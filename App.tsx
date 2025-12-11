import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Generator } from './components/Generator';
import { Stats } from './components/Stats';
import { Documentation } from './components/Documentation';
import { Samples } from './components/Samples';
import { GenerationResult } from './types';
import { PenTool, BarChart2, Book, Layout, Github } from 'lucide-react';

const NavLink: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive 
          ? 'bg-indigo-100 text-indigo-700' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {icon}
      {label}
    </Link>
  );
};

const LayoutShell: React.FC<{ children: React.ReactNode; history: GenerationResult[] }> = ({ children, history }) => {
    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-indigo-600">
                        <PenTool className="w-6 h-6" />
                        <h1 className="font-bold text-xl tracking-tight text-slate-900">PenPal AI</h1>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Creative Writing Studio</p>
                </div>
                
                <nav className="flex-1 p-4 space-y-1">
                    <NavLink to="/" icon={<Layout className="w-4 h-4"/>} label="Generator" />
                    <NavLink to="/samples" icon={<Github className="w-4 h-4"/>} label="Gallery" />
                    <NavLink to="/stats" icon={<BarChart2 className="w-4 h-4"/>} label="Analytics" />
                    <NavLink to="/docs" icon={<Book className="w-4 h-4"/>} label="Documentation" />
                </nav>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Session Stats</div>
                    <div className="flex justify-between text-sm text-slate-700 mb-1">
                        <span>Generations</span>
                        <span className="font-bold">{history.length}</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden flex flex-col relative">
                 <header className="md:hidden h-14 bg-white border-b border-slate-200 flex items-center px-4 justify-between">
                     <span className="font-bold text-slate-900">PenPal AI</span>
                     {/* Mobile menu could go here, omitting for brevity */}
                 </header>
                 <div className="flex-1 overflow-auto p-4 md:p-8">
                    {children}
                 </div>
            </main>
        </div>
    )
}

const App: React.FC = () => {
  const [history, setHistory] = useState<GenerationResult[]>([]);

  // Load history from local storage on mount
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

  // Save history when it updates
  useEffect(() => {
    localStorage.setItem('museai_history', JSON.stringify(history));
  }, [history]);

  const handleSave = (result: GenerationResult) => {
    // If updating a rating, find and update
    if (result.userRating && history.some(h => h.id === result.id)) {
        setHistory(prev => prev.map(h => h.id === result.id ? result : h));
    } else {
        setHistory(prev => [...prev, result]);
    }
  };

  return (
    <Router>
        <LayoutShell history={history}>
            <Routes>
                <Route path="/" element={<Generator onSave={handleSave} />} />
                <Route path="/stats" element={<Stats history={history} />} />
                <Route path="/docs" element={<Documentation />} />
                <Route path="/samples" element={<Samples />} />
            </Routes>
        </LayoutShell>
    </Router>
  );
};

export default App;
