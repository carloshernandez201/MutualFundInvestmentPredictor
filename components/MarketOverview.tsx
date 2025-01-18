'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const generateMarketData = (length: number) => {
  const baseValue = 100;
  return Array.from({ length }, (_, i) => ({
    date: new Date(2023, 0, i + 1).toISOString().split('T')[0],
    SP500: baseValue + Math.random() * 10,
    NASDAQ: baseValue + Math.random() * 15,
    DOW: baseValue + Math.random() * 8,
  }));
};

export default function MarketOverview() {
  const [data, setData] = useState(generateMarketData(30));

  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateMarketData(30));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-gray-800">Market Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{fontSize: 10}} angle={-45} textAnchor="end" height={50} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="SP500" stroke="#2563eb" strokeWidth={2} dot={false} name="S&P 500" />
            <Line type="monotone" dataKey="NASDAQ" stroke="#16a34a" strokeWidth={2} dot={false} name="NASDAQ" />
            <Line type="monotone" dataKey="DOW" stroke="#dc2626" strokeWidth={2} dot={false} name="Dow Jones" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

