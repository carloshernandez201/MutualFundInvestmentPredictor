'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StaticGraphProps {
  futureValue: number | null; // Accept futureValue as a prop
  initialInvestment: number;
  time: number;
}

const generateGrowthData = (initialInvestment: number, futureValue: number | null, time: number) => {
  const data = [];
  if (futureValue !== null) {
    for (let i = 0; i <= time; i++) {
      const yearValue = initialInvestment * Math.pow(futureValue / initialInvestment, i / time);
      data.push({ year: i, value: yearValue });
    }
  }
  return data;
};

export default function StaticGraph({ futureValue, initialInvestment, time }: StaticGraphProps) {
  const [data, setData] = useState(generateGrowthData(initialInvestment, futureValue, time));

  useEffect(() => {
    setData(generateGrowthData(initialInvestment, futureValue, time));
  }, [futureValue, initialInvestment, time]);

  return (
      <Card className="bg-gray-800 border-green-400">
        <CardHeader>
          <CardTitle className="text-2xl text-green-400">Investment Growth Projection</CardTitle>
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
                <XAxis dataKey="year" stroke="#a0aec0" />
                <YAxis stroke="#a0aec0" />
                <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: 'none' }} />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#48bb78" strokeWidth={2} name="Investment Value" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </CardContent>
      </Card>
  );
}
