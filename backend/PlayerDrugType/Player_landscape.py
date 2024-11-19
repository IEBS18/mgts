import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import mplcursors

# Step 1: Read the data
df = pd.read_csv('merged_drug_sales_usa_adoption_rate_full_individual_revenue.csv')

# Step 2: Clean and prepare the data
print("Columns in dataset:", df.columns)

# Step 3: Process user input
disease = input("Enter the disease you want to search for: ").strip().lower()

# Step 4: Filter data for the disease
if 'Disease(s)' not in df.columns:
    raise ValueError("'Disease(s)' column is not found in the dataset.")
filtered_df = df[df['Disease(s)'].str.lower() == disease]

# Step 5: Aggregate data
if 'TradeName_drug_sales' not in df.columns:
    raise ValueError("'TradeName' column is not found in the dataset.")

# Count the number of drugs each manufacturer is making for that disease
drug_counts = filtered_df.groupby('Manufacturer').agg(
    Drug_Count=('TradeName_drug_sales', 'size'),
    Drug_Names=('TradeName_drug_sales', lambda x: ', '.join(x))
).reset_index()

print("Aggregated data:", drug_counts)

# Step 6: Plot the data
plt.figure(figsize=(10, 6))
bars = sns.barplot(data=drug_counts, x='Manufacturer', y='Drug_Count', palette='viridis')
plt.title(f'Drug Counts by Manufacturer for {disease.title()}', fontsize=14)
plt.xlabel('Manufacturer', fontsize=12)
plt.ylabel('Number of Drugs', fontsize=12)
plt.xticks(rotation=45)
plt.tight_layout()

# Add hover functionality
cursor = mplcursors.cursor(bars, hover=True)

# Customize the hover behavior to show drug names
@cursor.connect("add")
def on_add(sel):
    index = sel.index
    manufacturer = drug_counts.iloc[index]['Manufacturer']
    count = drug_counts.iloc[index]['Drug_Count']
    drugs = drug_counts.iloc[index]['Drug_Names']
    sel.annotation.set(
        text=f"Manufacturer: {manufacturer}\n"
             f"Drug Count: {count}\n"
             f"Drugs: {drugs}",
        fontsize=10,
        bbox=dict(boxstyle="round,pad=0.3", edgecolor="black", facecolor="white")
    )

# Display the plot
plt.show()

manufacturer_sales = filtered_df.groupby('Manufacturer')['Revenue_2023_Indication'].sum()

plt.figure(figsize=(8, 8))
plt.pie(manufacturer_sales, labels=manufacturer_sales.index, autopct='%1.1f%%', startangle=140, wedgeprops={'width': 0.4})
plt.title(f"Market Share for Manufacturers in {disease}")
plt.show()

revenue_by_year = filtered_df.melt(id_vars=['Manufacturer'], value_vars=['Revenue_2019_Indication', 'Revenue_2020_Indication', 'Revenue_2021_Indication', 'Revenue_2022_Indication', 'Revenue_2023_Indication'],
                                      var_name='Year', value_name='Revenue')

plt.figure(figsize=(10, 6))
sns.barplot(x='Year', y='Revenue', hue='Manufacturer', data=revenue_by_year)
plt.title(f"Revenue vs Year for Manufacturers in {disease}")
plt.ylabel("Revenue (USD)")
plt.show()