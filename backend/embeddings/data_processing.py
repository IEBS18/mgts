import pandas as pd

def load_data(file_path):
    return pd.read_csv(file_path)

def preprocess_data(df):
    df = df.replace('-', pd.NA) 
    df = df.fillna(0)  # Fill missing values with 0

    df["Resolution_Date"] = pd.to_datetime(df["Resolution_Date"], errors='coerce')

    # Handle percentage fields
    if df["Adverse_Event_Discontinuation"].dtype == 'object':
        df["Adverse_Event_Discontinuation"] = pd.to_numeric(df["Adverse_Event_Discontinuation"].str.replace('%', ''), errors='coerce') / 100
    if df["Serious_Adverse_Events"].dtype == 'object':
        df["Serious_Adverse_Events"] = pd.to_numeric(df["Serious_Adverse_Events"].str.replace('%', ''), errors='coerce') / 100

    numeric_columns = [
        "Morbidity_(PFS)", "Mortality_Difference", "Quality_of_Life", 
        "Total_Adverse_Events", "Annual_Therapy_Costs", "Annual_Comparitive_Therapy_Costs",
        "Serious_Adverse_Events"
    ]
    
    df[numeric_columns] = df[numeric_columns].apply(pd.to_numeric, errors='coerce')
    
    df['Annual_Therapy_Costs'] = pd.to_numeric(df['Annual_Therapy_Costs'], errors='coerce').fillna(0)
    
    return df
