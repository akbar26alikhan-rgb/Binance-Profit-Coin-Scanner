
import React from 'react';
import { CoinData, FilterState } from '../types';

interface DashboardProps {
  coins: CoinData[];
  filters: FilterState;
  onSelectCoin: (coin: CoinData) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ coins, filters, onSelectCoin }) => {
  const filteredCoins = coins.filter(coin => {
    if (coin.scores.total < filters.minScore) return false;
    if (filters.grades.length > 0 && !filters.grades.includes(coin.scores.grade)) return false;
    if (parseFloat(coin.quoteVolume) < filters.minVolume) return false;
    if (filters.bullishOnly && coin.indicators.ema50 < coin.indicators.ema200) return false;
    return true;
  });

  const getGradeColor = (grade: string) => {
    switch(grade) {
      case 'A+': return 'text-green-400 bg-green-400/10';
      case 'A': return 'text-green-500 bg-green-500/10';
      case 'B': return 'text-blue-400 bg-blue-400/10';
      case 'C': return 'text-yellow-400 bg-yellow-400/10';
      case 'D': return 'text-orange-400 bg-orange-400/10';
      default: return 'text-red-400 bg-red-400/10';
    }
  };

  const getIconUrl = (symbol: string) => {
    const baseAsset = symbol.replace('USDT', '');
    // Using Binance official CDN for asset logos
    return `https://static.binance.com/assets/asset/symbol/${baseAsset.toLowerCase()}.png`;
  };

  const handleIconError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Hide the broken image and allow the text to be the primary identifier
    (e.target as HTMLImageElement).style.display = 'none';
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-[#2b3139] bg-[#161a1e]">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[#1e2329] text-[#848e9c] text-xs font-medium uppercase tracking-wider">
          <tr>
            <th className="px-6 py-4">Coin</th>
            <th className="px-6 py-4">Price / 24h%</th>
            <th className="px-6 py-4">Volume (24h)</th>
            <th className="px-6 py-4">Trend Status</th>
            <th className="px-6 py-4">Breakout</th>
            <th className="px-6 py-4">Score</th>
            <th className="px-6 py-4">Grade</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#2b3139]">
          {filteredCoins.map((coin) => (
            <tr 
              key={coin.symbol} 
              onClick={() => onSelectCoin(coin)}
              className="hover:bg-[#1e2329] cursor-pointer transition-colors group"
            >
              <td className="px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#1e2329] flex items-center justify-center overflow-hidden border border-[#2b3139] flex-shrink-0">
                    <img 
                      src={getIconUrl(coin.symbol)} 
                      alt=""
                      className="w-full h-full object-cover"
                      onError={handleIconError}
                    />
                    <span className="text-[10px] font-bold text-[#474d57] absolute pointer-events-none group-hover:text-[#848e9c]">
                      {coin.symbol.slice(0, 1)}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-[#eaecef] group-hover:text-yellow-400 transition-colors">
                      {coin.symbol.replace('USDT', '')}
                    </div>
                    <div className="text-[10px] text-[#474d57]">USDT Pair</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-[#eaecef] font-medium">${parseFloat(coin.lastPrice).toLocaleString()}</div>
                <div className={`text-xs ${parseFloat(coin.priceChangePercent) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {parseFloat(coin.priceChangePercent) >= 0 ? '+' : ''}{coin.priceChangePercent}%
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-[#eaecef]">${(parseFloat(coin.quoteVolume) / 1000000).toFixed(2)}M</div>
              </td>
              <td className="px-6 py-4">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${coin.indicators.ema50 > coin.indicators.ema200 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {coin.indicators.ema50 > coin.indicators.ema200 ? 'BULLISH' : 'BEARISH'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className={`text-xs font-semibold ${coin.indicators.breakoutStatus === 'Breakout' ? 'text-yellow-400' : 'text-[#848e9c]'}`}>
                  {coin.indicators.breakoutStatus}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-lg font-bold text-[#eaecef]">{coin.scores.total}</div>
              </td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-md text-xs font-bold ${getGradeColor(coin.scores.grade)}`}>
                  {coin.scores.grade}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredCoins.length === 0 && (
        <div className="p-20 text-center text-[#848e9c]">
          No coins matching your active filters.
        </div>
      )}
    </div>
  );
};

export default Dashboard;
