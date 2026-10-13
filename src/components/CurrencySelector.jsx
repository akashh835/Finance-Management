// filepath: f:\finance\src\components\CurrencySelector.jsx
import { useState } from 'react';
import { useCurrency } from '../hooks/useCurrency';

/**
 * Currency selector component
 * @returns {JSX.Element} Currency selector component
 */
const CurrencySelector = () => {
  const {
    preferredCurrency,
    supportedCurrencies,
    updatePreferredCurrency
  } = useCurrency();

  const [isOpen, setIsOpen] = useState(false);

  const handleCurrencyChange = async (currency) => {
    await updatePreferredCurrency(currency);
    setIsOpen(false);
  };

  // Get current currency symbol
  const currentCurrency = supportedCurrencies && supportedCurrencies.length > 0
    ? supportedCurrencies.find(c => c.code === preferredCurrency)
    : null;
  const currentSymbol = currentCurrency ? currentCurrency.symbol : '$';

  return (
    <div className="relative">
      <button
        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{currentSymbol} {preferredCurrency}</span>
        <svg
          className={`ml-2 h-5 w-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {supportedCurrencies && supportedCurrencies.length > 0 ? supportedCurrencies.map((currency) => (
            <button
              key={currency.code}
              className={`block w-full text-left px-4 py-2 text-sm ${
                currency.code === preferredCurrency
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => handleCurrencyChange(currency.code)}
            >
              {currency.symbol} {currency.code} - {currency.name}
            </button>
          )) : (
            <button className="block w-full text-left px-4 py-2 text-sm text-gray-700">
              Loading currencies...
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
