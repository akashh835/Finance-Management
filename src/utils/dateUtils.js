// filepath: f:\finance\src\utils\dateUtils.js
import { format as dateFnsFormat, isValid } from 'date-fns';

/**
 * Safely format a date string or Date object
 * @param {string|Date} date - Date to format
 * @param {string} formatStr - Format string for date-fns
 * @param {string} fallback - Fallback string if date is invalid
 * @returns {string} Formatted date string or fallback
 */
export const formatDate = (date, formatStr = 'MMM d, yyyy', fallback = 'Invalid date') => {
  if (!date) return 'No date';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return isValid(dateObj) ? dateFnsFormat(dateObj, formatStr) : fallback;
  } catch (error) {
    console.error('Date formatting error:', error);
    return fallback;
  }
};

/**
 * Safely parse a date string to a Date object
 * @param {string} dateStr - Date string to parse
 * @returns {Date|null} Date object or null if invalid
 */
export const parseDate = (dateStr) => {
  if (!dateStr) return null;
  
  try {
    const date = new Date(dateStr);
    return isValid(date) ? date : null;
  } catch (error) {
    console.error('Date parsing error:', error);
    return null;
  }
};

/**
 * Get today's date formatted as YYYY-MM-DD for input fields
 * @returns {string} Today's date in YYYY-MM-DD format
 */
export const getTodayFormatted = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default {
  formatDate,
  parseDate,
  getTodayFormatted
};
