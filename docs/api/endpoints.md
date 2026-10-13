# API Endpoints

This document provides a comprehensive list of all API endpoints available in the Smart Budget Tracker API.

## Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |
| POST | `/api/auth/logout` | Logout and invalidate token |
| POST | `/api/auth/refresh-token` | Refresh JWT token |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password/:token` | Reset password with token |
| POST | `/api/auth/2fa/generate` | Generate 2FA secret |
| POST | `/api/auth/2fa/verify` | Verify 2FA code |
| POST | `/api/auth/2fa/disable` | Disable 2FA |

## User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user profile |
| PUT | `/api/users/me` | Update current user profile |
| DELETE | `/api/users/me` | Delete current user account |
| PUT | `/api/users/me/password` | Update password |
| GET | `/api/users/me/preferences` | Get user preferences |
| PUT | `/api/users/me/preferences` | Update user preferences |

## Budget Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budgets` | Get all budgets |
| POST | `/api/budgets` | Create a new budget |
| GET | `/api/budgets/:id` | Get a specific budget |
| PUT | `/api/budgets/:id` | Update a budget |
| DELETE | `/api/budgets/:id` | Delete a budget |
| GET | `/api/budgets/:id/expenses` | Get expenses for a budget |

## Expense Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | Get all expenses |
| POST | `/api/expenses` | Create a new expense |
| GET | `/api/expenses/:id` | Get a specific expense |
| PUT | `/api/expenses/:id` | Update an expense |
| DELETE | `/api/expenses/:id` | Delete an expense |
| POST | `/api/expenses/bulk` | Create multiple expenses |
| GET | `/api/expenses/stats` | Get expense statistics |

## Category Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories |
| POST | `/api/categories` | Create a new category |
| GET | `/api/categories/:id` | Get a specific category |
| PUT | `/api/categories/:id` | Update a category |
| DELETE | `/api/categories/:id` | Delete a category |
| GET | `/api/categories/:id/expenses` | Get expenses for a category |

## Goal Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/goals` | Get all goals |
| POST | `/api/goals` | Create a new goal |
| GET | `/api/goals/:id` | Get a specific goal |
| PUT | `/api/goals/:id` | Update a goal |
| DELETE | `/api/goals/:id` | Delete a goal |
| PUT | `/api/goals/:id/progress` | Update goal progress |

## Report Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/income-vs-expenses` | Get income vs expenses report |
| GET | `/api/reports/spending-by-category` | Get spending by category report |
| GET | `/api/reports/monthly-spending` | Get monthly spending report |
| GET | `/api/reports/budget-performance` | Get budget performance report |
| GET | `/api/reports/savings-rate` | Get savings rate report |
| GET | `/api/reports/net-worth` | Get net worth report |

## Bank Integration Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bank/link` | Link a bank account |
| GET | `/api/bank/accounts` | Get linked bank accounts |
| DELETE | `/api/bank/accounts/:id` | Unlink a bank account |
| POST | `/api/bank/sync` | Sync transactions from bank |
| GET | `/api/bank/transactions` | Get bank transactions |
