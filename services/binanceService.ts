
import { BinanceTicker, KlineData, CoinData } from '../types';
import { computeIndicators } from './indicatorService';
import { calculateScores } from './scoringEngine';

const API_BASE = 'https://api.binance.com/api/v3';
const FAPI_BASE = 'https://fapi.binance.com/fapi/v1';

export const fetchTickers = async (): Promise<BinanceTicker[]> => {
  const res = await fetch(`${API_BASE}/ticker/24hr`);
  const data = await res.json();
  return data.filter((t: any) => t.symbol.endsWith('USDT') && !t.symbol.includes('UP') && !t.symbol.includes('DOWN'));
};

export const fetchKlines = async (symbol: string, interval: string = '1h', limit: number = 250): Promise<KlineData[]> => {
  const res = await fetch(`${API_BASE}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
  const data = await res.json();
  return data.map((d: any) => ({
    time: d[0],
    open: parseFloat(d[1]),
    high: parseFloat(d[2]),
    low: parseFloat(d[3]),
    close: parseFloat(d[4]),
    volume: parseFloat(d[5]),
  }));
};

export const fetchFuturesData = async (symbol: string) => {
  try {
    const fundingRes = await fetch(`${FAPI_BASE}/premiumIndex?symbol=${symbol}`);
    const fundingData = await fundingRes.json();
    return {
      fundingRate: parseFloat(fundingData.lastFundingRate || '0'),
    };
  } catch {
    return { fundingRate: 0.01 };
  }
};

export const processAllCoins = async (
  onProgress?: (count: number, total: number) => void
): Promise<CoinData[]> => {
  const tickers = await fetchTickers();
  // Sort by volume to rank liquidity
  const sortedByVol = [...tickers].sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume));
  
  // Find BTC change for relative strength
  const btcTicker = tickers.find(t => t.symbol === 'BTCUSDT');
  const btcChange = btcTicker ? parseFloat(btcTicker.priceChangePercent) : 0;

  // We process top 50 to avoid rate limits in a single-page demo environment
  const targetCoins = sortedByVol.slice(0, 50);
  const results: CoinData[] = [];

  for (let i = 0; i < targetCoins.length; i++) {
    const ticker = targetCoins[i];
    try {
      // Small delay to respect rate limits if needed, but Binance is generous for these
      const [klines, futures] = await Promise.all([
        fetchKlines(ticker.symbol),
        fetchFuturesData(ticker.symbol)
      ]);

      const indicators = computeIndicators(klines);
      const scores = calculateScores(
        { ...ticker, indicators, ...futures }, 
        i + 1, 
        btcChange
      );

      results.push({
        ...ticker,
        indicators,
        scores,
        ...futures,
        history: klines // Store history for charting
      });
      
      onProgress?.(i + 1, targetCoins.length);
    } catch (err) {
      console.error(`Error processing ${ticker.symbol}:`, err);
    }
  }

  return results.sort((a, b) => b.scores.total - a.scores.total);
};
