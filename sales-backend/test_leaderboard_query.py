from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker
from database import DATABASE_URL
from auth.models import User
from sales.router import Sale

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

def get_leaderboard_for_company(company_id):
    print(f"--- Leaderboard for Company {company_id} ---")
    results = db.query(
        User,
        func.sum(Sale.amount).label("total_revenue"),
        func.sum(Sale.quantity).label("total_quantity")
    ).join(Sale, Sale.user_id == User.id).filter(
        Sale.company_id == company_id
    ).group_by(User.id).order_by(func.sum(Sale.amount).desc()).all()
    
    if not results:
        print("No results found.")
    
    for user, revenue, quantity in results:
        print(f"User: {user.full_name}, Revenue: {revenue}, Qty: {quantity}")

# Test for Company 2 (Rushi) and 3 (Gautam)
get_leaderboard_for_company(2)
get_leaderboard_for_company(3)
