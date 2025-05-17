import torch
from transformers import BertTokenizer
from train import MultiLabelClassifier
from utils import load_and_prepare_data, encode_labels
import numpy as np
import joblib

tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
df = load_and_prepare_data("data/synthetic_patient_data_extended.csv")
# _, mlb = encode_labels(df)
mlb = joblib.load("model/mlb.pkl")
model = MultiLabelClassifier(num_labels=sum(len(m.classes_) for m in mlb.values()))
model.load_state_dict(torch.load("model/model3.pt"))
model.eval()

def predict(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128)
    with torch.no_grad():
        logits = model(inputs['input_ids'], inputs['attention_mask'])
        probs = torch.sigmoid(logits).squeeze().cpu().numpy()
        preds = (probs > 0.5).astype(int)

    decoded = {}
    start = 0
    for label, binarizer in mlb.items():
        end = start + len(binarizer.classes_)
        decoded[label] = binarizer.inverse_transform(np.array([preds[start:end]]))[0]
        start = end

    # Generate summary
    summary = f"Patient reports symptoms: {', '.join(decoded['symptoms'])}. Affected systems: {', '.join(decoded['body_system'])}."

    # Risk score (0-10) based on triage priority
    triage_map = {
        "Immediate": 10,
        "Delayed": 6,
        "Minor": 3,
        "Expectant": 1
    }
    triage = decoded['triage_priority']
    if triage:
        score = max([triage_map.get(label, 0) for label in triage])
    else:
        score = 5  # Neutral score if unknown

    # Recommended action
    if score >= 8:
        action = "Seek emergency medical attention immediately."
    elif score >= 5:
        action = "Visit urgent care or consult a physician soon."
    else:
        action = "Monitor symptoms and consult if they worsen."

    return {
        "labels": decoded,
        "summary": summary,
        "risk_score": score,
        "recommended_action": action
    }

result = predict("I have been experiencing dizziness, vomiting, and chest pain.")
print(result)