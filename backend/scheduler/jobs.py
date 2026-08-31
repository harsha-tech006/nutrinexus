import datetime
import sys
from database.db import get_db
from models.Notification import Notification
from services.mail_service import send_email
from services.fcm_service import send_push_notification

def check_medicine_reminders():
    """Cron-like check to trigger medicine logs and push events."""
    db = get_db()
    if db is None:
        return
        
    now_utc = datetime.datetime.utcnow()
    now_local = datetime.datetime.now()

    time_strs = list({now_utc.strftime("%H:%M"), now_local.strftime("%H:%M")})
    day_strs = list({now_utc.strftime("%A"), now_local.strftime("%A")})

    reminders = list(db['medicinereminders'].find({
        "time": {"$in": time_strs},
        "days": {"$in": day_strs},
        "is_active": True
    }))

    for rem in reminders:
        user = db['users'].find_one({"_id": rem['user_id']})
        if not user:
            continue

        title = f"⏰ Pill Reminder: {rem['medicine_name']}"
        body = f"It's time to take your {rem['medicine_name']} ({rem['dosage']})."
        
        # 1. Create system notification log
        try:
            Notification.create(Notification(
                user_id=str(user['_id']),
                title=title,
                body=body,
                notif_type="Medicine"
            ).to_dict())
        except Exception as e:
            print(f"Error creating notification log: {e}", file=sys.stderr)

        # 2. Email notify to user's registered email
        email_addr = user.get('email')
        if email_addr:
            email_body = (
                f"Hello {user.get('name', 'Valued User')},\n\n"
                f"This is your scheduled medicine reminder:\n"
                f"- Medicine: {rem['medicine_name']}\n"
                f"- Dosage: {rem['dosage']}\n"
                f"- Scheduled Time: {rem['time']}\n\n"
                "Please make sure to take your dosage on time.\n\n"
                "Disclaimer: Consult a qualified healthcare professional before taking any medicine."
            )
            html_body = f"""
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
                <h2 style="color: #10b981; margin-bottom: 10px;">⏰ NutriNexus Medicine Alarm</h2>
                <p>Hello <strong>{user.get('name', 'User')}</strong>,</p>
                <p>It's time to take your scheduled medicine!</p>
                <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p style="margin: 4px 0;"><strong>💊 Medicine:</strong> {rem['medicine_name']}</p>
                    <p style="margin: 4px 0;"><strong>🥄 Dosage:</strong> {rem['dosage']}</p>
                    <p style="margin: 4px 0;"><strong>🕒 Scheduled Time:</strong> {rem['time']}</p>
                </div>
                <p style="font-size: 12px; color: #64748b;">Disclaimer: Always follow your physician's guidance.</p>
            </div>
            """
            try:
                send_email(title, [email_addr], email_body, html_body)
                print(f"[MAIL SENT] Sent reminder email for {rem['medicine_name']} to {email_addr}", flush=True)
            except Exception as mail_err:
                print(f"Mail send error: {mail_err}", file=sys.stderr)

        # 3. FCM notify
        fcm_token = user.get('fcm_token')
        if fcm_token:
            try:
                send_push_notification(fcm_token, title, body)
            except Exception as fcm_err:
                print(f"FCM send error: {fcm_err}", file=sys.stderr)

    print(f"[{datetime.datetime.utcnow().isoformat()}] Checked medicine reminders for: {time_strs}")

def check_water_reminders():
    """Triggers hydration reminders every few hours."""
    db = get_db()
    if db is None:
        return
        
    users = list(db['users'].find({"is_verified": True}))
    for user in users:
        title = "Hydration Reminder 💧"
        body = "Stay healthy! Don't forget to drink a glass of water."
        
        try:
            Notification.create(Notification(
                user_id=str(user['_id']),
                title=title,
                body=body,
                notif_type="Water"
            ).to_dict())
        except Exception as e:
            print(f"Error creating water notification: {e}", file=sys.stderr)
        
        fcm_token = user.get('fcm_token')
        if fcm_token:
            try:
                send_push_notification(fcm_token, title, body)
            except Exception as fcm_err:
                print(f"FCM water error: {fcm_err}", file=sys.stderr)

def check_inactive_users_and_send_emails():
    """Checks for users who haven't updated their profile details or haven't logged in recently."""
    db = get_db()
    if db is None:
        return

    now = datetime.datetime.utcnow()
    users = list(db['users'].find({}))

    for user in users:
        email = user.get('email')
        name = user.get('name', 'Valued User')
        if not email:
            continue

        last_reminder = user.get('last_reminder_sent')
        if last_reminder and (now - last_reminder) < datetime.timedelta(days=1):
            continue

        profile_incomplete = (
            user.get('gender') is None or
            user.get('age') is None or
            user.get('height') is None or
            user.get('weight') is None or
            user.get('goal') is None or
            user.get('activity_level') is None
        )

        last_login = user.get('last_login')
        inactive = False
        if last_login:
            if (now - last_login) > datetime.timedelta(days=3):
                inactive = True
        else:
            created_at = user.get('created_at')
            if created_at and (now - created_at) > datetime.timedelta(days=1):
                inactive = True

        sent = False
        if profile_incomplete:
            title = "Complete Your NutriNexus Profile for Personalized Plans"
            body = (
                f"Hello {name},\n\n"
                "Welcome to NutriNexus! We noticed that you haven't completed your profile setup or updated your health metrics.\n\n"
                "Log in to complete your profile:\n"
                "http://localhost:3000/settings\n\n"
                "Best regards,\nThe NutriNexus Team"
            )
            try:
                send_email(title, [email], body)
                sent = True
            except Exception as e:
                print(f"Inactivity email error: {e}", file=sys.stderr)
        elif inactive:
            title = "We miss you at NutriNexus!"
            body = (
                f"Hello {name},\n\n"
                "It has been a few days since your last visit to NutriNexus. Consistent logging is key to achieving your health goals.\n\n"
                "Log in today to view your updated health dashboard:\n"
                "http://localhost:3000/dashboard\n\n"
                "Best regards,\nThe NutriNexus Team"
            )
            try:
                send_email(title, [email], body)
                sent = True
            except Exception as e:
                print(f"Inactivity email error: {e}", file=sys.stderr)

        if sent:
            db['users'].update_one(
                {"_id": user['_id']},
                {"$set": {"last_reminder_sent": now}}
            )

def register_scheduled_jobs(scheduler):
    """Bind scheduled tasks to APScheduler background runner."""
    # Check medicines every 30 seconds
    scheduler.add_job(
        check_medicine_reminders,
        'cron',
        second='0,30',
        id='medicine_reminder_job',
        replace_existing=True
    )
    
    # Check water hydration status every 2 hours
    scheduler.add_job(
        check_water_reminders,
        'interval',
        hours=2,
        id='water_reminder_job',
        replace_existing=True
    )

    # Check user inactivity and send reminders every 12 hours
    scheduler.add_job(
        check_inactive_users_and_send_emails,
        'interval',
        hours=12,
        id='user_inactivity_reminder_job',
        replace_existing=True
    )
