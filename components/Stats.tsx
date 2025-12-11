import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { GenerationResult } from '../types';
import { Download, Activity, Star, TrendingUp, Clock, Zap, FileJson, FileSpreadsheet, FileText, FileCode, X, Check } from 'lucide-react';

interface StatsProps {
  history: GenerationResult[];
}

type ExportFormat = 'json' | 'csv' | 'md' | 'txt';

export const Stats: React.FC<StatsProps> = ({ history }) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('md');

  const data = history.slice(-10).map((h, i) => ({
    name: `Gen ${i + 1}`,
    duration: h.metrics.durationMs / 1000, // seconds
    tokens: h.metrics.estimatedTokens,
    type: h.params.type
  }));

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const executeExport = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    
    switch (selectedFormat) {
      case 'json':
        downloadFile(JSON.stringify(history, null, 2), `penpal_history_${timestamp}.json`, 'application/json');
        break;
        
      case 'csv':
        const headers = ['ID', 'Date', 'Type', 'Genre', 'Tone', 'Duration(s)', 'Tokens', 'Model', 'Rating', 'Content'];
        const csvRows = history.map(h => [
            h.id,
            new Date(h.timestamp).toISOString(),
            h.params.type,
            h.params.genre,
            h.params.tone,
            (h.metrics.durationMs / 1000).toFixed(2),
            h.metrics.estimatedTokens,
            h.metrics.model,
            h.userRating || '',
            `"${h.content.replace(/"/g, '""').replace(/\n/g, ' ')}"` // Escape quotes and newlines for CSV
        ]);
        const csvContent = [headers.join(','), ...csvRows.map(r => r.join(','))].join('\n');
        downloadFile(csvContent, `penpal_history_${timestamp}.csv`, 'text/csv');
        break;

      case 'md':
        const mdContent = history.map(h => `
# ${h.params.type.toUpperCase()} - ${new Date(h.timestamp).toLocaleDateString()}
**Genre:** ${h.params.genre} | **Tone:** ${h.params.tone} | **Rating:** ${h.userRating || 'N/A'}/5

${h.content}

---
`).join('\n');
        downloadFile(mdContent, `penpal_history_${timestamp}.md`, 'text/markdown');
        break;

      case 'txt':
        const txtContent = history.map(h => `
------------------------------------------------
Date: ${new Date(h.timestamp).toLocaleString()}
Type: ${h.params.type}
Genre: ${h.params.genre}
Tone: ${h.params.tone}
Rating: ${h.userRating || 'N/A'}/5
------------------------------------------------
${h.content}
`).join('\n\n');
        downloadFile(txtContent, `penpal_history_${timestamp}.txt`, 'text/plain');
        break;
    }
    setShowExportModal(false);
  };

  if (history.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-96 glass-panel rounded-2xl text-slate-400 dark:text-slate-500">
            <Activity className="w-12 h-12 mb-4 opacity-20" />
            <p className="italic">Generate content to unlock your analytics dashboard.</p>
        </div>
    );
  }

  const FORMAT_OPTIONS = [
      { id: 'json', label: 'JSON Data', icon: FileJson, desc: 'Raw data export', color: 'text-amber-500' },
      { id: 'csv', label: 'CSV Spreadsheet', icon: FileSpreadsheet, desc: 'Excel compatible', color: 'text-emerald-500' },
      { id: 'md', label: 'Markdown', icon: FileCode, desc: 'Readable document', color: 'text-indigo-500' },
      { id: 'txt', label: 'Plain Text', icon: FileText, desc: 'Simple text file', color: 'text-slate-500' },
  ] as const;

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                Performance Analytics
            </h2>
            <div className="relative z-50">
                <button 
                    onClick={() => setShowExportModal(true)}
                    className="flex items-center gap-2 px-4 py-2 glass-panel hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl transition-all text-sm font-medium shadow-sm hover:shadow-md active:scale-95"
                >
                    <Download className="w-4 h-4" />
                    Export History
                </button>
            </div>
        </div>

        {/* Export Modal */}
        {showExportModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowExportModal(false)}></div>
                <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                        <h3 className="font-bold text-slate-800 dark:text-white">Export History</h3>
                        <button onClick={() => setShowExportModal(false)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                            <X className="w-4 h-4 text-slate-500" />
                        </button>
                    </div>
                    
                    <div className="p-6">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Choose a format to download your entire generation history.</p>
                        <div className="grid grid-cols-1 gap-3">
                            {FORMAT_OPTIONS.map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => setSelectedFormat(opt.id)}
                                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left group ${
                                        selectedFormat === opt.id 
                                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500/50 ring-1 ring-indigo-500/20' 
                                            : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                                    }`}
                                >
                                    <div className={`p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 ${opt.color}`}>
                                        <opt.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{opt.label}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">{opt.desc}</div>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                                        selectedFormat === opt.id
                                            ? 'border-indigo-600 bg-indigo-600 text-white'
                                            : 'border-slate-300 dark:border-slate-600'
                                    }`}>
                                        {selectedFormat === opt.id && <Check className="w-3 h-3" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex gap-3 justify-end">
                        <button 
                            onClick={() => setShowExportModal(false)}
                            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={executeExport}
                            className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download File
                        </button>
                    </div>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <Clock className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Generation Speed (s)</h3>
                </div>
                <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                    <XAxis dataKey="name" fontSize={10} stroke="#94a3b8" />
                    <YAxis fontSize={10} stroke="#94a3b8" />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                            borderRadius: '8px', 
                            border: 'none', 
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                        }} 
                    />
                    <Line type="monotone" dataKey="duration" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, fill:'#8b5cf6'}} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
                </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <Zap className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Token Usage (Est)</h3>
                </div>
                <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                    <XAxis dataKey="name" fontSize={10} stroke="#94a3b8" />
                    <YAxis fontSize={10} stroke="#94a3b8" />
                    <Tooltip 
                         contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                            borderRadius: '8px', 
                            border: 'none', 
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                        }}
                    />
                    <Bar dataKey="tokens" fill="#10b981" radius={[6, 6, 0, 0]} barSize={32} />
                    </BarChart>
                </ResponsiveContainer>
                </div>
            </div>
            
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-2xl border border-indigo-100/50 dark:border-indigo-800/50 flex flex-col items-center sm:items-start relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity className="w-16 h-16 text-indigo-600 dark:text-indigo-400" />
                     </div>
                     <p className="text-sm text-indigo-600 dark:text-indigo-300 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Total Generations
                     </p>
                     <p className="text-4xl font-bold text-slate-900 dark:text-white">{history.length}</p>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-amber-100/50 dark:border-amber-800/50 flex flex-col items-center sm:items-start relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Star className="w-16 h-16 text-amber-500" />
                     </div>
                     <p className="text-sm text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Star className="w-4 h-4" /> Avg Rating
                     </p>
                     <div className="flex items-baseline gap-1">
                        <p className="text-4xl font-bold text-slate-900 dark:text-white">
                            {(history.reduce((acc, curr) => acc + (curr.userRating || 0), 0) / (history.filter(h => h.userRating).length || 1)).toFixed(1)}
                        </p>
                        <span className="text-slate-400 font-medium">/5</span>
                     </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/50 flex flex-col items-center sm:items-start relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="w-16 h-16 text-emerald-500" />
                     </div>
                     <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Top Genre
                     </p>
                     <p className="text-3xl font-bold text-slate-900 dark:text-white capitalize truncate w-full text-center sm:text-left">
                        {history.length > 0 ? history[history.length - 1].params.genre : '-'}
                     </p>
                </div>
            </div>
        </div>
    </div>
  );
};