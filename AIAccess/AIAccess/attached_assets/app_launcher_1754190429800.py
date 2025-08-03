import json
import os
import subprocess

APP_FILE = "apps.json"
apps = {}

def load_apps():
    global apps
    if os.path.exists(APP_FILE):
        try:
            with open(APP_FILE, "r") as f:
                apps = json.load(f)
            print(f"Loaded {len(apps)} apps.")
        except Exception as e:
            print(f"Failed to load apps: {e}")
            apps = {}
    else:
        print("apps.json file not found.")
        apps = {}

def launch_app(app_name):
    app_path = apps.get(app_name.lower())
    if app_path and os.path.exists(app_path):
        try:
            subprocess.Popen(app_path)
            return f"Launching {app_name}."
        except Exception as e:
            return f"Error launching {app_name}: {str(e)}"
    else:
        return f"App '{app_name}' not found or path is invalid."
