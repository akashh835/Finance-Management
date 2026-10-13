// filepath: f:\finance\src\services\currencyService.js
import api from './api';

// Cache for exchange rates to avoid unnecessary API calls
const exchangeRateCache = {
  rates: {},
  timestamp: null,
  // Cache expires after 24 hours
  expirationTime: 24 * 60 * 60 * 1000
};

/**
 * Get exchange rates for a base currency
 * @param {string} baseCurrency - Base currency code (e.g., 'USD')
 * @returns {Promise<Object>} Exchange rates
 */
export const getExchangeRates = async (baseCurrency = 'USD') => {
  try {
    // Check if we have cached rates that are still valid
    const now = Date.now();
    if (
      exchangeRateCache.rates[baseCurrency] &&
      exchangeRateCache.timestamp &&
      now - exchangeRateCache.timestamp < exchangeRateCache.expirationTime
    ) {
      return exchangeRateCache.rates[baseCurrency];
    }

    // If not in cache or expired, fetch from API
    const response = await api.get('/currency/rates', { base: baseCurrency });

    // Update cache
    exchangeRateCache.rates[baseCurrency] = response.data.data;
    exchangeRateCache.timestamp = now;

    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);

    // Return mock exchange rates if API call fails
    return getMockExchangeRates(baseCurrency);
  }
};

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {Promise<number>} Converted amount
 */
export const convertCurrency = async (amount, fromCurrency = 'USD', toCurrency = 'USD') => {
  // If currencies are the same, no conversion needed
  if (fromCurrency === toCurrency) {
    return amount;
  }

  try {
    // Get exchange rates with the fromCurrency as base
    const rates = await getExchangeRates(fromCurrency);

    // Convert the amount
    if (rates && rates[toCurrency]) {
      return amount * rates[toCurrency];
    } else {
      throw new Error(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
    }
  } catch (error) {
    console.error('Currency conversion failed:', error);

    // Use mock conversion as fallback
    return convertWithMockRates(amount, fromCurrency, toCurrency);
  }
};

/**
 * Format amount in specified currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted amount
 */
export const formatCurrency = (amount, currency = 'USD') => {
  // Handle null, undefined, or NaN amounts
  if (amount === null || amount === undefined || isNaN(amount)) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(0);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Get mock exchange rates for testing/fallback
 * @param {string} baseCurrency - Base currency code
 * @returns {Object} Mock exchange rates
 */
const getMockExchangeRates = (baseCurrency = 'USD') => {
  const mockRates = {
    USD: {
      EUR: 0.85,
      GBP: 0.75,
      JPY: 110.0,
      CAD: 1.25,
      AUD: 1.35,
      INR: 83.0,
      USD: 1.0
    },
    EUR: {
      USD: 1.18,
      GBP: 0.88,
      JPY: 129.5,
      CAD: 1.47,
      AUD: 1.59,
      INR: 97.5,
      EUR: 1.0
    },
    GBP: {
      USD: 1.33,
      EUR: 1.14,
      JPY: 146.7,
      CAD: 1.67,
      AUD: 1.80,
      INR: 110.0,
      GBP: 1.0
    },
    JPY: {
      USD: 0.0091,
      EUR: 0.0077,
      GBP: 0.0068,
      CAD: 0.0114,
      AUD: 0.0123,
      INR: 0.75,
      JPY: 1.0
    },
    CAD: {
      USD: 0.80,
      EUR: 0.68,
      GBP: 0.60,
      JPY: 88.0,
      AUD: 1.08,
      INR: 66.5,
      CAD: 1.0
    },
    AUD: {
      USD: 0.74,
      EUR: 0.63,
      GBP: 0.56,
      JPY: 81.5,
      CAD: 0.93,
      INR: 61.5,
      AUD: 1.0
    },
    INR: {
      USD: 0.012,
      EUR: 0.0103,
      GBP: 0.0091,
      JPY: 1.33,
      CAD: 0.015,
      AUD: 0.0163,
      INR: 1.0
    }
  };

  return mockRates[baseCurrency] || mockRates.USD;
};

/**
 * Convert amount using mock rates
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {number} Converted amount
 */
const convertWithMockRates = (amount, fromCurrency = 'USD', toCurrency = 'USD') => {
  // If currencies are the same, no conversion needed
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const mockRates = getMockExchangeRates(fromCurrency);

  if (mockRates && mockRates[toCurrency]) {
    return amount * mockRates[toCurrency];
  } else {
    // Default fallback - just return the original amount
    console.warn(`No mock rate found for ${fromCurrency} to ${toCurrency}, using 1:1 conversion`);
    return amount;
  }
};

export default {
  getExchangeRates,
  convertCurrency,
  formatCurrency
};
