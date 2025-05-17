import pandas as pd
from sklearn.preprocessing import MultiLabelBinarizer

def load_and_prepare_data(csv_path):
    df = pd.read_csv(csv_path)
    df.fillna('', inplace=True)
    
    label_cols = ['triage_priority', 'symptoms', 'body_system', 'context']
    for col in label_cols:
        df[col] = df[col].apply(lambda x: x.split(';') if x else [])

    return df

def encode_labels(df):
    mlb = {}
    encoded = []

    for col in ['triage_priority', 'symptoms', 'body_system', 'context']:
        mlb[col] = MultiLabelBinarizer()
        y = mlb[col].fit_transform(df[col])
        encoded.append(y)

    import numpy as np
    return np.hstack(encoded), mlb