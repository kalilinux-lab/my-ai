import json
import os

MEMORY_FILE = "memory.json"
memory = {}

def load_memory():
    global memory
    if os.path.exists(MEMORY_FILE):
        try:
            with open(MEMORY_FILE, "r") as f:
                memory = json.load(f)
            print(f"Memory loaded: {len(memory)} entries")
        except Exception as e:
            print(f"Failed to load memory: {e}")
            memory = {}
    else:
        memory = {}

def save_memory():
    try:
        with open(MEMORY_FILE, "w") as f:
            json.dump(memory, f, indent=4)
        print("Memory saved.")
    except Exception as e:
        print(f"Failed to save memory: {e}")

def get_memory():
    return memory

def update_memory(key, value):
    memory[key] = value
    save_memory()
