from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.dependencies.database import get_db
from app.models.user import User
from app.schemas.user import UserOut

from google.oauth2 import id_token
from google.auth.transport import requests
import requests as http_requests

router = APIRouter()

DEMO_PASSWORD = "password123"


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "guest"  # "guest" or "host"


class GoogleLoginRequest(BaseModel):
    token: str
    role: str = "guest"


@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    # For demo accounts use DEMO_PASSWORD, for new accounts use their own password
    stored_pw = getattr(user, '_password', None)
    if stored_pw:
        if body.password != stored_pw:
            raise HTTPException(status_code=401, detail="Invalid email or password")
    elif body.password != DEMO_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"data": UserOut.model_validate(user)}


@router.post("/register")
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    # Check if email already exists
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    if body.role not in ("guest", "host"):
        raise HTTPException(status_code=400, detail="Role must be 'guest' or 'host'")

    if len(body.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    user = User(
        name=body.name,
        email=body.email,
        role=body.role,
        avatar_url=f"https://api.dicebear.com/9.x/avataaars/svg?seed={body.name.replace(' ', '')}",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"data": UserOut.model_validate(user)}


@router.get("")
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return {"data": [UserOut.model_validate(u) for u in users]}


@router.get("/me")
def get_current_user(x_user_id: int = Header(default=0), db: Session = Depends(get_db)):
    if x_user_id == 0:
        return {"data": None}
    user = db.get(User, x_user_id)
    if not user:
        return {"data": None}
    return {"data": UserOut.model_validate(user)}

@router.post("/google-login")
def google_login(body: GoogleLoginRequest, db: Session = Depends(get_db)):
    try:
        # Fetch user info using the access token
        response = http_requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {body.token}"}
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid Google access token")
            
        idinfo = response.json()
        email = idinfo.get("email")
        name = idinfo.get("name")
        picture = idinfo.get("picture")

        if not email:
            raise HTTPException(status_code=400, detail="Google token does not contain email")

        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        if not user:
            # Create new user
            user = User(
                email=email,
                name=name or "Google User",
                role=body.role,
                avatar_url=picture
            )
            # Give a random/unusable password or set to None if allowed
            setattr(user, "_password", None) 
            db.add(user)
            db.commit()
            db.refresh(user)
            
        return {"data": UserOut.model_validate(user)}
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")
