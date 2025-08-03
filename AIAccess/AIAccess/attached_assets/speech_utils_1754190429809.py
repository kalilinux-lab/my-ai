import speech_recognition as sr
import pyttsx3
import time
import pyaudio
from langdetect import detect

# Initialize pyttsx3 engine globally
engine = pyttsx3.init()

# Set male voice (usually voice 0 or 1 depending on your system)
voices = engine.getProperty('voices')
for voice in voices:
    if "male" in voice.name.lower() or "male" in voice.id.lower():
        engine.setProperty('voice', voice.id)
        break
else:
    # fallback if no explicit male voice found
    engine.setProperty('voice', voices[0].id)

def recognize_speech():
    r = sr.Recognizer()
    with sr.Microphone() as source:
        
        r.adjust_for_ambient_noise(source)
        audio = r.listen(source)
        try:
            text = r.recognize_google(audio, language="en-IN")
            return text
        except sr.UnknownValueError:
            print("Sorry, I couldn't understand.")
            return ""
        except sr.RequestError as e:
            print(f"Could not request results; {e}")
            return ""

def speak(text, lang="en"):
    engine.say(text)
    engine.runAndWait()

    
