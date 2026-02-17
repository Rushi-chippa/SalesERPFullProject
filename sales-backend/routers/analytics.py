from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from database import get_db
import models, auth
from datetime import datetime, timedelta

router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"]
)

@router.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    """
    Returns aggregated stats for the dashboard:
    - Total Revenue
    - Total Orders
    - Average Order Value
    - Recent Sales
    """
    total_revenue = db.query(func.sum(models.Sale.amount)).scalar() or 0
    total_orders = db.query(func.count(models.Sale.id)).scalar() or 0
    avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
    
    recent_sales = db.query(models.Sale).order_by(models.Sale.date.desc()).limit(5).all()
    
    # Format recent sales
    recent_sales_data = []
    for sale in recent_sales:
        product = db.query(models.Product).filter(models.Product.id == sale.product_id).first()
        salesman = db.query(models.Salesman).filter(models.Salesman.id == sale.salesman_id).first()
        recent_sales_data.append({
            "id": sale.id,
            "product": product.name if product else "Unknown",
            "salesman": salesman.name if salesman else "Unknown",
            "amount": sale.amount,
            "date": sale.date
        })

    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "avg_order_value": round(avg_order_value, 2),
        "recent_sales": recent_sales_data
    }

@router.get("/reports")
def get_reports_data(start_date: str = None, end_date: str = None, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    """
    Returns detailed aggregation for reports:
    - Sales by Month
    - Sales by Salesman
    - Top Products
    """
    query = db.query(models.Sale)
    
    if start_date:
        query = query.filter(models.Sale.date >= start_date)
    if end_date:
        query = query.filter(models.Sale.date <= end_date)
        
    sales = query.all()
    
    # Sales by Salesman
    sales_by_salesman = {}
    sales_by_product = {}
    sales_by_month = {}
    
    for sale in sales:
        # Salesman
        salesman = db.query(models.Salesman).filter(models.Salesman.id == sale.salesman_id).first()
        if salesman:
            if salesman.name not in sales_by_salesman:
                sales_by_salesman[salesman.name] = {"amount": 0, "count": 0}
            sales_by_salesman[salesman.name]["amount"] += sale.amount
            sales_by_salesman[salesman.name]["count"] += 1
            
        # Product
        product = db.query(models.Product).filter(models.Product.id == sale.product_id).first()
        if product:
            if product.name not in sales_by_product:
                sales_by_product[product.name] = {"amount": 0, "quantity": 0}
            sales_by_product[product.name]["amount"] += sale.amount
            sales_by_product[product.name]["quantity"] += sale.quantity

        # Month
        month_key = sale.date.strftime("%Y-%m")
        if month_key not in sales_by_month:
            sales_by_month[month_key] = 0
        sales_by_month[month_key] += sale.amount

    return {
        "sales_by_salesman": sales_by_salesman,
        "sales_by_product": sales_by_product,
        "sales_by_month": sales_by_month
    }
