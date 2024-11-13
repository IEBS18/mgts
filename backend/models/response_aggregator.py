#models.response_aggregator.py
from sklearn.linear_model import LinearRegression
import numpy as np

class ResponseAggregator:
    def __init__(self):
        self.regressor = LinearRegression()

    def predict_future_cost(self, historical_costs, sub_llm_output, year_diff, start_year, target_year, inflation_rate):
        X = np.array([list(range(len(historical_costs)))]).T  # Transposed for regression fitting
        y = np.array(historical_costs)

        # regression model
        self.regressor.fit(X, y)
        future_cost = self.regressor.predict([[year_diff]])[0]

        base_predicted_cost = future_cost + sub_llm_output
        print('Base_price:',base_predicted_cost)

        # inflation adjustment
        if inflation_rate is not None:
            final_cost = self.adjust_for_inflation(base_predicted_cost, start_year, target_year, inflation_rate)
        else:
            final_cost = base_predicted_cost
        
        return final_cost

    def adjust_for_inflation(self, predicted_cost, start_year, target_year, inflation_rate):
        years_difference = target_year - start_year
        adjusted_cost = predicted_cost * (1 + inflation_rate) ** years_difference
        return adjusted_cost
