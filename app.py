from datetime import datetime
from flask import Flask, render_template, request
import pandas as pd
import yfinance as yf
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

app = Flask(__name__, template_folder="templates", static_folder="static")


def to_scalar(value):
    if isinstance(value, pd.DataFrame):
        value = value.iloc[0, 0]
    elif isinstance(value, pd.Series):
        value = value.iloc[0]

    if hasattr(value, "item"):
        try:
            return value.item()
        except Exception:
            return value

    return value


def get_latest_quote(symbol="AAPL"):
    try:
        history = yf.Ticker(symbol).history(period="5d", interval="1d")
        if history.empty:
            return "N/A", "N/A"

        close_history = history["Close"]
        latest_close = float(to_scalar(close_history.iloc[-1]))
        previous_close = float(to_scalar(close_history.iloc[-2])) if len(close_history) > 1 else latest_close
        change_percent = ((latest_close - previous_close) / previous_close * 100) if previous_close else 0
        sign = "+" if change_percent >= 0 else ""
        return f"${latest_close:,.2f}", f"{sign}{change_percent:.2f}%"
    except Exception:
        return "N/A", "N/A"

@app.route('/')
def index():
    price_close, change_price = get_latest_quote("AAPL")
    return render_template('index.html', price_close=price_close, change_price=change_price)

@app.route('/results', methods=['POST'])
def results():
    company_name = request.form['company_name']
    start_year = request.form['start_year']
    end_year = request.form['end_year']
    future_date = request.form['future_date']

    start_date = f"{start_year}-01-01"
    end_date = f"{end_year}-12-31"

    price_close, change_price = get_latest_quote("AAPL")

    try:
        stock_data = yf.download(company_name, start=start_date, end=end_date)
        if stock_data.empty:
            raise ValueError(f"No data found for {company_name}. Check the ticker.")
    except Exception as e:
        return render_template('results.html', result={
            "error": str(e),
            "price_close": price_close,
            "change_price": change_price,
            "company_name": company_name.upper()
        })

    stock_data.dropna(inplace=True)
    stock_data['Daily Return'] = stock_data['Close'].pct_change()
    stock_data['5 Day Moving Avg'] = stock_data['Close'].rolling(window=5).mean()
    stock_data['10 Day Moving Avg'] = stock_data['Close'].rolling(window=10).mean()
    stock_data['20 Day Moving Avg'] = stock_data['Close'].rolling(window=20).mean()
    stock_data['Volatility'] = stock_data['Daily Return'].rolling(window=5).std()
    stock_data['Volume Change'] = stock_data['Volume'].pct_change()
    stock_data['Future Price'] = stock_data['Close'].shift(-1)
    stock_data.dropna(inplace=True)

    features = ['Close', 'Volume', '5 Day Moving Avg', '10 Day Moving Avg', '20 Day Moving Avg', 'Volatility', 'Volume Change']
    X = stock_data[features]
    y = stock_data['Future Price']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestRegressor(n_estimators=200, max_depth=10, random_state=42)
    model.fit(X_train, y_train)

    result = predict_stock_movement(stock_data, model, future_date, features, company_name, price_close, change_price)
    return render_template('results.html', result=result)

def predict_stock_movement(stock_data, model, input_date, features, company_name, price_close, change_price):
    try:
        input_datetime = datetime.strptime(input_date, "%d-%m-%Y")

        if input_datetime in stock_data.index:
            date_data = stock_data.loc[input_datetime]
            features_data = date_data[features].values.reshape(1, -1)
            predicted_price = model.predict(features_data)[0]
        else:
            last_row = stock_data.iloc[-1]
            features_data = last_row[features].values.reshape(1, -1)
            predicted_price = model.predict(features_data)[0]

        last_price = float(to_scalar(stock_data['Close'].iloc[-1]))
        predicted_price = float(to_scalar(predicted_price))
        percentage_change = float(((predicted_price - last_price) / last_price) * 100)
        movement = "Up" if percentage_change > 0 else "Down"
        
        return {
            "company_name": company_name.upper(),
            "future_date": input_date,
            "predicted_price": round(predicted_price, 2),
            "percentage_change": round(percentage_change, 2),
            "movement": movement,
            "price_close": price_close,
            "change_price": change_price
        }
    except Exception as e:
        return {
            "error": str(e),
            "company_name": company_name.upper(),
            "price_close": price_close,
            "change_price": change_price
        }

if __name__ == '__main__':
    app.run(debug=True)
