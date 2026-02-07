
import { CoinData, ScoreDetails } from '../types';

export const calculateScores = (
  coin: Partial<CoinData>, 
  volumeRank: number, 
  btcChange: number
): ScoreDetails => {
  const { indicators, lastPrice, priceChangePercent, quoteVolume, fundingRate, openInterest } = coin;
  const price = parseFloat(lastPrice || '0');
  const change = parseFloat(priceChangePercent || '0');
  const vol = parseFloat(quoteVolume || '0');

  // 1. Liquidity (0-20)
  let liquidity = 0;
  if (volumeRank <= 20) liquidity = 20;
  else if (volumeRank <= 50) liquidity = 15;
  else if (volumeRank <= 100) liquidity = 10;
  else if (volumeRank <= 200) liquidity = 5;

  // 2. Trend (0-20)
  let trend = 0;
  if (indicators) {
    if (price > indicators.ema200 && indicators.ema50 > indicators.ema200) trend = 20;
    else if (price > indicators.ema200) trend = 15;
    else if (Math.abs(price - indicators.ema200) / indicators.ema200 < 0.02) trend = 10;
    else if (price < indicators.ema200 && indicators.ema50 < indicators.ema200) trend = 0;
    else trend = 5;
  }

  // 3. Volatility (0-15)
  let volatility = 0;
  if (indicators) {
    const range = indicators.atrPercent;
    if (range >= 3 && range <= 12) volatility = 15;
    else if (range >= 1.5 && range < 3) volatility = 10;
    else if (range < 1.5) volatility = 5;
    else volatility = 0; // Too volatile (e.g. > 12%) is risky
  }

  // 4. Breakout (0-15)
  let breakout = 0;
  if (indicators) {
    if (indicators.breakoutStatus === 'Breakout') breakout = 15;
    else if (indicators.breakoutStatus === 'Retest') breakout = 10;
    else if (indicators.breakoutStatus === 'Range') breakout = 5;
    else breakout = 0;
  }

  // 5. Volume Spike (0-10)
  let volumeSpike = 0;
  if (indicators) {
    // Note: This needs more granular data, for now we compare 24h volume to a static estimate or 1h avg
    // We'll use a mocked comparison factor for the sake of the engine
    const currentVol = vol / 24; // Avg hourly
    if (currentVol >= indicators.volSma20 * 2) volumeSpike = 10;
    else if (currentVol >= indicators.volSma20 * 1.5) volumeSpike = 7;
    else if (currentVol >= indicators.volSma20 * 1.1) volumeSpike = 4;
  }

  // 6. Futures Score (0-10)
  let futures = 4; // Flat default
  if (fundingRate !== undefined) {
    if (fundingRate <= 0.01) futures = 10;
    else if (fundingRate <= 0.05) futures = 7;
    else futures = 0;
  }

  // 7. BTC Strength (0-5)
  let btcStrength = 0;
  if (change > btcChange) btcStrength = 5;
  else if (Math.abs(change - btcChange) < 0.5) btcStrength = 3;

  // 8. Narrative (0-5) - Mocked for this demo
  const narrative = 3;

  const total = liquidity + trend + volatility + breakout + volumeSpike + futures + btcStrength + narrative;

  let grade = 'F';
  if (total >= 90) grade = 'A+';
  else if (total >= 80) grade = 'A';
  else if (total >= 70) grade = 'B';
  else if (total >= 60) grade = 'C';
  else if (total >= 40) grade = 'D';

  return {
    liquidity, trend, volatility, breakout, volumeSpike, futures, btcStrength, narrative,
    total, grade
  };
};
