import os
from speech_utils import speak, recognize_speech
from memory_utils import load_memory, save_memory
from command_processor import processCommand
from app_launcher import load_apps, launch_app
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from dotenv import load_dotenv
import wolframalpha

conversation_history = []



def main():
    load_dotenv()
    wolfram_app_id = os.getenv("WOLFRAM_APP_ID")
    if not wolfram_app_id:
        speak("Missing WolframAlpha App ID. Please set it in the .env file.")
        return

    wolf_client = wolframalpha.Client(wolfram_app_id)

    load_memory()
    load_apps()
    print("Hello, I am Jarvis Alpha variant. How can I assist you?")
    speak("Hello, I am Jarvis Alpha variant. How can I assist you?")

    while True:
        print("Listening...")
        command = recognize_speech()
        if command:
            command = command.strip().lower()
            print(f"You said: {command}")

            if any(exit_word in command for exit_word in ["exit", "goodbye","good bye", "bye bye", "quit"]):
                speak("Jarvis alpha0variant initialising to shutdown ")
                break

            # Add user input to conversation history
            conversation_history.append({"role": "user", "content": command})

            response = processCommand(command, wolf_client, conversation_history)
            conversation_history.append({"role": "assistant", "content": response})

            print("jarvis:",response)
            speak(response)

        
                

if __name__ == "__main__":
    main()

