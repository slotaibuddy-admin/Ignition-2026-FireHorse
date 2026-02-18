import { useState, useEffect, useCallback } from 'react';
import { fetchMaticUsdRate, formatMatic } from '../utils/priceUtils';

const PRICE_IN_USD = parseFloat(import.meta.env.VITE_PRICE_USD) || 5.0;
const REFRESH_INTERVAL_MS = 60_000;

/**
 * Live MATIC price hook (USD anchor).
 * Auto-refreshes every 60 seconds to create soft urgency.
 *
 * Returns:
 *   maticAmount  - how much MATIC equals PRICE_IN_USD
 *   usdAmount    - the fixed USD price (5.00)
 *   rate         - current MATIC/USD rate
 *   maticDisplay - formatted string for UI
 *   isLoading    - true while first fetch is in progress
 *   lastUpdated  - Date of last successful refresh
 *   refresh      - call to force an immediate refresh
 */
export function useMaticPrice() {
  const [rate, setRate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const newRate = await fetchMaticUsdRate();
      setRate(newRate);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Price refresh error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch + interval
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  const maticAmount = rate ? PRICE_IN_USD / rate : null;

  return {
    maticAmount,
    usdAmount: PRICE_IN_USD,
    rate,
    maticDisplay: maticAmount ? formatMatic(maticAmount) : '…',
    isLoading,
    lastUpdated,
    refresh,
  };
}
