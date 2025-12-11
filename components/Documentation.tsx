import React, { useState } from 'react';
import { TECHNICAL_DOCS } from '../constants';
import ReactMarkdown from 'react-markdown';

export const Documentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex flex-col md:flex-row h-full min-h-[600px] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Tech Docs</h2>
        <ul className="space-y-2">
          {TECHNICAL_DOCS.map((doc, index) => (
            <li key={index}>
              <button
                onClick={() => setActiveTab(index)}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === index
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {doc.title}
              </button>
            </li>
          ))}
          <li>
              <button
                onClick={() => setActiveTab(99)}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === 99
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                4. Prompt Comparison Matrix
              </button>
          </li>
        </ul>
      </div>
      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === 99 ? (
             <div className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Prompt Version Comparison</h3>
                <p className="text-slate-600 mb-4">Analysis of how prompt structuring affects the quality of output from the Gemini API.</p>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                            <tr>
                                <th className="px-6 py-3">Feature</th>
                                <th className="px-6 py-3">Naive Prompt (V1)</th>
                                <th className="px-6 py-3">Structured Prompt (V2 - Current)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-white border-b">
                                <td className="px-6 py-4 font-medium text-slate-900">Structure</td>
                                <td className="px-6 py-4">"Write a story about X..."</td>
                                <td className="px-6 py-4">Context + Constraints + Specific Fields + Guidelines</td>
                            </tr>
                            <tr className="bg-white border-b">
                                <td className="px-6 py-4 font-medium text-slate-900">Consistency</td>
                                <td className="px-6 py-4">Low. Often ignores tone or length.</td>
                                <td className="px-6 py-4">High. Adheres strictly to JSON-like constraints.</td>
                            </tr>
                            <tr className="bg-white border-b">
                                <td className="px-6 py-4 font-medium text-slate-900">Hallucination</td>
                                <td className="px-6 py-4">High in factual contexts.</td>
                                <td className="px-6 py-4">Controlled via "Show, Don't Tell" directives.</td>
                            </tr>
                            <tr className="bg-white border-b">
                                <td className="px-6 py-4 font-medium text-slate-900">Creativity</td>
                                <td className="px-6 py-4">Generic, cliché-prone.</td>
                                <td className="px-6 py-4">High. Uses temperature and specific persona injection.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
             </div>
        ) : (
             <div className="prose prose-slate max-w-none">
                <ReactMarkdown>{TECHNICAL_DOCS[activeTab].content}</ReactMarkdown>
            </div>
        )}
      </div>
    </div>
  );
};
