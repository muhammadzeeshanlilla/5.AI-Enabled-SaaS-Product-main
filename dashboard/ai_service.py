import numpy as np
from sklearn.linear_model import LinearRegression


def run_prediction(rows, columns):
    try:
        # Find first numeric column for prediction
        numeric_col = None
        for col in columns:
            try:
                values = [float(row[col]) for row in rows if row.get(col) is not None]
                if len(values) > 1:
                    numeric_col = col
                    break
            except (ValueError, TypeError):
                continue

        if not numeric_col:
            return {'error': 'No numeric column found for prediction'}

        values = [float(row[numeric_col]) for row in rows if row.get(numeric_col) is not None]
        n = len(values)

        # Train simple linear regression
        X = np.array(range(n)).reshape(-1, 1)
        y = np.array(values)
        model = LinearRegression()
        model.fit(X, y)

        # Predict next 3 values
        future_X = np.array(range(n, n + 3)).reshape(-1, 1)
        forecast = model.predict(future_X).tolist()
        forecast = [round(v, 2) for v in forecast]

        # Trend direction
        trend = 'increasing' if model.coef_[0] > 0 else 'decreasing'
        score = round(model.score(X, y) * 100, 1)

        return {
            'column_analyzed': numeric_col,
            'trend': trend,
            'forecast_next_3': forecast,
            'confidence': score,
            'insight': f"{numeric_col} is {trend}. Next 3 predicted values: {forecast}"
        }

    except Exception as e:
        return {'error': str(e)}