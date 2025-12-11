import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Feather, Zap, Shield } from 'lucide-react';

export const Welcome: React.FC = () => {
  return (
    <div className="h-full w-full overflow-y-auto relative bg-gradient-to-br from-purple-700 via-indigo-950 to-slate-950 scroll-smooth">
       
       {/* Ambient Overlay - Fixed position so it stays while scrolling */}
       <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none"></div>

       {/* Content Wrapper - min-h-full allows centering but lets content grow */}
       <div className="min-h-full flex flex-col items-center justify-center p-6 py-12 md:py-20 relative z-10">
          <div className="max-w-5xl w-full text-center space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-sm font-medium text-purple-100 animate-in fade-in slide-in-from-top-4 duration-700 shadow-lg shadow-purple-500/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Powered by Gemini 2.5 & 3.0</span>
              </div>
              
              {/* Hero Text */}
              <div className="space-y-4">
                  <h1 className="text-5xl md:text-7xl font-serif font-bold text-white tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 drop-shadow-2xl">
                    Where Ideas Become <br />
                    <span className="bg-gradient-to-r from-purple-200 via-fuchsia-200 to-indigo-200 bg-clip-text text-transparent">Masterpieces</span>
                  </h1>
                  
                  <p className="text-lg md:text-xl text-purple-100/80 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    Unleash your imagination with PenPal AI. Generate stories, poems, worlds, and characters in seconds using advanced AI models.
                  </p>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 pt-4">
                  <Link 
                    to="/generate" 
                    className="w-full sm:w-auto group relative px-8 py-4 bg-white text-purple-950 font-bold rounded-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.6)]"
                  >
                    Start Creating
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    to="/samples" 
                    className="w-full sm:w-auto px-8 py-4 bg-purple-900/30 text-white font-medium rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                  >
                    View Gallery
                  </Link>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 md:mt-20 text-left animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all hover:-translate-y-1">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-400/20 flex items-center justify-center mb-4 text-indigo-200 border border-indigo-400/30">
                          <Feather className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">Diverse Formats</h3>
                      <p className="text-sm text-purple-200/70 leading-relaxed">From Haikus to High Fantasy epics, create content in any format or genre with tailored templates.</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all hover:-translate-y-1">
                      <div className="w-12 h-12 rounded-2xl bg-fuchsia-400/20 flex items-center justify-center mb-4 text-fuchsia-200 border border-fuchsia-400/30">
                          <Zap className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">Lightning Fast</h3>
                      <p className="text-sm text-purple-200/70 leading-relaxed">Powered by Gemini Flash for instant results, or switch to Pro for complex reasoning and worldbuilding.</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all hover:-translate-y-1">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-400/20 flex items-center justify-center mb-4 text-cyan-200 border border-cyan-400/30">
                          <Shield className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">Private & Secure</h3>
                      <p className="text-sm text-purple-200/70 leading-relaxed">Your history is stored locally in your browser. We respect your creative ownership.</p>
                  </div>
              </div>
              
              <div className="pt-12 animate-in fade-in duration-1000 delay-700">
                <p className="text-xs text-purple-300/50 font-mono">v2.5.0 • Built with Google Gemini API</p>
              </div>
          </div>
       </div>
    </div>
  );
};
