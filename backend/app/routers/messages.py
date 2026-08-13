from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func, desc
from pydantic import BaseModel
from typing import Optional

from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.listing import Listing
from app.models.message import Message


router = APIRouter()


class SendMessageRequest(BaseModel):
    recipient_id: int
    listing_id: int
    content: str


class MessageOut(BaseModel):
    id: int
    sender_id: int
    sender_name: str
    sender_avatar: Optional[str]
    recipient_id: int
    recipient_name: str
    recipient_avatar: Optional[str]
    listing_id: int
    listing_title: str
    content: str
    is_read: bool
    created_at: str


class ConversationOut(BaseModel):
    other_user_id: int
    other_user_name: str
    other_user_avatar: Optional[str]
    listing_id: int
    listing_title: str
    last_message: str
    last_message_time: str
    unread_count: int


@router.post("", status_code=201)
def send_message(
    body: SendMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Validate recipient exists
    recipient = db.get(User, body.recipient_id)
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")

    # Validate listing exists
    listing = db.get(Listing, body.listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if current_user.id == body.recipient_id:
        raise HTTPException(status_code=400, detail="Cannot message yourself")

    msg = Message(
        sender_id=current_user.id,
        recipient_id=body.recipient_id,
        listing_id=body.listing_id,
        content=body.content,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    return {
        "data": {
            "id": msg.id,
            "sender_id": msg.sender_id,
            "sender_name": current_user.name,
            "sender_avatar": current_user.avatar_url,
            "recipient_id": msg.recipient_id,
            "recipient_name": recipient.name,
            "recipient_avatar": recipient.avatar_url,
            "listing_id": msg.listing_id,
            "listing_title": listing.title,
            "content": msg.content,
            "is_read": msg.is_read,
            "created_at": msg.created_at.isoformat(),
        },
        "message": "Message sent",
    }


@router.get("/conversations")
def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all conversations for the current user, grouped by (other_user, listing)."""
    # Get all messages involving the current user
    messages = (
        db.query(Message)
        .filter(
            or_(
                Message.sender_id == current_user.id,
                Message.recipient_id == current_user.id,
            )
        )
        .order_by(desc(Message.created_at))
        .all()
    )

    # Group by (other_user_id, listing_id)
    conversations: dict[tuple[int, int], dict] = {}
    for msg in messages:
        other_id = msg.recipient_id if msg.sender_id == current_user.id else msg.sender_id
        key = (other_id, msg.listing_id)

        if key not in conversations:
            other_user = db.get(User, other_id)
            listing = db.get(Listing, msg.listing_id)
            conversations[key] = {
                "other_user_id": other_id,
                "other_user_name": other_user.name if other_user else "Unknown",
                "other_user_avatar": other_user.avatar_url if other_user else None,
                "listing_id": msg.listing_id,
                "listing_title": listing.title if listing else "Unknown",
                "last_message": msg.content,
                "last_message_time": msg.created_at.isoformat(),
                "unread_count": 0,
            }

        # Count unread messages sent to the current user
        if msg.recipient_id == current_user.id and not msg.is_read:
            conversations[key]["unread_count"] += 1

    return {"data": list(conversations.values())}


@router.get("/conversation/{other_user_id}/{listing_id}")
def get_conversation_messages(
    other_user_id: int,
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all messages in a specific conversation."""
    messages = (
        db.query(Message)
        .filter(
            Message.listing_id == listing_id,
            or_(
                and_(Message.sender_id == current_user.id, Message.recipient_id == other_user_id),
                and_(Message.sender_id == other_user_id, Message.recipient_id == current_user.id),
            ),
        )
        .order_by(Message.created_at)
        .all()
    )

    # Mark unread messages as read
    for msg in messages:
        if msg.recipient_id == current_user.id and not msg.is_read:
            msg.is_read = True
    db.commit()

    result = []
    for msg in messages:
        sender = db.get(User, msg.sender_id)
        recipient = db.get(User, msg.recipient_id)
        listing = db.get(Listing, msg.listing_id)
        result.append({
            "id": msg.id,
            "sender_id": msg.sender_id,
            "sender_name": sender.name if sender else "Unknown",
            "sender_avatar": sender.avatar_url if sender else None,
            "recipient_id": msg.recipient_id,
            "recipient_name": recipient.name if recipient else "Unknown",
            "recipient_avatar": recipient.avatar_url if recipient else None,
            "listing_id": msg.listing_id,
            "listing_title": listing.title if listing else "Unknown",
            "content": msg.content,
            "is_read": msg.is_read,
            "created_at": msg.created_at.isoformat(),
        })

    return {"data": result}
