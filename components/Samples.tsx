import React, { useState } from 'react';
import { SAMPLE_OUTPUTS } from '../constants';
import ReactMarkdown from 'react-markdown';
import { Copy, Check } from 'lucide-react';

export const Samples: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
      {SAMPLE_OUTPUTS.map((sample, index) => (
        <div 
            key={index} 
            className="group glass-panel rounded-2xl overflow-hidden flex flex-col hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 border border-slate-200/50 dark:border-slate-800/50 relative"
        >
          <div className="bg-indigo-50/50 dark:bg-indigo-900/20 p-5 border-b border-indigo-100/50 dark:border-indigo-800/30 backdrop-blur-sm relative">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg text-indigo-900 dark:text-indigo-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">{sample.title}</h3>
                    <p className="text-[10px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold mt-1 bg-indigo-100 dark:bg-indigo-900/50 inline-block px-2 py-0.5 rounded-full">{sample.type}</p>
                </div>
                <button 
                  onClick={() => handleCopy(sample.content, index)}
                  className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors shadow-sm"
                  title="Copy content"
                >
                    {copiedIndex === index ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
                </button>
            </div>
            <p className="text-sm text-indigo-800/70 dark:text-indigo-200/70 mt-3 italic leading-snug">{sample.description}</p>
          </div>
          <div className="p-5 flex-1 overflow-y-auto max-h-64 text-sm font-serif text-slate-700 dark:text-slate-300 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
             <ReactMarkdown>{sample.content}</ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  );
};