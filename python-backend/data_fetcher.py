import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
from mock_data import generate_mock_stock_data

logger = logging.getLogger(__name__)

def fetch_stock_data(symbol, period_days=365):
    """
    Fetch historical stock data from Yahoo Finance
    
    Args:
        symbol (str): Stock symbol (e.g., 'AAPL')
        period_days (int): Number of days of historical data to fetch
    
    Returns:
        pandas.DataFrame: Stock data with OHLCV columns
    """
    try:
        logger.info(f"Fetching {period_days} days of data for {symbol}")
        
        # use period parameter
        try:
            ticker = yf.Ticker(symbol)
            data = ticker.history(period=f"{period_days + 30}d", interval='1d')
        except:
            # Or use date range
            end_date = datetime.now()
            start_date = end_date - timedelta(days=period_days + 30)
            data = ticker.history(
                start=start_date.strftime('%Y-%m-%d'),
                end=end_date.strftime('%Y-%m-%d'),
                interval='1d'
            )
        
        # Or try yf.download as fallback
        if data.empty:
            logger.info("Trying alternative download method...")
            data = yf.download(symbol, period=f"{period_days + 30}d", interval='1d')
        
        if data.empty:
            logger.warning(f"Yahoo Finance API failed for {symbol}. Using mock data for demonstration.")
            # sse mock data as fallback
            data = generate_mock_stock_data(symbol, period_days + 30)
            logger.info(f"Generated {len(data)} rows of realistic mock data for {symbol}")
        
        if data.empty:
            logger.error(f"No data available for symbol {symbol}")
            return None
        
        # clean the data
        data = clean_stock_data(data)
        
        # take only the requested number of days
        data = data.tail(period_days)
        
        logger.info(f"Successfully fetched {len(data)} rows of data for {symbol}")
        logger.info(f"Date range: {data.index[0].date()} to {data.index[-1].date()}")
        logger.info(f"Price range: ${data['Close'].min():.2f} - ${data['Close'].max():.2f}")
        
        return data
        
    except Exception as e:
        logger.error(f"Error fetching data for {symbol}: {str(e)}")
        return None

def clean_stock_data(data):
    """
    Clean and preprocess stock data
    
    Args:
        data (pandas.DataFrame): Raw stock data
    
    Returns:
        pandas.DataFrame: Cleaned stock data
    """
    logger.info("Cleaning stock data...")
    
    # remove any rows with missing data
    initial_rows = len(data)
    data = data.dropna()
    
    if len(data) < initial_rows:
        logger.info(f"Removed {initial_rows - len(data)} rows with missing data")
    
    # ensure we have the required columns
    required_columns = ['Open', 'High', 'Low', 'Close', 'Volume']
    missing_columns = [col for col in required_columns if col not in data.columns]
    
    if missing_columns:
        raise ValueError(f"Missing required columns: {missing_columns}")
    
    # add technical indicators for better predictions
    data = add_technical_indicators(data)
    
    return data

def add_technical_indicators(data):
    """
    Add technical indicators to enhance prediction accuracy
    
    Args:
        data (pandas.DataFrame): Stock data with OHLCV
    
    Returns:
        pandas.DataFrame: Data with additional technical indicators
    """
    logger.info("Adding technical indicators...")
    
    # simple Moving Averages
    data['SMA_5'] = data['Close'].rolling(window=5).mean()
    data['SMA_10'] = data['Close'].rolling(window=10).mean()
    data['SMA_20'] = data['Close'].rolling(window=20).mean()
    
    # exponential Moving Average
    data['EMA_12'] = data['Close'].ewm(span=12).mean()
    data['EMA_26'] = data['Close'].ewm(span=26).mean()
    
    # MACD
    data['MACD'] = data['EMA_12'] - data['EMA_26']
    data['MACD_signal'] = data['MACD'].ewm(span=9).mean()
    
    # RSI
    delta = data['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    data['RSI'] = 100 - (100 / (1 + rs))
    
    # bollinger Bbnds
    data['BB_middle'] = data['Close'].rolling(window=20).mean()
    bb_std = data['Close'].rolling(window=20).std()
    data['BB_upper'] = data['BB_middle'] + (bb_std * 2)
    data['BB_lower'] = data['BB_middle'] - (bb_std * 2)
    
    # volatility
    data['Volatility'] = data['Close'].rolling(window=10).std()
    
    # price change percentage
    data['Price_change'] = data['Close'].pct_change()
    
    # volume moving average
    data['Volume_MA'] = data['Volume'].rolling(window=10).mean()
    
    # fill any remaining NaN values with forward fill
    data = data.fillna(method='ffill').fillna(method='bfill')
    
    logger.info(f"Added technical indicators. Data shape: {data.shape}")
    
    return data

def get_feature_columns():
    """
    Return list of feature columns to use for prediction
    """
    return [
        'Open', 'High', 'Low', 'Close', 'Volume',
        'SMA_5', 'SMA_10', 'SMA_20',
        'EMA_12', 'EMA_26', 'MACD', 'MACD_signal',
        'RSI', 'BB_upper', 'BB_lower', 'Volatility',
        'Price_change', 'Volume_MA'
    ]