import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def get_sales_df(sales_data):
    """Converts list of Sale objects to DataFrame"""
    if not sales_data:
        return pd.DataFrame()
    
    data = []
    for sale in sales_data:
        data.append({
            'id': sale.id,
            'product_id': sale.product_id,
            'user_id': sale.user_id,
            'amount': sale.amount,
            'quantity': sale.quantity,
            'date': sale.date,
            'customer_name': sale.customer_name
        })
    return pd.DataFrame(data)

def calculate_abc_analysis(sales_val, products_val):
    """
    Performs ABC Analysis on Products based on Revenue.
    A: Top 80% Revenue
    B: Next 15% Revenue
    C: Bottom 5% Revenue
    """
    if sales_val.empty:
        return {}

    # Group by product and sum amount
    product_revenue = sales_val.groupby('product_id')['amount'].sum().reset_index()
    product_revenue = product_revenue.sort_values('amount', ascending=False)
    
    # Calculate cumulative percentage
    product_revenue['cumulative_sum'] = product_revenue['amount'].cumsum()
    product_revenue['total_revenue'] = product_revenue['amount'].sum()
    product_revenue['cumulative_perc'] = product_revenue['cumulative_sum'] / product_revenue['total_revenue']
    
    # Assign Class
    def assign_class(perc):
        if perc <= 0.80: return 'A'
        elif perc <= 0.95: return 'B'
        else: return 'C'
        
    # Merge with product names
    # products_val should have 'id' and 'name'
    if not products_val.empty:
        product_revenue = product_revenue.merge(products_val, left_on='product_id', right_on='id', how='left')
        product_revenue['name'] = product_revenue['name'].fillna('Unknown Product')
    else:
        product_revenue['name'] = 'Unknown Product'

    product_revenue['class'] = product_revenue['cumulative_perc'].apply(assign_class)
    
    # Return list of dicts: [{product_id: 1, name: '...', class: 'A', revenue: ...}, ...]
    return product_revenue[['product_id', 'name', 'amount', 'class']].to_dict('records')

def calculate_rfm(sales_df):
    """
    Performs RFM Analysis on Customers (using customer_name as proxy for ID if no customer table).
    """
    if sales_df.empty:
        return []

    # Ensure date is datetime
    sales_df['date'] = pd.to_datetime(sales_df['date'])
    now = datetime.utcnow()
    
    # RFM Aggregation
    rfm = sales_df.groupby('customer_name').agg({
        'date': lambda x: (now - x.max()).days, # Recency
        'id': 'count', # Frequency
        'amount': 'sum' # Monetary
    }).reset_index()
    
    rfm.columns = ['customer_name', 'recency', 'frequency', 'monetary']
    
    # Simple Segmentation Logic (Quantile-based could be better but sticking to simple rules first)
    # 1. Champions: Recent (< 30 days), Frequent (> 5), High Value (> 10000)
    # 2. Loyal: Recent (< 60 days), Frequent (> 3)
    # 3. At Risk: Old (> 60 days), High Value (> 5000)
    # 4. New: Recent (< 30 days), Low Frequency
    # 5. Lost: Old (> 90 days)
    
    def segment_customer(row):
        r, f, m = row['recency'], row['frequency'], row['monetary']
        
        if r <= 30 and f >= 5 and m >= 10000: return "Champion"
        if r <= 60 and f >= 3: return "Loyal"
        if r > 60 and m >= 5000: return "At Risk"
        if r <= 30: return "New/Promising"
        if r > 90: return "Lost"
        return "Regular"

    rfm['segment'] = rfm.apply(segment_customer, axis=1)
    
    return rfm.to_dict('records')

def calculate_kpis(sales_df, salesmen_count):
    """
    Calculates Executive KPIs
    """
    if sales_df.empty:
        return {
            "run_rate": 0,
            "active_salesmen_ratio": 0,
            "top_mover_id": None
        }

    sales_df['date'] = pd.to_datetime(sales_df['date'])
    now = datetime.utcnow()
    current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # 1. Revenue Run Rate
    # Metric: (Current Month Revenue / Days Passed) * Days in Month
    month_sales = sales_df[sales_df['date'] >= current_month_start]
    current_revenue = month_sales['amount'].sum()
    days_passed = max((now - current_month_start).days, 1) # Avoid div by 0
    # Approximate days in month (30)
    run_rate = (current_revenue / days_passed) * 30
    
    # 2. Active Salesmen Ratio (Weekly)
    week_start = now - timedelta(days=7)
    week_sales = sales_df[sales_df['date'] >= week_start]
    active_salesmen = week_sales['user_id'].nunique()
    ratio = (active_salesmen / salesmen_count) * 100 if salesmen_count > 0 else 0
    
    return {
        "run_rate": round(run_rate, 2),
        "active_salesmen_ratio": round(ratio, 1),
        "top_mover_id": None # Placeholder for complex logic involving prev month comparison
    }

def calculate_consistency_score(sales_df):
    """
    Calculates consistency score (Std Dev of daily sales) for each salesman.
    Lower Std Dev (normalized by mean) = More Consistent? 
    Actually, usually Coefficient of Variation (CV) = StdDev / Mean.
    Lower CV is better consistency.
    """
    if sales_df.empty:
        return []

    sales_df['date'] = pd.to_datetime(sales_df['date'])
    sales_df['date_only'] = sales_df['date'].dt.date
    
    # Group by User and Date to get Daily Totals
    daily_sales = sales_df.groupby(['user_id', 'date_only'])['amount'].sum().reset_index()
    
    # Calculate StdDev and Mean per User
    stats = daily_sales.groupby('user_id')['amount'].agg(['std', 'mean', 'count']).reset_index()
    stats = stats.fillna(0)
    
    # CV = (Std / Mean) * 100. Lower is better.
    # But for a "Score" (Higher is better), maybe 100 - CV? Or just return CV.
    # Let's return the metrics directly.
    
    stats['cv'] = np.where(stats['mean'] > 0, (stats['std'] / stats['mean']) * 100, 0)
    
    return stats.to_dict('records')
