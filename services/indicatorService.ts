
import { KlineData, Indicators } from '../types';

export const calculateEMA = (data: number[], period: number): number[] => {
  const k = 2 / (period + 1);
  const ema = [data[0]];
  for (let i = 1; i < data.length; i++) {
    ema.push(data[i] * k + ema[i - 1] * (1 - k));
  }
  return ema;
};

export const calculateRSI = (data: number[], period: number = 14): number => {
  if (data.length < period + 1) return 50;
  let gains = 0;
  let losses = 0;

  for (let i = data.length - period; i < data.length; i++) {
    const diff = data[i] - data[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
};

export const calculateATR = (klines: KlineData[], period: number = 14): number => {
  if (klines.length < period + 1) return 0;
  let trSum = 0;
  for (let i = klines.length - period; i < klines.length; i++) {
    const high = klines[i].high;
    const low = klines[i].low;
    const prevClose = klines[i - 1].close;
    const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
    trSum += tr;
  }
  return trSum / period;
};

export const computeIndicators = (klines: KlineData[]): Indicators => {
  const closes = klines.map(k => k.close);
  const volumes = klines.map(k => k.volume);
  const lastPrice = closes[closes.length - 1];

  const ema50Arr = calculateEMA(closes, 50);
  const ema200Arr = calculateEMA(closes, 200);
  
  const ema50 = ema50Arr[ema50Arr.length - 1];
  const ema200 = ema200Arr[ema200Arr.length - 1];
  const rsi = calculateRSI(closes, 14);
  const atr = calculateATR(klines, 14);
  const atrPercent = (atr / lastPrice) * 100;

  // Simple Moving Average for Volume
  const volSma20 = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;

  // Bollinger Bands
  const last20Closes = closes.slice(-20);
  const sma20 = last20Closes.reduce((a, b) => a + b, 0) / 20;
  const stdDev = Math.sqrt(last20Closes.map(x => Math.pow(x - sma20, 2)).reduce((a, b) => a + b, 0) / 20);
  const bollingerUpper = sma20 + 2 * stdDev;
  const bollingerLower = sma20 - 2 * stdDev;

  // Breakout Logic (Simplistic)
  const last20High = Math.max(...klines.slice(-21, -1).map(k => k.high));
  let status: Indicators['breakoutStatus'] = 'Range';
  if (lastPrice > last20High) status = 'Breakout';
  else if (lastPrice < bollingerLower) status = 'Rejection';

  return {
    ema50,
    ema200,
    rsi,
    atr,
    atrPercent,
    volSma20,
    bollingerUpper,
    bollingerLower,
    breakoutStatus: status
  };
};
