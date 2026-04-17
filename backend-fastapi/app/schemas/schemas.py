from typing import List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr
from datetime import datetime

# Auth Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    token: str
    user: UserResponse

class UserProfile(UserResponse):
    createdAt: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

# Category Schemas
class CategoryBase(BaseModel):
    id: int
    name: str
    slug: str

    model_config = ConfigDict(from_attributes=True)

class CategoryResponse(CategoryBase):
    pass

# Product Schemas
class ProductBase(BaseModel):
    id: int
    name: str
    slug: str
    description: str
    price: float
    image: str
    categoryId: int

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class ProductResponse(ProductBase):
    category: CategoryBase

    model_config = ConfigDict(from_attributes=True)

# Order Schemas
class OrderItemCreate(BaseModel):
    id: int
    quantity: int
    price: float

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    total: float

class OrderItemResponseBase(BaseModel):
    id: int
    orderId: int
    productId: int
    quantity: int
    price: float

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class OrderItemWithProductResponse(OrderItemResponseBase):
    product: ProductBase

class OrderResponse(BaseModel):
    id: int
    userId: int
    total: float
    status: str
    createdAt: datetime
    updatedAt: datetime
    items: List[OrderItemResponseBase] = []

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class OrderWithItemsResponse(OrderResponse):
    items: List[OrderItemWithProductResponse]
