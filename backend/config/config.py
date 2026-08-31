import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "your_super_secret_jwt_key_change_this_to_a_strong_random_string_2024")
    MONGO_URI = os.getenv("MONGO_URI", os.getenv("MONGODB_URI", "mongodb://localhost:27017/nutrition_assistant"))
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    
    # Flask-Mail configuration
    MAIL_SERVER = os.getenv("MAIL_SERVER", os.getenv("EMAIL_HOST", "smtp.gmail.com"))
    MAIL_PORT = int(os.getenv("MAIL_PORT", os.getenv("EMAIL_PORT", 587)))
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "True").lower() in ("true", "1", "t")
    MAIL_USERNAME = os.getenv("MAIL_USERNAME", os.getenv("EMAIL_USER", ""))
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", os.getenv("EMAIL_PASSWORD", ""))
    MAIL_DEFAULT_SENDER = os.getenv("MAIL_DEFAULT_SENDER", os.getenv("EMAIL_FROM", "noreply@nutritionassistant.com"))
    
    # Client URLs for CORS
    CLIENT_URL = os.getenv("CLIENT_URL", "http://localhost:3000")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://127.0.0.1:5500,http://localhost:8080,http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003")

    # Firebase Credentials Path
    FIREBASE_CREDENTIALS_JSON = os.getenv("FIREBASE_CREDENTIALS_JSON", "")
