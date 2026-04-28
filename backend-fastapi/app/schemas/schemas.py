from typing import List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field
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
    role: str

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    token: str
    user: UserResponse

class UserProfile(UserResponse):
    createdAt: datetime = Field(validation_alias="created_at")

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
    categoryId: int = Field(validation_alias="category_id")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class ProductCreate(BaseModel):
    name: str
    slug: str
    description: str
    price: float
    image: str
    category_id: int

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image: Optional[str] = None
    category_id: Optional[int] = None

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
    orderId: int = Field(validation_alias="order_id")
    productId: int = Field(validation_alias="product_id")
    quantity: int
    price: float

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class OrderItemWithProductResponse(OrderItemResponseBase):
    product: ProductBase

class OrderResponse(BaseModel):
    id: int
    userId: int = Field(validation_alias="user_id")
    total: float
    status: str
    createdAt: datetime = Field(validation_alias="created_at")
    updatedAt: datetime = Field(validation_alias="updated_at")
    items: List[OrderItemResponseBase] = []

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class OrderWithItemsResponse(OrderResponse):
    items: List[OrderItemWithProductResponse]
