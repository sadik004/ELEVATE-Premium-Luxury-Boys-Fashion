import uuid
import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.models import User, Payment, Order
from app.schemas.payment import PaymentInitiate, PaymentResponse
from app.api.v1.endpoints.auth import get_current_user
from app.core.config import settings

router = APIRouter()

@router.post("/initiate", response_model=PaymentResponse)
async def initiate_payment(
    payload: PaymentInitiate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify the order exists and belongs to the current user
    result = await db.execute(select(Order).where(Order.id == payload.order_id, Order.user_id == current_user.id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    trx_id = str(uuid.uuid4())

    # Create the payment record in the database
    new_payment = Payment(
        order_id=order.id,
        trx_id=trx_id,
        amount=payload.total_amount,
        status="PENDING"
    )
    db.add(new_payment)
    await db.commit()
    await db.refresh(new_payment)

    # Prepare data for SSLCommerz
    sslcz_url = "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
    post_data = {
        "store_id": settings.SSLCOMMERZ_STORE_ID,
        "store_passwd": settings.SSLCOMMERZ_STORE_PASSWORD,
        "total_amount": payload.total_amount,
        "currency": "BDT",
        "tran_id": trx_id,
        "success_url": "http://localhost:8000/api/payment/success",
        "fail_url": "http://localhost:8000/api/payment/fail",
        "cancel_url": "http://localhost:8000/api/payment/cancel",
        "emi_option": 0,
        "cus_name": current_user.name or "Customer Name",
        "cus_email": current_user.email,
        "cus_phone": "01700000000",
        "cus_add1": "Dummy Address",
        "cus_city": "Dhaka",
        "cus_country": "Bangladesh",
        "shipping_method": "NO",
        "product_name": "ELEVATE Products",
        "product_category": "General",
        "product_profile": "general"
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(sslcz_url, data=post_data)
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to connect to payment gateway")

        resp_data = response.json()
        if resp_data.get("status") == "SUCCESS":
            return PaymentResponse(GatewayPageURL=resp_data.get("GatewayPageURL"))
        else:
            raise HTTPException(status_code=400, detail=resp_data.get("failedreason", "Failed to initiate payment"))


@router.post("/success")
async def payment_success(request: Request, db: AsyncSession = Depends(get_db)):
    form_data = await request.form()
    val_id = form_data.get("val_id")
    trx_id = form_data.get("tran_id")

    if not val_id or not trx_id:
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/payment/fail")

    # Call validation API
    validate_url = "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php"
    params = {
        "val_id": val_id,
        "store_id": settings.SSLCOMMERZ_STORE_ID,
        "store_passwd": settings.SSLCOMMERZ_STORE_PASSWORD,
        "v": 1,
        "format": "json"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(validate_url, params=params)

        # Determine status
        payment_status = "FAILED"
        if response.status_code == 200:
            resp_data = response.json()
            if resp_data.get("status") in ["VALID", "VALIDATED"]:
                payment_status = "SUCCESS"

    # Update database
    result = await db.execute(select(Payment).where(Payment.trx_id == trx_id))
    payment = result.scalar_one_or_none()

    if payment:
        payment.status = payment_status
        payment.val_id = val_id
        await db.commit()

    if payment_status == "SUCCESS":
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/payment/success", status_code=302)
    else:
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/payment/fail", status_code=302)


@router.post("/fail")
async def payment_fail(request: Request, db: AsyncSession = Depends(get_db)):
    form_data = await request.form()
    trx_id = form_data.get("tran_id")

    if trx_id:
        result = await db.execute(select(Payment).where(Payment.trx_id == trx_id))
        payment = result.scalar_one_or_none()
        if payment:
            payment.status = "FAILED"
            await db.commit()

    return RedirectResponse(url=f"{settings.FRONTEND_URL}/payment/fail", status_code=302)


@router.post("/cancel")
async def payment_cancel(request: Request, db: AsyncSession = Depends(get_db)):
    form_data = await request.form()
    trx_id = form_data.get("tran_id")

    if trx_id:
        result = await db.execute(select(Payment).where(Payment.trx_id == trx_id))
        payment = result.scalar_one_or_none()
        if payment:
            payment.status = "CANCELLED"
            await db.commit()

    return RedirectResponse(url=f"{settings.FRONTEND_URL}/payment/fail", status_code=302)
