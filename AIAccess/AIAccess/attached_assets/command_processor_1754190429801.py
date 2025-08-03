import datetime
import pyaudio 
import webbrowser
import pyjokes
import os
import pyautogui
import pyttsx3
import ctypes
import subprocess
import psutil
import re
import wolframalpha
import requests
from bs4 import BeautifulSoup
from googlesearch import search
from speech_utils import speak
from memory_utils import get_memory, update_memory
from app_launcher import launch_app
from ai_utils import ask_openrouter
from langdetect import detect

DYNAMIC_COMMANDS = [
    "joke", "tell me a joke", "make me laugh",
    "time", "clock", "news",
    "date", "today's date", "what is the date"
]

months_hi = {
    "January": "जनवरी", "February": "फ़रवरी", "March": "मार्च", "April": "अप्रैल",
    "May": "मई", "June": "जून", "July": "जुलाई", "August": "अगस्त",
    "September": "सितंबर", "October": "अक्टूबर", "November": "नवंबर", "December": "दिसंबर"
}

def generate_text_local(prompt=None):
    return "Sorry, I can't compose letters yet."

def match_keywords(command, keywords):
    return any(re.search(rf"\b{re.escape(kw)}\b", command.lower()) for kw in keywords)

def generate_image(prompt):
    try:
        script_path = os.path.join("modules", "ai_image_generator", "generate.py")
        subprocess.run(["python", script_path, prompt], check=True)
        return f"Generating image for '{prompt}'"
    except Exception as e:
        return f"Image generation failed: {str(e)}"

def search_web(query):
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
        return None
    except Exception:
        return None

def processCommand(command, wolf_client, conversation_history):
    c = command.lower().strip()
    memory = get_memory()

    if c in memory:
        return memory[c]

    response = ""
    try:
        lang = detect(command)
    except Exception:
        lang = "en"

    if "screenshot" in command:
        file_path = os.path.join(os.getcwd(), "screenshot.png")
        pyautogui.screenshot(file_path)
        return "Screenshot taken and saved."

    if match_keywords(c, ["joke"]):
        response = pyjokes.get_joke()

    elif "increase volume" in command:
        for _ in range(5):
            pyautogui.press("volumeup")
        return "Volume increased."   

    elif "decrease volume" in command:
        for _ in range(5):
            pyautogui.press("volumedown")
        return "Volume decreased."

    elif "increase brightness" in command:
        try:
            import screen_brightness_control as sbc
            sbc.set_brightness("+10")
            return "Brightness increased."
        except Exception:
            return "Sorry, couldn't adjust brightness."

    elif "decrease brightness" in command:
        try:
            import screen_brightness_control as sbc
            sbc.set_brightness("-10")
            return "Brightness decreased."
        except Exception:
            return "Sorry, couldn't adjust brightness."

    elif "open downloads" in command:
        downloads = os.path.join(os.path.expanduser("~"), "Downloads")
        os.startfile(downloads)
        return "Opening Downloads folder."

    elif match_keywords(c, ["time", "clock", "samay"]):
        now = datetime.datetime.now()
        response = f"Abhi ka samay {now.strftime('%I:%M %p')} hai." if lang == "hi" else now.strftime("The current time is %I:%M %p.")

    elif match_keywords(c, ["news"]):
        webbrowser.open("https://news.google.com")
        response = "Opening news."

    elif match_keywords(c, ["youtube"]):
        webbrowser.open("https://youtube.com")
        response = "Opening YouTube."

    elif match_keywords(c, ["google"]):
        webbrowser.open("https://google.com")
        response = "Opening Google."

    elif match_keywords(c, ["facebook"]):
        webbrowser.open("https://facebook.com")
        response = "Opening Facebook."

    elif match_keywords(c, ["gmail"]):
        webbrowser.open("https://gmail.com")
        response = "Opening Gmail"

    elif match_keywords(c, ["date", "tarikh"]):
        today = datetime.datetime.now()
        if lang == "hi":
            month_name_en = today.strftime("%B")
            month_name_hi = months_hi.get(month_name_en, month_name_en)
            response = f"Aaj ki tarikh {today.day} {month_name_hi} {today.year} hai."
        else:
            response = f"Today's date is {today.strftime('%B %d, %Y')}."

    elif "play" in c and "youtube" in c:
        import pywhatkit
        song = re.sub(r"\b(play|music|song|on youtube|please|can you|could you|youtube)\b", "", c).strip()
        pywhatkit.playonyt(song)
        response = f"Playing {song} on YouTube."

    elif match_keywords(c, ["open", "launch"]):
        app_name = c.replace("open", "").replace("launch", "").strip()
        response = launch_app(app_name)

    elif "generate" in c and "image" in c:
        prompt = c.replace("generate", "").replace("image", "").replace("jarvis", "").strip()
        response = generate_image(prompt)

    elif match_keywords(c, ["calculate", "what is", "who is", "winner", "result"]):
        if "who made you" in c or "who created you" in c:
            response = "I was created by my boss Sachin."
        else:
            response = search_web(command)

            if not response or len(response) < 30:
                query = re.sub(r"\b(calculate|what is|who is|winner|result)\b", "", c).strip()
                try:
                    res = wolf_client.query(query)
                    response = next(res.results).text
                except Exception:
                    response = None

            if not response:
                try:
                    import wikipedia
                    response = wikipedia.summary(query, sentences=2)
                except Exception:
                    response = None

            if not response:
                model = "deepseek/deepseek-chat-v3-0324" if "code" in c or "calculate" in c else "meta-llama/llama-4-maverick"
                conversation_history.append({"role": "user", "content": command})
                response = ask_openrouter(conversation_history, model)
                conversation_history.append({"role": "assistant", "content": response})

    elif match_keywords(c, ["write", "compose", "draft", "letter"]):
        response = generate_text_local()

    else:
        model = "deepseek/deepseek-chat-v3-0324" if "code" in c or "calculate" in c else "meta-llama/llama-4-maverick"
        conversation_history.append({"role": "user", "content": command})
        response = ask_openrouter(conversation_history, model)
        conversation_history.append({"role": "assistant", "content": response})

    if not match_keywords(c, DYNAMIC_COMMANDS) and "sorry" not in str(response).lower():
        update_memory(command, response)

    return response