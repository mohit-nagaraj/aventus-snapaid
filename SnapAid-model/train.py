import torch
from transformers import BertTokenizer, BertModel
from torch.utils.data import Dataset, DataLoader
import torch.nn as nn
from utils import load_and_prepare_data, encode_labels
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import numpy as np
import joblib

class PatientDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_len=128):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_len = max_len
    
    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        inputs = self.tokenizer(
            self.texts[idx], max_length=self.max_len, truncation=True,
            padding='max_length', return_tensors="pt"
        )
        item = {key: val.squeeze(0) for key, val in inputs.items()}
        item['labels'] = torch.tensor(self.labels[idx], dtype=torch.float)
        return item

class MultiLabelClassifier(nn.Module):
    def __init__(self, num_labels):
        super().__init__()
        self.bert = BertModel.from_pretrained("bert-base-uncased")
        self.classifier = nn.Sequential(
            nn.Linear(self.bert.config.hidden_size, 256),
            nn.ReLU(),
            nn.Linear(256, num_labels)
        )

    def forward(self, input_ids, attention_mask):
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        cls_output = outputs.pooler_output
        return self.classifier(cls_output)

df = load_and_prepare_data("data/synthetic_patient_data_extended.csv")
X, mlb = encode_labels(df)
tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
dataset = PatientDataset(df['message'].tolist(), X, tokenizer)
loader = DataLoader(dataset, batch_size=4, shuffle=True)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = MultiLabelClassifier(num_labels=X.shape[1]).to(device)
optimizer = torch.optim.AdamW(model.parameters(), lr=2e-5)
criterion = nn.BCEWithLogitsLoss()

model.train()
for epoch in range(5):
    all_preds = []
    all_labels = []
    total_loss = 0.0
    for batch in loader:
        input_ids = batch['input_ids'].to(device)
        attention_mask = batch['attention_mask'].to(device)
        labels = batch['labels'].to(device)

        outputs = model(input_ids, attention_mask)
        loss = criterion(outputs, labels)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        total_loss += loss.item()

        probs = torch.sigmoid(outputs).detach().cpu().numpy()
        preds = (probs > 0.2).astype(int)
        all_preds.extend(preds)
        all_labels.extend(labels.detach().cpu().numpy())

    all_preds = np.vstack(all_preds)
    all_labels = np.vstack(all_labels)

    acc = accuracy_score(all_labels, all_preds)
    precision = precision_score(all_labels, all_preds, average="samples", zero_division=0)
    recall = recall_score(all_labels, all_preds, average="samples", zero_division=0)
    f1 = f1_score(all_labels, all_preds, average="samples", zero_division=0)

    # print(f"Epoch {epoch+1}, Loss: {loss.item():.4f}, Accuracy: {((outputs > 0) == labels).float().mean():.4f}")
    print(f"Epoch {epoch+1}")
    print(f"  Loss     : {total_loss/len(loader):.4f}")
    print(f"  Accuracy : {acc:.4f}")
    print(f"  Precision: {precision:.4f}")
    print(f"  Recall   : {recall:.4f}")
    print(f"  F1 Score : {f1:.4f}")

torch.save(model.state_dict(), "model/model3.pt")
joblib.dump(mlb, "model/mlb.pkl")