import torch
import torch.nn as nn
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error
import logging
from datetime import datetime, timedelta
from data_fetcher import get_feature_columns

logger = logging.getLogger(__name__)

class LSTMModel(nn.Module):
    """
    Multi-layer LSTM model for stock price prediction
    """
    def __init__(self, input_size, hidden_size=50, num_layers=2, dropout=0.2):
        super(LSTMModel, self).__init__()
        
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        # LSTM layers
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            dropout=dropout,
            batch_first=True
        )
        
        # dropout for regularization
        self.dropout = nn.Dropout(dropout)
        
        # output layer
        self.linear = nn.Linear(hidden_size, 1)
        
    def forward(self, x):
        # initialize hidden state
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size)
        
        # forward propagate LSTM
        out, _ = self.lstm(x, (h0, c0))
        
        # apply dropout
        out = self.dropout(out)
        
        # take the last output
        out = self.linear(out[:, -1, :])
        
        return out

class StockPredictor:
    """
    Stock price prediction using LSTM neural networks
    """
    def __init__(self, sequence_length=60, hidden_size=50, num_layers=2):
        self.sequence_length = sequence_length
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.model = None
        self.scaler = MinMaxScaler()
        self.feature_columns = get_feature_columns()
        
    def prepare_data(self, data, target_column='Close'):
        """
        Prepare data for LSTM training
        """
        logger.info("Preparing data for LSTM training...")
        
        # select features
        features = data[self.feature_columns].values
        target = data[target_column].values
        
        # scale features
        scaled_features = self.scaler.fit_transform(features)
        
        # create sequences
        X, y = [], []
        for i in range(self.sequence_length, len(scaled_features)):
            X.append(scaled_features[i-self.sequence_length:i])
            y.append(target[i])
        
        X = np.array(X)
        y = np.array(y)
        
        logger.info(f"Created {len(X)} sequences of length {self.sequence_length}")
        logger.info(f"Feature shape: {X.shape}, Target shape: {y.shape}")
        
        return X, y, target
    
    def train_test_split(self, X, y, test_size=0.2):
        """
        Split data into train and test sets
        """
        split_idx = int(len(X) * (1 - test_size))
        
        X_train, X_test = X[:split_idx], X[split_idx:]
        y_train, y_test = y[:split_idx], y[split_idx:]
        
        logger.info(f"Train set: {len(X_train)} samples")
        logger.info(f"Test set: {len(X_test)} samples")
        
        return X_train, X_test, y_train, y_test
    
    def train_model(self, X_train, y_train, X_test, y_test, epochs=50, batch_size=32, learning_rate=0.001):
        """
        Train the LSTM model
        """
        logger.info("Starting LSTM model training...")
        
        # convert to PyTorch tensors
        X_train_tensor = torch.FloatTensor(X_train)
        y_train_tensor = torch.FloatTensor(y_train).view(-1, 1)
        X_test_tensor = torch.FloatTensor(X_test)
        y_test_tensor = torch.FloatTensor(y_test).view(-1, 1)
        
        # initialize model
        input_size = X_train.shape[2]
        self.model = LSTMModel(input_size, self.hidden_size, self.num_layers)
        
        # loss and optimizer
        criterion = nn.MSELoss()
        optimizer = torch.optim.Adam(self.model.parameters(), lr=learning_rate)
        
        # training loop
        train_losses = []
        test_losses = []
        
        for epoch in range(epochs):
            # training phase
            self.model.train()
            
            # forward pass
            outputs = self.model(X_train_tensor)
            loss = criterion(outputs, y_train_tensor)
            
            # backward pass
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
            # validation phase
            self.model.eval()
            with torch.no_grad():
                test_outputs = self.model(X_test_tensor)
                test_loss = criterion(test_outputs, y_test_tensor)
            
            train_losses.append(loss.item())
            test_losses.append(test_loss.item())
            
            if epoch % 10 == 0:
                logger.info(f'Epoch [{epoch}/{epochs}], Train Loss: {loss.item():.4f}, Test Loss: {test_loss.item():.4f}')
        
        logger.info("Model training completed!")
        return train_losses, test_losses
    
    def predict(self, X):
        """
        Make predictions using the trained model
        """
        self.model.eval()
        with torch.no_grad():
            X_tensor = torch.FloatTensor(X)
            predictions = self.model(X_tensor)
            return predictions.numpy().flatten()
    
    def calculate_metrics(self, y_true, y_pred):
        """
        Calculate prediction metrics
        """
        mse = mean_squared_error(y_true, y_pred)
        mae = mean_absolute_error(y_true, y_pred)
        rmse = np.sqrt(mse)
        
        # calculate accuracy (percentage of predictions within 5% of actual)
        percentage_error = np.abs((y_true - y_pred) / y_true) * 100
        accuracy = np.mean(percentage_error <= 5) * 100
        
        return {
            'mse': mse,
            'mae': mae,
            'rmse': rmse,
            'accuracy': accuracy
        }
    
    def train_and_predict(self, data, prediction_days=30):
        """
        Complete training and prediction pipeline
        """
        logger.info("Starting complete prediction pipeline...")
        
        # prepare data
        X, y, original_prices = self.prepare_data(data)
        
        # split data
        X_train, X_test, y_train, y_test = self.train_test_split(X, y)
        
        # train model
        train_losses, test_losses = self.train_model(X_train, y_train, X_test, y_test)
        
        # make predictions on test set
        y_pred = self.predict(X_test)
        
        # calculate metrics
        metrics = self.calculate_metrics(y_test, y_pred)
        
        # prepare results for visualization
        # get the last few actual prices and predictions for plotting
        plot_length = min(prediction_days, len(y_test))
        
        # create date range for the predictions
        last_date = data.index[-1]
        date_range = []
        for i in range(plot_length):
            # Go backwards from the last date
            date = last_date - timedelta(days=plot_length - i - 1)
            date_range.append(date.strftime('%Y-%m-%d'))
        
        # prepare prediction data for frontend
        predictions = []
        for i in range(plot_length):
            predictions.append({
                'date': date_range[i],
                'actual': float(y_test[-(plot_length-i)]),
                'predicted': float(y_pred[-(plot_length-i)])
            })
        
        logger.info(f"Prediction pipeline completed. RMSE: {metrics['rmse']:.2f}, Accuracy: {metrics['accuracy']:.1f}%")
        
        return {
            'predictions': predictions,
            'metrics': metrics,
            'train_losses': train_losses,
            'test_losses': test_losses
        }