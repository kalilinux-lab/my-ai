import tkinter as tk
from tkinter import ttk
import math
import time
import threading
from command_processor import processCommand
from dotenv import load_dotenv
import os
import wolframalpha

# Load environment variables
load_dotenv()
WOLFRAM_APP_ID = os.getenv("WOLFRAM_APP_ID")
wolf_client = wolframalpha.Client(WOLFRAM_APP_ID)

# Global conversation history
conversation_history = []

# Setup the GUI
root = tk.Tk()
root.title("Jarvis - Arc Reactor GUI")
root.geometry("600x700")
root.configure(bg="black")

# Draw arc reactor
canvas = tk.Canvas(root, width=400, height=400, bg="black", highlightthickness=0)
canvas.pack(pady=20)

def draw_arc_reactor():
    canvas.delete("all")
    w, h = 200, 200
    center_x, center_y = w, h
    radius = 100

    # Outer circle
    canvas.create_oval(center_x - radius, center_y - radius, center_x + radius, center_y + radius,
                       outline="#00ffff", width=4)

    # Inner glows
    for r in range(80, 0, -10):
        color = f'#00ffff{hex(255 - r)[2:].zfill(2)}'
        canvas.create_oval(center_x - r, center_y - r, center_x + r, center_y + r,
                           outline=color, width=2)

    # Spokes
    for angle in range(0, 360, 45):
        rad = math.radians(angle)
        x1 = center_x + 20 * math.cos(rad)
        y1 = center_y + 20 * math.sin(rad)
        x2 = center_x + radius * math.cos(rad)
        y2 = center_y + radius * math.sin(rad)
        canvas.create_line(x1, y1, x2, y2, fill="#00ffff", width=2)

# Animate reactor
def animate():
    while True:
        draw_arc_reactor()
        time.sleep(0.05)

threading.Thread(target=animate, daemon=True).start()

# Input + Output
command_entry = ttk.Entry(root, width=50, font=("Arial", 14))
command_entry.pack(pady=10)

output_text = tk.Text(root, width=65, height=15, font=("Arial", 12), bg="black", fg="#00ffff", wrap="word")
output_text.pack(padx=10, pady=10)

# Run Jarvis command on button click
def run_command():
    user_input = command_entry.get()
    if not user_input.strip():
        return
    output_text.insert(tk.END, f"You: {user_input}\n")
    output_text.see(tk.END)

    # Process command
    global conversation_history
    try:
        response = processCommand(user_input, wolf_client, conversation_history)
        output_text.insert(tk.END, f"Jarvis: {response}\n\n")
        output_text.see(tk.END)
    except Exception as e:
        output_text.insert(tk.END, f"Error: {str(e)}\n\n")

    command_entry.delete(0, tk.END)

run_btn = ttk.Button(root, text="Run", command=run_command)
run_btn.pack()

# Optional: Run command on Enter key
def on_enter(event):
    run_command()

command_entry.bind("<Return>", on_enter)

# Start the GUI loop
root.mainloop()
