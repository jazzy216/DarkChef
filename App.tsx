
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, 
  Trash2, 
  Play, 
  Sparkles, 
  ArrowRight, 
  Copy, 
  ChevronRight, 
  Hash, 
  Code, 
  Wand2,
  Terminal,
  Settings2,
  Cpu
} from 'lucide-react';
import { OPERATIONS, getOperationById } from './services/operations';
import { analyzeInput } from './services/geminiService';
import { ActiveOperation, DetectionResult, OperationCategory } from './types';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [recipe, setRecipe] = useState<ActiveOperation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DetectionResult | null>(null);
  const [activeCategory, setActiveCategory] = useState<OperationCategory | 'All'>('All');

  const filteredOperations = useMemo(() => {
    return OPERATIONS.filter(op => {
      const matchesSearch = op.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           op.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'All' || op.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const runRecipe = useCallback(() => {
    let currentOutput = input;
    try {
      recipe.forEach(activeOp => {
        const op = getOperationById(activeOp.operationId);
        if (op) {
          currentOutput = op.run(currentOutput, activeOp.params);
        }
      });
      setOutput(currentOutput);
    } catch (e) {
      setOutput(`Error executing recipe: ${(e as Error).message}`);
    }
  }, [input, recipe]);

  useEffect(() => {
    runRecipe();
  }, [input, recipe, runRecipe]);

  const addToRecipe = (operationId: string) => {
    setRecipe(prev => [
      ...prev, 
      { 
        instanceId: Math.random().toString(36).substr(2, 9), 
        operationId, 
        params: {} 
      }
    ]);
  };

  const removeFromRecipe = (instanceId: string) => {
    setRecipe(prev => prev.filter(op => op.instanceId !== instanceId));
  };

  const handleMagicAnalysis = async () => {
    if (!input) return;
    setIsAnalyzing(true);
    const result = await analyzeInput(input);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const applySuggestedOperations = (ops: string[]) => {
    const newSteps = ops.map(opId => ({
        instanceId: Math.random().toString(36).substr(2, 9), 
        operationId: opId, 
        params: {} 
    }));
    setRecipe(prev => [...prev, ...newSteps]);
    setAnalysis(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Cpu className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            NovaChef
          </h1>
          <span className="text-[10px] uppercase tracking-widest bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-bold">
            v1.0
          </span>
        </div>
        
        <div className="flex items-center gap-4">
           <button 
            onClick={handleMagicAnalysis}
            disabled={isAnalyzing || !input}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isAnalyzing ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
            }`}
          >
            {isAnalyzing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent"></div>
            ) : <Sparkles className="w-4 h-4" />}
            {isAnalyzing ? 'Analyzing...' : 'Smart Analysis'}
          </button>
          <div className="h-6 w-px bg-slate-800"></div>
          <button className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
            <Settings2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex flex-1 overflow-hidden">
        
        {/* Sidebar: Operations */}
        <aside className="w-72 border-r border-slate-800 bg-slate-900 flex flex-col shrink-0">
          <div className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text"
                placeholder="Search operations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none placeholder:text-slate-500"
              />
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              {['All', 'Encoding', 'Hashing', 'Data Format'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat as any)}
                  className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase transition-colors ${
                    activeCategory === cat ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800 text-slate-500 border border-transparent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin">
            {filteredOperations.map(op => (
              <button
                key={op.id}
                onClick={() => addToRecipe(op.id)}
                className="w-full text-left p-3 rounded-xl hover:bg-slate-800 transition-all group mb-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300 group-hover:text-white">{op.name}</span>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                </div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{op.description}</p>
              </button>
            ))}
          </div>
        </aside>

        {/* Recipe Builder */}
        <section className="w-80 border-r border-slate-800 bg-slate-900/50 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active Recipe</h2>
            </div>
            {recipe.length > 0 && (
              <button 
                onClick={() => setRecipe([])}
                className="p-1.5 hover:bg-red-500/10 rounded text-red-500/70 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {recipe.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-6">
                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-slate-600">
                  <Terminal className="w-6 h-6" />
                </div>
                <p className="text-sm text-slate-500">Your recipe is empty. Add operations from the sidebar to get started.</p>
              </div>
            ) : (
              recipe.map((activeOp, index) => {
                const op = getOperationById(activeOp.operationId);
                return (
                  <div key={activeOp.instanceId} className="bg-slate-800 border border-slate-700/50 rounded-xl overflow-hidden shadow-sm hover:border-slate-600 transition-colors">
                    <div className="px-3 py-2.5 bg-slate-700/30 border-b border-slate-700/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] w-5 h-5 bg-slate-600 rounded-full flex items-center justify-center text-slate-300 font-mono font-bold">
                          {index + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-200">{op?.name}</span>
                      </div>
                      <button 
                        onClick={() => removeFromRecipe(activeOp.instanceId)}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-2 bg-slate-900/40">
                       <p className="text-[10px] text-slate-500 italic">No parameters required</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          <div className="p-4 bg-slate-900 border-t border-slate-800">
            <button 
              disabled={recipe.length === 0}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-bold text-indigo-400 transition-all"
            >
              <Play className="w-4 h-4 fill-indigo-400" />
              RUN RECIPE
            </button>
          </div>
        </section>

        {/* Data IO */}
        <section className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          {/* AI Suggestions Overlay */}
          {analysis && (
            <div className="m-4 p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-bold text-white">AI Detection: {analysis.format}</span>
                  <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                    {Math.round(analysis.confidence * 100)}% Match
                  </span>
                </div>
                <button onClick={() => setAnalysis(null)} className="text-slate-400 hover:text-white">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{analysis.explanation}</p>
              <div className="flex items-center gap-2">
                 <button 
                  onClick={() => applySuggestedOperations(analysis.suggestedOperations)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"
                >
                  Apply {analysis.suggestedOperations.length} steps
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="h-10 border-b border-slate-800 bg-slate-900/30 px-4 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Input</span>
               </div>
               <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-600 font-mono">{input.length} chars</span>
               </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste or type your data here..."
              className="flex-1 w-full p-6 bg-transparent resize-none outline-none mono text-sm text-slate-300 placeholder:text-slate-700 leading-relaxed scrollbar-thin"
            />
          </div>

          <div className="h-1 bg-slate-800"></div>

          {/* Output Area */}
          <div className="flex-1 flex flex-col min-h-0 bg-slate-900/20">
            <div className="h-10 border-b border-slate-800 bg-slate-900/30 px-4 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Output</span>
               </div>
               <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-600 font-mono">{output.length} chars</span>
                  <button 
                    onClick={() => copyToClipboard(output)}
                    className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 px-2 py-1 rounded border border-slate-700/50 transition-all"
                  >
                    <Copy className="w-3 h-3" />
                    COPY
                  </button>
               </div>
            </div>
            <div className="flex-1 p-6 mono text-sm overflow-auto scrollbar-thin">
              {output ? (
                <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed break-all">
                  {output}
                </pre>
              ) : (
                <p className="text-slate-700 italic">Result will appear here...</p>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer / Status Bar */}
      <footer className="h-8 border-t border-slate-800 bg-slate-900 flex items-center justify-between px-4 shrink-0 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>System Ready</span>
          </div>
          <div className="h-3 w-px bg-slate-700"></div>
          <span>API: Connected</span>
        </div>
        <div className="flex items-center gap-4">
           <span>Model: Gemini-3-Flash</span>
           <div className="h-3 w-px bg-slate-700"></div>
           <span>© 2024 NovaLabs</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
