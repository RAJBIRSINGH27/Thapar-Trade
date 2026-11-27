from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
import sqlite3
import uuid

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parent
DB = ROOT / "thapar_trade.db"

app = FastAPI(title="Thapar Trade API", version="1.0.0", description="Academic backend for the Thapar Trade campus marketplace")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000", "http://localhost:3001"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


def now():
    return datetime.now(timezone.utc).isoformat()


def conn():
    c = sqlite3.connect(DB)
    c.row_factory = sqlite3.Row
    return c


def init_db():
    c = conn()
    c.executescript("""
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'student', created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL,
      price REAL NOT NULL, category TEXT NOT NULL, condition TEXT NOT NULL,
      location TEXT NOT NULL, seller_id TEXT NOT NULL, seller_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'available', created_at TEXT NOT NULL,
      FOREIGN KEY(seller_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY, buyer_id TEXT NOT NULL, total REAL NOT NULL,
      pickup_location TEXT NOT NULL, payment_method TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'placed', created_at TEXT NOT NULL,
      FOREIGN KEY(buyer_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY, order_id TEXT NOT NULL, listing_id TEXT NOT NULL,
      title TEXT NOT NULL, price REAL NOT NULL, quantity INTEGER NOT NULL,
      seller_id TEXT NOT NULL, FOREIGN KEY(order_id) REFERENCES orders(id)
    );
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY, order_id TEXT NOT NULL, user_id TEXT NOT NULL,
      amount REAL NOT NULL, method TEXT NOT NULL, status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY, order_id TEXT NOT NULL, user_id TEXT NOT NULL,
      rating INTEGER NOT NULL, comment TEXT, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY, reporter_id TEXT NOT NULL, target_id TEXT NOT NULL,
      target_type TEXT NOT NULL, reason TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'open',
      created_at TEXT NOT NULL
    );
    """)
    if not c.execute("SELECT 1 FROM users WHERE email=?", ("admin@thapar.edu",)).fetchone():
        c.execute("INSERT INTO users VALUES (?,?,?,?,?,?)", ("admin", "Thapar Trade Admin", "admin@thapar.edu", "admin123", "admin", now()))
    c.commit(); c.close()


init_db()

class Register(BaseModel):
    name: str
    email: str
    password: str = Field(min_length=6)

class Login(BaseModel):
    email: str
    password: str

class ListingIn(BaseModel):
    title: str
    description: str
    price: float
    category: str
    condition: str = "Good"
    location: str
    seller_id: str
    seller_name: str

class OrderItemIn(BaseModel):
    listing_id: str
    title: str
    price: float
    quantity: int = 1
    seller_id: str

class OrderIn(BaseModel):
    buyer_id: str
    items: list[OrderItemIn]
    pickup_location: str
    payment_method: str

class PaymentIn(BaseModel):
    order_id: str
    user_id: str
    amount: float
    method: str

class ReviewIn(BaseModel):
    order_id: str
    user_id: str
    rating: int = Field(ge=1, le=5)
    comment: str = ""

class ReportIn(BaseModel):
    reporter_id: str
    target_id: str
    target_type: str
    reason: str

class StatusIn(BaseModel):
    status: str

@app.get("/")
def root():
    return {"service":"Thapar Trade API", "status":"healthy", "version":"1.0.0"}

@app.get("/api/health")
def health():
    return {"status":"healthy", "database":"sqlite", "path":str(DB)}

@app.post("/api/auth/register")
def register(data:Register):
    email=data.email.strip().lower()
    if not email.endswith("@thapar.edu"):
        raise HTTPException(400,"Only @thapar.edu accounts are allowed")
    c=conn()
    try:
        uid=str(uuid.uuid4())
        c.execute("INSERT INTO users VALUES (?,?,?,?,?,?)",(uid,data.name.strip(),email,data.password,"student",now()))
        c.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(400,"Account already exists")
    finally: c.close()
    return {"id":uid,"name":data.name.strip(),"email":email,"role":"student"}

@app.post("/api/auth/login")
def login(data:Login):
    c=conn(); row=c.execute("SELECT id,name,email,role FROM users WHERE email=? AND password=?",(data.email.strip().lower(),data.password)).fetchone(); c.close()
    if not row: raise HTTPException(401,"Invalid email or password")
    return dict(row)

@app.get("/api/listings")
def get_listings(search:Optional[str]=None, category:Optional[str]=None):
    c=conn(); rows=c.execute("SELECT * FROM listings WHERE status='available' ORDER BY created_at DESC").fetchall(); c.close()
    result=[dict(x) for x in rows]
    if category and category!="All": result=[x for x in result if x["category"]==category]
    if search: result=[x for x in result if search.lower() in (x["title"]+" "+x["description"]+" "+x["seller_name"]).lower()]
    return result

@app.post("/api/listings")
def create_listing(data:ListingIn):
    lid=str(uuid.uuid4()); c=conn(); c.execute("INSERT INTO listings VALUES (?,?,?,?,?,?,?,?,?,?,?)",(lid,data.title,data.description,data.price,data.category,data.condition,data.location,data.seller_id,data.seller_name,"available",now())); c.commit(); c.close(); return {"id":lid,**data.model_dump(),"status":"available"}

@app.put("/api/listings/{listing_id}")
def update_listing(listing_id:str,data:ListingIn):
    c=conn(); row=c.execute("SELECT id FROM listings WHERE id=?",(listing_id,)).fetchone()
    if not row: c.close(); raise HTTPException(404,"Listing not found")
    c.execute("UPDATE listings SET title=?,description=?,price=?,category=?,condition=?,location=? WHERE id=?",(data.title,data.description,data.price,data.category,data.condition,data.location,listing_id)); c.commit(); c.close(); return {"message":"Listing updated"}

@app.delete("/api/listings/{listing_id}")
def delete_listing(listing_id:str):
    c=conn(); c.execute("DELETE FROM listings WHERE id=?",(listing_id,)); c.commit(); c.close(); return {"message":"Listing deleted"}

@app.post("/api/orders")
def create_order(data:OrderIn):
    oid=f"TT-{uuid.uuid4().hex[:8].upper()}"; total=sum(i.price*i.quantity for i in data.items); c=conn(); c.execute("INSERT INTO orders VALUES (?,?,?,?,?,?,?)",(oid,data.buyer_id,total,data.pickup_location,data.payment_method,"placed",now()))
    for i in data.items: c.execute("INSERT INTO order_items VALUES (?,?,?,?,?,?,?)",(str(uuid.uuid4()),oid,i.listing_id,i.title,i.price,i.quantity,i.seller_id)); c.execute("UPDATE listings SET status='sold' WHERE id=?",(i.listing_id,))
    c.commit(); c.close(); return {"order_id":oid,"total":total,"status":"placed"}

@app.get("/api/orders/{user_id}")
def orders(user_id:str):
    c=conn(); rows=c.execute("SELECT * FROM orders WHERE buyer_id=? ORDER BY created_at DESC",(user_id,)).fetchall(); result=[]
    for r in rows:
        d=dict(r); d["items"]=[dict(x) for x in c.execute("SELECT * FROM order_items WHERE order_id=?",(r["id"],)).fetchall()]; result.append(d)
    c.close(); return result

@app.post("/api/payments")
def create_payment(data:PaymentIn):
    pid=f"PAY-{uuid.uuid4().hex[:8].upper()}"; c=conn(); c.execute("INSERT INTO payments VALUES (?,?,?,?,?,?,?)",(pid,data.order_id,data.user_id,data.amount,data.method,"success",now())); c.commit(); c.close(); return {"payment_id":pid,"status":"success"}

@app.post("/api/reviews")
def create_review(data:ReviewIn):
    rid=str(uuid.uuid4()); c=conn(); c.execute("INSERT INTO reviews VALUES (?,?,?,?,?,?)",(rid,data.order_id,data.user_id,data.rating,data.comment,now())); c.commit(); c.close(); return {"id":rid,"status":"submitted"}

@app.post("/api/reports")
def create_report(data:ReportIn):
    rid=str(uuid.uuid4()); c=conn(); c.execute("INSERT INTO reports VALUES (?,?,?,?,?,?,?)",(rid,data.reporter_id,data.target_id,data.target_type,data.reason,"open",now())); c.commit(); c.close(); return {"id":rid,"status":"open"}

@app.get("/api/admin/summary")
def admin_summary():
    c=conn(); result={}
    for table,key in [("users","users"),("listings","listings"),("orders","orders"),("payments","payments"),("reviews","reviews"),("reports","reports")]: result[key]=c.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
    result["open_reports"]=c.execute("SELECT COUNT(*) FROM reports WHERE status='open'").fetchone()[0]; c.close(); return result

@app.patch("/api/admin/orders/{order_id}")
def admin_order_status(order_id:str,data:StatusIn):
    allowed={"placed","processing","ready","completed","cancelled"}
    if data.status not in allowed: raise HTTPException(400,"Invalid status")
    c=conn(); c.execute("UPDATE orders SET status=? WHERE id=?",(data.status,order_id)); c.commit(); c.close(); return {"order_id":order_id,"status":data.status}

@app.patch("/api/admin/reports/{report_id}")
def resolve_report(report_id:str):
    c=conn(); c.execute("UPDATE reports SET status='resolved' WHERE id=?",(report_id,)); c.commit(); c.close(); return {"id":report_id,"status":"resolved"}
