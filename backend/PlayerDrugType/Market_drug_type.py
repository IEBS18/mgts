import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Load your dataset (replace with your actual file path)
file_path = r'merged_drug_sales_usa_adoption_rate_full_individual_revenue.csv'
df = pd.read_csv(file_path)
print(df.columns)
# Clean up column names
df.columns = df.columns.str.strip()

# Ask the user for the disease name
disease_name = input("Enter the disease name for analysis: ")

# Check if the disease name exists in the dataset
if disease_name not in df['Disease(s)'].values:
    print(f"'{disease_name}' not found in the dataset.")
else:
    # Filter the dataset for the selected disease
    df_disease = df[df['Disease(s)'] == disease_name]

    # 1. Donut Chart: Market share for manufacturers for a specific disease
    # manufacturer_sales = df_disease.groupby('Manufacturer')['Revenue_2023_Indication'].sum()

    # plt.figure(figsize=(8, 8))
    # plt.pie(manufacturer_sales, labels=manufacturer_sales.index, autopct='%1.1f%%', startangle=140, wedgeprops={'width': 0.4})
    # plt.title(f"Market Share for Manufacturers in {disease_name}")
    # plt.show()

    # 2. Revenue Bar Chart: Year vs. Revenue for manufacturers for a specific disease
    # revenue_by_year = df_disease.melt(id_vars=['Manufacturer'], value_vars=['Revenue_2019_Indication', 'Revenue_2020_Indication', 'Revenue_2021_Indication', 'Revenue_2022_Indication', 'Revenue_2023_Indication'],
    #                                   var_name='Year', value_name='Revenue')

    # plt.figure(figsize=(10, 6))
    # sns.barplot(x='Year', y='Revenue', hue='Manufacturer', data=revenue_by_year)
    # plt.title(f"Revenue vs Year for Manufacturers in {disease_name}")
    # plt.ylabel("Revenue (USD)")
    # plt.show()

    # 3. Pie Chart: Type of drug for treatment of various diseases
    drug_type_distribution = df_disease['Type_of_Drug'].value_counts()

    plt.figure(figsize=(8, 8))
    plt.pie(drug_type_distribution, labels=drug_type_distribution.index, autopct='%1.1f%%', startangle=140)
    plt.title(f"Drug Type Distribution for Treatment of {disease_name}")
    plt.show()

    # # 4. Bar Chart: Number of drugs by manufacturer for the same disease
    # drug_count_by_manufacturer = df_disease.groupby('Manufacturer')['TradeName_drug_sales'].nunique()

    # plt.figure(figsize=(10, 6))
    # drug_count_by_manufacturer.plot(kind='bar', color='skyblue')
    # plt.title(f"Number of Drugs by Manufacturer for Treatment of {disease_name}")
    # plt.xlabel("Manufacturer")
    # plt.ylabel("Number of Drugs")
    # plt.show()
