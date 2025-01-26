'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import StaticGraph from "./StaticGraph";
import { Loader2 } from 'lucide-react';

interface MutualFund {
  ticker: string;
  name: string;
}

export default function MutualFundCalculator() {
  const [mutualFunds, setMutualFunds] = useState<MutualFund[]>([]);
  const [selectedFund, setSelectedFund] = useState('');
  const [initialInvestment, setInitialInvestment] = useState('');
  const [time, setTime] = useState('');
  const [result, setResult] = useState<{ futureValue: string; annualizedReturn: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch('/api/mutual-funds')
        .then(response => response.json())
        .then(data => setMutualFunds(data));
  }, []);

  const handleCalculate = async () => {
    setIsLoading(true);
    const response = await fetch(`/api/calculate?ticker=${selectedFund}&initialInvestment=${initialInvestment}&time=${time}`);
    const data = await response.json();
    setResult(data);
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
            {/* Mutual Fund Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Mutual Fund</label>
              <Select onValueChange={setSelectedFund}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a mutual fund" />
                </SelectTrigger>
                <SelectContent>
                  {mutualFunds.map(fund => (
                      <SelectItem key={fund.ticker} value={fund.ticker}>
                        {fund.name} ({fund.ticker})
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Initial Investment Input */}
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

            {/* Time Input */}
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

            {/* Calculate Button */}
            <Button onClick={handleCalculate} className="w-full">
              {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                  'Calculate'
              )}
            </Button>
          </div>

          {/* Display Results */}
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

                {/* Investment Growth Projection Graph */}
                <StaticGraph
                    futureValue={parseFloat(result.futureValue)}
                    initialInvestment={parseFloat(initialInvestment)}
                    time={parseInt(time)}
                />
              </div>
          )}
        </CardContent>
      </Card>
  );
}
