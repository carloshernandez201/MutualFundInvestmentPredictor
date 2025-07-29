'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, TrendingUp, Activity, BarChart3 } from 'lucide-react';

const POPULAR_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'TSLA', name: 'Tesla, Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
];

interface PredictionResult {
  predictions: { date: string; actual: number; predicted: number }[];
  metrics: {
    mse: number;
    mae: number;
    rmse: number;
    accuracy: number;
  };
  status: string;
}

export default function StockPredictor() {
  const [selectedStock, setSelectedStock] = useState('');
  const [predictionDays, setPredictionDays] = useState('30');
  const [trainingPeriod, setTrainingPeriod] = useState('365');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async () => {
    if (!selectedStock) {
      alert('Please select a stock');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // This will call our Python backend (we'll implement this next)
      const response = await fetch('http://localhost:5001/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: selectedStock,
          prediction_days: parseInt(predictionDays),
          training_period: parseInt(trainingPeriod),
        }),
      });

      if (!response.ok) {
        throw new Error('Prediction failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to generate prediction. Make sure the Python backend is running.');
      console.error('Prediction error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-gray-800 flex items-center">
          <TrendingUp className="mr-2 h-6 w-6" />
          Stock Price Predictor
        </CardTitle>
        <CardDescription>
          Use LSTM neural networks to predict future stock prices based on historical data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Stock Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Stock
            </label>
            <Select onValueChange={setSelectedStock}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a stock to analyze" />
              </SelectTrigger>
              <SelectContent>
                {POPULAR_STOCKS.map(stock => (
                  <SelectItem key={stock.symbol} value={stock.symbol}>
                    <div className="flex items-center justify-between w-full">
                      <span>{stock.name}</span>
                      <span className="text-sm text-gray-500 ml-2">({stock.symbol})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prediction Parameters */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="predictionDays" className="block text-sm font-medium text-gray-700 mb-2">
                Prediction Days
              </label>
              <Input
                type="number"
                id="predictionDays"
                value={predictionDays}
                onChange={(e) => setPredictionDays(e.target.value)}
                placeholder="30"
                min="1"
                max="60"
              />
            </div>
            <div>
              <label htmlFor="trainingPeriod" className="block text-sm font-medium text-gray-700 mb-2">
                Training Period (days)
              </label>
              <Input
                type="number"
                id="trainingPeriod"
                value={trainingPeriod}
                onChange={(e) => setTrainingPeriod(e.target.value)}
                placeholder="365"
                min="60"
                max="1000"
              />
            </div>
          </div>

          {/* Predict Button */}
          <Button onClick={handlePredict} className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Training LSTM Model...
              </>
            ) : (
              <>
                <Activity className="mr-2 h-4 w-4" />
                Generate Prediction
              </>
            )}
          </Button>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
              <p className="text-red-500 text-xs mt-1">
                Make sure to start the Python backend server first!
              </p>
            </div>
          )}
        </div>

        {/* Results Section */}
        {result && (
          <div className="mt-8 space-y-6">
            <h3 className="text-xl font-medium text-gray-800 flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Prediction Results
            </h3>

            {/* Model Performance Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">RMSE</p>
                <p className="text-xl font-semibold text-blue-600">
                  ${result.metrics.rmse.toFixed(2)}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">MAE</p>
                <p className="text-xl font-semibold text-green-600">
                  ${result.metrics.mae.toFixed(2)}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Accuracy</p>
                <p className="text-xl font-semibold text-purple-600">
                  {result.metrics.accuracy.toFixed(1)}%
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-sm font-semibold text-orange-600">
                  {result.status}
                </p>
              </div>
            </div>

            {/* Prediction Chart */}
            <div className="mt-8">
              <h4 className="text-lg font-medium mb-4 text-gray-800">
                Actual vs Predicted Prices
              </h4>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.predictions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{fontSize: 10}} 
                      angle={-45} 
                      textAnchor="end" 
                      height={50} 
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                      labelFormatter={(date) => `Date: ${date}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#2563eb" 
                      strokeWidth={2} 
                      dot={false} 
                      name="Actual Price"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#dc2626" 
                      strokeWidth={2} 
                      dot={false} 
                      strokeDasharray="5 5"
                      name="Predicted Price"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder when no results */}
        {!result && !isLoading && !error && (
          <div className="mt-8 text-center py-12 bg-gray-50 rounded-lg">
            <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Ready to Predict Stock Prices
            </h3>
            <p className="text-gray-500">
              Select a stock and configure parameters to generate LSTM predictions
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}