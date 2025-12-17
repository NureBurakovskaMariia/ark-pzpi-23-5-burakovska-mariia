import math

def analyze(values):
    mean = sum(values) / len(values)

    variance = sum((v - mean) ** 2 for v in values) / len(values)
    std_dev = math.sqrt(variance)

    current = values[-1]
    is_anomaly = abs(current - mean) > 2 * std_dev

    return {
        "current": current,
        "mean": round(mean, 2),
        "std_dev": round(std_dev, 2),
        "is_anomaly": is_anomaly
    }
