from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from auth import utils, models as auth_models
from .models import Category
from .schemas import CategoryCreate, CategoryResponse

router = APIRouter(
    prefix="/api/categories",
    tags=["Categories"]
)

@router.get("/", response_model=List[CategoryResponse])
def get_categories(
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(utils.get_current_active_user)
):
    return db.query(Category).filter(Category.company_id == current_user.company_id).all()

@router.post("/", response_model=CategoryResponse)
def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(utils.get_current_active_user)
):
    if current_user.role != "manager":
         raise HTTPException(status_code=403, detail="Only managers can add categories")
         
    new_category = Category(
        name=category.name,
        description=category.description,
        company_id=current_user.company_id
    )
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category

@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(utils.get_current_active_user)
):
    print(f"DEBUG: Delete Category Request - User: {current_user.email}, Role: {current_user.role}, Company: {current_user.company_id}, TargetCategory: {category_id}")
    
    if current_user.role != "manager":
         print("DEBUG: User is not manager")
         raise HTTPException(status_code=403, detail="Only managers can delete categories")
         
    print(f"DEBUG: Delete Category Request - User: {current_user.email}, Role: {current_user.role}, Company: {current_user.company_id}, TargetCategory: {category_id}")
    
    if current_user.role != "manager":
         print("DEBUG: User is not manager")
         raise HTTPException(status_code=403, detail="Only managers can delete categories")
         
    # First, find the category ANYWHERE
    category = db.query(Category).filter(Category.id == category_id).first()
    
    if not category:
        print(f"DEBUG: Category {category_id} does not exist in DB")
        raise HTTPException(status_code=404, detail="Category not found in database")
        
    print(f"DEBUG: Found category {category.id}, Name: {category.name}, Company: {category.company_id}")
    
    # Then check ownership
    if category.company_id != current_user.company_id:
        print(f"DEBUG: Ownership mismatch! User Company: {current_user.company_id} vs Category Company: {category.company_id}")
        raise HTTPException(status_code=403, detail=f"Permission denied: Category belongs to company {category.company_id}, you are company {current_user.company_id}")

    db.delete(category)
    db.commit()
    return {"message": "Category deleted successfully"}
