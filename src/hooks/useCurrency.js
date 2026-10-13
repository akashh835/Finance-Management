// filepath: f:\finance\src\hooks\useCurrency.js
import { useContext } from 'react';
import { FinanceContext } from '../context/FinanceContextSimple';

/**
 * Custom hook for currency conversion and formatting
 * @returns {Object} Currency functions and state
 */
export const useCurrency = () => {
  const {
    preferredCurrency,
    supportedCurrencies,
    convertCurrency,
    formatCurrency,
    updatePreferredCurrency
  } = useContext(FinanceContext);

  /**
   * Format an amount in the preferred currency
   * @param {number} amount - Amount to format
   * @param {string} fromCurrency - Source currency code (defaults to USD)
   * @returns {string} Formatted amount
   */
  const formatAmount = (amount, fromCurrency = 'USD') => {
    // Handle null, undefined, or NaN amounts
    if (amount === null || amount === undefined || isNaN(amount)) {
      return formatCurrency(0, preferredCurrency);
    }

    // If the currencies are the same, no need to convert
    if (fromCurrency === preferredCurrency) {
      return formatCurrency(amount, preferredCurrency);
    }

    // Use a synchronous approach for formatting
    // This is a workaround since we can't use async/await in render functions
    try {
      // For now, use the mock conversion rates directly
      const mockRates = {
        USD: { EUR: 0.85, GBP: 0.75, JPY: 110.0, CAD: 1.25, AUD: 1.35, INR: 83.0, USD: 1.0 },
        EUR: { USD: 1.18, GBP: 0.88, JPY: 129.5, CAD: 1.47, AUD: 1.59, INR: 97.5, EUR: 1.0 },
        GBP: { USD: 1.33, EUR: 1.14, JPY: 146.7, CAD: 1.67, AUD: 1.80, INR: 110.0, GBP: 1.0 },
        JPY: { USD: 0.0091, EUR: 0.0077, GBP: 0.0068, CAD: 0.0114, AUD: 0.0123, INR: 0.75, JPY: 1.0 },
        CAD: { USD: 0.80, EUR: 0.68, GBP: 0.60, JPY: 88.0, AUD: 1.08, INR: 66.5, CAD: 1.0 },
        AUD: { USD: 0.74, EUR: 0.63, GBP: 0.56, JPY: 81.5, CAD: 0.93, INR: 61.5, AUD: 1.0 },
        INR: { USD: 0.012, EUR: 0.0103, GBP: 0.0091, JPY: 1.33, CAD: 0.015, AUD: 0.0163, INR: 1.0 }
      };

      // Get the conversion rate
      const rate = mockRates[fromCurrency] && mockRates[fromCurrency][preferredCurrency]
        ? mockRates[fromCurrency][preferredCurrency]
        : 1;

      // Convert the amount
      const convertedAmount = amount * rate;

      // Format the converted amount
      return formatCurrency(convertedAmount, preferredCurrency);
    } catch (err) {
      console.error('Currency conversion failed:', err);
      return formatCurrency(amount, preferredCurrency); // Fallback to original amount
    }
  };

  /**
   * Convert an amount to the preferred currency
   * @param {number} amount - Amount to convert
   * @param {string} fromCurrency - Source currency code
   * @returns {Promise<number>} Converted amount
   */
  const convertAmount = async (amount, fromCurrency) => {
    return await convertCurrency(amount, fromCurrency, preferredCurrency);
  };

  /**
   * Get the symbol for a currency
   * @param {string} currencyCode - Currency code
   * @returns {string} Currency symbol
   */
  const getCurrencySymbol = (currencyCode = preferredCurrency) => {
    const currency = supportedCurrencies && supportedCurrencies.length > 0
      ? supportedCurrencies.find(c => c.code === currencyCode)
      : null;
    return currency ? currency.symbol : '$';
  };

  return {
    preferredCurrency,
    supportedCurrencies,
    formatAmount,
    convertAmount,
    updatePreferredCurrency,
    getCurrencySymbol
  };
};

export default useCurrency;
