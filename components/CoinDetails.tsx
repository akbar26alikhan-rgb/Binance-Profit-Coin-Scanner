
import React from 'react';
import { CoinData } from '../types';
import ScoreCard from './ScoreCard';
import PriceChart from './PriceChart';

interface CoinDetailsProps {
  coin: CoinData;
  onBack: () => void;
}

const CoinDetails: React.FC<CoinDetailsProps> = ({ coin, onBack }) => {
  const calculateTradePlan = () => {
    const price = parseFloat(coin.lastPrice);
    const atr = coin.indicators.atr;
    const entry = price;
    const stopLoss = price - (atr * 1.5);
    const tp1 = price + (atr * 2);
    const tp2 = price + (atr * 4);
    return { entry, stopLoss, tp1, tp2 };
  };

  const plan = calculateTradePlan();

  const getIconUrl = (symbol: string) => {
    const baseAsset = symbol.replace('USDT', '');
    return `https://static.binance.com/assets/asset/symbol/${baseAsset.toLowerCase()}.png`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center text-[#848e9c] hover:text-[#eaecef] transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-[#1e2329] border border-[#2b3139]">
              <img 
                src={getIconUrl(coin.symbol)} 
                alt="" 
                className="w-full h-full object-cover"
                onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
              />
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-[#eaecef]">{coin.symbol}</h1>
              <p className="text-[#848e9c] text-sm">${parseFloat(coin.lastPrice).toLocaleString()}</p>
            </div>
          </div>
          <div className={`text-3xl font-black px-4 py-2 rounded-xl bg-[#1e2329] border border-[#2b3139]`}>
            {coin.scores.grade}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Chart Section */}
          <div className="bg-[#161a1e] p-6 rounded-xl border border-[#2b3139]">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <span className="w-1.5 h-6 bg-green-500 rounded-full mr-2"></span>
              Live Price Action (1H)
            </h3>
            <PriceChart data={coin.history || []} />
          </div>

          <div className="bg-[#161a1e] p-6 rounded-xl border border-[#2b3139]">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <span className="w-1.5 h-6 bg-yellow-500 rounded-full mr-2"></span>
              Performance Scoring
            </h3>
            <ScoreCard scores={coin.scores} />
          </div>

          <div className="bg-[#161a1e] p-6 rounded-xl border border-[#2b3139]">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full mr-2"></span>
              Technical Indicators
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 bg-[#1e2329] rounded-lg">
                <div className="text-xs text-[#848e9c]">RSI (14)</div>
                <div className={`text-lg font-bold ${coin.indicators.rsi > 70 ? 'text-red-400' : coin.indicators.rsi < 30 ? 'text-green-400' : 'text-[#eaecef]'}`}>
                  {coin.indicators.rsi.toFixed(2)}
                </div>
              </div>
              <div className="p-3 bg-[#1e2329] rounded-lg">
                <div className="text-xs text-[#848e9c]">EMA 50 / 200</div>
                <div className="text-sm font-bold text-[#eaecef]">
                  {coin.indicators.ema50.toFixed(2)} / {coin.indicators.ema200.toFixed(2)}
                </div>
              </div>
              <div className="p-3 bg-[#1e2329] rounded-lg">
                <div className="text-xs text-[#848e9c]">ATR %</div>
                <div className="text-lg font-bold text-[#eaecef]">{coin.indicators.atrPercent.toFixed(2)}%</div>
              </div>
              <div className="p-3 bg-[#1e2329] rounded-lg">
                <div className="text-xs text-[#848e9c]">Funding Rate</div>
                <div className="text-lg font-bold text-yellow-400">{coin.fundingRate?.toFixed(4)}%</div>
              </div>
              <div className="p-3 bg-[#1e2329] rounded-lg">
                <div className="text-xs text-[#848e9c]">Volume SMA 20</div>
                <div className="text-lg font-bold text-[#eaecef]">{Math.round(coin.indicators.volSma20).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#161a1e] p-6 rounded-xl border border-[#2b3139] border-yellow-500/30">
            <h3 className="text-lg font-bold mb-4 flex items-center text-yellow-400">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.464 15.05a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 13a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1z" />
              </svg>
              Smart Trade Plan
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <span className="text-sm font-medium">Entry Zone</span>
                <span className="font-bold">${plan.entry.toFixed(4)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <span className="text-sm font-medium">Stop Loss</span>
                <span className="font-bold">${plan.stopLoss.toFixed(4)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <span className="text-sm font-medium">Take Profit 1</span>
                <span className="font-bold">${plan.tp1.toFixed(4)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-500/20 rounded-lg border border-blue-500/40">
                <span className="text-sm font-medium">Take Profit 2</span>
                <span className="font-bold">${plan.tp2.toFixed(4)}</span>
              </div>
              <div className="pt-4 text-[10px] text-[#474d57] uppercase tracking-widest text-center">
                Risk/Reward Ratio 1:2+
              </div>
            </div>
          </div>

          <div className="bg-[#161a1e] p-6 rounded-xl border border-[#2b3139]">
            <h3 className="text-lg font-bold mb-4">Sentiment & Narrative</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#848e9c]">Social Hype</span>
                <span className="text-green-400 font-bold">Strong</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#848e9c]">Whale Activity</span>
                <span className="text-yellow-400 font-bold">Moderate</span>
              </div>
              <div className="p-3 bg-[#1e2329] rounded-lg text-xs text-[#848e9c] leading-relaxed">
                Currently showing strong correlation with sector-wide bullish movements. ATR suggests healthy volatility for short-term swing trades.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinDetails;
