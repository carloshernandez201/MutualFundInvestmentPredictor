'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';

interface MutualFund {
  ticker: string;
  name: string;
  hotness: number;
}

export default function MutualFundCalculator() {
  const [mutualFunds, setMutualFunds] = useState<MutualFund[]>([]);
  const [selectedFund, setSelectedFund] = useState('');
  const [initialInvestment, setInitialInvestment] = useState('');
  const [time, setTime] = useState('');
  const [result, setResult] = useState<{ futureValue: string; annualizedReturn: string } | null>(null);
  const [chartData, setChartData] = useState<{ year: number; value: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch('/api/mutual-funds')
      .then(response => response.json())
      .then(data => setMutualFunds(data));
  }, []);

  const updateFrequency = async (ticker: string) => {
    try {
      await fetch(`/api/mutual-funds/update-frequency`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticker }),
      });
    } catch (error) {
      console.error('Failed to update frequency:', error);
    }
  }

  const handleCalculate = async () => {
    if (!selectedFund) {
      alert('Please select a mutual fund');
      return;
    }
    setIsLoading(true);
    await updateFrequency(selectedFund);
    const response = await fetch(`/api/calculate?ticker=${selectedFund}&initialInvestment=${initialInvestment}&time=${time}`);
    const data = await response.json();
    setResult(data);

    const yearlyData = [];
    for (let i = 0; i <= parseInt(time); i++) {
      yearlyData.push({
        year: i,
        value: parseFloat(initialInvestment) * Math.exp((parseFloat(data.annualizedReturn) / 100) * i)
      });
    }
    setChartData(yearlyData);
    setIsLoading(false);
  };

  return (
<Card>
  <CardHeader>
    <CardTitle className="text-2xl text-gray-800">Investment Calculator</CardTitle>
    <CardDescription>Calculate potential returns on your mutual fund investments</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Mutual Fund</label>
        <Select onValueChange={setSelectedFund}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a mutual fund" />
          </SelectTrigger>
          <SelectContent> 
            {mutualFunds.map(fund => (
              <SelectItem 
                key={fund.ticker} 
                value={fund.ticker} 
                className={`
                  flex items-center justify-between
                  ${fund.hotness <= 2 ? 'bg-red-100 data-[highlighted]:bg-red-200' : ''}
                `}
              >
                <span>{fund.name} ({fund.ticker})</span>
                {fund.hotness <= 2 && <span className="ml-2 text-red-500">🔥 Trending</span>}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
          <div>
            <label htmlFor="initialInvestment" className="block text-sm font-medium text-gray-700">
              Initial Investment ($)
            </label>
            <Input
              type="number"
              id="initialInvestment"
              value={initialInvestment}
              onChange={(e) => setInitialInvestment(e.target.value)}
              placeholder="Enter initial investment amount"
            />
          </div>
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700">
              Investment Duration (years)
            </label>
            <Input
              type="number"
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="Enter investment duration in years"
            />
          </div>
          <Button onClick={handleCalculate} className="w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'Calculate'
            )}
          </Button>
        </div>

        {result && (
          <div className="mt-8">
            <h3 className="text-xl font-medium text-gray-800 mb-4">Results</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Future Value</p>
                <p className="text-2xl font-semibold text-blue-600">${result.futureValue}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Annualized Return</p>
                <p className="text-2xl font-semibold text-green-600">{result.annualizedReturn}%</p>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="text-lg font-medium mb-4 text-gray-800">Investment Growth Projection</h4>
              <ChartContainer className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

