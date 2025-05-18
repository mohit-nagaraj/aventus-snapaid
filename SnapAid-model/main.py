from fastapi import FastAPI
from PIL import Image
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import google.generativeai as genai
from typing import Optional, Dict, List
import os
from dotenv import load_dotenv
import json
from pydantic import BaseModel
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

class ConversationInput(BaseModel):
    conversation_history: List[Dict[str, str]]
    input_text: Optional[str] = None
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

@app.post("/conversation")
async def handle_conversation(conv_input: ConversationInput):
    """
    Handle conversation history and respond to the latest user query.
    The conversation_history is a list of dictionaries with 'text' and 'user' keys.
    The latest entry in the conversation_history is the current user query.
    """
    print("Received conversation input:", conv_input)
    
    conversation_history = conv_input.conversation_history
    input_text = conv_input.input_text
    input_image = conv_input.input_image
    input_voice = conv_input.input_voice
    
    if not conversation_history:
        return JSONResponse(status_code=400, content={"error": "Conversation history is required"})
    
    # Get the latest user message
    latest_message = conversation_history[-1]
    
    if latest_message.get("user") != "user":
        return JSONResponse(status_code=400, content={"error": "The latest message must be from the user"})
    
    latest_query = latest_message.get("text", "")
    
    # If input_text is provided, append it to the latest query
    if input_text:
        latest_query = f"{latest_query}\n{input_text}" if latest_query else input_text
    
    # Process voice input if provided
    transcription = ""
    if input_voice:
        transcription = describe_audio_clip_from_url(input_voice)
        print("Transcription from voice:", transcription)
        if transcription:
            latest_query = f"{latest_query}\n{transcription}" if latest_query else transcription
    
    # Format the conversation history for the model's prompt
    formatted_history = ""
    if len(conversation_history) > 1:
        for msg in conversation_history[:-1]:  # Exclude the latest message
            role = "Patient" if msg.get("user") == "user" else "Medical Assistant"
            formatted_history += f"{role}: {msg.get('text', '')}\n"
    
    prompt = """
    You are a medical triage assistant having a conversation with a patient. 
    Based on the conversation history and the patient's latest query, provide a helpful and informative response.
    
    You should assess the medical situation and provide appropriate advice, but avoid diagnosing or prescribing medication.
    If it's a serious situation, recommend appropriate medical attention.
    
    Reply in a conversational manner, not in JSON format. Your response should be a single string that directly addresses the patient's query.
    
    If the patient's question is out of the medical context, politely remind them that you are a medical triage assistant and can only help with health-related queries.
    """
    
    # Add conversation history to prompt if it exists
    if formatted_history:
        prompt += f"\n\nConversation history:\n{formatted_history}"
    
    # Add latest query to prompt
    prompt += f"\nPatient's latest query: {latest_query}"
    
    try:
        # Process image if provided
        if input_image:
            print("Downloading image from URL...")
            response = requests.get(input_image)
            image = Image.open(BytesIO(response.content))
            print("DOne")
            
            # Add image context to prompt
            image_prompt = prompt + "\n\nThe patient has also shared an image. Please analyze the image along with their query."
            response = model.generate_content([image, image_prompt])
        else:
            response = model.generate_content(prompt)
        
        print(response.text.strip())
        # Return the text response directly
        return {"response": response.text.strip()}
    
    except Exception as e:
        print("Error:", str(e))
        return JSONResponse(status_code=500, content={"error": str(e)})