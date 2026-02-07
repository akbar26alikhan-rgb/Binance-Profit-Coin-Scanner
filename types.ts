
export interface BinanceTicker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  quoteVolume: string;
  highPrice: string;
  lowPrice: string;
}

export interface KlineData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Indicators {
  ema50: number;
  ema200: number;
  rsi: number;
  atr: number;
  atrPercent: number;
  volSma20: number;
  bollingerUpper: number;
  bollingerLower: number;
  breakoutStatus: 'Breakout' | 'Retest' | 'Range' | 'Rejection';
}

export interface ScoreDetails {
  liquidity: number;
  trend: number;
  volatility: number;
  breakout: number;
  volumeSpike: number;
  futures: number;
  btcStrength: number;
  narrative: number;
  total: number;
  grade: string;
}

export interface CoinData extends BinanceTicker {
  indicators: Indicators;
  scores: ScoreDetails;
  fundingRate?: number;
  openInterest?: number;
}

export enum View {
  Dashboard = 'dashboard',
  Details = 'details',
  Backtest = 'backtest'
}

export interface FilterState {
  minScore: number;
  grades: string[];
  minVolume: number;
  bullishOnly: boolean;
}
