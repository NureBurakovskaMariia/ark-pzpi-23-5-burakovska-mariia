import requests
from config import SERVER_URL, ANIMAL_ID

def send_data(sensor_type, value):
    payload = {
        "animal_id": ANIMAL_ID,
        "sensor_type": sensor_type,
        "value": value
    }

    try:
        response = requests.post(SERVER_URL, json=payload)
        print(f"SERVER RESPONSE ({sensor_type}):", response.status_code)
    except requests.exceptions.RequestException as e:
        print("Error sending data:", e)
