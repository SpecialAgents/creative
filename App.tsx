import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Generator } from './components/Generator';
import { Stats } from './components/Stats';
import { Documentation } from './components/Documentation';
import { Samples } from './components/Samples';
import { History } from './components/History';
import { Welcome } from './components/Welcome';
import { GenerationResult } from './types';
import { PenTool, BarChart2, Book, Layout, Github, Sun, Moon, Clock } from 'lucide-react';

const MAX_HISTORY_ITEMS = 10;

const NavLink: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
        isActive 
          ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 shadow-sm border border-indigo-500/10' 
          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200'
      }`}
    >
      <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </span>
      {label}
    </Link>
  );
};

interface LayoutProps {
    children: React.ReactNode;
    history: GenerationResult[];
    isDark: boolean;
    toggleTheme: () => void;
}

const LayoutShell: React.FC<LayoutProps> = ({ children, history, isDark, toggleTheme }) => {
    const location = useLocation();
    const isWelcomePage = location.pathname === '/';

    if (isWelcomePage) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen w-full">
            {/* Sidebar */}
            <aside className="w-72 hidden md:flex flex-col glass-panel border-r border-zinc-200/50 dark:border-white/5 z-20">
                <div className="p-8 pb-6">
                    <Link to="/" className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 mb-1 hover:opacity-80 transition-opacity">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <PenTool className="w-6 h-6" />
                        </div>
                        <h1 className="font-bold text-xl tracking-tight text-zinc-900 dark:text-white">PenPal AI</h1>
                    </Link>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 pl-1">Creative Writing Studio</p>
                </div>
                
                <nav className="flex-1 px-4 space-y-1.5 py-4">
                    <NavLink to="/generate" icon={<Layout className="w-4 h-4"/>} label="Studio" />
                    <NavLink to="/history" icon={<Clock className="w-4 h-4"/>} label="History" />
                    <NavLink to="/samples" icon={<Github className="w-4 h-4"/>} label="Gallery" />
                    <NavLink to="/stats" icon={<BarChart2 className="w-4 h-4"/>} label="Analytics" />
                    
                </nav>

                <div className="p-6 mt-auto">
                    <div className="bg-zinc-50/50 dark:bg-black/30 rounded-2xl p-4 border border-zinc-100 dark:border-white/5 backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-2">
                             <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Storage</div>
                        </div>
                        <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 mb-2">
                             <div 
                                className={`h-2 rounded-full transition-all duration-500 ${history.length >= MAX_HISTORY_ITEMS ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-fuchsia-500'}`} 
                                style={{ width: `${(history.length / MAX_HISTORY_ITEMS) * 100}%` }}
                             ></div>
                        </div>
                        <div className="flex justify-between items-end text-xs text-zinc-500 dark:text-zinc-400">
                            <span>{history.length} / {MAX_HISTORY_ITEMS} slots used</span>
                        </div>
                    </div>
                    <button 
                        onClick={toggleTheme}
                        className="mt-4 w-full flex items-center justify-center gap-2 p-2 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden flex flex-col relative">
                 <header className="md:hidden h-16 glass-panel border-b border-zinc-200/50 dark:border-zinc-800/50 flex items-center px-4 justify-between z-20">
                     <Link to="/" className="flex items-center gap-2">
                        <PenTool className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <span className="font-bold text-zinc-900 dark:text-white">PenPal AI</span>
                     </Link>
                     <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        {isDark ? <Sun className="w-5 h-5 text-zinc-600 dark:text-zinc-300" /> : <Moon className="w-5 h-5 text-zinc-600" />}
                     </button>
                 </header>
                 <div className="flex-1 overflow-auto p-4 md:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto h-full">
                        {children}
                    </div>
                 </div>
            </main>
        </div>
    )
}

const App: React.FC = () => {
  const [history, setHistory] = useState<GenerationResult[]>([]);
  const [isDark, setIsDark] = useState(() => {
      if (typeof window !== 'undefined') {
          return localStorage.getItem('theme') === 'dark' || 
                 (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
      }
      return false;
  });

  // Theme effect
  useEffect(() => {
    if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Load history
  useEffect(() => {
    const saved = localStorage.getItem('museai_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history
  useEffect(() => {
    localStorage.setItem('museai_history', JSON.stringify(history));
  }, [history]);

  const handleSave = (result: GenerationResult) => {
    // Check if updating an existing item (rating update)
    const existingIndex = history.findIndex(h => h.id === result.id);
    if (existingIndex >= 0) {
        const newHistory = [...history];
        newHistory[existingIndex] = result;
        setHistory(newHistory);
        return { success: true, remaining: MAX_HISTORY_ITEMS - newHistory.length };
    }

    // Check limit for new items
    if (history.length >= MAX_HISTORY_ITEMS) {
        return { success: false, remaining: 0 };
    }

    const newHistory = [...history, result];
    setHistory(newHistory);
    return { success: true, remaining: MAX_HISTORY_ITEMS - newHistory.length };
  };

  const handleDelete = (id: string) => {
      setHistory(prev => prev.filter(h => h.id !== id));
  };

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <Router>
        <LayoutShell history={history} isDark={isDark} toggleTheme={toggleTheme}>
            <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/generate" element={<Generator onSave={handleSave} historyCount={history.length} maxHistory={MAX_HISTORY_ITEMS} />} />
                <Route path="/history" element={<History history={history} onDelete={handleDelete} />} />
                <Route path="/stats" element={<Stats history={history} />} />
                <Route path="/docs" element={<Documentation />} />
                <Route path="/samples" element={<Samples />} />
            </Routes>
        </LayoutShell>
    </Router>
  );
};

export default App;