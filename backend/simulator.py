import time
import requests

from honeypot import generate_event


LIVE_API = "https://honeypot-monitoring-dashboard.onrender.com"


print()
print("=" * 60)
print("🍯 HONEYPOT ATTACK SIMULATOR")
print("=" * 60)
print("🌐 Live backend:")
print(LIVE_API)
print("⏱️ New attack every 5 minutes")
print("🛑 Press CTRL + C to stop")
print("=" * 60)


while True:

    try:

        # Generate fake attack
        event = generate_event()

        # Send event to Render
        response = requests.post(
            f"{LIVE_API}/api/events/generate",
            json={
                "source_ip": event["source_ip"],
                "username": event["username"],
                "password": event["password"]
            },
            timeout=30
        )

        response.raise_for_status()

        print("✅ Attack sent to LIVE Render backend")

    except requests.exceptions.RequestException as error:

        print()
        print("❌ Could not connect to LIVE backend")
        print(error)

    except Exception as error:

        print()
        print("❌ Simulator error")
        print(error)

    print()
    print("⏳ Waiting 5 minutes for next attack...")
    print("⏱️ 300 seconds")

    time.sleep(300)