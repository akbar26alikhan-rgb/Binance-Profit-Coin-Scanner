
import React, { useState, useEffect, useCallback } from 'react';
import { CoinData, View, FilterState } from './types';
import { processAllCoins } from './services/binanceService';
import Dashboard from './components/Dashboard';
import CoinDetails from './components/CoinDetails';

const App: React.FC = () => {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [currentView, setCurrentView] = useState<View>(View.Dashboard);
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const initialFilters: FilterState = {
    minScore: 0,
    grades: [],
    minVolume: 1000000,
    bullishOnly: false,
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await processAllCoins((curr, total) => {
        setProgress({ current: curr, total });
      });
      setCoins(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch market data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000); // 5 minutes refresh
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleSelectCoin = (coin: CoinData) => {
    setSelectedCoin(coin);
    setCurrentView(View.Details);
  };

  const toggleGradeFilter = (grade: string) => {
    setFilters(prev => ({
      ...prev,
      grades: prev.grades.includes(grade) 
        ? prev.grades.filter(g => g !== grade) 
        : [...prev.grades, grade]
    }));
  };

  const resetFilters = () => setFilters(initialFilters);

  const formatVolume = (val: number) => {
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}B`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(0)}M`;
    return `${(val / 1000).toFixed(0)}K`;
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-[#161a1e] border-b border-[#2b3139] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setCurrentView(View.Dashboard)}
          >
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center font-bold text-[#0b0e11]">B</div>
            <span className="font-bold text-lg hidden sm:block tracking-tight">Binance Profit Scanner</span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-[10px] text-[#848e9c] uppercase tracking-wider">Market Status</span>
              <span className="text-xs font-bold text-green-400">● Live Tracking</span>
            </div>
            <button 
              onClick={() => fetchData()}
              disabled={loading}
              title="Refresh Data"
              className={`p-2 rounded-lg bg-[#1e2329] border border-[#2b3139] hover:bg-[#2b3139] transition-all ${loading ? 'opacity-50' : ''}`}
            >
              <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-8">
        {currentView === View.Dashboard ? (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#161a1e] p-5 rounded-xl border border-[#2b3139]">
                <div className="text-xs text-[#848e9c] mb-1">Top Opportunities</div>
                <div className="text-2xl font-bold text-[#eaecef]">
                  {coins.filter(c => c.scores.total >= 80).length} <span className="text-sm font-normal text-green-400">Coins</span>
                </div>
              </div>
              <div className="bg-[#161a1e] p-5 rounded-xl border border-[#2b3139]">
                <div className="text-xs text-[#848e9c] mb-1">Average Market Score</div>
                <div className="text-2xl font-bold text-[#eaecef]">
                  {coins.length ? (coins.reduce((acc, c) => acc + c.scores.total, 0) / coins.length).toFixed(1) : 0}
                </div>
              </div>
              <div className="bg-[#161a1e] p-5 rounded-xl border border-[#2b3139]">
                <div className="text-xs text-[#848e9c] mb-1">Last Analysis</div>
                <div className="text-2xl font-bold text-[#eaecef]">
                  {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </div>
              </div>
              <div className="bg-[#161a1e] p-5 rounded-xl border border-[#2b3139]">
                <div className="text-xs text-[#848e9c] mb-1">Scanned Universe</div>
                <div className="text-2xl font-bold text-[#eaecef]">50 <span className="text-sm font-normal text-[#474d57]">USDT Pairs</span></div>
              </div>
            </div>

            {/* Enhanced Filters Bar */}
            <div className="bg-[#161a1e] p-6 rounded-xl border border-[#2b3139] space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Grades Multi-select */}
                <div className="flex flex-col space-y-2">
                  <span className="text-xs font-bold text-[#848e9c] uppercase tracking-wider">Trade Grades</span>
                  <div className="flex flex-wrap gap-2">
                    {['A+', 'A', 'B', 'C', 'D'].map(grade => (
                      <button 
                        key={grade}
                        onClick={() => toggleGradeFilter(grade)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all border ${
                          filters.grades.includes(grade) 
                            ? 'bg-yellow-500 text-[#0b0e11] border-yellow-500' 
                            : 'bg-[#1e2329] text-[#848e9c] border-[#2b3139] hover:border-[#474d57]'
                        }`}
                      >
                        {grade}
                      </button>
                    ))}
                    {filters.grades.length > 0 && (
                      <button 
                        onClick={() => setFilters(f => ({ ...f, grades: [] }))}
                        className="text-xs text-[#474d57] hover:text-yellow-500 underline ml-2"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Bullish Toggle and Reset */}
                <div className="flex items-center space-x-6">
                  <label className="flex items-center group cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={filters.bullishOnly}
                        onChange={() => setFilters(f => ({ ...f, bullishOnly: !f.bullishOnly }))}
                      />
                      <div className={`w-10 h-5 rounded-full transition-colors ${filters.bullishOnly ? 'bg-yellow-500' : 'bg-[#2b3139]'}`}></div>
                      <div className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${filters.bullishOnly ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-[#848e9c] group-hover:text-[#eaecef]">Bullish Trend Only</span>
                  </label>

                  <button 
                    onClick={resetFilters}
                    className="text-xs font-bold text-[#848e9c] hover:text-[#eaecef] uppercase tracking-widest flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Reset
                  </button>
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Score Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-[#848e9c] uppercase tracking-wider">Min Profit Score</span>
                    <span className="text-xl font-black text-yellow-500">{filters.minScore}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={filters.minScore}
                    onChange={(e) => setFilters(f => ({ ...f, minScore: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-[#1e2329] rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  />
                  <div className="flex justify-between text-[10px] text-[#474d57]">
                    <span>0 - High Risk</span>
                    <span>100 - Strong A+</span>
                  </div>
                </div>

                {/* Volume Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-[#848e9c] uppercase tracking-wider">Min 24h Volume</span>
                    <span className="text-xl font-black text-[#eaecef]">{formatVolume(filters.minVolume)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100000000" // Up to 100M for this demo
                    step="1000000"
                    value={filters.minVolume}
                    onChange={(e) => setFilters(f => ({ ...f, minVolume: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-[#1e2329] rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  />
                  <div className="flex justify-between text-[10px] text-[#474d57]">
                    <span>0</span>
                    <span>100M+</span>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="bg-[#161a1e] rounded-xl border border-[#2b3139] p-20 flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-center">
                  <p className="text-lg font-bold">Analysing Market Sentiment...</p>
                  <p className="text-sm text-[#848e9c]">Processed {progress.current} / {progress.total} tokens</p>
                </div>
              </div>
            ) : (
              <Dashboard 
                coins={coins} 
                filters={filters} 
                onSelectCoin={handleSelectCoin}
              />
            )}
          </div>
        ) : (
          selectedCoin && (
            <CoinDetails 
              coin={selectedCoin} 
              onBack={() => setCurrentView(View.Dashboard)}
            />
          )
        )}
      </main>

      {/* Persistent Call to Action */}
      {!loading && currentView === View.Dashboard && (
        <div 
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-yellow-500 text-[#0b0e11] rounded-full font-bold shadow-2xl flex items-center space-x-2 animate-bounce cursor-pointer hover:scale-105 transition-transform z-40"
          onClick={() => alert("Alerts system integration coming soon! This will use the Notification API.")}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
          <span>Set Score Alerts</span>
        </div>
      )}
    </div>
  );
};

export default App;
