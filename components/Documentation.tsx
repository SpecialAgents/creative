import React, { useState } from 'react';
import { TECHNICAL_DOCS } from '../constants';
import ReactMarkdown from 'react-markdown';
import { FileText, Download, ChevronRight } from 'lucide-react';

export const Documentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const generateWordDocument = () => {
    // Construct HTML content that Word can interpret
    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>PenPal AI Technical Documentation</title>
        <style>
          body { font-family: 'Calibri', sans-serif; line-height: 1.5; }
          h1 { color: #4338ca; font-size: 24pt; margin-bottom: 24px; }
          h2 { color: #1e1b4b; font-size: 18pt; margin-top: 24px; border-bottom: 1px solid #ccc; padding-bottom: 8px; }
          h3 { color: #4b5563; font-size: 14pt; margin-top: 16px; }
          p { margin-bottom: 12px; text-align: justify; }
          code { background-color: #f3f4f6; padding: 2px 4px; font-family: 'Consolas', monospace; }
          pre { background-color: #f3f4f6; padding: 12px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <h1 style="text-align:center;">PenPal AI Technical Specification</h1>
        <p style="text-align:center; color: #666;">Generated on ${new Date().toLocaleDateString()}</p>
        <br/><br/>
    `;

    let content = "";
    
    // Iterate through all docs and convert Markdown-ish content to HTML for Word
    TECHNICAL_DOCS.forEach(doc => {
      // Basic markdown parsing for the export
      let htmlContent = doc.content
        .replace(/### (.*)/g, '<h3>$1</h3>')
        .replace(/## (.*)/g, '<h2>$1</h2>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\n\*/g, '<br/>•')
        .replace(/\n/g, '<p></p>');

      content += `
        <div class="section">
          ${htmlContent}
        </div>
        <br style="page-break-after:always;" />
      `;
    });

    const footer = `</body></html>`;
    const fullHtml = header + content + footer;

    // Create Blob
    const blob = new Blob(['\ufeff', fullHtml], {
      type: 'application/msword'
    });

    // Trigger Download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'PenPal_AI_Technical_Docs.doc'; // .doc opens in Word without warning usually
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col md:flex-row h-full min-h-[600px] glass-panel rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
      <div className="w-full md:w-72 bg-slate-50/50 dark:bg-slate-900/50 border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col backdrop-blur-md">
        <div className="p-6 pb-2">
            <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Table of Contents</h2>
            <button 
                onClick={generateWordDocument}
                className="w-full mb-6 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
                <Download className="w-4 h-4" />
                Download .docx
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
          {TECHNICAL_DOCS.map((doc, index) => (
            <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex justify-between items-center group ${
                  activeTab === index
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
            >
                <span className="truncate">{doc.title}</span>
                {activeTab === index && <ChevronRight className="w-3 h-3 text-indigo-500" />}
            </button>
          ))}
          <button
                onClick={() => setActiveTab(99)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex justify-between items-center ${
                  activeTab === 99
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
          >
            <span>Appendix: Prompt Analysis</span>
            {activeTab === 99 && <ChevronRight className="w-3 h-3 text-indigo-500" />}
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 lg:p-12 overflow-y-auto bg-white/30 dark:bg-slate-900/30 scroll-smooth">
        {activeTab === 99 ? (
             <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                    <h3 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-3">Prompt Engineering Analysis</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        A comparative study of prompt structuring techniques and their impact on Large Language Model output quality within the PenPal ecosystem.
                    </p>
                </div>
                
                <div className="overflow-hidden rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm bg-white/50 dark:bg-slate-800/50">
                    <table className="min-w-full text-sm text-left text-slate-600 dark:text-slate-300">
                        <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-100/50 dark:bg-slate-800/80">
                            <tr>
                                <th className="px-6 py-4 font-bold">Feature</th>
                                <th className="px-6 py-4 font-bold">Naive Approach (V1)</th>
                                <th className="px-6 py-4 font-bold">Structured Approach (V2)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            <tr className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">Structure</td>
                                <td className="px-6 py-4 font-mono text-xs text-slate-500">"Write a story about X..."</td>
                                <td className="px-6 py-4 text-emerald-700 dark:text-emerald-400 font-medium">Context + Constraints + Specific Fields + Guidelines</td>
                            </tr>
                            <tr className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">Consistency</td>
                                <td className="px-6 py-4">Low. Often ignores tone.</td>
                                <td className="px-6 py-4 text-emerald-700 dark:text-emerald-400 font-medium">High. Adheres strictly to JSON-like constraints.</td>
                            </tr>
                            <tr className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">Creativity</td>
                                <td className="px-6 py-4">Generic, cliché-prone.</td>
                                <td className="px-6 py-4 text-emerald-700 dark:text-emerald-400 font-medium">High. Uses temperature and specific persona.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
             </div>
        ) : (
             <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
                <div className="mb-8 pb-6 border-b border-slate-200/50 dark:border-slate-700/50">
                    <div className="flex items-center gap-3 mb-2 text-indigo-600 dark:text-indigo-400">
                        <FileText className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">Technical Specification</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white">
                        {TECHNICAL_DOCS[activeTab].title}
                    </h2>
                </div>
                <div className="prose prose-lg prose-slate dark:prose-invert max-w-none 
                    prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-800 dark:prose-headings:text-slate-100
                    prose-a:text-indigo-600 dark:prose-a:text-indigo-400 hover:prose-a:text-indigo-500
                    prose-code:text-indigo-600 dark:prose-code:text-indigo-300 prose-code:bg-indigo-50 dark:prose-code:bg-indigo-900/30 prose-code:px-1 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                    prose-pre:bg-slate-900 dark:prose-pre:bg-black/50 prose-pre:border prose-pre:border-slate-800
                ">
                    <ReactMarkdown>{TECHNICAL_DOCS[activeTab].content}</ReactMarkdown>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};