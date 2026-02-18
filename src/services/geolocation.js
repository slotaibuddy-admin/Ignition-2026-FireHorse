/**
 * Geolocation service - detects user country and fetches regional settings
 */

const COUNTRY_CURRENCY_MAP = {
  // Europe
  'DE': { code: 'EUR', symbol: '€', region: 'EU' },
  'FR': { code: 'EUR', symbol: '€', region: 'EU' },
  'IT': { code: 'EUR', symbol: '€', region: 'EU' },
  'ES': { code: 'EUR', symbol: '€', region: 'EU' },
  'GB': { code: 'GBP', symbol: '£', region: 'EU' },
  'AT': { code: 'EUR', symbol: '€', region: 'EU' },
  'CH': { code: 'CHF', symbol: 'CHF', region: 'EU' },
  'SE': { code: 'SEK', symbol: 'kr', region: 'EU' },
  'NO': { code: 'NOK', symbol: 'kr', region: 'EU' },
  'NL': { code: 'EUR', symbol: '€', region: 'EU' },
  'BE': { code: 'EUR', symbol: '€', region: 'EU' },
  'PL': { code: 'PLN', symbol: 'zł', region: 'EU' },
  'CZ': { code: 'CZK', symbol: 'Kč', region: 'EU' },

  // Americas
  'US': { code: 'USD', symbol: '$', region: 'US' },
  'CA': { code: 'CAD', symbol: '$', region: 'US' },
  'MX': { code: 'MXN', symbol: '$', region: 'US' },
  'BR': { code: 'BRL', symbol: 'R$', region: 'US' },
  'AR': { code: 'ARS', symbol: '$', region: 'US' },
  'CL': { code: 'CLP', symbol: '$', region: 'US' },

  // Asia-Pacific
  'JP': { code: 'JPY', symbol: '¥', region: 'APAC' },
  'CN': { code: 'CNY', symbol: '¥', region: 'APAC' },
  'AU': { code: 'AUD', symbol: '$', region: 'APAC' },
  'NZ': { code: 'NZD', symbol: '$', region: 'APAC' },
  'SG': { code: 'SGD', symbol: '$', region: 'APAC' },
  'HK': { code: 'HKD', symbol: '$', region: 'APAC' },
  'IN': { code: 'INR', symbol: '₹', region: 'APAC' },
  'TH': { code: 'THB', symbol: '฿', region: 'APAC' },

  // Middle East & Africa
  'AE': { code: 'AED', symbol: 'د.إ', region: 'MENA' },
  'SA': { code: 'SAR', symbol: '﷼', region: 'MENA' },
  'IL': { code: 'ILS', symbol: '₪', region: 'MENA' },
  'ZA': { code: 'ZAR', symbol: 'R', region: 'MENA' },
};

const PAYMENT_METHODS_BY_REGION = {
  EU: ['stripe', 'paypal', 'crypto'],
  US: ['stripe', 'paypal', 'crypto'],
  APAC: ['stripe', 'crypto'],
  MENA: ['stripe', 'crypto'],
};

const CRYPTO_NETWORKS_BY_REGION = {
  EU: ['polygon', 'ethereum'],
  US: ['polygon', 'ethereum'],
  APAC: ['polygon'],
  MENA: ['polygon'],
};

/**
 * Get user's country from IP geolocation
 */
export async function detectCountry() {
  try {
    // Try to use GeoIP API (free tier)
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error('Failed to fetch geolocation');
    
    const data = await response.json();
    const countryCode = data.country_code;
    
    return countryCode && COUNTRY_CURRENCY_MAP[countryCode]
      ? countryCode
      : 'US'; // Default fallback
  } catch (error) {
    console.warn('Geolocation failed, defaulting to US:', error);
    return 'US';
  }
}

/**
 * Get regional settings for a country
 */
export function getRegionalSettings(countryCode) {
  const countryConfig = COUNTRY_CURRENCY_MAP[countryCode] || COUNTRY_CURRENCY_MAP['US'];
  const region = countryConfig.region;

  return {
    countryCode,
    ...countryConfig,
    paymentMethods: PAYMENT_METHODS_BY_REGION[region] || ['stripe', 'crypto'],
    cryptoNetworks: CRYPTO_NETWORKS_BY_REGION[region] || ['polygon'],
  };
}

/**
 * Format price for region
 */
export function formatPrice(amountUSD, regionalSettings) {
  // For now, use simple conversion (in production, use real exchange rates)
  const exchangeRates = {
    'EUR': 0.92,
    'GBP': 0.79,
    'JPY': 149.5,
    'AUD': 1.53,
    'CAD': 1.36,
    'CHF': 0.88,
    'CNY': 7.24,
    'INR': 83.12,
    // All others default to USD
  };

  const rate = exchangeRates[regionalSettings.code] || 1;
  const amount = (amountUSD * rate).toFixed(2);
  
  return {
    amount,
    currency: regionalSettings.code,
    symbol: regionalSettings.symbol,
    formatted: `${regionalSettings.symbol}${amount}`,
  };
}

/**
 * Persist regional choice to localStorage
 */
export function saveCountryPreference(countryCode) {
  localStorage.setItem('ignition_country', countryCode);
}

/**
 * Get saved country preference or detect new one
 */
export async function getUserCountry() {
  const saved = localStorage.getItem('ignition_country');
  if (saved) return saved;
  
  return detectCountry();
}
