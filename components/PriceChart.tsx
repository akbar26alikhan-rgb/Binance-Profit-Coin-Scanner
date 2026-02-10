
import React from 'react';
import { KlineData } from '../types';

interface PriceChartProps {
  data: KlineData[];
}

const PriceChart: React.FC<PriceChartProps> = ({ data }) => {
  if (!data || data.length === 0) return <div className="h-64 flex items-center justify-center text-[#474d57]">No Chart Data Available</div>;

  const width = 800;
  const height = 300;
  const padding = 40;
  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;

  const prices = data.flatMap(d => [d.high, d.low]);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;

  const getY = (price: number) => 
    height - padding - ((price - minPrice) / priceRange) * chartHeight;

  const getX = (index: number) => 
    padding + (index / (data.length - 1)) * chartWidth;

  const candleWidth = Math.max(2, (chartWidth / data.length) * 0.7);

  return (
    <div className="w-full overflow-hidden bg-[#0b0e11] rounded-lg border border-[#2b3139] p-2">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
        {/* Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
          const price = minPrice + p * priceRange;
          const y = getY(price);
          return (
            <React.Fragment key={i}>
              <line 
                x1={padding} y1={y} x2={width - padding} y2={y} 
                stroke="#1e2329" strokeWidth="1" 
              />
              <text 
                x={width - padding + 5} y={y + 4} 
                fill="#474d57" fontSize="10"
              >
                {price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </text>
            </React.Fragment>
          );
        })}

        {/* Candles */}
        {data.map((d, i) => {
          const x = getX(i);
          const openY = getY(d.open);
          const closeY = getY(d.close);
          const highY = getY(d.high);
          const lowY = getY(d.low);
          const isBullish = d.close >= d.open;
          const color = isBullish ? '#0ecb81' : '#f6465d';

          return (
            <g key={i}>
              {/* Wick */}
              <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth="1" />
              {/* Body */}
              <rect 
                x={x - candleWidth / 2} 
                y={Math.min(openY, closeY)} 
                width={candleWidth} 
                height={Math.max(1, Math.abs(openY - closeY))} 
                fill={color} 
              />
            </g>
          );
        })}

        {/* Volume Sub-chart */}
        {(() => {
          const maxVol = Math.max(...data.map(d => d.volume));
          return data.map((d, i) => {
            const x = getX(i);
            const volHeight = (d.volume / maxVol) * 40;
            const isBullish = d.close >= d.open;
            return (
              <rect 
                key={`v-${i}`}
                x={x - candleWidth / 2}
                y={height - padding - volHeight}
                width={candleWidth}
                height={volHeight}
                fill={isBullish ? '#0ecb8133' : '#f6465d33'}
              />
            );
          });
        })()}
      </svg>
    </div>
  );
};

export default PriceChart;
