import pandas as pd
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
import numpy as np
import re
import chardet

# with open('USA_Market_Estimation.csv', 'rb') as f:
#     result = chardet.detect(f.read())
df = pd.read_csv('MarketEstimation/kumar_final.csv')

years = ['2019', '2020', '2021', '2022']
forecast_years = ['2023','2024', '2025', '2026', '2027', '2028']

def get_disease_data(disease_name):
    """Fetch data for the given disease name"""
    escaped_disease_name = re.escape(disease_name)
    disease_data = df[df['Disease'].str.contains(escaped_disease_name, case=False, na=False)]
    return disease_data

def preprocess_data(values):
    """Convert values to float and handle missing or non-numeric entries"""
    processed_values = []
    for val in values:
        try:
            val = str(val).replace('$', '').replace(',', '').strip()
            processed_values.append(float(val))
        except ValueError:
            processed_values.append(np.nan)
    return processed_values

def forecast_with_noise(X, y, future_periods=5, noise_scale=0.005, min_value=1e-5):
    """Train Linear Regression and forecast future values with controlled noise and a minimum value"""
    model = LinearRegression()
    model.fit(X, y)
 
    future_X = np.array(range(len(X), len(X) + future_periods)).reshape(-1, 1)
    predictions = model.predict(future_X)
 
    noise = np.random.normal(0, predictions.std() * noise_scale, predictions.shape)
 
    predictions_with_noise = predictions + noise
    predictions_with_noise = np.clip(predictions_with_noise, min_value, None)  # Clip to avoid values less than min_value
 
    return predictions_with_noise
def plot_market_and_prevalence_forecast(disease_name):
    """Forecast Market Size and Prevalence Rate and plot together with values shown"""
    disease_data = get_disease_data(disease_name)
    if disease_data.empty:
        print(f"Error: No data found for disease '{disease_name}'")
        return

    market_size = preprocess_data([disease_data[f'Market_Size_{year}'].values[0] for year in years])
    prevalence_rate = preprocess_data([disease_data[f'Prevalence Rate_{year}'].values[0] for year in years])

    if any(np.isnan(market_size)) or any(np.isnan(prevalence_rate)):
        print("Data contains missing or invalid values.")
        return

    X = np.array(range(len(years))).reshape(-1, 1)
    market_predictions = forecast_with_noise(X, np.array(market_size), future_periods=len(forecast_years))
    prevalence_predictions = forecast_with_noise(X, np.array(prevalence_rate), future_periods=len(forecast_years))

    all_years = years + forecast_years
    combined_prevalence = prevalence_rate + list(prevalence_predictions)
    print("all Years:",all_years)
    print("Combined Prevalence:",combined_prevalence)
    print("Market Predictions: ", market_predictions)
    print("Market Size: ", market_size)
    
    return years, forecast_years, combined_prevalence, market_predictions, market_size

    # fig, ax1 = plt.subplots(figsize=(12, 7))

    # ax1.bar(years, market_size, label='Actual Market Size', color='yellow', alpha=0.7)
    # ax1.bar(forecast_years, market_predictions, label='Forecast Market Size', color='orange', alpha=0.7)
    # ax1.set_xlabel('Year')
    # ax1.set_ylabel('Market Size (in USD)', color='blue')
    # ax1.tick_params(axis='y', labelcolor='blue')
    # ax1.set_yticks(np.round(np.linspace(0, max(market_size + list(market_predictions)), 5), -5))  # Rounded y-axis

    # for i, value in enumerate(market_size):
    #     ax1.text(years[i], value, f'{value:,.0f}', ha='center', va='bottom', color='blue', fontsize=9)
    # for i, value in enumerate(market_predictions):
    #     ax1.text(forecast_years[i], value, f'{value:,.0f}', ha='center', va='bottom', color='orange', fontsize=9)

    # ax2 = ax1.twinx()
    # ax2.plot(all_years, combined_prevalence, label='Prevalence Rate', marker='o', linestyle='-', color='green')
    # ax2.set_ylabel('Prevalence Rate', color='green')
    # ax2.tick_params(axis='y', labelcolor='green')
    # ax2.set_yticks(np.round(np.linspace(min(prevalence_rate), max(combined_prevalence), 5), 6))  # Precise y-axis for prevalence rate

    # for i, value in enumerate(combined_prevalence):
    #     ax2.text(all_years[i], value, f'{value:.6f}', ha='center', va='bottom', color='green', fontsize=9)

    # fig.suptitle(f'Market Size and Prevalence Rate Forecast for {disease_name}')
    # fig.legend(loc="upper left", bbox_to_anchor=(0.1, 0.9))
    # plt.tight_layout()
    # plt.show()

def plot_therapy_cost_forecast(disease_name):
    """Forecast Annual Therapy Cost with a continuous stacked area chart and show values"""
    disease_data = get_disease_data(disease_name)
    if disease_data.empty:
        print(f"Error: No data found for disease '{disease_name}'")
        return

    therapy_cost = preprocess_data([disease_data[f'Average_therapy_cost_{year}'].values[0] for year in years])

    if any(np.isnan(therapy_cost)):
        print("Therapy cost data contains missing or invalid values.")
        return

    X = np.array(range(len(years))).reshape(-1, 1)
    therapy_cost_predictions = forecast_with_noise(X, np.array(therapy_cost), future_periods=len(forecast_years))

    all_years = years + forecast_years
    combined_therapy_cost = therapy_cost + list(therapy_cost_predictions)
    print("all Years:",all_years)
    print("Combined Therapy Cost:",combined_therapy_cost)
    
    return all_years, combined_therapy_cost
    # plt.figure(figsize=(12, 7))
    # plt.fill_between(all_years, combined_therapy_cost, color='blue', alpha=0.5, label='Therapy Cost (Actual and Forecast)')
    # plt.xlabel('Year')
    # plt.ylabel('Annual Therapy Cost (in USD)')
    # plt.yticks(np.round(np.linspace(0, max(combined_therapy_cost), 5), -4))  # Rounded y-axis
    # plt.title(f'Annual Therapy Cost Forecast for {disease_name}')
    # plt.legend()

    # for i, value in enumerate(combined_therapy_cost):
    #     plt.text(all_years[i], value, f'{value:,.0f}', ha='center', va='bottom', color='blue', fontsize=9)

    # plt.tight_layout()
    # plt.show()


# def main():
#     print("Available options:")
#     print("1. Market Size & Prevalence Rate Forecast (combined plot)")
#     print("2. Annual Therapy Cost Forecast (stacked area plot)")
    
#     choice = input("Select the graph you want to view (1/2): ")
#     disease_name = input("Enter the Disease Name: ")

#     if choice == '1':
#         plot_market_and_prevalence_forecast(disease_name)
#     elif choice == '2':
#         plot_therapy_cost_forecast(disease_name)
#     else:
#         print("Invalid choice. Please select 1 or 2.")

if __name__ == "__main__":
    # main()
    print("Available options:")
    print("1. Market Size & Prevalence Rate Forecast (combined plot)")
    print("2. Annual Therapy Cost Forecast (stacked area plot)")
    
    choice = input("Select the graph you want to view (1/2): ")
    disease_name = input("Enter the Disease Name: ")

    if choice == '1':
        plot_market_and_prevalence_forecast(disease_name)
    elif choice == '2':
        plot_therapy_cost_forecast(disease_name)
    else:
        print("Invalid choice. Please select 1 or 2.")
