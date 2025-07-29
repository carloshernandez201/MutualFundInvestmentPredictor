from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from datetime import datetime
import traceback

# import custom modules
from data_fetcher import fetch_stock_data
from stock_predictor import StockPredictor

app = Flask(__name__)
CORS(app)  # enable CORS for Next.js frontend

# set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'message': 'Stock Predictor API is running'
    })

@app.route('/api/predict', methods=['POST'])
def predict_stock():
    """Main prediction endpoint"""
    try:
        # get request data
        data = request.get_json()
        
        # validate required fields
        if not data or 'symbol' not in data:
            return jsonify({'error': 'Stock symbol is required'}), 400
        
        symbol = data['symbol'].upper()
        prediction_days = data.get('prediction_days', 30)
        training_period = data.get('training_period', 365)
        
        logger.info(f"Starting prediction for {symbol}, {prediction_days} days, {training_period} training period")
        
        # fetch historical data
        logger.info("Fetching stock data...")
        stock_data = fetch_stock_data(symbol, period_days=training_period)
        
        if stock_data is None or len(stock_data) < 60:
            return jsonify({'error': f'Insufficient data for {symbol}'}), 400
        
        # create and train model
        logger.info("Creating and training LSTM model...")
        predictor = StockPredictor()
        
        # train the model and get predictions
        result = predictor.train_and_predict(
            stock_data, 
            prediction_days=prediction_days
        )
        
        # format response
        response = {
            'symbol': symbol,
            'predictions': result['predictions'],
            'metrics': result['metrics'],
            'status': 'completed',
            'training_samples': len(stock_data),
            'timestamp': datetime.now().isoformat()
        }
        
        logger.info(f"Prediction completed successfully for {symbol}")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}")
        logger.error(traceback.format_exc())
        
        return jsonify({
            'error': 'Prediction failed',
            'details': str(e),
            'status': 'failed'
        }), 500

@app.route('/api/stocks', methods=['GET'])
def get_available_stocks():
    """Return list of supported stocks"""
    stocks = [
        {'symbol': 'AAPL', 'name': 'Apple Inc.'},
        {'symbol': 'TSLA', 'name': 'Tesla, Inc.'},
        {'symbol': 'GOOGL', 'name': 'Alphabet Inc.'},
        {'symbol': 'MSFT', 'name': 'Microsoft Corporation'},
        {'symbol': 'AMZN', 'name': 'Amazon.com Inc.'},
        {'symbol': 'META', 'name': 'Meta Platforms Inc.'},
        {'symbol': 'NVDA', 'name': 'NVIDIA Corporation'},
    ]
    return jsonify(stocks)

if __name__ == '__main__':
    print("Starting Stock Predictor API...")
    print("Ready to process LSTM predictions")
    print("API available at: http://localhost:5001")
    
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=True
    )