import React, { useState, useEffect, useRef } from 'react';
import { PROMPT_TEMPLATES, GENRES, TONES, LENGTHS, SA_LANGUAGES } from '../constants';
import { GenerationParams, GenerationResult, PromptTemplate } from '../types';
import { generateCreativeContent, generateSpeech } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { 
  Loader2, AlertCircle, Save, Star, Copy, Check, Download, Sparkles, ChevronRight,
  BookOpen, Feather, User, Globe, MessageCircle, AlignLeft, AlignCenter, AlignJustify,
  Thermometer, Wand2, RefreshCw, X, FileJson, FileText, FileCode, Volume2, StopCircle, Mic, HardDrive
} from 'lucide-react';

interface GeneratorProps {
  onSave: (result: GenerationResult) => { success: boolean, remaining: number };
  historyCount: number;
  maxHistory: number;
}

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  story: <BookOpen className="w-4 h-4" />,
  poem: <Feather className="w-4 h-4" />,
  character: <User className="w-4 h-4" />,
  worldbuilding: <Globe className="w-4 h-4" />,
  dialogue: <MessageCircle className="w-4 h-4" />
};

const LENGTH_ICONS: Record<string, React.ReactNode> = {
  short: <AlignLeft className="w-4 h-4" />,
  medium: <AlignCenter className="w-4 h-4" />,
  long: <AlignJustify className="w-4 h-4" />
};

type DownloadFormat = 'md' | 'txt' | 'json';

// Utility for audio decoding
function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
  
  async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

// Gibberish detection helper
const isGibberish = (text: string): boolean => {
    // Check for repetitive characters (e.g., "aaaaa")
    if (/(.)\1{4,}/.test(text)) return true;
    
    // For very long words (>15 chars) check if they have vowels
    // This catches "sdfghjklmnbvcxz"
    const words = text.split(/\s+/);
    for (const word of words) {
        if (word.length > 15 && !/[aeiouyAEIOUY]/.test(word)) {
            return true;
        }
    }
    
    // Consonant ratio check for single word inputs that might be random keys
    // Only applies if text length > 5
    if (text.length > 5) {
        const vowels = text.match(/[aeiouyAEIOUY]/g);
        const vowelCount = vowels ? vowels.length : 0;
        const letterCount = text.replace(/[^a-zA-Z]/g, '').length;
        if (letterCount > 0 && (vowelCount / letterCount) < 0.1) {
             // Less than 10% vowels suggests gibberish in most Latin languages
             return true;
        }
    }

    return false;
};

export const Generator: React.FC<GeneratorProps> = ({ onSave, historyCount, maxHistory }) => {
  const [activeTemplate, setActiveTemplate] = useState<PromptTemplate>(PROMPT_TEMPLATES[0]);
  const [params, setParams] = useState<GenerationParams>({
    type: 'story',
    genre: GENRES[0],
    tone: TONES[0],
    language: 'English',
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
  const [saveStatus, setSaveStatus] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  // Audio State
  const [isNarrating, setIsNarrating] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Download Modal State
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<DownloadFormat>('md');

  useEffect(() => {
    setParams(prev => ({ ...prev, type: activeTemplate.id, promptInputs: {} }));
    setError(null);
    setOutput('');
    setSaveStatus(null);
    stopNarration();
  }, [activeTemplate]);

  const handleInputChange = (key: string, value: string) => {
    setParams(prev => ({
      ...prev,
      promptInputs: { ...prev.promptInputs, [key]: value }
    }));
    if (error) setError(null);
  };

  const validateInputs = () => {
    const numberPattern = /^[0-9\s]+$/;

    for (const field of activeTemplate.fields) {
      const value = params.promptInputs[field.key]?.trim();
      
      if (!value) {
        setError(`Please fill in the ${field.label} field.`);
        return false;
      }

      if (field.type === 'text') {
          if (numberPattern.test(value)) {
              setError(`The ${field.label} cannot be purely numerical.`);
              return false;
          }
          // Check for special characters that aren't basic punctuation
          if (/[@#$%^&*_+=(){}\[\]|<>\/~`]/.test(value)) {
              setError(`The ${field.label} contains invalid special characters.`);
              return false;
          }
          
          if (isGibberish(value)) {
              setError(`The ${field.label} appears to be gibberish. Please enter meaningful text.`);
              return false;
          }
      }
    }
    return true;
  };

  const handleGenerate = async () => {
    if (!validateInputs()) return;

    stopNarration();
    setIsGenerating(true);
    setError(null);
    setOutput('');
    setSaveStatus(null);
    setStartTime(Date.now());
    setUserRating(undefined);

    const apiKey = process.env.API_KEY || '';
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
      
      const genResult: GenerationResult = {
        id: crypto.randomUUID(),
        content: result.text,
        timestamp: endTime,
        params: { ...params },
        metrics: {
            durationMs: duration,
            estimatedTokens: result.text.length / 4,
            model: result.model
        }
      };
      
      const status = onSave(genResult);
      if (status.success) {
          setSaveStatus({
              msg: `Saved to history! ${status.remaining} slots remaining.`,
              type: 'success'
          });
      } else {
          setSaveStatus({
              msg: `History full (10/10). Please delete old items in the History tab to save this.`,
              type: 'error'
          });
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const stopNarration = () => {
    if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
    }
    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    setIsNarrating(false);
  };

  const handleNarrate = async () => {
      if (isNarrating) {
          stopNarration();
          return;
      }

      if (!output) return;

      setIsLoadingAudio(true);
      const apiKey = process.env.API_KEY || '';
      
      try {
          const base64Audio = await generateSpeech(apiKey, output);
          
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
          audioContextRef.current = audioContext;

          const audioBuffer = await decodeAudioData(
            decode(base64Audio),
            audioContext,
            24000,
            1
          );

          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContext.destination);
          
          source.onended = () => {
              setIsNarrating(false);
              sourceNodeRef.current = null;
          };

          source.start();
          sourceNodeRef.current = source;
          setIsNarrating(true);

      } catch (err: any) {
          setError("Failed to generate narration: " + err.message);
      } finally {
          setIsLoadingAudio(false);
      }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const executeDownload = () => {
    if (!output) return;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `penpal-${params.type}-${timestamp}`;
    
    let content = output;
    let mimeType = 'text/markdown';
    let extension = 'md';

    switch (selectedFormat) {
        case 'json':
            content = JSON.stringify({
                meta: {
                    type: params.type,
                    genre: params.genre,
                    tone: params.tone,
                    date: new Date().toISOString(),
                    model: modelUsed
                },
                content: output
            }, null, 2);
            mimeType = 'application/json';
            extension = 'json';
            break;
        case 'txt':
            content = output;
            mimeType = 'text/plain';
            extension = 'txt';
            break;
        case 'md':
        default:
            content = output;
            mimeType = 'text/markdown';
            extension = 'md';
            break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowDownloadModal(false);
  };

  const FORMAT_OPTIONS = [
    { id: 'md', label: 'Markdown', icon: FileCode, desc: 'Best for formatted text', color: 'text-indigo-500' },
    { id: 'txt', label: 'Plain Text', icon: FileText, desc: 'Simple unformatted text', color: 'text-slate-500' },
    { id: 'json', label: 'JSON Data', icon: FileJson, desc: 'Includes metadata', color: 'text-amber-500' },
  ] as const;

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full min-h-[calc(100vh-6rem)]">
      
      {/* Download Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowDownloadModal(false)}></div>
            <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-800/50">
                    <h3 className="font-bold text-zinc-800 dark:text-white">Download Content</h3>
                    <button onClick={() => setShowDownloadModal(false)} className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-full transition-colors">
                        <X className="w-4 h-4 text-zinc-500" />
                    </button>
                </div>
                
                <div className="p-5">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Select a format to save your {activeTemplate.name}.</p>
                    <div className="space-y-2">
                        {FORMAT_OPTIONS.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => setSelectedFormat(opt.id as DownloadFormat)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                                    selectedFormat === opt.id 
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500/50 ring-1 ring-indigo-500/20' 
                                        : 'bg-white dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                                }`}
                            >
                                <div className={`p-2 rounded-lg bg-white dark:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-zinc-700 ${opt.color}`}>
                                    <opt.icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">{opt.label}</div>
                                </div>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                                    selectedFormat === opt.id
                                        ? 'border-indigo-600 bg-indigo-600 text-white'
                                        : 'border-zinc-300 dark:border-zinc-600'
                                }`}>
                                    {selectedFormat === opt.id && <Check className="w-2.5 h-2.5" />}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 flex gap-3 justify-end">
                    <button 
                        onClick={() => setShowDownloadModal(false)}
                        className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={executeDownload}
                        className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Download
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Configuration Panel */}
      <div className="w-full lg:w-[420px] flex-shrink-0 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-3xl p-6 flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-120px)] transition-all duration-300 shadow-2xl shadow-black/5 hover:shadow-black/10">
        
        {/* Template Selector */}
        <div>
          <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-3">
            <Wand2 className="w-3.5 h-3.5" /> Template
          </label>
          <div className="grid grid-cols-2 gap-3">
            {PROMPT_TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTemplate(t)}
                className={`text-left px-4 py-3 rounded-2xl border transition-all duration-300 flex items-center gap-3 group relative overflow-hidden ${
                  activeTemplate.id === t.id 
                    ? 'bg-gradient-to-br from-fuchsia-600 to-indigo-600 border-transparent text-white shadow-lg shadow-fuchsia-500/20' 
                    : 'bg-white dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-500 hover:-translate-y-0.5'
                }`}
              >
                <div className={`p-2 rounded-xl transition-colors ${activeTemplate.id === t.id ? 'bg-white/20 text-white' : 'bg-zinc-50 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-600'}`}>
                  {TEMPLATE_ICONS[t.id]}
                </div>
                <div className="flex flex-col items-start z-10">
                    <span className="text-xs font-bold leading-none mb-1.5">{t.name}</span>
                    <span className={`text-[10px] leading-none ${activeTemplate.id === t.id ? 'text-white/70' : 'text-zinc-400'}`}>Creator</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* Language Selector */}
          <div className="group">
              <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2 ml-1">Language</label>
              <div className="relative">
                <select 
                  className="w-full p-3 pl-10 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-600"
                  value={params.language}
                  onChange={(e) => setParams({...params, language: e.target.value})}
                >
                  {SA_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                    <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
          </div>

          {/* Genre & Tone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="group">
              <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2 ml-1">Genre</label>
              <div className="relative">
                <select 
                  className="w-full p-3 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-600"
                  value={params.genre}
                  onChange={(e) => setParams({...params, genre: e.target.value})}
                >
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                    <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>
            <div className="group">
              <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2 ml-1">Tone</label>
              <div className="relative">
                <select 
                  className="w-full p-3 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-600"
                  value={params.tone}
                  onChange={(e) => setParams({...params, tone: e.target.value})}
                >
                  {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                    <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Length Selector */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2 ml-1">Length</label>
            <div className="flex bg-zinc-100 dark:bg-zinc-800/80 p-1.5 rounded-2xl gap-1">
              {LENGTHS.map(l => (
                <button
                  key={l}
                  onClick={() => setParams({...params, length: l as any})}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    params.length === l 
                    ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-sm ring-1 ring-black/5 dark:ring-white/10' 
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50'
                  }`}
                >
                  {LENGTH_ICONS[l]}
                  <span className="capitalize">{l}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Creativity Slider with Creative Colors */}
          <div className="bg-white/50 dark:bg-black/20 rounded-2xl p-5 border border-white/50 dark:border-white/5 relative overflow-hidden group">
             {/* Subtle background gradient glow */}
             <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none"></div>
             
             <div className="flex justify-between mb-4 relative z-10">
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    <Thermometer className="w-4 h-4" /> 
                    <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-extrabold">Creativity</span>
                </label>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-zinc-400">Precise</span>
                    <span className="text-xs font-mono font-bold text-white bg-zinc-900 px-2.5 py-1 rounded-md shadow-sm min-w-[3rem] text-center">{params.creativity.toFixed(1)}</span>
                    <span className="text-[10px] font-bold text-zinc-400">Wild</span>
                </div>
             </div>
             
             <div className="relative h-2.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 z-10">
                {/* Gradient Track */}
                <div 
                    className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80"
                    style={{ width: `${params.creativity * 100}%` }}
                ></div>
                <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1"
                    value={params.creativity}
                    onChange={(e) => setParams({...params, creativity: parseFloat(e.target.value)})}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                {/* Thumb Visual (handled by range input usually, but we are styling the track custom) */}
                <div 
                    className="absolute top-1/2 -translate-y-1/2 h-5 w-5 bg-white shadow-md rounded-full border-2 border-indigo-500 pointer-events-none transition-all"
                    style={{ left: `calc(${params.creativity * 100}% - 10px)` }}
                ></div>
             </div>
          </div>
        </div>

        {/* Dynamic Fields */}
        <div className="border-t-2 border-dashed border-zinc-200 dark:border-white/10 pt-5">
          <label className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-white mb-5 bg-zinc-100 dark:bg-zinc-800 w-fit px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
             <Sparkles className="w-3.5 h-3.5 text-amber-500" />
             {activeTemplate.name} Details
          </label>
          <div className="space-y-4">
            {activeTemplate.fields.map(field => (
              <div key={field.key} className="relative group">
                <label className="block text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5 transition-colors group-focus-within:text-indigo-400 ml-1">{field.label}</label>
                {field.type === 'select' ? (
                   <select 
                     className="w-full p-3 bg-white dark:bg-zinc-800 rounded-xl border-2 border-zinc-100 dark:border-zinc-700 text-sm text-zinc-800 dark:text-zinc-100 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                     onChange={(e) => handleInputChange(field.key, e.target.value)}
                   >
                     <option value="" className="dark:bg-zinc-800">Select...</option>
                     {field.options?.map(o => <option key={o} value={o} className="dark:bg-zinc-800">{o}</option>)}
                   </select>
                ) : (
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    className="w-full p-3 bg-white dark:bg-zinc-800 rounded-xl border-2 border-zinc-100 dark:border-zinc-700 text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    value={params.promptInputs[field.key] || ''}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Storage Warning */}
        {historyCount >= maxHistory && (
             <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800/50">
                 <HardDrive className="w-4 h-4 shrink-0" />
                 <span>History storage full ({maxHistory}/{maxHistory}). New generations won't be saved until you free up space.</span>
             </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`mt-auto w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-white transition-all shadow-xl hover:shadow-2xl active:scale-[0.98] relative overflow-hidden group ${
            isGenerating 
                ? 'bg-zinc-800 cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 shadow-indigo-500/30'
          }`}
        >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 blur-xl"></div>
            <div className="relative flex items-center gap-2">
                {isGenerating ? <><Loader2 className="animate-spin w-5 h-5"/> Writing...</> : <>Generate Content <ChevronRight className="w-5 h-5"/></>}
            </div>
        </button>
        
        {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs p-4 rounded-2xl flex gap-3 items-start border border-red-100 dark:border-red-900/30 animate-in slide-in-from-bottom-2 fade-in">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="font-medium">{error}</span>
            </div>
        )}

        {saveStatus && (
            <div className={`text-xs p-4 rounded-2xl flex gap-3 items-start border animate-in slide-in-from-bottom-2 fade-in ${
                saveStatus.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/30'
                : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30'
            }`}>
                {saveStatus.type === 'success' ? <Check className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                <span className="font-medium">{saveStatus.msg}</span>
            </div>
        )}
      </div>

      {/* Output Panel */}
      <div className="flex-1 bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-white/20 dark:border-white/5 rounded-3xl flex flex-col h-[calc(100vh-120px)] shadow-2xl shadow-black/5 relative overflow-hidden group transition-all duration-500">
        <div className="p-5 border-b border-zinc-200/50 dark:border-zinc-800/50 flex justify-between items-center bg-white/50 dark:bg-zinc-900/80 backdrop-blur-sm z-10 sticky top-0">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-serif font-bold text-lg text-zinc-800 dark:text-white leading-none">Creation</h2>
                        {modelUsed && <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">Powered by Gemini</span>}
                    </div>
                </div>
                {isGenerating && <span className="text-xs font-bold text-fuchsia-500 animate-pulse bg-fuchsia-50 dark:bg-fuchsia-900/20 px-2 py-1 rounded-full">AI is writing...</span>}
            </div>
            
            <div className="flex items-center gap-2 opacity-100 transition-opacity">
                 {output && (
                    <>
                    <button 
                        onClick={handleNarrate}
                        disabled={isLoadingAudio} 
                        className={`p-2.5 rounded-xl transition-all tooltip flex items-center gap-2 ${
                            isNarrating 
                            ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800' 
                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-transparent'
                        }`} 
                        title="Narrate Text"
                    >
                        {isLoadingAudio ? <Loader2 className="w-4 h-4 animate-spin"/> : isNarrating ? <StopCircle className="w-5 h-5"/> : <Volume2 className="w-5 h-5"/>}
                    </button>

                    <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>

                    <button onClick={() => setShowDownloadModal(true)} className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-400 transition-colors tooltip" title="Download Options">
                        <Download className="w-5 h-5"/>
                    </button>
                    <button onClick={copyToClipboard} className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-400 transition-colors" title="Copy Text">
                        {copied ? <Check className="w-5 h-5 text-green-600 dark:text-green-400"/> : <Copy className="w-5 h-5"/>}
                    </button>
                    {!userRating && (
                        <div className="flex gap-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2 py-1.5 ml-3 shadow-sm">
                             {[1,2,3,4,5].map(star => (
                                 <button key={star} onClick={() => {
                                     setUserRating(star);
                                     onSave({ ...params, userRating: star } as any);
                                 }} className="p-0.5 hover:scale-110 transition-transform">
                                    <Star className="w-4 h-4 text-zinc-300 dark:text-zinc-600 hover:text-amber-400 dark:hover:text-amber-400 fill-current transition-colors"/>
                                 </button>
                             ))}
                        </div>
                    )}
                    </>
                 )}
            </div>
        </div>
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 font-serif text-lg leading-relaxed text-zinc-800 dark:text-zinc-200 prose prose-zinc dark:prose-invert max-w-none scroll-smooth selection:bg-indigo-100 dark:selection:bg-indigo-900/30 selection:text-indigo-900 dark:selection:text-indigo-100">
          {output ? (
             <ReactMarkdown>{output}</ReactMarkdown>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-700">
                <div className="w-32 h-32 rounded-full bg-white dark:bg-zinc-800 shadow-2xl shadow-black/10 flex items-center justify-center mb-8 border border-zinc-100 dark:border-zinc-700 animate-[float_6s_ease-in-out_infinite]">
                    <Sparkles className="w-12 h-12 text-indigo-300 dark:text-indigo-500" />
                </div>
                <p className="text-sm uppercase tracking-widest font-bold text-zinc-400 dark:text-zinc-500">Your masterpiece awaits</p>
                <p className="text-sm text-zinc-400/70 dark:text-zinc-600 mt-3 max-w-xs text-center">Configure the creative options on the left sidebar to spark your imagination.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
