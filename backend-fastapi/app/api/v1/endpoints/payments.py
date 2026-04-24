from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.crud import crud_order
from app.db.session import get_db
from app.models.models import Order, Payment, User
from app.schemas.schemas import OrderCreate
from app.services.sslcommerz import read_gateway_payload, sslcommerz_service

router = APIRouter()


@router.post("/initiate", status_code=status.HTTP_201_CREATED)
async def initiate_payment(
    order_in: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not order_in.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    order = await crud_order.create_order(db, current_user.id, order_in)
    transaction_id = sslcommerz_service.make_transaction_id(order.id)

    payment = Payment(
        order_id=order.id,
        trx_id=transaction_id,
        amount=order.total,
        status="PENDING",
    )
    db.add(payment)
    await db.flush()

    try:
        session = await sslcommerz_service.create_session(
            order=order,
            user=current_user,
            transaction_id=transaction_id,
            item_count=sum(item.quantity for item in order_in.items),
        )
    except HTTPException:
        payment.status = "INIT_FAILED"
        order.status = "PAYMENT_INIT_FAILED"
        await db.commit()
        raise

    await db.commit()

    return {
        "orderId": order.id,
        "transactionId": transaction_id,
        "gatewayUrl": session["GatewayPageURL"],
    }


@router.api_route("/success", methods=["GET", "POST"])
async def payment_success(request: Request, db: AsyncSession = Depends(get_db)):
    payload = await read_gateway_payload(request)
    transaction_id = payload.get("tran_id")
    val_id = payload.get("val_id")

    if transaction_id:
        result = await db.execute(select(Payment).where(Payment.trx_id == transaction_id))
        payment = result.scalar_one_or_none()
        if payment:
            validation = await sslcommerz_service.validate_payment(val_id) if val_id else {}
            validation_status = validation.get("status")
            payment.val_id = val_id
            payment.status = "VALID" if validation_status in {"VALID", "VALIDATED"} else "FAILED"

            order = await db.get(Order, payment.order_id)
            if order:
                order.status = "PAID" if payment.status == "VALID" else "PAYMENT_FAILED"

            await db.commit()

            if payment.status != "VALID":
                return _frontend_redirect("failed", transaction_id)

    return _frontend_redirect("success", transaction_id)


@router.api_route("/fail", methods=["GET", "POST"])
async def payment_fail(request: Request, db: AsyncSession = Depends(get_db)):
    payload = await read_gateway_payload(request)
    await _mark_payment(db, payload.get("tran_id"), "FAILED", "PAYMENT_FAILED")
    return _frontend_redirect("failed", payload.get("tran_id"))


@router.api_route("/cancel", methods=["GET", "POST"])
async def payment_cancel(request: Request, db: AsyncSession = Depends(get_db)):
    payload = await read_gateway_payload(request)
    await _mark_payment(db, payload.get("tran_id"), "CANCELLED", "CANCELLED")
    return _frontend_redirect("cancelled", payload.get("tran_id"))


@router.api_route("/ipn", methods=["GET", "POST"])
async def payment_ipn(request: Request, db: AsyncSession = Depends(get_db)):
    payload = await read_gateway_payload(request)
    transaction_id = payload.get("tran_id")
    val_id = payload.get("val_id")

    if transaction_id:
        validation = await sslcommerz_service.validate_payment(val_id) if val_id else {}
        status_value = "VALID" if validation.get("status") in {"VALID", "VALIDATED"} else "FAILED"
        await _mark_payment(db, transaction_id, status_value, "PAID" if status_value == "VALID" else "PAYMENT_FAILED", val_id)

    return {"status": "OK"}


async def _mark_payment(
    db: AsyncSession,
    transaction_id: Optional[str],
    payment_status: str,
    order_status: str,
    val_id: Optional[str] = None,
) -> None:
    if not transaction_id:
        return

    result = await db.execute(select(Payment).where(Payment.trx_id == transaction_id))
    payment = result.scalar_one_or_none()
    if not payment:
        return

    payment.status = payment_status
    if val_id:
        payment.val_id = val_id

    order = await db.get(Order, payment.order_id)
    if order:
        order.status = order_status

    await db.commit()


def _frontend_redirect(payment_status: str, transaction_id: Optional[str]) -> RedirectResponse:
    frontend_url = settings.FRONTEND_URL.rstrip("/")
    location = f"{frontend_url}/cart?payment={payment_status}"
    if transaction_id:
        location = f"{location}&transactionId={transaction_id}"
    return RedirectResponse(location, status_code=status.HTTP_303_SEE_OTHER)
