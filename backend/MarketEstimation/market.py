import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression

# Path to the single Excel file
file_path = 'MarketEstimation/data/Complete_MarketEstimation_data.xlsx'

years = ['2019', '2020', '2021', '2022', '2023']
forecast_years = ['2024', '2025', '2026', '2027', '2028']

def preprocess_data(values, min_value=1e-5):
    """Convert values to float, handle missing entries, replace zeros with a small threshold."""
    processed_values = []
    for val in values:
        try:
            val = str(val).replace('$', '').replace(',', '').strip()
            val = float(val)
            if val == 0:
                val = min_value  # Replace zero values with a small threshold
            processed_values.append(val)
        except ValueError:
            processed_values.append(min_value)  # Replace invalid values with the threshold
    return processed_values

def forecast_with_noise(X, y, future_periods=5, noise_scale=1.98, min_value=1e-4):
    """Train Linear Regression and forecast future values with controlled noise and a minimum value"""
    model = LinearRegression()
    model.fit(X, y)
 
    future_X = np.array(range(len(X), len(X) + future_periods)).reshape(-1, 1)
    predictions = model.predict(future_X)
 
    # Ensure no predictions are zero
    predictions = np.maximum(predictions, min_value)  # Replace any zero or negative values with min_value
 
    noise = np.random.normal(0, predictions.std() * noise_scale, predictions.shape)
 
    predictions_with_noise = predictions + noise
    predictions_with_noise = np.clip(predictions_with_noise, min_value, None)  # Clip to avoid values less than min_value
 
    return predictions_with_noise 
def get_country_data(disease_name):
    """Retrieve market and therapy cost data for a disease across multiple countries."""
    country_data = {}
    try:
        # Read the single Excel file
        df = pd.read_excel(file_path)

        # Filter data for the given disease
        disease_data = df[df['Disease'] == disease_name]

        if not disease_data.empty:
            # Iterate through each country in the filtered data
            for country in disease_data['Country'].unique():
                country_specific_data = disease_data[disease_data['Country'] == country]
                
                # Process market size and therapy cost for existing years and forecast future values
                market_size = preprocess_data([country_specific_data[f'Market_Size_{year}'].values[0] for year in years])
                therapy_cost = preprocess_data([country_specific_data[f'Average_therapy_cost_{year}'].values[0] for year in years])
                
                # Forecast future values
                X = np.array(range(len(years))).reshape(-1, 1)
                market_forecast = forecast_with_noise(X, np.array(market_size), future_periods=len(forecast_years))
                therapy_cost_forecast = forecast_with_noise(X, np.array(therapy_cost), future_periods=len(forecast_years))
                print(market_forecast)
                print(therapy_cost_forecast)
                # Store results in dictionary
                country_data[country] = {
                    'years': years,
                    'market_size': market_size,
                    'market_forecast': market_forecast,
                    'therapy_cost': therapy_cost,
                    'therapy_cost_forecast': therapy_cost_forecast,
                }
    except Exception as e:
        print(f"Error loading data: {e}")
    
    if not country_data:
        print(f"No data found for disease '{disease_name}' in the file.")
    return country_data

def visualize_market_and_therapy(disease_name):
    """Main function to display data for all countries where the disease exists."""
    country_data = get_country_data(disease_name)
    if not country_data:
        return
    
    for country, data in country_data.items():
        print(f"\nCountry: {country}")
        print(f"Years: {data['years']}")
        print(f"Market Size (2019-2023): {data['market_size']}")
        print(f"Market Forecast (2024-2028): {data['market_forecast']}")
        print(f"Therapy Cost (2019-2023): {data['therapy_cost']}")
        print(f"Therapy Cost Forecast (2024-2028): {data['therapy_cost_forecast']}")

def main():
    disease_name = input("Enter the Disease Name: ").strip()
    visualize_market_and_therapy(disease_name)

if __name__ == "__main__":
    main()
