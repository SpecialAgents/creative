import React, { useState, useEffect } from 'react';
import { PROMPT_TEMPLATES, GENRES, TONES, LENGTHS } from '../constants';
import { GenerationParams, GenerationResult, PromptTemplate } from '../types';
import { generateCreativeContent } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { Loader2, AlertCircle, Save, Star, Copy, Check, Download } from 'lucide-react';

interface GeneratorProps {
  onSave: (result: GenerationResult) => void;
}

export const Generator: React.FC<GeneratorProps> = ({ onSave }) => {
  const [activeTemplate, setActiveTemplate] = useState<PromptTemplate>(PROMPT_TEMPLATES[0]);
  const [params, setParams] = useState<GenerationParams>({
    type: 'story',
    genre: GENRES[0],
    tone: TONES[0],
    length: 'medium',
    creativity: 0.7,
    promptInputs: {}
  });
  
  const [output, setOutput] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [modelUsed, setModelUsed] = useState('');
  const [userRating, setUserRating] = useState<number | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  // Sync params type when template changes
  useEffect(() => {
    setParams(prev => ({ ...prev, type: activeTemplate.id, promptInputs: {} }));
    setError(null);
    setOutput('');
  }, [activeTemplate]);

  const handleInputChange = (key: string, value: string) => {
    setParams(prev => ({
      ...prev,
      promptInputs: { ...prev.promptInputs, [key]: value }
    }));
  };

  const validateInputs = () => {
    for (const field of activeTemplate.fields) {
      if (!params.promptInputs[field.key]?.trim()) {
        setError(`Please fill in the ${field.label} field.`);
        return false;
      }
    }
    return true;
  };

  const handleGenerate = async () => {
    if (!validateInputs()) return;

    setIsGenerating(true);
    setError(null);
    setOutput('');
    setStartTime(Date.now());
    setUserRating(undefined);

    const apiKey = process.env.API_KEY || ''; // In real app, consider better key mgmt
    if (!apiKey) {
        setError("API Key not found in environment variables.");
        setIsGenerating(false);
        return;
    }

    try {
      const result = await generateCreativeContent(apiKey, params, (chunk) => {
        setOutput(chunk);
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      setGenerationTime(duration);
      setModelUsed(result.model);
      
      // Auto-save to history
      const genResult: GenerationResult = {
        id: crypto.randomUUID(),
        content: result.text,
        timestamp: endTime,
        params: { ...params },
        metrics: {
            durationMs: endTime - Date.now(), // Fixed approx for now, logic below corrects it
            estimatedTokens: result.text.length / 4,
            model: result.model
        }
      };
      
      // Fix duration in metrics
      genResult.metrics.durationMs = duration;
      onSave(genResult);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `penpal-${params.type}-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Configuration Panel */}
      <div className="w-full lg:w-1/3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-120px)]">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">I want to write a...</label>
          <div className="grid grid-cols-2 gap-2">
            {PROMPT_TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTemplate(t)}
                className={`text-left text-xs px-3 py-2 rounded-lg border transition-all ${
                  activeTemplate.id === t.id 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Genre</label>
              <select 
                className="w-full p-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                value={params.genre}
                onChange={(e) => setParams({...params, genre: e.target.value})}
              >
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tone</label>
              <select 
                className="w-full p-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                value={params.tone}
                onChange={(e) => setParams({...params, tone: e.target.value})}
              >
                {TONES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Length: <span className="text-indigo-600">{params.length}</span></label>
            <div className="flex gap-2">
              {LENGTHS.map(l => (
                <button
                  key={l}
                  onClick={() => setParams({...params, length: l as any})}
                  className={`flex-1 py-1 text-xs rounded border ${params.length === l ? 'bg-indigo-100 border-indigo-400 text-indigo-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
             <div className="flex justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase">Creativity (Temp)</label>
                <span className="text-xs font-mono text-slate-500">{params.creativity.toFixed(1)}</span>
             </div>
             <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1"
                value={params.creativity}
                onChange={(e) => setParams({...params, creativity: parseFloat(e.target.value)})}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
             />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <label className="block text-sm font-semibold text-slate-700 mb-3">{activeTemplate.name} Details</label>
          <div className="space-y-3">
            {activeTemplate.fields.map(field => (
              <div key={field.key}>
                <label className="block text-xs text-slate-500 mb-1">{field.label}</label>
                {field.type === 'select' ? (
                   <select 
                     className="w-full p-2 rounded border border-slate-300 text-sm focus:border-indigo-500 outline-none"
                     onChange={(e) => handleInputChange(field.key, e.target.value)}
                   >
                     <option value="">Select...</option>
                     {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                   </select>
                ) : (
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    className="w-full p-2 rounded border border-slate-300 text-sm focus:border-indigo-500 outline-none transition-colors"
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    value={params.promptInputs[field.key] || ''}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`mt-auto w-full py-3 rounded-lg flex items-center justify-center gap-2 font-bold text-white transition-all ${
            isGenerating ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-200'
          }`}
        >
          {isGenerating ? <><Loader2 className="animate-spin w-4 h-4"/> Writing...</> : 'Generate Content'}
        </button>
        
        {error && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg flex gap-2 items-start border border-red-100">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
            </div>
        )}
      </div>

      {/* Output Panel */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-120px)]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
            <div className="flex items-center gap-4">
                <h2 className="font-serif font-bold text-lg text-slate-800">Output</h2>
                {modelUsed && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">Generated by {modelUsed}</span>}
                {generationTime > 0 && <span className="text-xs text-slate-400">{(generationTime/1000).toFixed(2)}s</span>}
            </div>
            <div className="flex items-center gap-2">
                 {output && (
                    <>
                    <button onClick={handleDownload} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors" title="Download Markdown">
                        <Download className="w-4 h-4"/>
                    </button>
                    <button onClick={copyToClipboard} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors" title="Copy Text">
                        {copied ? <Check className="w-4 h-4 text-green-600"/> : <Copy className="w-4 h-4"/>}
                    </button>
                    {!userRating && (
                        <div className="flex gap-1 bg-white border border-slate-200 rounded-full px-2 py-1 ml-2">
                             {[1,2,3,4,5].map(star => (
                                 <button key={star} onClick={() => {
                                     setUserRating(star);
                                     onSave({ ...params, userRating: star } as any); // Update last history item ideally
                                 }}>
                                    <Star className="w-3 h-3 text-slate-300 hover:text-yellow-400 fill-current transition-colors"/>
                                 </button>
                             ))}
                        </div>
                    )}
                    </>
                 )}
            </div>
        </div>
        <div className="flex-1 overflow-y-auto p-8 font-serif text-lg leading-relaxed text-slate-800 prose prose-slate max-w-none">
          {output ? (
             <ReactMarkdown>{output}</ReactMarkdown>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <Save className="w-8 h-8 text-slate-300" />
                </div>
                <p>Your creation will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};