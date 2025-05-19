from flask import Flask, request, jsonify
import pickle
import numpy as np
from datetime import datetime, timedelta
import pandas as pd
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler

app = Flask(__name__)

# Initialize model as None
model = None

# Load your pre-trained model
try:
    with open('model.pkl', 'rb') as f:
        model = pickle.load(f)
    print("Model loaded successfully")
except FileNotFoundError:
    print("Model file not found. Running without model.")
except Exception as e:
    print(f"Error loading model: {str(e)}")

def prepare_features(data):
    """Prepare features for the model based on historical data."""
    try:
        if data.empty:
            raise ValueError("Empty data received for feature preparation")
            
        # Create a DataFrame for features
        features = pd.DataFrame()
        
        # Basic price features
        features['close'] = data['Close']
        features['open'] = data['Open']
        features['high'] = data['High']
        features['low'] = data['Low']
        features['volume'] = data['Volume']
        
        # Technical indicators
        features['sma_7'] = data['Close'].rolling(7).mean()
        features['sma_20'] = data['Close'].rolling(20).mean()
        features['ema_12'] = data['Close'].ewm(span=12, adjust=False).mean()
        features['ema_26'] = data['Close'].ewm(span=26, adjust=False).mean()
        
        # MACD
        features['macd'] = features['ema_12'] - features['ema_26']
        
        # RSI
        delta = data['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(14).mean()
        rs = gain / loss
        features['rsi'] = 100 - (100 / (1 + rs))
        
        # Bollinger Bands
        rolling_std = data['Close'].rolling(20).std()
        features['bb_upper'] = features['sma_20'] + (2 * rolling_std)
        features['bb_lower'] = features['sma_20'] - (2 * rolling_std)
        
        # Drop NA values
        features = features.dropna()
        
        if features.empty:
            raise ValueError("No features remaining after NA drop")
        
        # Scale features
        scaler = MinMaxScaler()
        scaled_features = scaler.fit_transform(features)
        
        return scaled_features[-1].reshape(1, -1)  # Return most recent data point
        
    except Exception as e:
        print(f"Error in prepare_features: {str(e)}")
        return None

@app.route('/predict', methods=['POST'])
def predict():
    if request.method != 'POST':
        return jsonify({'success': False, 'error': 'Method not allowed'}), 405
        
    try:
        if model is None:
            raise ValueError("Prediction model not loaded")
            
        # Validate input data
        data = request.get_json()
        if not data:
            raise ValueError("No JSON data received")
            
        crypto_symbol = data.get('crypto', 'BTC-USD')
        timeframe = data.get('timeframe', '24h')
        
        # Validate timeframe
        if timeframe not in ['24h', '7d', '30d']:
            raise ValueError("Invalid timeframe specified")
        
        # Determine the period and interval
        period_map = {
            '24h': ('7d', '1h'),
            '7d': ('30d', '1d'),
            '30d': ('90d', '1d')
        }
        period, interval = period_map[timeframe]
        
        # Get historical data with error handling
        try:
            crypto_data = yf.download(
                crypto_symbol, 
                period=period, 
                interval=interval,
                progress=False
            )
            if crypto_data.empty:
                raise ValueError("No data downloaded from Yahoo Finance")
        except Exception as e:
            raise ValueError(f"Failed to fetch data: {str(e)}")
        
        # Prepare features
        features = prepare_features(crypto_data)
        if features is None:
            raise ValueError("Feature preparation failed")
        
        # Make prediction
        try:
            prediction = model.predict(features)
            predicted_price = float(prediction[0])
        except Exception as e:
            raise ValueError(f"Prediction failed: {str(e)}")
        
        # Calculate metrics
        current_price = float(crypto_data['Close'].iloc[-1])
        price_change = ((predicted_price - current_price) / current_price) * 100
        confidence = min(95, max(60, 80 + (abs(price_change) / 2)))
        
        return jsonify({
            'success': True,
            'currentPrice': round(current_price, 2),
            'predictedPrice': round(predicted_price, 2),
            'priceChange': round(price_change, 2),
            'confidence': round(confidence, 2),
            'timeframe': timeframe,
            'crypto': crypto_symbol,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        })
        
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': f"Server error: {str(e)}"}), 500

@app.route('/')
def index():
    return app.send_static_file('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)