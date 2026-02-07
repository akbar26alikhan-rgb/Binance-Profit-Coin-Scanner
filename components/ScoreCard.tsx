
import React from 'react';
import { ScoreDetails } from '../types';

interface ScoreCardProps {
  scores: ScoreDetails;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ scores }) => {
  const items = [
    { label: 'Liquidity', value: scores.liquidity, max: 20 },
    { label: 'Trend', value: scores.trend, max: 20 },
    { label: 'Volatility', value: scores.volatility, max: 15 },
    { label: 'Breakout', value: scores.breakout, max: 15 },
    { label: 'Volume Spike', value: scores.volumeSpike, max: 10 },
    { label: 'Futures', value: scores.futures, max: 10 },
    { label: 'BTC Strength', value: scores.btcStrength, max: 5 },
    { label: 'Narrative', value: scores.narrative, max: 5 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.label} className="bg-[#1e2329] p-3 rounded-lg border border-[#2b3139]">
          <div className="text-xs text-[#848e9c] mb-1">{item.label}</div>
          <div className="flex items-end justify-between">
            <span className="text-lg font-bold text-[#eaecef]">{item.value}</span>
            <span className="text-xs text-[#474d57]">/ {item.max}</span>
          </div>
          <div className="w-full bg-[#0b0e11] h-1.5 mt-2 rounded-full overflow-hidden">
            <div 
              className="bg-yellow-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(item.value / item.max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScoreCard;
