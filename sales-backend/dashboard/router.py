from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, exc
from database import get_db
from auth import utils, models as auth_models
from sales.router import Sale
from products.router import Product

from . import schemas
from datetime import datetime, timedelta
from typing import List

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)

@router.get("/summary", response_model=schemas.DashboardSummary)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(utils.get_current_active_user)
):
    # Base query filtered by company
    query = db.query(Sale).filter(Sale.company_id == current_user.company_id)
    
    # Filter by Salesman if applicable
    if current_user.role == "salesman":
        query = query.filter(Sale.user_id == current_user.id)

    # Current Stats
    total_revenue = query.with_entities(func.sum(Sale.amount)).scalar() or 0.0
    total_orders = query.count()
    avg_order_value = (total_revenue / total_orders) if total_orders > 0 else 0.0

    # Calculate Growth (Last 30 days vs Previous 30 days)
    today = datetime.utcnow()
    last_30_days = today - timedelta(days=30)
    prev_30_days = last_30_days - timedelta(days=30)

    current_period_revenue = query.filter(Sale.date >= last_30_days).with_entities(func.sum(Sale.amount)).scalar() or 0.0
    prev_period_revenue = query.filter(Sale.date >= prev_30_days, Sale.date < last_30_days).with_entities(func.sum(Sale.amount)).scalar() or 0.0

    growth = 0.0
    if prev_period_revenue > 0:
        growth = ((current_period_revenue - prev_period_revenue) / prev_period_revenue) * 100
    elif current_period_revenue > 0:
        growth = 100.0 # 100% growth if started from 0

    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "avg_order_value": avg_order_value,
        "sales_growth": round(growth, 2)
    }

@router.get("/charts/sales-trend", response_model=List[schemas.ChartDataPoint])
def get_sales_trend(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(utils.get_current_active_user)
):
    from typing import List
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    query = db.query(
        func.date(Sale.date).label('date'),
        func.sum(Sale.amount).label('amount'),
        func.count(Sale.id).label('orders')
    ).filter(
        Sale.company_id == current_user.company_id,
        Sale.date >= start_date
    )

    if current_user.role == "salesman":
        query = query.filter(Sale.user_id == current_user.id)

    results = query.group_by(func.date(Sale.date)).all()
    
    # Format results
    chart_data = []
    for r in results:
        chart_data.append({
            "date": str(r.date),
            "amount": float(r.amount or 0),
            "orders": r.orders
        })
    
    # Sort by date
    chart_data.sort(key=lambda x: x['date'])
    return chart_data

@router.get("/recent-sales", response_model=List[schemas.RecentSaleSchema])
def get_recent_sales(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(utils.get_current_active_user)
):
    query = db.query(Sale).filter(Sale.company_id == current_user.company_id)
    
    if current_user.role == "salesman":
        query = query.filter(Sale.user_id == current_user.id)
        
    sales = query.order_by(desc(Sale.date)).limit(limit).all()
    
    result = []
    for sale in sales:
        # Fetch Product Name
        product = db.query(Product).filter(Product.id == sale.product_id).first()
        product_name = product.name if product else "Unknown"

        # Fetch Salesman Name (User)
        salesman_name = "Unknown"
        if sale.user_id:
             user = db.query(auth_models.User).filter(auth_models.User.id == sale.user_id).first()
             if user:
                 salesman_name = user.full_name
        
        result.append({
            "id": sale.id,
            "product_name": product_name,
            "amount": sale.amount,
            "date": sale.date,
            "salesman_name": salesman_name,
            "status": "Completed" 
        })
    
    return result

@router.get("/top-products", response_model=List[schemas.TopProductSchema])
def get_top_products(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(utils.get_current_active_user)
):
    # Aggregation to find top products
    # We join Sale with Product to get names directly if possible, or fetch later
    # Let's aggregate on Sale first
    
    query = db.query(
        Sale.product_id,
        func.sum(Sale.quantity).label('total_sold'),
        func.sum(Sale.amount).label('total_revenue')
    ).filter(Sale.company_id == current_user.company_id)

    if current_user.role == "salesman":
        query = query.filter(Sale.user_id == current_user.id)

    results = query.group_by(Sale.product_id).order_by(desc('total_revenue')).limit(limit).all()

    top_products = []
    for r in results:
        product = db.query(Product).filter(Product.id == r.product_id).first()
        name = product.name if product else f"Product {r.product_id}"
        
        top_products.append({
            "id": r.product_id,
            "name": name,
            "total_sold": int(r.total_sold or 0),
            "total_revenue": float(r.total_revenue or 0)
        })
        
    return top_products
