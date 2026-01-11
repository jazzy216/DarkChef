
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
  Cpu,
  Flame
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
    <div className="flex flex-col h-screen overflow-hidden bg-neutral-950 text-neutral-200">
      {/* Header */}
      <header className="h-16 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 chef-gradient rounded-lg flex items-center justify-center shadow-lg shadow-rose-500/20">
            <Flame className="text-white w-5 h-5" />
          </div>
          <div className="flex flex-col -space-y-1">
            <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">
              DarkChef
            </h1>
            <span className="text-[10px] text-rose-500 font-bold tracking-widest uppercase">
              Pro Alchemy
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <button 
            onClick={handleMagicAnalysis}
            disabled={isAnalyzing || !input}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all ${
                isAnalyzing 
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700' 
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-xl shadow-rose-900/20 active:scale-95'
            }`}
          >
            {isAnalyzing ? (
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-neutral-400 border-t-transparent"></div>
            ) : <Sparkles className="w-3.5 h-3.5" />}
            {isAnalyzing ? 'ANALYZING' : 'SMART DETECTION'}
          </button>
          <div className="h-6 w-px bg-neutral-800"></div>
          <button className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-500 hover:text-white transition-colors">
            <Settings2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex flex-1 overflow-hidden">
        
        {/* Sidebar: Operations */}
        <aside className="w-72 border-r border-neutral-800 bg-neutral-900 flex flex-col shrink-0">
          <div className="p-4 space-y-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-rose-400 transition-colors" />
              <input 
                type="text"
                placeholder="Find operation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-rose-500/50 focus:border-rose-500/50 outline-none placeholder:text-neutral-600 transition-all"
              />
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              {['All', 'Encoding', 'Hashing', 'Data Format'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat as any)}
                  className={`text-[9px] px-2.5 py-1 rounded-md font-black uppercase transition-all tracking-tighter ${
                    activeCategory === cat 
                    ? 'bg-rose-600 text-white' 
                    : 'bg-neutral-800 text-neutral-500 hover:text-neutral-300'
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
                className="w-full text-left p-3 rounded-lg hover:bg-neutral-800 transition-all group mb-1 border border-transparent hover:border-neutral-700"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-400 group-hover:text-rose-400 transition-colors">{op.name}</span>
                  <ChevronRight className="w-4 h-4 text-neutral-700 group-hover:text-rose-400 transition-all transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-neutral-600 mt-0.5 line-clamp-1 group-hover:text-neutral-500">{op.description}</p>
              </button>
            ))}
          </div>
        </aside>

        {/* Recipe Builder */}
        <section className="w-80 border-r border-neutral-800 bg-neutral-900/30 flex flex-col shrink-0">
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/40">
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-rose-500" />
              <h2 className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.2em]">The Recipe</h2>
            </div>
            {recipe.length > 0 && (
              <button 
                onClick={() => setRecipe([])}
                className="px-2 py-1 hover:bg-rose-950/30 rounded text-rose-500/70 hover:text-rose-500 transition-colors text-[10px] font-bold uppercase"
              >
                Clear
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-950/10">
            {recipe.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-8 space-y-4 opacity-30">
                <Terminal className="w-10 h-10 text-neutral-600" />
                <p className="text-xs text-neutral-500 font-medium">Select operations to build your data forge.</p>
              </div>
            ) : (
              recipe.map((activeOp, index) => {
                const op = getOperationById(activeOp.operationId);
                return (
                  <div key={activeOp.instanceId} className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden shadow-2xl hover:border-neutral-700 transition-all">
                    <div className="px-3 py-2 bg-neutral-800/50 border-b border-neutral-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] w-4 h-4 bg-rose-600/10 text-rose-500 border border-rose-500/20 rounded-sm flex items-center justify-center font-mono font-bold">
                          {index + 1}
                        </span>
                        <span className="text-xs font-bold text-neutral-300 uppercase tracking-tight">{op?.name}</span>
                      </div>
                      <button 
                        onClick={() => removeFromRecipe(activeOp.instanceId)}
                        className="text-neutral-600 hover:text-rose-500 p-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="px-3 py-2 bg-neutral-950/20">
                       <p className="text-[10px] text-neutral-600 font-medium uppercase tracking-widest italic opacity-50">Standard Config</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          <div className="p-4 bg-neutral-900 border-t border-neutral-800">
            <button 
              disabled={recipe.length === 0}
              className="w-full flex items-center justify-center gap-2 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-xs font-black text-rose-500 transition-all border border-neutral-700 hover:border-rose-900/50 shadow-inner uppercase tracking-widest"
            >
              <Play className="w-3.5 h-3.5 fill-rose-500" />
              Execute Sequence
            </button>
          </div>
        </section>

        {/* Data IO */}
        <section className="flex-1 flex flex-col bg-black overflow-hidden relative">
          {/* AI Suggestions Overlay */}
          {analysis && (
            <div className="m-4 p-5 bg-neutral-900 border-l-4 border-l-rose-600 border border-neutral-800 rounded-r-xl flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 duration-500 shadow-2xl z-40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-rose-500/10 rounded">
                    <Sparkles className="w-4 h-4 text-rose-500" />
                  </div>
                  <span className="text-sm font-black text-white uppercase tracking-tighter">AI SCAN DETECTED: {analysis.format}</span>
                  <span className="text-[10px] font-black bg-rose-950 text-rose-400 px-2 py-0.5 rounded border border-rose-900/50">
                    {Math.round(analysis.confidence * 100)}% MATCH
                  </span>
                </div>
                <button onClick={() => setAnalysis(null)} className="text-neutral-600 hover:text-white transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed font-medium">{analysis.explanation}</p>
              <div className="flex items-center gap-2 mt-1">
                 <button 
                  onClick={() => applySuggestedOperations(analysis.suggestedOperations)}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-black uppercase transition-all shadow-lg shadow-rose-900/40 active:scale-95 tracking-widest"
                >
                  Apply Suggested Forge Sequence
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="h-10 border-b border-neutral-800 bg-neutral-900/20 px-4 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-2">
                <Code className="w-3.5 h-3.5 text-neutral-600" />
                <span className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em]">Source Input</span>
               </div>
               <div className="flex items-center gap-2">
                  <span className="text-[10px] text-neutral-700 font-mono font-bold">{input.length.toLocaleString()} BYTES</span>
               </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Inject raw data here..."
              className="flex-1 w-full p-8 bg-transparent resize-none outline-none mono text-sm text-neutral-400 placeholder:text-neutral-800 leading-loose scrollbar-thin selection:bg-rose-500/30"
            />
          </div>

          <div className="h-px bg-neutral-800"></div>

          {/* Output Area */}
          <div className="flex-1 flex flex-col min-h-0 bg-neutral-900/5">
            <div className="h-10 border-b border-neutral-800 bg-neutral-900/20 px-4 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-2">
                <Hash className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">Forge Output</span>
               </div>
               <div className="flex items-center gap-3">
                  <span className="text-[10px] text-neutral-700 font-mono font-bold">{output.length.toLocaleString()} BYTES</span>
                  <button 
                    onClick={() => copyToClipboard(output)}
                    className="flex items-center gap-1.5 text-[9px] font-black text-neutral-500 hover:text-white bg-neutral-800/50 hover:bg-neutral-700 px-3 py-1 rounded border border-neutral-700/50 transition-all uppercase tracking-widest"
                  >
                    <Copy className="w-3 h-3" />
                    EXTRACT
                  </button>
               </div>
            </div>
            <div className="flex-1 p-8 mono text-sm overflow-auto scrollbar-thin bg-black/40">
              {output ? (
                <pre className="text-rose-400 whitespace-pre-wrap leading-relaxed break-all selection:bg-rose-500 selection:text-white">
                  {output}
                </pre>
              ) : (
                <div className="h-full flex items-center justify-center opacity-10">
                   <p className="text-neutral-500 italic uppercase tracking-[0.5em] font-black text-xs">Waiting for sequence</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer / Status Bar */}
      <footer className="h-8 border-t border-neutral-800 bg-neutral-900 flex items-center justify-between px-6 shrink-0 text-[9px] font-bold text-neutral-600 uppercase tracking-widest">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse shadow-[0_0_8px_rgba(225,29,72,0.6)]"></div>
            <span>Forge Active</span>
          </div>
          <div className="h-3 w-px bg-neutral-800"></div>
          <span className="text-neutral-500">Security Layer: Encrypted</span>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-1.5">
             <Cpu className="w-3 h-3" />
             <span>Core: Gemini Flash v3.0</span>
           </div>
           <div className="h-3 w-px bg-neutral-800"></div>
           <span className="hover:text-rose-500 transition-colors cursor-default">DarkChef Protocol © 2024</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
