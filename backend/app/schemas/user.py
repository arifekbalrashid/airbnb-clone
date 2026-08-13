from pydantic import BaseModel, Field
from typing import Optional


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    avatar_url: Optional[str] = None

    model_config = {"from_attributes": True}
