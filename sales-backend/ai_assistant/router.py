from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from database import get_db
from auth import utils, models as auth_models
from .service import AIService
from pydantic import BaseModel

router = APIRouter(
    prefix="/api/ai",
    tags=["AI Assistant"]
)

class AskRequest(BaseModel):
    question: str

@router.post("/ask")
async def ask_ai(
    request: AskRequest,
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(utils.get_current_active_user)
):
    try:
        service = AIService(db, current_user)
        response = await service.get_response(request.question)
        return {"answer": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
