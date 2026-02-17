from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import DATABASE_URL
from sales.router import Sale

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

print("--- Sales for Company 2 ---")
sales_2 = db.query(Sale).filter(Sale.company_id == 2).all()
print(f"Total Sales for Company 2: {len(sales_2)}")
for sale in sales_2:
    print(f"Sale {sale.id}: User {sale.user_id}, Amt {sale.amount}")

print("\n--- Sales for Company 3 ---")
sales_3 = db.query(Sale).filter(Sale.company_id == 3).all()
print(f"Total Sales for Company 3: {len(sales_3)}")
for sale in sales_3:
    print(f"Sale {sale.id}: User {sale.user_id}, Amt {sale.amount}")
