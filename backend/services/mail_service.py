import sys
from flask_mail import Message
from flask import current_app

def send_email(subject, recipients, body, html_body=None):
    """General function to send email via Flask-Mail."""
    from app import mail
    try:
        msg = Message(
            subject=subject,
            recipients=recipients,
            body=body,
            html=html_body,
            sender=current_app.config.get('MAIL_DEFAULT_SENDER', 'noreply@nutritionassistant.com')
        )
        mail.send(msg)
        return True
    except Exception as e:
        current_app.logger.error(f"Error sending email: {str(e)}")
        print(f"\n[MAIL SERVICE DEBUG] Subject: {subject}\n[MAIL SERVICE DEBUG] Recipients: {recipients}\n[MAIL SERVICE DEBUG] Body:\n{body}\n", file=sys.stderr, flush=True)
        return False

def send_otp_email(email, name, otp):
    """Send OTP email to user for registration or verification."""
    subject = "NutriNexus - Verification Code"
    body = f"Hello {name},\n\nYour verification code is: {otp}.\nIt will expire in 10 minutes."
    html_body = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #4CAF50;">NutriNexus AI Nutrition Assistant</h2>
        <p>Hello {name},</p>
        <p>Your one-time password (OTP) verification code is:</p>
        <div style="font-size: 24px; font-weight: bold; background: #f4f4f4; padding: 10px 20px; display: inline-block; border-radius: 5px; letter-spacing: 2px;">
            {otp}
        </div>
        <p>This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
        <br>
        <p>Best regards,<br>The NutriNexus Team</p>
    </div>
    """
    return send_email(subject, [email], body, html_body)

def send_fitness_skipped_email(email, name):
    """Send alert email to user when they skip their fitness routine."""
    subject = "NutriNexus - Fitness Routine Skipped"
    body = f"Hello {name},\n\nYou have marked today's workout/fitness routine as skipped. Consistency is the key to building healthy habits. Try to stay active and get back on track tomorrow!"
    html_body = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #FF5722;">NutriNexus Fitness Alert</h2>
        <p>Hello {name},</p>
        <p>You have marked today's fitness/workout routine as <strong>Skipped</strong>.</p>
        <p style="color: #555; line-height: 1.5;">Consistency is the secret to building strong habits. Don't worry about skipping a day, but try to stay active or get back on track tomorrow!</p>
        <br>
        <p>Best regards,<br>The NutriNexus Team</p>
    </div>
    """
    return send_email(subject, [email], body, html_body)
