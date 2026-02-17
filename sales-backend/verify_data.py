from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker
from database import Base
from auth.models import User
from sales.router import Sale
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sales.db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def verify_data():
    print("--- Verifying Data ---")
    
    # 1. Users
    print("\n[Users]")
    users = db.query(User).all()
    for u in users:
        print(f"ID: {u.id}, Name: {u.full_name}, Role: {u.role}, CompanyID: {u.company_id}")
        
    # 2. Sales
    print("\n[Sales]")
    sales = db.query(Sale).all()
    for s in sales:
        user_name = s.user.full_name if s.user else "None"
        print(f"ID: {s.id}, Amount: {s.amount}, UserID: {s.user_id} ({user_name}), CompanyID: {s.company_id}")
        
    # 3. Leaderboard Query Logic
    print("\n[Leaderboard Logic Check]")
    # Group by User and Company
    
    # Pick the first company found in users
    company_id = users[0].company_id if users else None
    
    if company_id:
        print(f"Checking for Company ID: {company_id}")
        results = db.query(
            User,
            func.sum(Sale.amount).label("total_revenue"),
            func.sum(Sale.quantity).label("total_quantity")
        ).join(Sale, Sale.user_id == User.id).filter(
            Sale.company_id == company_id
        ).group_by(User.id).order_by(func.sum(Sale.amount).desc()).all()
        
        print(f"Found {len(results)} leaderboard entries.")
        for user, revenue, quantity in results:
            print(f"Rank: ?, User: {user.full_name}, Revenue: {revenue}, Quantity: {quantity}")
    else:
        print("No users found to determine company.")

if __name__ == "__main__":
    verify_data()
