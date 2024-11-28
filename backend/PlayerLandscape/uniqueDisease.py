# import pandas as pd
# import json

# # Load the CSV file
# csv_file = 'Drug_Sales_Data.xlsx'

# # Read the CSV into a DataFrame
# df = pd.read_excel(csv_file)

# # Get unique disease names from the 'Disease' column
# unique_diseases = df['Disease'].dropna().unique().tolist()

# # Save the unique diseases to a JSON file
# with open('disease.json', 'w') as json_file:
#     json.dump(unique_diseases, json_file, indent=4)

# print("Unique disease names have been saved to disease.json.")
import pandas as pd

def replace_various_with_others(input_file, output_file):
    # Read the Excel file
    df = pd.read_excel(input_file)
    
    # Check if the 'Manufacturer' column exists
    if 'Manufacturer' in df.columns:
        # Replace 'Various' or 'various' with 'Others'
        df['Manufacturer'] = df['Manufacturer'].replace(['Various', 'various'], 'Others')
        
        # Save the modified DataFrame back to an Excel file
        df.to_excel(output_file, index=False)
        print(f"Updated file saved as: {output_file}")
    else:
        print("The 'Manufacturer' column was not found in the input file.")

# Example usage
input_file = "Drug_Sales_Data.xlsx"  # Replace with the path to your input file
output_file = "Final_Drug_Sales_Data.xlsx"  # Replace with the desired output file name
replace_various_with_others(input_file, output_file)
