from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, DateTime, JSON, func
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import sessionmaker, declarative_base, Session, relationship
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

# 1. Ініціалізація FastAPI
app = FastAPI()

# Налаштування CORS для дозволу запитів з вашого фронтенду
origins = [
    "http://localhost:5173",  # URL вашого фронтенд-додатку
    "http://127.0.0.1:5173"   # Можливий варіант для localhost
]

# Додавання CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Додай всі варіанти
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = "mysql+pymysql://root:Valik25122005!@127.0.0.1:3306/bar_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime


# Таблиця категорій для напоїв
class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    drinks = relationship("Drink", back_populates="category")


# Таблиця для інгредієнтів
class Drink(Base):
    __tablename__ = "drinks"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)  # Наприклад: "Пиво", "Ром"
    category_id = Column(Integer, ForeignKey("categories.id"))
    quantity = Column(Float, default=0.0)  # Літри в запасі
    min_threshold = Column(Float, default=1.0)  # Мінімальний запас
    category = relationship("Category", back_populates="drinks")
    price = Column(Float, default=0.0)


# Таблиця коктейлів
class Cocktail(Base):
    __tablename__ = "cocktails"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    price = Column(Float, default=0.0)
    ingredients = relationship("CocktailIngredient", back_populates="cocktail")  # Зв'язок з інгредієнтами


# Проміжна таблиця для зв'язку коктейлів та інгредієнтів
class CocktailIngredient(Base):
    __tablename__ = "cocktail_ingredients"
    id = Column(Integer, primary_key=True, index=True)
    cocktail_id = Column(Integer, ForeignKey("cocktails.id"))
    drink_id = Column(Integer, ForeignKey("drinks.id"))
    quantity = Column(Float)  # Кількість інгредієнта в цьому коктейлі

    cocktail = relationship("Cocktail", back_populates="ingredients")
    drink = relationship("Drink")


# Таблиця історії замовлень
class OrderHistory(Base):
    __tablename__ = "order_history"
    id = Column(Integer, primary_key=True, index=True)
    cocktail_id = Column(Integer, ForeignKey("cocktails.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    cocktail = relationship("Cocktail")


# Таблиця закупок інгредієнтів
class Purchase(Base):
    __tablename__ = "purchases"
    id = Column(Integer, primary_key=True, index=True)
    drink_id = Column(Integer, ForeignKey("drinks.id"))
    quantity_added = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)
    drink = relationship("Drink")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import timedelta

# Конфігурація хешування паролів
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Ключ для генерації JWT (зміни на власний!)
SECRET_KEY = "mysecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Таблиця користувачів
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

Base.metadata.create_all(bind=engine)

from fastapi import FastAPI, HTTPException, Depends, Request, Response
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from uuid import uuid4
from typing import Optional


# Додаємо middleware для сесій
app.add_middleware(SessionMiddleware, secret_key="supersecretkey", session_cookie="session_id")


# Функція для створення сесії
def create_session(response: Response, user_id: int):
    session_id = str(uuid4())  # Генеруємо унікальний ідентифікатор сесії
    response.set_cookie(key="session_id", value=session_id, httponly=True, secure=True, samesite="Lax")
    return session_id


# Функція для отримання користувача із сесії
def get_current_user(request: Request, db: Session = Depends(get_db)):
    session_id = request.cookies.get("session_id")
    if not session_id:
        raise HTTPException(status_code=401, detail="Не авторизовано")

    user = db.query(User).filter(User.session_id == session_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Сесія недійсна")

    return user


# Функція для хешування пароля
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Функція для перевірки пароля
def verify_password(plain_password, hashed_password) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Функція для створення JWT-токена
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# Функція для отримання доступу до бази даних
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Роут для отримання інвентарю
@app.get("/inventory/")
def get_inventory(db: Session = Depends(get_db)):
    drinks = db.query(Drink).join(Category).all()
    return {"inventory": [
        {
            "id": drink.id,
            "category": drink.category.name,
            "name": drink.name,
            "quantity": drink.quantity
        }
        for drink in drinks
    ]}

@app.get("/orders/")
def get_orders(db: Session = Depends(get_db)):
    orders = db.query(OrderHistory).all()
    return orders

@app.post("/order/")
def make_order(order: dict, db: Session = Depends(get_db)):
    cocktail = db.query(Cocktail).filter(Cocktail.name == order.get('item')).first()
    if not cocktail:
        raise HTTPException(status_code=404, detail="Cocktail not found")

    quantity = order.get('quantity', 1)  # Якщо quantity немає, ставимо значення 1

    # Створюємо замовлення в таблиці OrderHistory
    new_order = OrderHistory(cocktail_id=cocktail.id)
    db.add(new_order)

    # Оновлюємо кількість інгредієнтів у drinks
    for ingredient in cocktail.ingredients:
        drink = db.query(Drink).filter(Drink.id == ingredient.drink_id).first()
        if drink:
            used_quantity = ingredient.quantity * quantity
            if drink.quantity >= used_quantity:
                drink.quantity -= used_quantity
                db.add(drink)
            else:
                raise HTTPException(status_code=400, detail=f"Not enough {drink.name} in stock")
        else:
            raise HTTPException(status_code=404, detail=f"Drink with id {ingredient.drink_id} not found")

    db.commit()
    return {"message": "Order placed successfully"}



from sqlalchemy import text

@app.post("/place_order")
async def place_order():
    db = SessionLocal()
    try:
        print("Received request to place order")  # Логування запиту
        db.execute(text("CALL decrease_inventory_based_on_orders()"))  # Використовуємо text()
        db.commit()
        return {"status": "success", "message": "Order processed and inventory updated."}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        db.close()



@app.get("/cocktails/")
def get_cocktails(db: Session = Depends(get_db)):
    cocktails = db.query(Cocktail).all()
    return [{"id": cocktail.id, "name": cocktail.name} for cocktail in cocktails]





@app.get("/drinks/")
def get_drinks(db: Session = Depends(get_db)):
    drinks = db.query(Drink).all()
    return [{"id": drink.id, "name": drink.name, "quantity": drink.quantity} for drink in drinks]



@app.post("/purchase/")
def make_purchase(purchase: dict, db: Session = Depends(get_db)):
    drink_id = purchase.get('drink_id')
    quantity_added = purchase.get('quantity', 0)

    if not drink_id or quantity_added <= 0:
        raise HTTPException(status_code=400, detail="Invalid drink ID or quantity")

    try:
        # Створюємо запис у таблиці purchases
        new_purchase = Purchase(drink_id=drink_id, quantity_added=quantity_added)
        db.add(new_purchase)

        # Викликаємо збережену процедуру або оновлюємо запаси вручну
        db.execute(text("CALL increase_inventory(:drink_id, :quantity)"),
                   {"drink_id": drink_id, "quantity": quantity_added})

        db.commit()
        return {"message": f"Закуплено {quantity_added} одиниць товару"}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")



@app.get("/purchases/")
def get_purchases(db: Session = Depends(get_db)):
    purchases = db.query(Purchase).all()
    return [
        {
            "id": p.id,
            "drink": db.query(Drink).filter(Drink.id == p.drink_id).first().name,
            "quantity_added": p.quantity_added,
            "timestamp": p.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        }
        for p in purchases
    ]


@app.get("/sales_report/")
def get_sales_report(period: str, db: Session = Depends(get_db)):
    """ Отримати звіт про продажі за вибраний період """

    now = datetime.utcnow()
    if period == "day":
        start_date = now - timedelta(days=1)
    elif period == "week":
        start_date = now - timedelta(weeks=1)
    elif period == "month":
        start_date = now - timedelta(days=30)
    else:
        raise HTTPException(status_code=400, detail="Invalid period")

    sales = (
        db.query(
            Cocktail.name.label("cocktail"),
            func.count(OrderHistory.id).label("quantity"),
            (func.count(OrderHistory.id) * Cocktail.price).label("total_sales")
        )
        .join(Cocktail, Cocktail.id == OrderHistory.cocktail_id)
        .filter(OrderHistory.timestamp >= start_date)
        .group_by(Cocktail.id)
        .all()
    )

    return [{"cocktail": s.cocktail, "quantity": s.quantity, "total_sales": s.total_sales} for s in sales]


@app.get("/purchases_report/")
def get_purchases_report(period: str, db: Session = Depends(get_db)):
    """ Отримати звіт про закупівлі за вибраний період """

    now = datetime.utcnow()
    if period == "day":
        start_date = now - timedelta(days=1)
    elif period == "week":
        start_date = now - timedelta(weeks=1)
    elif period == "month":
        start_date = now - timedelta(days=30)
    else:
        raise HTTPException(status_code=400, detail="Invalid period")

    purchases = (
        db.query(
            Drink.name.label("drink"),
            func.sum(Purchase.quantity_added).label("quantity"),
            func.sum(Purchase.quantity_added * Drink.price).label("total_cost")  # Ціна з `drinks.price`
        )
        .join(Drink, Drink.id == Purchase.drink_id)  # З'єднуємо purchases і drinks
        .filter(Purchase.timestamp >= start_date)
        .group_by(Drink.id)
        .all()
    )

    return [{"drink": p.drink, "quantity": p.quantity, "total_cost": p.total_cost} for p in purchases]






@app.get("/dashboard_stats/")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """ Отримати статистику для головної сторінки """

    # Загальний дохід (сума всіх продажів)
    total_sales = (
        db.query(func.sum(Cocktail.price))
        .join(OrderHistory, OrderHistory.cocktail_id == Cocktail.id)
        .scalar() or 0
    )

    # Загальні витрати (сума закупівель)
    total_purchases = (
        db.query(func.sum(Purchase.quantity_added * Drink.price))
        .join(Drink, Drink.id == Purchase.drink_id)
        .scalar() or 0
    )

    # Чистий прибуток = дохід - витрати
    net_profit = total_sales - total_purchases

    # Найпопулярніший коктейль (той, що продавався найбільше разів)
    most_popular = (
        db.query(Cocktail.name, func.count(OrderHistory.id).label("count"))
        .join(OrderHistory, OrderHistory.cocktail_id == Cocktail.id)
        .group_by(Cocktail.id)
        .order_by(func.count(OrderHistory.id).desc())
        .first()
    )

    return {
        "total_sales": total_sales,
        "total_purchases": total_purchases,
        "net_profit": net_profit,
        "most_popular": most_popular[0] if most_popular else "Немає продажів"
    }




@app.get("/sales_trend/")
def get_sales_trend(period: str = "week", db: Session = Depends(get_db)):
    """ Отримати тренд продажів та закупівель за вибраний період """

    now = datetime.utcnow()
    if period == "day":
        start_date = now - timedelta(days=1)
    elif period == "week":
        start_date = now - timedelta(weeks=1)
    elif period == "month":
        start_date = now - timedelta(days=30)
    else:
        raise HTTPException(status_code=400, detail="Invalid period")

    # Групуємо продажі по днях
    sales = (
        db.query(
            func.date(OrderHistory.timestamp).label("date"),
            func.sum(Cocktail.price).label("total_sales")  # Використовуємо sum(Cocktail.price)
        )
        .join(Cocktail, Cocktail.id == OrderHistory.cocktail_id)
        .filter(OrderHistory.timestamp >= start_date)
        .group_by(func.date(OrderHistory.timestamp))
        .order_by(func.date(OrderHistory.timestamp))
        .all()
    )

    # Групуємо закупівлі по днях
    purchases = (
        db.query(
            func.date(Purchase.timestamp).label("date"),
            func.sum(Purchase.quantity_added * Drink.price).label("total_purchases")
        )
        .join(Drink, Drink.id == Purchase.drink_id)
        .filter(Purchase.timestamp >= start_date)
        .group_by(func.date(Purchase.timestamp))
        .order_by(func.date(Purchase.timestamp))
        .all()
    )

    # Логування для перевірки запиту
    print("Продажі:", sales)
    print("Закупівлі:", purchases)

    # Формуємо словники для швидкого доступу
    sales_dict = {str(s.date): s.total_sales for s in sales}
    purchases_dict = {str(p.date): p.total_purchases for p in purchases}

    trend_data = []
    for i in range((now - start_date).days + 1):
        day = (start_date + timedelta(days=i)).strftime("%Y-%m-%d")
        trend_data.append({
            "date": day,
            "sales": sales_dict.get(day, 0),
            "purchases": purchases_dict.get(day, 0)
        })

    print("Формовані дані:", trend_data)  # Логування перед поверненням
    return trend_data



@app.get("/low_stock/")
def get_low_stock_items(db: Session = Depends(get_db)):
    """ Отримати список товарів, у яких кількість менше мінімального порогу """
    low_stock_items = (
        db.query(Drink)
        .filter(Drink.quantity < Drink.min_threshold)
        .all()
    )

    return [
        {
            "id": drink.id,
            "name": drink.name,
            "quantity": drink.quantity,
            "min_threshold": drink.min_threshold
        }
        for drink in low_stock_items
    ]



@app.post("/register/")
def register_user(user: dict, db: Session = Depends(get_db)):
    username = user.get("username")
    password = user.get("password")

    if db.query(User).filter(User.username == username).first():
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_password = hash_password(password)
    new_user = User(username=username, hashed_password=hashed_password)

    db.add(new_user)
    db.commit()

    return {"message": "User registered successfully"}


@app.post("/login/")
def login(user: dict, response: Response, db: Session = Depends(get_db)):
    username = user.get("username")
    password = user.get("password")

    db_user = db.query(User).filter(User.username == username).first()
    if not db_user or not verify_password(password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Невірні дані")

    session_id = create_session(response, db_user.id)  # Створюємо сесію
    db_user.session_id = session_id  # Зберігаємо її в БД
    db.commit()

    return {"message": "Вхід успішний"}

@app.post("/logout/")
def logout(response: Response, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    response.delete_cookie("session_id")  # Видаляємо кукі
    current_user.session_id = None  # Очищаємо сесію в БД
    db.commit()
    return {"message": "Вихід виконано"}



from fastapi.security import OAuth2PasswordBearer
from fastapi import Security

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Security(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        user = db.query(User).filter(User.username == username).first()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


@app.get("/protected/")
def protected_route(current_user: User = Depends(get_current_user)):
    return {"message": f"Привіт, {current_user.username}!"}


@app.get("/get_user/")
def get_user(request: Request, db: Session = Depends(get_db)):
    session_id = request.cookies.get("session_id")
    if not session_id:
        raise HTTPException(status_code=401, detail="Не авторизовано")

    user = db.query(User).filter(User.session_id == session_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Сесія недійсна")

    return {"username": user.username}


# Роут для тесту
@app.get("/")
def root():
    return {"message": "Bar Admin API is running"}
