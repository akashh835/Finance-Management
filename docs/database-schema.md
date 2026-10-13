# Database Schema

This document describes the database schema for the Smart Budget Tracker application. The application uses MongoDB with Mongoose for data modeling.

## Collections

### Users

The `users` collection stores user account information.

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String, // Hashed
  avatar: String,
  role: String, // 'user' or 'admin'
  isEmailVerified: Boolean,
  twoFactorEnabled: Boolean,
  twoFactorSecret: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  preferences: {
    currency: String,
    theme: String,
    language: String,
    notificationSettings: {
      email: Boolean,
      push: Boolean,
      budgetAlerts: Boolean,
      goalAlerts: Boolean
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Indexes:
- `email`: Unique index

### Categories

The `categories` collection stores expense and income categories.

```javascript
{
  _id: ObjectId,
  name: String,
  color: String, // Hex color code
  icon: String,
  type: String, // 'income' or 'expense'
  isSystem: Boolean, // System-defined or user-defined
  user: ObjectId, // Reference to Users collection (null for system categories)
  createdAt: Date,
  updatedAt: Date
}
```

#### Indexes:
- `user`: Index
- Compound index: `{ name: 1, user: 1 }` (Unique)

### Budgets

The `budgets` collection stores budget information.

```javascript
{
  _id: ObjectId,
  name: String,
  amount: Number,
  startDate: Date,
  endDate: Date,
  category: ObjectId, // Reference to Categories collection (optional)
  user: ObjectId, // Reference to Users collection
  shared: [
    {
      user: ObjectId, // Reference to Users collection
      permission: String // 'view' or 'edit'
    }
  ],
  notes: String,
  isRecurring: Boolean,
  recurrencePattern: {
    frequency: String, // 'monthly', 'quarterly', 'yearly'
    dayOfMonth: Number,
    monthOfYear: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Indexes:
- `user`: Index
- `category`: Index
- `startDate`: Index
- `endDate`: Index

### Expenses

The `expenses` collection stores expense and income transactions.

```javascript
{
  _id: ObjectId,
  description: String,
  amount: Number,
  date: Date,
  type: String, // 'income' or 'expense'
  category: ObjectId, // Reference to Categories collection
  budget: ObjectId, // Reference to Budgets collection (optional)
  user: ObjectId, // Reference to Users collection
  paymentMethod: String,
  location: String,
  receipt: String, // URL to receipt image
  notes: String,
  tags: [String],
  isRecurring: Boolean,
  recurrencePattern: {
    frequency: String, // 'daily', 'weekly', 'monthly', 'yearly'
    interval: Number,
    endDate: Date
  },
  shared: [
    {
      user: ObjectId, // Reference to Users collection
      amount: Number,
      paid: Boolean
    }
  ],
  currency: String,
  exchangeRate: Number,
  bankTransaction: ObjectId, // Reference to BankTransactions collection (optional)
  createdAt: Date,
  updatedAt: Date
}
```

#### Indexes:
- `user`: Index
- `category`: Index
- `budget`: Index
- `date`: Index
- `type`: Index
- Compound index: `{ user: 1, date: -1 }`

### Goals

The `goals` collection stores savings goals.

```javascript
{
  _id: ObjectId,
  name: String,
  targetAmount: Number,
  currentAmount: Number,
  startDate: Date,
  targetDate: Date,
  category: ObjectId, // Reference to Categories collection (optional)
  user: ObjectId, // Reference to Users collection
  shared: [
    {
      user: ObjectId, // Reference to Users collection
      permission: String // 'view' or 'edit'
    }
  ],
  contributions: [
    {
      amount: Number,
      date: Date,
      notes: String
    }
  ],
  milestones: [
    {
      name: String,
      amount: Number,
      reached: Boolean
    }
  ],
  notes: String,
  priority: String, // 'low', 'medium', 'high'
  status: String, // 'active', 'completed', 'cancelled'
  createdAt: Date,
  updatedAt: Date
}
```

#### Indexes:
- `user`: Index
- `targetDate`: Index
- `status`: Index

### BankAccounts

The `bankAccounts` collection stores connected bank account information.

```javascript
{
  _id: ObjectId,
  user: ObjectId, // Reference to Users collection
  institution: {
    id: String,
    name: String,
    logo: String
  },
  accountId: String, // External account ID from bank API
  name: String,
  officialName: String,
  type: String, // 'checking', 'savings', 'credit', 'investment'
  subtype: String,
  mask: String, // Last 4 digits of account number
  balance: {
    current: Number,
    available: Number,
    limit: Number
  },
  currency: String,
  isActive: Boolean,
  lastSync: Date,
  accessToken: String, // Encrypted
  itemId: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Indexes:
- `user`: Index
- `accountId`: Unique index

### BankTransactions

The `bankTransactions` collection stores transactions imported from bank accounts.

```javascript
{
  _id: ObjectId,
  user: ObjectId, // Reference to Users collection
  account: ObjectId, // Reference to BankAccounts collection
  transactionId: String, // External transaction ID from bank API
  name: String,
  merchantName: String,
  amount: Number,
  date: Date,
  pending: Boolean,
  category: [String], // Categories from bank API
  mappedCategory: ObjectId, // Reference to Categories collection
  mappedExpense: ObjectId, // Reference to Expenses collection (if mapped)
  location: {
    address: String,
    city: String,
    region: String,
    postalCode: String,
    country: String,
    lat: Number,
    lon: Number
  },
  paymentChannel: String,
  paymentMethod: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Indexes:
- `user`: Index
- `account`: Index
- `transactionId`: Unique index
- `date`: Index
- Compound index: `{ user: 1, date: -1 }`

### Notifications

The `notifications` collection stores user notifications.

```javascript
{
  _id: ObjectId,
  user: ObjectId, // Reference to Users collection
  type: String, // 'budget_alert', 'goal_reached', 'shared_expense', etc.
  title: String,
  message: String,
  read: Boolean,
  data: Object, // Additional data related to the notification
  createdAt: Date
}
```

#### Indexes:
- `user`: Index
- `read`: Index
- `createdAt`: Index

## Relationships

The following diagram illustrates the relationships between collections:

```
┌─────────┐       ┌───────────┐       ┌──────────────┐
│         │       │           │       │              │
│  Users  │◄──────┤  Budgets  │◄──────┤   Expenses   │
│         │       │           │       │              │
└─────────┘       └───────────┘       └──────────────┘
     ▲                  ▲                    ▲
     │                  │                    │
     │                  │                    │
     │                  │                    │
     │                  │                    │
     │             ┌────┴────┐               │
     └─────────────┤         ├───────────────┘
                   │Categories│
     ┌─────────────┤         ├───────────────┐
     │             └────┬────┘               │
     │                  │                    │
     │                  │                    │
     ▼                  ▼                    ▼
┌─────────┐       ┌───────────┐       ┌──────────────┐
│         │       │           │       │              │
│  Goals  │       │BankAccounts│──────►│BankTransactions│
│         │       │           │       │              │
└─────────┘       └───────────┘       └──────────────┘
     ▲
     │
     │
     │
┌────┴────────┐
│             │
│Notifications│
│             │
└─────────────┘
```

## Data Validation

Mongoose schemas include validation rules for all fields to ensure data integrity:

- Required fields
- Field type validation
- Minimum and maximum values
- Enum values for fields with predefined options
- Custom validation functions for complex validation rules

## Data Migration

The application includes scripts for data migration when the schema changes:

- Migration scripts are stored in the `backend/migrations` directory
- Each migration script is versioned and includes up and down methods
- Migrations are tracked in a `migrations` collection to ensure they are only run once

## Backup and Recovery

The database is backed up regularly:

- Daily automated backups
- Point-in-time recovery
- Backup retention policy
- Backup verification process

## Performance Considerations

The database is optimized for performance:

- Appropriate indexes for common queries
- Compound indexes for queries with multiple conditions
- TTL indexes for temporary data
- Capped collections for logs
- Sharding for horizontal scaling

## Security Considerations

The database is secured with multiple layers of protection:

- Authentication and authorization
- Network security
- Encryption at rest
- Encryption in transit
- Regular security audits
- Principle of least privilege for database users
