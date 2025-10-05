import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string;
  totalProfit: number;
  avgMargin: number;
}

interface ProfitabilityChartProps {
  data: ChartData[];
}

const ProfitabilityChart: React.FC<ProfitabilityChartProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white/60 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Profitability Over Time</h2>
                <div className="flex items-center justify-center h-64 text-slate-500">
                    <p>Not enough sales data to display the chart. Sell more laptops to see your progress!</p>
                </div>
            </div>
        );
    }
    
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
            <div className="bg-white/80 backdrop-blur-lg p-3 rounded-lg shadow-lg border border-white/30">
                <p className="font-bold text-slate-800">{label}</p>
                <p className="text-indigo-600">{`Total Profit: ${payload[0].value.toFixed(2)} DZD`}</p>
                <p className="text-teal-600">{`Avg Margin: ${payload[1].value.toFixed(2)}%`}</p>
            </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white/60 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-4 sm:p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Profitability Over Time</h2>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <LineChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 20,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="name" stroke="#555" />
                        <YAxis yAxisId="left" stroke="#8884d8" label={{ value: 'Profit (DZD)', angle: -90, position: 'insideLeft', fill: '#555', dx: -10 }} />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Margin (%)', angle: -90, position: 'insideRight', fill: '#555', dx: 10 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="totalProfit" name="Total Profit" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                        <Line yAxisId="right" type="monotone" dataKey="avgMargin" name="Avg. Margin" stroke="#82ca9d" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ProfitabilityChart;
