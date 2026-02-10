
import React from 'react';
import { KlineData } from '../types';
import { calculateEMA, calculateRSISeries } from '../services/indicatorService';

interface PriceChartProps {
  data: KlineData[];
}

const PriceChart: React.FC<PriceChartProps> = ({ data }) => {
  if (!data || data.length === 0) return <div className="h-64 flex items-center justify-center text-[#474d57]">No Chart Data Available</div>;

  const width = 800;
  const height = 450;
  const paddingTop = 40;
  const paddingBottom = 40;
  
  // Panes Configuration
  const pricePaneHeight = 260;
  const rsiPaneHeight = 80;
  const spacer = 30;
  
  const chartWidth = width - 80; // Extra room for price labels
  const leftOffset = 40;

  const closes = data.map(d => d.close);
  const ema50 = calculateEMA(closes, 50);
  const ema200 = calculateEMA(closes, 200);
  const rsiSeries = calculateRSISeries(closes, 14);

  // Scaling Price
  const prices = data.flatMap(d => [d.high, d.low]);
  const allPricePoints = [...prices, ...ema50, ...ema200];
  const minPrice = Math.min(...allPricePoints);
  const maxPrice = Math.max(...allPricePoints);
  const priceRange = maxPrice - minPrice;

  const getPriceY = (price: number) => 
    paddingTop + pricePaneHeight - ((price - minPrice) / priceRange) * pricePaneHeight;

  const getRsiY = (rsi: number) => 
    paddingTop + pricePaneHeight + spacer + rsiPaneHeight - (rsi / 100) * rsiPaneHeight;

  const getX = (index: number) => 
    leftOffset + (index / (data.length - 1)) * chartWidth;

  const candleWidth = Math.max(2, (chartWidth / data.length) * 0.7);

  return (
    <div className="w-full overflow-hidden bg-[#0b0e11] rounded-lg border border-[#2b3139] p-2">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
        {/* --- Price Pane --- */}
        {/* Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
          const price = minPrice + p * priceRange;
          const y = getPriceY(price);
          return (
            <React.Fragment key={`price-grid-${i}`}>
              <line 
                x1={leftOffset} y1={y} x2={leftOffset + chartWidth} y2={y} 
                stroke="#1e2329" strokeWidth="1" 
              />
              <text 
                x={leftOffset + chartWidth + 5} y={y + 4} 
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
          const openY = getPriceY(d.open);
          const closeY = getPriceY(d.close);
          const highY = getPriceY(d.high);
          const lowY = getPriceY(d.low);
          const isBullish = d.close >= d.open;
          const color = isBullish ? '#0ecb81' : '#f6465d';

          return (
            <g key={`candle-${i}`}>
              <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth="1" />
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

        {/* EMA 200 (Long Term) */}
        <polyline
          points={ema200.map((p, i) => `${getX(i)},${getPriceY(p)}`).join(' ')}
          fill="none"
          stroke="#2b83f6"
          strokeWidth="1.5"
          opacity="0.8"
        />

        {/* EMA 50 (Short Term) */}
        <polyline
          points={ema50.map((p, i) => `${getX(i)},${getPriceY(p)}`).join(' ')}
          fill="none"
          stroke="#f3ba2f"
          strokeWidth="1.5"
          opacity="0.9"
        />

        {/* Volume Sub-chart (Overlayed at bottom of price pane) */}
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
                y={paddingTop + pricePaneHeight - volHeight}
                width={candleWidth}
                height={volHeight}
                fill={isBullish ? '#0ecb8133' : '#f6465d33'}
              />
            );
          });
        })()}

        {/* --- RSI Pane --- */}
        <rect 
          x={leftOffset} 
          y={paddingTop + pricePaneHeight + spacer} 
          width={chartWidth} 
          height={rsiPaneHeight} 
          fill="#161a1e33" 
        />
        
        {/* RSI 70/30 Levels */}
        {[30, 70].map(level => (
          <line 
            key={`rsi-level-${level}`}
            x1={leftOffset} y1={getRsiY(level)} 
            x2={leftOffset + chartWidth} y2={getRsiY(level)} 
            stroke="#2b3139" strokeWidth="1" strokeDasharray="4"
          />
        ))}

        {/* RSI Line */}
        <polyline
          points={rsiSeries.map((r, i) => `${getX(i)},${getRsiY(r)}`).join(' ')}
          fill="none"
          stroke="#9c27b0"
          strokeWidth="1.5"
        />
        
        <text 
          x={leftOffset + 5} 
          y={paddingTop + pricePaneHeight + spacer + 15} 
          fill="#9c27b0" fontSize="10" fontWeight="bold"
        >
          RSI (14)
        </text>

        <text x={leftOffset + chartWidth + 5} y={getRsiY(70) + 3} fill="#474d57" fontSize="8">70</text>
        <text x={leftOffset + chartWidth + 5} y={getRsiY(30) + 3} fill="#474d57" fontSize="8">30</text>

        {/* Legend */}
        <g transform={`translate(${leftOffset}, ${paddingTop - 20})`}>
          <rect width="8" height="8" fill="#f3ba2f" rx="2" />
          <text x="12" y="8" fill="#848e9c" fontSize="10">EMA 50</text>
          
          <rect x="60" width="8" height="8" fill="#2b83f6" rx="2" />
          <text x="72" y="8" fill="#848e9c" fontSize="10">EMA 200</text>
        </g>
      </svg>
    </div>
  );
};

export default PriceChart;
