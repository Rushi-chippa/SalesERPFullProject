from sqlalchemy import create_engine, text
from database import DATABASE_URL

def dump_all():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        with open("dump.txt", "w") as f:
            f.write("--- Users ---\n")
            users = conn.execute(text("SELECT id, email, role, company_id FROM users"))
            for u in users:
                f.write(f"ID: {u.id}, Email: {u.email}, Role: {u.role}, CompanyID: {u.company_id}\n")

            f.write("\n--- Categories ---\n")
            cats = conn.execute(text("SELECT id, name, company_id FROM categories"))
            for c in cats:
                f.write(f"ID: {c.id}, Name: {c.name}, CompanyID: {c.company_id}\n")

if __name__ == "__main__":
    dump_all()
