'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { month: 'Jan', balance: 450000 },
  { month: 'Feb', balance: 520000 },
  { month: 'Mar', balance: 480000 },
  { month: 'Apr', balance: 610000 },
  { month: 'May', balance: 580000 },
  { month: 'Jun', balance: 657500 },
];

export default function BalanceTrendsChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="month"
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          tickFormatter={(value:any) => `$${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
          formatter={(value:any) => [`$${(value / 1000).toFixed(0)}k`, 'Balance']}
          labelStyle={{ color: '#6b7280' }}
        />
        <Line
          type="monotone"
          dataKey="balance"
          stroke="#2563eb"
          strokeWidth={3}
          dot={{ fill: '#2563eb', r: 5 }}
          activeDot={{ r: 7 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
