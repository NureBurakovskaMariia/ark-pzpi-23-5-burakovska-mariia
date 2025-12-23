from sensor import read_temperature, read_humidity
from config import SENSOR_TYPES, SEND_INTERVAL
from logic import analyze
from network import send_data
import time

history = {sensor: [] for sensor in SENSOR_TYPES}

while True:
    for sensor_type in SENSOR_TYPES:

        if sensor_type == "Temperature":
            value = read_temperature()
        elif sensor_type == "Humidity":
            value = read_humidity()

        history[sensor_type].append(value)
        if len(history[sensor_type]) > 10:
            history[sensor_type].pop(0)

        result = analyze(history[sensor_type])
        print(f"{sensor_type} reading:", value, "Analysis:", result)

        send_data(sensor_type=sensor_type, value=value)

    time.sleep(SEND_INTERVAL)
