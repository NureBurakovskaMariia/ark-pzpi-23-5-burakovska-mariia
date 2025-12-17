import random

def read_temperature():
    return round(random.uniform(36.5, 38.5), 2)

def read_humidity():
    return round(random.uniform(40.0, 70.0), 2)
