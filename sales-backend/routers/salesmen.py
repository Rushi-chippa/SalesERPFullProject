from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models, auth
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(
    prefix="/api/salesmen",
    tags=["Salesmen"]
)

class SalesmanBase(BaseModel):
    name: str
    email: str
    phone: str
    status: str = "active"
    region: Optional[str] = None

class SalesmanCreate(SalesmanBase):
    pass

class SalesmanResponse(SalesmanBase):
    id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

@router.get("/", response_model=List[SalesmanResponse])
def get_salesmen(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Salesman).all()

@router.post("/", response_model=SalesmanResponse)
def create_salesman(salesman: SalesmanCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_salesman = db.query(models.Salesman).filter(models.Salesman.email == salesman.email).first()
    if db_salesman:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    new_salesman = models.Salesman(**salesman.dict())
    db.add(new_salesman)
    db.commit()
    db.refresh(new_salesman)
    return new_salesman

@router.put("/{salesman_id}", response_model=SalesmanResponse)
def update_salesman(salesman_id: int, salesman: SalesmanCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_salesman = db.query(models.Salesman).filter(models.Salesman.id == salesman_id).first()
    if not db_salesman:
        raise HTTPException(status_code=404, detail="Salesman not found")
    
    for key, value in salesman.dict().items():
        setattr(db_salesman, key, value)
    
    db.commit()
    db.refresh(db_salesman)
    return db_salesman

@router.delete("/{salesman_id}")
def delete_salesman(salesman_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_salesman = db.query(models.Salesman).filter(models.Salesman.id == salesman_id).first()
    if not db_salesman:
        raise HTTPException(status_code=404, detail="Salesman not found")
    
    db.delete(db_salesman)
    db.commit()
    return {"message": "Salesman deleted successfully"}
