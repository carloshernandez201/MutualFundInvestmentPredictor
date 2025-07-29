import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_mock_stock_data(symbol='AAPL', days=365, base_price=150):
    """
    Generate realistic mock stock data for testing
    """
    dates = pd.date_range(
        start=datetime.now() - timedelta(days=days),
        end=datetime.now(),
        freq='D'
    )
    
    # generate realistic price movements using random walk
    np.random.seed(42)  # for reproducible data
    
    # start with base price
    prices = [base_price]
    
    for i in range(len(dates) - 1):
        # random walk with slight upward trend
        change = np.random.normal(0.002, 0.02)  # 0.2% average daily gain, 2% volatility
        new_price = prices[-1] * (1 + change)
        prices.append(max(new_price, 1))  # ensure price stays positive
    
    # create OHLCV data
    data = []
    for i, (date, close) in enumerate(zip(dates, prices)):
        # generate realistic OHLC based on close price
        volatility = 0.015  # 1.5% intraday volatility
        
        high = close * (1 + np.random.uniform(0, volatility))
        low = close * (1 - np.random.uniform(0, volatility))
        
        # ensure logical ordering: Low <= Open, Close <= High
        open_price = np.random.uniform(low, high)
        
        # volume (somewhat realistic for AAPL)
        base_volume = 50_000_000  # 50M shares
        volume = int(base_volume * np.random.uniform(0.5, 2.0))
        
        data.append({
            'Open': round(open_price, 2),
            'High': round(high, 2),
            'Low': round(low, 2),
            'Close': round(close, 2),
            'Volume': volume
        })
    
    df = pd.DataFrame(data, index=dates)
    return df

if __name__ == "__main__":
    # test the mock data generator
    mock_data = generate_mock_stock_data('AAPL', 100)
    print(f"Generated {len(mock_data)} rows of mock data")
    print(mock_data.head())
    print(f"Price range: ${mock_data['Close'].min():.2f} - ${mock_data['Close'].max():.2f}")