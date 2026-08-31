from pymongo import MongoClient
from config.config import Config

client = None
db = None

def init_db():
    global client, db
    if db is None:
        client = MongoClient(Config.MONGO_URI)
        # Extract db name from MONGO_URI
        # Format is typically: mongodb://host:port/database_name?options
        parts = Config.MONGO_URI.split("/")
        db_name = parts[-1].split("?")[0] if parts else "nutrition_assistant"
        if not db_name:
            db_name = "nutrition_assistant"
        db = client[db_name]
        print(f"MongoDB connected successfully to database: {db_name}")
    return db

def get_db():
    global db
    if db is None:
        return init_db()
    return db
