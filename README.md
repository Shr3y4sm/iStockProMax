<h1>iStockProMax</h1>

iStockProMax is a Flask-based stock analysis project built to demonstrate a practical full-stack data workflow for interviews and recruiters. It combines live stock quote scraping, historical market data retrieval, and a machine learning prediction pipeline to show how a web app can move from user input to data processing to a visual result.

<h2>Demo link</h2>

https://istock-pro-max.vercel.app/

<h2>Project Overview</h2>

The app opens with a stock dashboard inspired by the Apple Investor Relations experience. It shows Apple’s live price and daily change, then lets a user enter a ticker, a historical date range, and a future date to generate a forecast. Behind the scenes, the app pulls data from YFinance, engineers stock features, trains a Random Forest Regressor, and returns a predicted price movement.

<h2>What It Demonstrates</h2>

- Flask routing and template rendering
- Live market data lookup with YFinance
- Financial time-series handling with Pandas and YFinance
- Machine learning with scikit-learn
- A polished frontend with a stock-market style interface and TradingView chart embed

<h2>Key Features</h2>

- Live stock price lookup for Apple on the homepage
- Historical stock data download for supported tickers
- Feature engineering using returns, moving averages, volatility, and volume change
- Future price prediction with a Random Forest model
- Simple visual output showing predicted price, percentage change, and movement direction

<h2>Tech Stack</h2>

- Backend: Flask, Python
- Data: Pandas, NumPy, YFinance
- ML: scikit-learn
- Frontend: HTML, CSS, Jinja templates
- Deployment: Vercel serverless functions

<h2>How It Works</h2>

1. The homepage loads the current Apple price and daily change.
2. The user enters a ticker symbol, a start year, an end year, and a target future date.
3. The app downloads historical market data and builds technical features.
4. A Random Forest Regressor is trained on the historical data.
5. The app returns a predicted price, percentage movement, and an up/down signal.

<h2>Setup</h2>

Install the required packages:

```bash
pip install -r requirements.txt
```

Run the app locally:

```bash
python app.py
```

<h2>Notes</h2>

- The homepage quote currently targets Apple only.
- The quote lookup now uses YFinance, which is more suitable for Vercel than Selenium-based browser scraping.
- This project is intended for educational and interview showcase purposes, not real trading decisions.

<h2>Screenshots</h2>

<h3>Homepage</h3>

![Screenshot 2024-12-22 183029](https://github.com/user-attachments/assets/93251d76-88b2-49b9-938d-a5742aa16cc9)

<h3>Prediction Page</h3>

![Screenshot 2024-12-22 183145](https://github.com/user-attachments/assets/4ba78e13-0d65-427f-ab8c-0a62b6bdb0c5)

<h2>Disclaimer</h2>

iStockProMax is for educational and informational use only. The predictions are based on historical data and a machine learning model, so they are not guaranteed to be accurate or suitable for trading.
