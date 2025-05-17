from fastapi import FastAPI, Request
from PIL import Image
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import google.generativeai as genai
from typing import Optional
import os
from dotenv import load_dotenv
import json
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional, Dict
import re
import requests
from io import BytesIO
from voice import describe_audio_clip_from_url

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
    input_image: Optional[str] = None
    input_voice: Optional[str] = None

@app.get("/")
def read_root():
    return {"message": "Welcome to the Medical Triage Assistant API!"}

@app.post("/predict")
async def analyze_message(msg: PredictionInput):
    # body = await msg.json()  # Await since it's an async request
    # input_text = body.get("input_text") 
    print("Received message:", msg)
    input_text =msg.input_text
    print("input text:",input_text)
    input_image = msg.input_image
    print("input image:",input_image)
    input_voice = msg.input_voice
    print("input voice:",input_voice)
    
    transcription = ""
    if input_voice:
        transcription = describe_audio_clip_from_url(input_voice)
        print("Transcription from voice:", transcription)
        print("Transcription:", transcription)


    # full_message = transcription + "\n" + input_text if transcription else input_text
    full_message = ""
    if transcription:
        full_message += transcription
    if input_text:
        if full_message:
            full_message += "\n" + input_text
        else:
            full_message = input_text
    print("Full message:", full_message)

    prompt = """
        You are a medical triage assistant. Analyze the following patient message and return:

        1. Triage Priority label (choose one: Immediate, Delayed, Minor, Expectant)
        2. Symptom-Based labels (from: Fever, Cough, Chest Pain, etc.)
        3. System-Based labels (from: Cardiovascular, Respiratory, etc.)
        4. Contextual Labels (from: Acute Onset, Chronic Condition, etc.)
        5. Domain Specific Labels (from: Cardiology, Neurology, etc.)
        If there is no label in any of the category, do not return anything.
        6. A concise medical summary
        7. A recommended action
        8. A risk score: Immediate = 10, Delayed = 6, Minor = 3, Expectant = 1
        Note:
            Return the result as just a valid JSON without markdown.
            All labels are to be in a format of string and sent inside an array field named label. 
            if there are multiple labels, separate them with commas.
            If the input is out of context,and only input text is sent, return "I cannot help with this issue.Kindly post a health related issue".
            If the patient is fine, do not return any label.
            If it is an extreme condition that requires immediate attention, please label it as "Emergency" and provide a risk score of 10.
        Respond in this JSON format:
        example:
        {
        "label": ["Minor", "Fever", "Respiratory", "Acute Onset", "Cardiology"],
        "summary": "Short medical summary here.",
        "risk_score": 5,
        "recommended_action": "Recommended action here."
        }

        Message:
        """
    if full_message:
        prompt += full_message
    if input_image:
        prompt += "Please analyze the provided image and return the results as instructed."
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
        print(json.loads(cleaned))
        return json.loads(cleaned)
    
    except Exception as e:
        print("Error:", str(e))
        return JSONResponse(status_code=500, content={"error": str(e)})

class QuizRequest(BaseModel):
    quiz_type: str
    responses: List[Dict]  # Each item has question_id, question_text, answer
    timestamp: Optional[str] = Field(default_factory=lambda: datetime.utcnow().isoformat())
    metadata: Optional[Dict] = {}

class QuizResult(BaseModel):
    score: Optional[int] = None  
    summary: str
    feedback: Optional[str] = None  
    recommendations: Optional[str] = None

def generate_gemini_prompt(quiz: QuizRequest) -> str:
    prompt = f"You are a health expert AI. Analyze the following responses from a '{quiz.quiz_type}' quiz and give:\n"
    prompt += "- A health score out of 100\n"
    prompt += "- A short summary of the user's condition\n"
    prompt += "- Feedback on each question\n"
    prompt += "- Overall health advice or recommendation\n\n"
    prompt += "Give without any markdown or code block and disclaimers.\n"

    prompt += "Responses:\n"
    for item in quiz.responses:
        prompt += f"Q{item['question_id']}: {item['question_text']}\nAnswer: {item['answer']}\n\n"

    return prompt

@app.post("/quiz")
async def process_quiz_results(quiz: QuizRequest):
    try:
        print("Received quiz results:", quiz)
        prompt = generate_gemini_prompt(quiz)
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)
        ai_text = response.text.strip()

        print("Gemini response:", ai_text)

        # score_match = re.search(r"\*\*Overall Health Score: (\d+)/\d+\*\*", ai_text)
        # score = int(score_match.group(1)) if score_match else None

        # # Extract summary (first paragraph)
        # summary_match = re.search(r"\*\*Summary of User's Condition:\*\*\n\n(.+?)\n\n", ai_text, re.DOTALL)
        # summary = summary_match.group(1).strip() if summary_match else "No summary found."

        # # Extract feedback (optional full block or parse it into list if needed)
        # feedback_match = re.search(r"\*\*Feedback on Each Question:\*\*\n\n(.+?)\n\n\*\*Overall Health Advice", ai_text, re.DOTALL)
        # feedback = feedback_match.group(1).strip() if feedback_match else "No detailed feedback found."

        # # Extract recommendations
        # recommendations_match = re.search(r"\*\*Overall Health Advice and Recommendations:\*\*\n\n(.+?)\n\n\*\*Important Disclaimer", ai_text, re.DOTALL)
        # recommendations = recommendations_match.group(1).strip() if recommendations_match else "No recommendations found."

        # Return response
        return ai_text


    except Exception as e:
        print("Error processing quiz results:", str(e))
        return JSONResponse(status_code=500, content={"error": str(e)})
