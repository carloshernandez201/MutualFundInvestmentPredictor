'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const generateRandomData = (length: number) => {
  return Array.from({ length }, (_, i) => ({
    month: i + 1,
    sp500: Math.random() * 1000 + 3000,
    nasdaq: Math.random() * 1000 + 10000,
  }));
};

export default function StaticGraph() {
  const [data, setData] = useState(generateRandomData(12));

  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateRandomData(12));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-gray-800 border-green-400">
      <CardHeader>
        <CardTitle className="text-2xl text-green-400">Market Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
              <XAxis dataKey="month" stroke="#a0aec0" />
              <YAxis stroke="#a0aec0" />
              <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: 'none' }} />
              <Legend />
              <Line type="monotone" dataKey="sp500" stroke="#48bb78" strokeWidth={2} name="S&P 500" />
              <Line type="monotone" dataKey="nasdaq" stroke="#4299e1" strokeWidth={2} name="NASDAQ" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
    </Card>
  );
}

