import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { GenerationResult } from '../types';
import { Download } from 'lucide-react';

interface StatsProps {
  history: GenerationResult[];
}

export const Stats: React.FC<StatsProps> = ({ history }) => {
  const data = history.slice(-10).map((h, i) => ({
    name: `Gen ${i + 1}`,
    duration: h.metrics.durationMs / 1000, // seconds
    tokens: h.metrics.estimatedTokens,
    type: h.params.type
  }));

  const handleExport = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(history, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "penpal_history.json";
    link.click();
  };

  if (history.length === 0) {
    return <div className="text-gray-500 text-center italic py-10">Generate some content to see analytics.</div>;
  }

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Performance Analytics</h2>
            <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm"
            >
                <Download className="w-4 h-4" />
                Export History (JSON)
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">Generation Speed (s)</h3>
            <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="duration" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">Token Usage (Estimated)</h3>
            <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="tokens" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
            </div>
        </div>
        
        <div className="md:col-span-2 bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex justify-between items-center">
            <div>
                <p className="text-sm text-indigo-800 font-medium">Total Generations</p>
                <p className="text-2xl font-bold text-indigo-900">{history.length}</p>
            </div>
            <div>
                <p className="text-sm text-indigo-800 font-medium">Avg Rating</p>
                <p className="text-2xl font-bold text-indigo-900">
                    {(history.reduce((acc, curr) => acc + (curr.userRating || 0), 0) / (history.filter(h => h.userRating).length || 1)).toFixed(1)}/5
                </p>
            </div>
            <div>
                <p className="text-sm text-indigo-800 font-medium">Favorite Genre</p>
                <p className="text-xl font-bold text-indigo-900 capitalize">
                    {history.length > 0 ? history[history.length - 1].params.genre : '-'}
                </p>
            </div>
        </div>
        </div>
    </div>
  );
};