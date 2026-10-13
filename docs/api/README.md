# API Documentation

This section contains detailed documentation for the Smart Budget Tracker API.

## Overview

The Smart Budget Tracker API is a RESTful API that provides endpoints for managing budgets, expenses, categories, goals, and user accounts. The API is secured using JWT authentication.

## Base URL

```
https://api.smartbudgettracker.com/v1
```

For local development:

```
http://localhost:5000/api
```

## Authentication

All API requests (except for registration and login) require authentication. The API uses JWT (JSON Web Tokens) for authentication.

To authenticate, include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

See the [Authentication](./authentication.md) section for more details.

## API Endpoints

- [Authentication](./endpoints/auth.md)
- [Users](./endpoints/users.md)
- [Budgets](./endpoints/budgets.md)
- [Expenses](./endpoints/expenses.md)
- [Categories](./endpoints/categories.md)
- [Goals](./endpoints/goals.md)
- [Reports](./endpoints/reports.md)
- [Bank Integration](./endpoints/bank.md)

## Response Format

All API responses are in JSON format. Successful responses have the following structure:

```json
{
  "success": true,
  "data": { ... }
}
```

Error responses have the following structure:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse. By default, clients are limited to 100 requests per 15-minute window.

## Pagination

Endpoints that return lists of items support pagination. Use the `page` and `limit` query parameters to control pagination:

```
GET /api/expenses?page=2&limit=10
```

Paginated responses include pagination metadata:

```json
{
  "success": true,
  "count": 10,
  "pagination": {
    "next": {
      "page": 3,
      "limit": 10
    },
    "prev": {
      "page": 1,
      "limit": 10
    }
  },
  "total": 45,
  "data": [ ... ]
}
```
