import React, { useState } from 'react';
import { GenerationResult } from '../types';
import { Trash2, Clock, FileText, Calendar, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface HistoryProps {
  history: GenerationResult[];
  onDelete: (id: string) => void;
}

export const History: React.FC<HistoryProps> = ({ history, onDelete }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] glass-panel rounded-2xl text-slate-400 dark:text-slate-500">
        <Clock className="w-16 h-16 mb-4 opacity-20" />
        <h3 className="text-lg font-bold mb-2">No History Yet</h3>
        <p className="text-sm opacity-70">Generated content will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
             <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
             History
           </h2>
           <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
             Manage your saved creations ({history.length}/10 slots used)
           </p>
        </div>
        {history.length >= 10 && (
             <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800/50">
                 <AlertCircle className="w-4 h-4" />
                 Storage Full
             </div>
        )}
      </div>

      <div className="grid gap-4">
        {history.slice().reverse().map((item) => (
          <div 
            key={item.id} 
            className={`glass-panel rounded-2xl overflow-hidden border transition-all duration-300 ${
                expandedId === item.id 
                ? 'border-indigo-500/30 shadow-lg shadow-indigo-500/10' 
                : 'border-slate-200/50 dark:border-slate-800/50 hover:border-indigo-300 dark:hover:border-indigo-700'
            }`}
          >
            <div 
                className="p-5 flex items-center justify-between cursor-pointer bg-white/50 dark:bg-slate-900/50 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors"
                onClick={() => toggleExpand(item.id)}
            >
              <div className="flex items-center gap-4 overflow-hidden">
                <div className={`p-2.5 rounded-xl shrink-0 ${
                    item.params.type === 'story' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                    item.params.type === 'poem' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                    item.params.type === 'character' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                }`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white truncate pr-4">
                     {item.params.type.charAt(0).toUpperCase() + item.params.type.slice(1)} 
                     <span className="text-slate-400 font-normal mx-2">•</span> 
                     <span className="text-indigo-600 dark:text-indigo-400 text-sm">{item.params.genre}</span>
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(item.timestamp).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{item.metrics.estimatedTokens} tokens</span>
                    {item.userRating && (
                        <>
                        <span>•</span>
                        <span className="text-amber-500 font-bold">{item.userRating} ★</span>
                        </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 ml-4">
                <button 
                  onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                  }}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="text-slate-400">
                    {expandedId === item.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
            </div>

            {expandedId === item.id && (
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30">
                    <div className="prose prose-sm dark:prose-invert max-w-none font-serif">
                        <ReactMarkdown>{item.content}</ReactMarkdown>
                    </div>
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};