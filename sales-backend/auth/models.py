from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Company(Base):
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    industry = Column(String)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    company_size = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    subscription_plan = Column(String, default="free")
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="company")
    # Will add back_populates for other modules later

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String, default="manager") # 'manager' or 'salesman'
    employee_id = Column(String, nullable=True) # Optional for managers, but likely used for salesmen
    phone = Column(String, nullable=True)
    region = Column(String, nullable=True)
    sales_target = Column(Integer, nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="users")
