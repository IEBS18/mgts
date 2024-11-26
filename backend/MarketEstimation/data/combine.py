import pandas as pd

# Load the two Excel files
file1 = 'USA_Final_output_new.xlsx'
file2 = 'USA_Disease_Data_3000_Final_output_new.xlsx'

# Read the sheets (assuming the data is in the first sheet of each file)
df1 = pd.read_excel(file1, sheet_name=0)
df2 = pd.read_excel(file2, sheet_name=0)

# Combine the data (vertically stack if they have the same columns, or merge if they share a key)
# Option 1: Stack the dataframes (append rows)
combined_df = pd.concat([df1, df2], ignore_index=True)

# Option 2: Merge on a common key (e.g., 'ID' column)
# combined_df = pd.merge(df1, df2, on='ID')

# Save the combined data to a new Excel file
combined_df.to_excel('USA_final_combined_file.xlsx', index=False)

print("Files combined successfully and saved as 'combined_file.xlsx'")
