from pydantic import BaseModel

class PaymentInitiate(BaseModel):
    order_id: int
    total_amount: float

class PaymentResponse(BaseModel):
    GatewayPageURL: str
