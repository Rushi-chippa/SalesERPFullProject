from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, DATABASE_URL
from sales.router import Sale
from auth.models import User
from products.router import Product

# Setup DB connection
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

print("--- Debugging Sales Relationships ---")

# Fetch last 5 sales
sales = db.query(Sale).order_by(Sale.id.desc()).limit(5).all()

if not sales:
    print("No sales found.")
else:
    for sale in sales:
        print(f"\nSale ID: {sale.id}")
        print(f"  User ID: {sale.user_id}")
        print(f"  Company ID: {sale.company_id}") # Added
        print(f"  Product ID: {sale.product_id}")
        
        # Check Relationships
        print(f"  User Relationship: {sale.user}")
        if sale.user:
            print(f"    Name: {sale.user.full_name}")
        else:
            # Try manual query
            u = db.query(User).filter(User.id == sale.user_id).first()
            print(f"    Manual User Check: {u.full_name if u else 'Not Found'}")

        print(f"  Product Relationship: {sale.product}")
        if sale.product:
            print(f"    Name: {sale.product.name}")
        else:
             # Try manual query
            p = db.query(Product).filter(Product.id == sale.product_id).first()
            print(f"    Manual Product Check: {p.name if p else 'Not Found'}")

print("\n--- End Debug ---")
