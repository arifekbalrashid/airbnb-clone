from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.dependencies.database import get_db
from app.models.user import User


def get_current_user(
    x_user_id: int = Header(default=1),
    db: Session = Depends(get_db),
) -> User:
    user = db.get(User, x_user_id)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid user")
    return user
