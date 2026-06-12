import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class UserRead(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
