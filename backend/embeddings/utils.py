#embeddings.utils.py
import torch
from transformers import BertTokenizer, BertModel

tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = BertModel.from_pretrained('bert-base-uncased')

def get_text_embeddings(text):
    inputs = tokenizer(text, return_tensors='pt', max_length=512, truncation=True, padding=True)
    outputs = model(**inputs)
    return outputs.last_hidden_state.mean(dim=1)

def combine_embeddings(text_embeddings, numeric_values):
    numeric_tensor = torch.tensor(numeric_values, dtype=torch.float32).unsqueeze(0)
    
    # Normalize numeric values to the range 0 to 1
    numeric_tensor = (numeric_tensor - numeric_tensor.min()) / (numeric_tensor.max() - numeric_tensor.min() + 1e-6)
    combined_embeddings = torch.cat((text_embeddings, numeric_tensor), dim=1)
    
    return combined_embeddings

def calculate_weightage(embeddings):

    norm = torch.norm(embeddings)
    
    weight = torch.sigmoid(norm / 10) * 3  
    return weight.item()
