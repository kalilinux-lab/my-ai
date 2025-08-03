import sys
import threading
from PyQt5.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QHBoxLayout,
    QTextEdit, QLineEdit, QPushButton, QLabel, QMessageBox
)
from PyQt5.QtGui import QPalette, QColor, QFont, QPixmap
from PyQt5.QtCore import Qt
from speech_utils import recognize_speech, speak
from command_processor import processCommand
from memory_utils import load_memory, save_memory
import os
import wolframalpha
from dotenv import load_dotenv
from googlesearch import search
import requests
from bs4 import BeautifulSoup

class JarvisGUI(QWidget):
    def __init__(self):
        super().__init__()
        self.latest_response = ""  # Store last response

        self.setWindowTitle("Jarvis Assistant")
        self.setGeometry(200, 200, 700, 600)

        self.setStyleSheet(f"""
            QWidget {{
                background-image: url(background.jpg);
                background-repeat: no-repeat;
                background-position: center;
                background-size: cover;
                color: white;
            }}
        """)

        self.layout = QVBoxLayout()

        self.chat_display = QTextEdit()
        self.chat_display.setReadOnly(True)
        self.chat_display.setStyleSheet("background-color: rgba(43, 43, 43, 0.8); color: white; font: 12pt Consolas;")

        self.input_box = QLineEdit()
        self.input_box.setStyleSheet("background-color: rgba(60, 60, 60, 0.9); color: white; font: 11pt Consolas;")
        self.input_box.returnPressed.connect(self.handle_text_command)

        self.mic_button = QPushButton("🎙️ Speak")
        self.mic_button.setStyleSheet("background-color: #007acc; color: white; padding: 6px;")
        self.mic_button.clicked.connect(self.handle_voice_command)

        self.send_button = QPushButton("Send")
        self.send_button.setStyleSheet("background-color: #007acc; color: white; padding: 6px;")
        self.send_button.clicked.connect(self.handle_text_command)

        self.stop_button = QPushButton("⛔ Stop")
        self.stop_button.setStyleSheet("background-color: #d32f2f; color: white; padding: 6px;")
        self.stop_button.clicked.connect(self.close_jarvis)

        self.status_label = QLabel("Welcome to Jarvis Alpha0 variant!")
        self.status_label.setStyleSheet("font: 10pt Consolas; background-color: rgba(30,30,30,0.7);")

        btn_layout = QHBoxLayout()
        btn_layout.addWidget(self.input_box)
        btn_layout.addWidget(self.send_button)
        btn_layout.addWidget(self.mic_button)
        btn_layout.addWidget(self.stop_button)

        quick_layout = QHBoxLayout()
        self.joke_btn = QPushButton("Tell Joke")
        self.joke_btn.setStyleSheet("background-color: #5e35b1; color: white; padding: 5px;")
        self.joke_btn.clicked.connect(lambda: self.send_quick_command("tell me a joke"))

        self.ss_btn = QPushButton("Screenshot")
        self.ss_btn.setStyleSheet("background-color: #5e35b1; color: white; padding: 5px;")
        self.ss_btn.clicked.connect(lambda: self.send_quick_command("take screenshot"))

        self.yt_btn = QPushButton("Open YouTube")
        self.yt_btn.setStyleSheet("background-color: #5e35b1; color: white; padding: 5px;")
        self.yt_btn.clicked.connect(lambda: self.send_quick_command("open youtube"))

        self.speak_btn = QPushButton("🔊 Speak Output")
        self.speak_btn.setStyleSheet("background-color: #388e3c; color: white; padding: 5px;")
        self.speak_btn.clicked.connect(self.speak_latest_output)

        quick_layout.addWidget(self.joke_btn)
        quick_layout.addWidget(self.ss_btn)
        quick_layout.addWidget(self.yt_btn)
        quick_layout.addWidget(self.speak_btn)

        self.layout.addWidget(self.chat_display)
        self.layout.addLayout(btn_layout)
        self.layout.addLayout(quick_layout)
        self.layout.addWidget(self.status_label)
        self.setLayout(self.layout)

        self.conversation_history = []
        load_memory()

        load_dotenv()
        wolfram_app_id = os.getenv("WOLFRAM_APP_ID")
        if not wolfram_app_id:
            QMessageBox.critical(self, "Error", "Missing WolframAlpha App ID in .env")
            sys.exit()
        self.wolf_client = wolframalpha.Client(wolfram_app_id)

    def fetch_web_result(self, query):
        try:
            for result in search(query, num_results=1):
                response = requests.get(result, timeout=5)
                soup = BeautifulSoup(response.text, 'html.parser')
                for tag in ['p', 'span', 'div']:
                    elements = soup.find_all(tag)
                    for element in elements:
                        text = element.get_text().strip()
                        if len(text) > 50 and query.lower().split()[0] in text.lower():
                            return text
            return "You can check this link for more info:\n" + result
        except Exception as e:
            return f"Sorry, I couldn't fetch the latest info. ({str(e)})"

    def send_quick_command(self, cmd):
        self.input_box.setText(cmd)
        self.handle_text_command()

    def handle_text_command(self):
        command = self.input_box.text().strip()
        if not command:
            return
        self.display_message("You", command)
        self.input_box.clear()
        threading.Thread(target=self.process_command, args=(command,), daemon=True).start()

    def handle_voice_command(self):
        self.status_label.setText("Listening...")
        threading.Thread(target=self.recognize_and_process, daemon=True).start()

    def recognize_and_process(self):
        command = recognize_speech()
        if command:
            self.display_message("You (voice)", command)
            self.process_command(command)
        else:
            self.status_label.setText("Sorry, I didn't catch that.")

    def process_command(self, command):
        self.status_label.setText("Processing...")
        response = processCommand(command, self.wolf_client, self.conversation_history)
        if not response or "sorry" in response.lower():
            response = self.fetch_web_result(command)

        self.conversation_history.append({"role": "user", "content": command})
        self.conversation_history.append({"role": "assistant", "content": response})
        self.display_message("Jarvis", response)
        self.latest_response = response
        self.status_label.setText("Ready")

    def speak_latest_output(self):
        if self.latest_response:
            speak(self.latest_response)

    def close_jarvis(self):
        self.status_label.setText("Jarvis is shutting down...")
        speak("Shutting down now")
        save_memory()
        QApplication.quit()

    def display_message(self, sender, message):
        self.chat_display.append(f"<b>{sender}:</b> {message}")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    jarvis_gui = JarvisGUI()
    jarvis_gui.show()
    sys.exit(app.exec_())
