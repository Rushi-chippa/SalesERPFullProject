from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models, auth
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(
    prefix="/api/sales",
    tags=["Sales"]
)

class SaleCreate(BaseModel):
    product_id: int
    salesman_id: int
    quantity: int
    amount: float
    date: datetime

class SaleResponse(SaleCreate):
    id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

@router.get("/", response_model=List[SaleResponse])
def get_sales(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Sale).all()

@router.post("/", response_model=SaleResponse)
def create_sale(sale: SaleCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Verify product and salesman exist
    product = db.query(models.Product).filter(models.Product.id == sale.product_id).first()
    salesman = db.query(models.Salesman).filter(models.Salesman.id == sale.salesman_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if not salesman:
        raise HTTPException(status_code=404, detail="Salesman not found")
        
    new_sale = models.Sale(**sale.dict())
    db.add(new_sale)
    db.commit()
    db.refresh(new_sale)
    return new_sale
