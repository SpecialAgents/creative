import React from 'react';
import { SAMPLE_OUTPUTS } from '../constants';
import ReactMarkdown from 'react-markdown';

export const Samples: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
      {SAMPLE_OUTPUTS.map((sample, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
          <div className="bg-indigo-50 p-4 border-b border-indigo-100">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg text-indigo-900">{sample.title}</h3>
                    <p className="text-xs uppercase tracking-wider text-indigo-600 font-semibold mt-1">{sample.type}</p>
                </div>
            </div>
            <p className="text-sm text-indigo-800 mt-2 italic">{sample.description}</p>
          </div>
          <div className="p-4 flex-1 overflow-y-auto max-h-64 text-sm font-serif text-slate-700 leading-relaxed">
             <ReactMarkdown>{sample.content}</ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  );
};
