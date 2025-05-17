from fastapi import FastAPI,Request, UploadFile, File, Form
from PIL import Image
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import google.generativeai as genai
import os
from dotenv import load_dotenv
import json
from pydantic import BaseModel
import re
import requests
from io import BytesIO

load_dotenv()
# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash")  

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictionInput(BaseModel):
    input_text: str
    input_image: str = None

@app.get("/")
def read_root():
    return {"message": "Welcome to the Medical Triage Assistant API!"}

@app.post("/predict")
async def analyze_message(msg: PredictionInput):
    # body = await msg.json()  # Await since it's an async request
    # input_text = body.get("input_text") 
    input_text =msg.input_text
    input_image = msg.input_image
    print("input text:",input_text)
    prompt = """
        You are a medical triage assistant. Analyze the following patient message and return:

        1. Triage Priority label (choose one: Immediate, Delayed, Minor, Expectant)
        2. Symptom-Based labels (from: Fever, Cough, Chest Pain, etc.)
        3. System-Based labels (from: Cardiovascular, Respiratory, etc.)
        4. Contextual Labels (from: Acute Onset, Chronic Condition, etc.)
        If there is no label in any of the category, do not return anything.
        5. A concise medical summary
        6. A recommended action
        7. A risk score: Immediate = 10, Delayed = 6, Minor = 3, Expectant = 1

        Return the result as just a valid JSON without markdown.
        All labels are to be in a format of string and sent inside an array field named label. 
        If it is an extreme condition that requires immediate attention, please label it as "Emergency" and provide a risk score of 10.
        Respond in this JSON format:
        example:
        {
        "label": ["Triage Priority", "Symptom-Based", "System-Based", "Contextual",...],
        "summary": "Short medical summary here.",
        "risk_score": 5,
        "recommended_action": "Recommended action here."
        }

        Message:
        """+ input_text 
    # print(prompt)/
    try:
        # If image is provided, read and convert to Gemini-compatible blob
        if input_image:
            print("Downloading image from URL...")
            response = requests.get(input_image)
            print(response)
            image = Image.open(BytesIO(response.content))
            print(image)
            response = model.generate_content([image, prompt])
        else:
            response = model.generate_content(prompt)

        cleaned = re.sub(r"^```json\s*|\s*```$", "", response.text.strip(), flags=re.IGNORECASE)
        return json.loads(cleaned)
    
    except Exception as e:
        print("Error:", str(e))
        return JSONResponse(status_code=500, content={"error": str(e)})