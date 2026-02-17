from sqlalchemy import MetaData, Table, Column, Integer, String, DateTime, inspect
from datetime import datetime

def get_table_name(company_name: str) -> str:
    """
    Sanitizes the company name to create a valid and safe table name.
    Removes spaces and non-alphanumeric characters, except for underscores.
    """
    sanitized = "".join(c if c.isalnum() else "_" for c in company_name)
    return sanitized

def ensure_company_salesmen_table(engine, table_name: str):
    """
    Checks if the dynamic table for the company exists.
    If not, creates it with the required schema.
    """
    inspector = inspect(engine)
    if not inspector.has_table(table_name):
        metadata = MetaData()
        # Define the dynamic table structure
        # We store key info + link to original user_id
        salesmen_table = Table(
            table_name,
            metadata,
            Column('id', Integer, primary_key=True),
            Column('user_id', Integer), # Reference to users.id
            Column('full_name', String),
            Column('email', String),
            Column('phone', String, nullable=True),
            Column('region', String, nullable=True),
            Column('sales_target', Integer, nullable=True),
            Column('created_at', DateTime, default=datetime.utcnow)
        )
        metadata.create_all(engine)
        print(f"DEBUG: Created dynamic table '{table_name}'")
    else:
        print(f"DEBUG: Table '{table_name}' already exists")

def insert_salesman_data(engine, table_name: str, data: dict):
    """
    Inserts a salesman record into the specified dynamic table.
    """
    metadata = MetaData()
    # Reflect the table to get the object
    table = Table(table_name, metadata, autoload_with=engine)
    
    with engine.connect() as conn:
        stmt = table.insert().values(**data)
        conn.execute(stmt)
        conn.commit()
    print(f"DEBUG: Inserted data into '{table_name}': {data['email']}")
