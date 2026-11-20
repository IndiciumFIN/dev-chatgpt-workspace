import os
import json
import urllib.request
import urllib.error

token = os.environ.get("BASE44_SERVICE_TOKEN")
backend_url = os.environ.get("VITE_BASE44_BACKEND_URL", "https://base44.app")

print(f"Backend URL: {backend_url}")
print(f"Token length: {len(token) if token else 0}")

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}
req = urllib.request.Request(f"{backend_url}/api/apps", headers=headers, method="GET")
try:
    with urllib.request.urlopen(req) as r:
        print("Success!")
        print(r.read().decode("utf-8")[:200])
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code}, {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")
