import re

def is_valid_email(email: str) -> bool:
    """Validate email format using regex."""
    if not email:
        return False
    email_regex = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return bool(re.match(email_regex, email.strip()))

def validate_password_strength(password: str) -> bool:
    """Validate if password is at least 6 characters."""
    if not password or len(password) < 6:
        return False
    return True
