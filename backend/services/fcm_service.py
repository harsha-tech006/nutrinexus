import firebase_admin
from firebase_admin import messaging

def send_push_notification(fcm_token, title, body, data_payload=None):
    """Send FCM push notification. Fallback if firebase is unconfigured."""
    try:
        # Check if Firebase is initialized
        if not firebase_admin._apps:
            # Silent fallback / logger
            print(f"[FCM Offline Sim] To: {fcm_token} | Title: {title} | Body: {body}")
            return False

        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data_payload or {},
            token=fcm_token,
        )
        response = messaging.send(message)
        print(f"FCM push notification sent successfully: {response}")
        return True
    except Exception as e:
        print(f"FCM delivery error: {str(e)}")
        return False
