import os
import requests
import tempfile
from google import genai

def describe_audio_clip_from_url(audio_url: str) -> str:
    try:
        # Create a temporary file to store the audio
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp_file:
            print("Downloading voice file from URL...")
            response = requests.get(audio_url)
            tmp_file.write(response.content)
            temp_path = tmp_file.name
        
        print("Uploading voice file to Gemini...")
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        uploaded_voice = client.files.upload(file=temp_path)

        print("Generating transcription...")
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=["Describe this audio clip", uploaded_voice]
        )

        transcription = response.text.strip()
        return transcription

    except Exception as e:
        print("Voice processing error:", str(e))
        return "Error processing audio."

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
            print("Temporary file removed.")

