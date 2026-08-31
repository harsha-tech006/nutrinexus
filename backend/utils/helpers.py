import random
import datetime
import bcrypt
import jwt
from config.config import Config

def hash_password(password: str) -> str:
    """Hash password using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def check_password(hashed_password: str, password: str) -> bool:
    """Verify password against hashed password."""
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def generate_token(user_id: str) -> str:
    """Generate JWT Auth Token."""
    try:
        payload = {
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7),
            'iat': datetime.datetime.utcnow(),
            'sub': str(user_id)
        }
        return jwt.encode(
            payload,
            Config.SECRET_KEY,
            algorithm='HS256'
        )
    except Exception as e:
        return str(e)

def generate_otp() -> str:
    """Generate random 6 digit numeric code."""
    return f"{random.randint(100000, 999999)}"

def calculate_bmi(weight_kg: float, height_m: float) -> float:
    """Calculate Body Mass Index (BMI)."""
    if not weight_kg or not height_m or height_m <= 0:
        return 0.0
    # If height is entered in cm (e.g. 175) instead of meters (1.75)
    if height_m > 3.0:
        height_m = height_m / 100.0
    return round(weight_kg / (height_m ** 2), 2)

def calculate_bmr(weight_kg: float, height_cm: float, age_years: int, gender: str) -> float:
    """Calculate BMR using Mifflin-St Jeor Equation."""
    if not weight_kg or not height_cm or not age_years or not gender:
        return 0.0
    # Ensure height is in cm
    if height_cm < 3.0:
        height_cm = height_cm * 100.0
        
    gender = gender.lower()
    if gender in ['male', 'm']:
        return round(10 * weight_kg + 6.25 * height_cm - 5 * age_years + 5, 2)
    else:
        return round(10 * weight_kg + 6.25 * height_cm - 5 * age_years - 161, 2)

def calculate_tdee(bmr: float, activity_level: str) -> float:
    """Calculate TDEE based on BMR and Activity Level."""
    multipliers = {
        'sedentary': 1.2,
        'lightly active': 1.375,
        'moderately active': 1.55,
        'very active': 1.725,
        'extra active': 1.9
    }
    # Match case-insensitive and fallback
    level = str(activity_level).lower().strip()
    multiplier = multipliers.get(level, 1.2)
    return round(bmr * multiplier, 2)

def calculate_water_requirement(weight_kg: float) -> float:
    """Calculate daily water requirement in Liters."""
    if not weight_kg or weight_kg <= 0:
        return 2.0
    # 35ml per kg of body weight
    return round((weight_kg * 35) / 1000, 2)

def calculate_protein_requirement(weight_kg: float, goal: str) -> float:
    """Calculate daily protein requirement in grams."""
    if not weight_kg or weight_kg <= 0:
        return 50.0
        
    goal_multiplier = {
        'weight loss': 1.8,
        'weight gain': 1.5,
        'muscle gain': 2.0,
        'healthy lifestyle': 1.0
    }
    g = str(goal).lower().strip()
    multiplier = goal_multiplier.get(g, 1.0)
    return round(weight_kg * multiplier, 1)
