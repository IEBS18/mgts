import pandas as pd
import json

# Load the CSV file
csv_file = 'drug_sales_data.csv'

# Read the CSV into a DataFrame
df = pd.read_csv(csv_file)

# Get unique disease names from the 'Disease' column
unique_diseases = df['Disease'].dropna().unique().tolist()

# Save the unique diseases to a JSON file
with open('disease.json', 'w') as json_file:
    json.dump(unique_diseases, json_file, indent=4)

print("Unique disease names have been saved to disease.json.")
