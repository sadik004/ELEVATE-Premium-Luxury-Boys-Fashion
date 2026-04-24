from urllib.parse import parse_qs
from uuid import uuid4

import httpx
from fastapi import HTTPException, Request, status

from app.core.config import settings
from app.models.models import Order, User


class SSLCommerzService:
    def __init__(self) -> None:
        base_url = (
            "https://sandbox.sslcommerz.com"
            if settings.SSLCOMMERZ_SANDBOX
            else "https://securepay.sslcommerz.com"
        )
        self.init_url = f"{base_url}/gwprocess/v4/api.php"
        self.validation_url = f"{base_url}/validator/api/validationserverAPI.php"

    def ensure_configured(self) -> None:
        if not settings.SSLCOMMERZ_STORE_ID or not settings.SSLCOMMERZ_STORE_PASSWORD:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="SSLCommerz is not configured",
            )

    def make_transaction_id(self, order_id: int) -> str:
        return f"ELEVATE-{order_id}-{uuid4().hex[:12].upper()}"

    async def create_session(
        self,
        *,
        order: Order,
        user: User,
        transaction_id: str,
        item_count: int,
    ) -> dict:
        self.ensure_configured()

        backend_url = settings.BACKEND_PUBLIC_URL.rstrip("/")
        base_api_url = settings.API_V1_STR.rstrip("/")
        payload = {
            "store_id": settings.SSLCOMMERZ_STORE_ID,
            "store_passwd": settings.SSLCOMMERZ_STORE_PASSWORD,
            "total_amount": f"{order.total:.2f}",
            "currency": settings.SSLCOMMERZ_CURRENCY,
            "tran_id": transaction_id,
            "success_url": f"{backend_url}{base_api_url}/payments/success",
            "fail_url": f"{backend_url}{base_api_url}/payments/fail",
            "cancel_url": f"{backend_url}{base_api_url}/payments/cancel",
            "ipn_url": f"{backend_url}{base_api_url}/payments/ipn",
            "cus_name": user.name or "ELEVATE Customer",
            "cus_email": user.email,
            "cus_add1": "Dhaka",
            "cus_city": "Dhaka",
            "cus_postcode": "1000",
            "cus_country": "Bangladesh",
            "cus_phone": "01700000000",
            "shipping_method": "NO",
            "product_name": "ELEVATE Fashion Order",
            "product_category": "Fashion",
            "product_profile": "general",
            "num_of_item": str(item_count),
        }

        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(self.init_url, data=payload)

        try:
            data = response.json()
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Invalid response from SSLCommerz",
            ) from exc

        if response.is_error or data.get("status") != "SUCCESS" or not data.get("GatewayPageURL"):
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=data.get("failedreason") or "Unable to initialize SSLCommerz payment",
            )

        return data

    async def validate_payment(self, val_id: str) -> dict:
        self.ensure_configured()
        params = {
            "val_id": val_id,
            "store_id": settings.SSLCOMMERZ_STORE_ID,
            "store_passwd": settings.SSLCOMMERZ_STORE_PASSWORD,
            "format": "json",
        }

        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(self.validation_url, params=params)

        try:
            return response.json()
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Invalid validation response from SSLCommerz",
            ) from exc


async def read_gateway_payload(request: Request) -> dict:
    if request.query_params:
        return dict(request.query_params)

    body = (await request.body()).decode("utf-8")
    if not body:
        return {}

    parsed = parse_qs(body, keep_blank_values=True)
    return {key: values[-1] for key, values in parsed.items()}


sslcommerz_service = SSLCommerzService()
