from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from auth import utils, models as auth_models
from .models import Customer
from .schemas import CustomerCreate, CustomerResponse

router = APIRouter(
    prefix="/api/customers",
    tags=["Customers"]
)

@router.get("/", response_model=List[CustomerResponse])
def get_customers(
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(utils.get_current_active_user)
):
    return db.query(Customer).filter(Customer.company_id == current_user.company_id).all()

@router.post("/", response_model=CustomerResponse)
def create_customer(
    customer: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(utils.get_current_active_user)
):
    new_customer = Customer(
        **customer.dict(),
        company_id=current_user.company_id
    )
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    return new_customer

@router.delete("/{customer_id}")
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(utils.get_current_active_user)
):
    if current_user.role != "manager":
         raise HTTPException(status_code=403, detail="Only managers can delete customers")
         
    customer = db.query(Customer).filter(Customer.id == customer_id, Customer.company_id == current_user.company_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    db.delete(customer)
    db.commit()
    return {"message": "Customer deleted successfully"}
