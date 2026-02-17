from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DashboardSummary(BaseModel):
    total_revenue: float
    total_orders: int
    avg_order_value: float
    sales_growth: float  # Percentage growth vs last month

class ChartDataPoint(BaseModel):
    date: str
    amount: float
    orders: int

class RecentSaleSchema(BaseModel):
    id: int
    product_name: str
    amount: float
    date: datetime
    salesman_name: str
    status: str = "Completed"

class TopProductSchema(BaseModel):
    id: int
    name: str
    total_sold: int
    total_revenue: float

class DashboardResponse(BaseModel):
    summary: DashboardSummary
    sales_chart: List[ChartDataPoint]
    recent_sales: List[RecentSaleSchema]
    top_products: List[TopProductSchema]
