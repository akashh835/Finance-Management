// filepath: f:\finance\src\services\budgetService.js
import api from './api';

/**
 * Get all budgets
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>} List of budgets
 */
export const getBudgets = async (params = {}) => {
  try {
    const response = await api.get('/budgets', { params });
    return response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch budgets');
  }
};

/**
 * Get a budget by ID
 * @param {string} id - Budget ID
 * @returns {Promise<Object>} Budget data
 */
export const getBudgetById = async (id) => {
  try {
    const response = await api.get(`/budgets/${id}`);
    return response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch budget');
  }
};

/**
 * Create a new budget
 * @param {Object} budgetData - Budget data
 * @returns {Promise<Object>} Created budget
 */
export const createBudget = async (budgetData) => {
  try {
    const response = await api.post('/budgets', budgetData);
    return response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to create budget');
  }
};

/**
 * Update a budget
 * @param {string} id - Budget ID
 * @param {Object} budgetData - Budget data to update
 * @returns {Promise<Object>} Updated budget
 */
export const updateBudget = async (id, budgetData) => {
  try {
    const response = await api.put(`/budgets/${id}`, budgetData);
    return response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to update budget');
  }
};

/**
 * Delete a budget
 * @param {string} id - Budget ID
 * @returns {Promise<Object>} Success message
 */
export const deleteBudget = async (id) => {
  try {
    const response = await api.delete(`/budgets/${id}`);
    return response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to delete budget');
  }
};

/**
 * Get expenses for a budget
 * @param {string} id - Budget ID
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>} List of expenses
 */
export const getBudgetExpenses = async (id, params = {}) => {
  try {
    const response = await api.get(`/budgets/${id}/expenses`, { params });
    return response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch budget expenses');
  }
};