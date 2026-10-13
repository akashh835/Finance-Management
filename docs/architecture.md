# Smart Budget Tracker Architecture

This document provides a comprehensive overview of the Smart Budget Tracker application architecture.

## System Architecture

The Smart Budget Tracker is built using a modern client-server architecture with a clear separation of concerns:

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  Client (React) │◄────►│  Server (Node)  │◄────►│  Database (DB)  │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

### Frontend Architecture

The frontend is built using React with a component-based architecture. It follows a modular approach with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                      React Application                       │
│                                                             │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────────┐    │
│  │             │   │             │   │                 │    │
│  │  Components │   │   Context   │   │     Hooks       │    │
│  │             │   │             │   │                 │    │
│  └─────────────┘   └─────────────┘   └─────────────────┘    │
│                                                             │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────────┐    │
│  │             │   │             │   │                 │    │
│  │   Pages     │   │  Services   │   │     Utils       │    │
│  │             │   │             │   │                 │    │
│  └─────────────┘   └─────────────┘   └─────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Key Frontend Components:

1. **Components**: Reusable UI components like buttons, forms, cards, etc.
2. **Context**: React Context API for state management across the application
3. **Hooks**: Custom React hooks for shared logic and functionality
4. **Pages**: Page-level components that represent different routes in the application
5. **Services**: API service modules for communicating with the backend
6. **Utils**: Utility functions for common operations

### Backend Architecture

The backend follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                      Express Application                     │
│                                                             │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────────┐    │
│  │             │   │             │   │                 │    │
│  │   Routes    │──►│ Controllers │──►│     Models      │    │
│  │             │   │             │   │                 │    │
│  └─────────────┘   └─────────────┘   └─────────────────┘    │
│         ▲                                     │             │
│         │                                     ▼             │
│  ┌─────────────┐                    ┌─────────────────┐    │
│  │             │                    │                 │    │
│  │ Middleware  │                    │    Database     │    │
│  │             │                    │                 │    │
│  └─────────────┘                    └─────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Key Backend Components:

1. **Routes**: Define API endpoints and route requests to appropriate controllers
2. **Controllers**: Handle business logic and interact with models
3. **Models**: Define data schemas and interact with the database
4. **Middleware**: Handle cross-cutting concerns like authentication, logging, error handling
5. **Utils**: Utility functions for common operations

## Data Flow

The data flow in the application follows a standard request-response pattern:

1. User interacts with the UI in the React frontend
2. Frontend makes API requests to the backend
3. Backend processes the request through middleware
4. Controllers handle the business logic
5. Models interact with the database
6. Response flows back through the same path

## Authentication Flow

The application uses JWT (JSON Web Tokens) for authentication:

```
┌─────────┐                                  ┌─────────┐                                  ┌─────────┐
│         │                                  │         │                                  │         │
│  User   │                                  │ Server  │                                  │   DB    │
│         │                                  │         │                                  │         │
└────┬────┘                                  └────┬────┘                                  └────┬────┘
     │                                            │                                            │
     │ Login Request (username/password)          │                                            │
     │ ─────────────────────────────────────────►│                                            │
     │                                            │                                            │
     │                                            │ Verify Credentials                         │
     │                                            │ ─────────────────────────────────────────►│
     │                                            │                                            │
     │                                            │ User Data                                  │
     │                                            │◄─────────────────────────────────────────┐│
     │                                            │                                            │
     │                                            │ Generate JWT                               │
     │                                            │ ┌─────────┐                                │
     │                                            │ │         │                                │
     │                                            │ │         │                                │
     │                                            │ └─────────┘                                │
     │                                            │                                            │
     │ JWT Token                                  │                                            │
     │◄─────────────────────────────────────────┐│                                            │
     │                                            │                                            │
     │ Store Token                                │                                            │
     │ ┌─────────┐                                │                                            │
     │ │         │                                │                                            │
     │ │         │                                │                                            │
     │ └─────────┘                                │                                            │
     │                                            │                                            │
     │ API Request with JWT                       │                                            │
     │ ─────────────────────────────────────────►│                                            │
     │                                            │                                            │
     │                                            │ Verify JWT                                 │
     │                                            │ ┌─────────┐                                │
     │                                            │ │         │                                │
     │                                            │ │         │                                │
     │                                            │ └─────────┘                                │
     │                                            │                                            │
     │ API Response                               │                                            │
     │◄─────────────────────────────────────────┐│                                            │
     │                                            │                                            │
```

## Database Schema

The application uses MongoDB with Mongoose for data modeling. The main collections are:

1. **Users**: Stores user account information
2. **Budgets**: Stores budget information
3. **Expenses**: Stores expense and income transactions
4. **Categories**: Stores expense and income categories
5. **Goals**: Stores savings goals
6. **BankAccounts**: Stores connected bank account information

See the [Database Schema](./database-schema.md) document for detailed schema information.

## Security Architecture

The application implements multiple layers of security:

1. **Authentication**: JWT-based authentication with token expiration
2. **Authorization**: Role-based access control for API endpoints
3. **Data Protection**: Password hashing with bcrypt
4. **API Security**: HTTPS, CORS, Helmet for HTTP headers
5. **Rate Limiting**: Prevents brute force attacks
6. **Input Validation**: Validates all user inputs
7. **Two-Factor Authentication**: Optional 2FA for enhanced security

## Deployment Architecture

The application can be deployed using various architectures:

### Single Server Deployment

```
┌─────────────────────────────────────────┐
│                                         │
│               Single Server             │
│                                         │
│  ┌─────────────┐     ┌─────────────┐    │
│  │             │     │             │    │
│  │  Frontend   │     │  Backend    │    │
│  │             │     │             │    │
│  └─────────────┘     └─────────────┘    │
│                                         │
│             ┌─────────────┐             │
│             │             │             │
│             │  Database   │             │
│             │             │             │
│             └─────────────┘             │
│                                         │
└─────────────────────────────────────────┘
```

### Microservices Deployment

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Frontend       │     │  API Gateway    │     │  Auth Service   │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Budget Service │     │ Expense Service │     │  Goal Service   │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                │
                      ┌─────────────────┐
                      │                 │
                      │    Database     │
                      │                 │
                      └─────────────────┘
```

## Third-Party Integrations

The application integrates with several third-party services:

1. **Plaid API**: For bank account integration
2. **Exchange Rate API**: For currency conversion
3. **Google Cloud Vision API**: For receipt scanning
4. **SendGrid/Nodemailer**: For email notifications

## Performance Considerations

The application implements several performance optimizations:

1. **Caching**: Client-side caching of frequently accessed data
2. **Pagination**: Pagination of large data sets
3. **Indexing**: Database indexing for faster queries
4. **Lazy Loading**: Lazy loading of components and data
5. **Code Splitting**: Splitting code into smaller chunks for faster loading

## Scalability Considerations

The application is designed to scale horizontally:

1. **Stateless Backend**: The backend is stateless, allowing for horizontal scaling
2. **Database Scaling**: MongoDB can be scaled through sharding and replication
3. **Load Balancing**: Multiple backend instances can be load balanced
4. **Caching Layer**: Redis can be added for caching frequently accessed data

## Monitoring and Logging

The application includes comprehensive monitoring and logging:

1. **Application Logs**: Detailed application logs for debugging
2. **Error Tracking**: Centralized error tracking
3. **Performance Monitoring**: Monitoring of API response times
4. **User Activity Tracking**: Tracking of user actions for auditing

## Conclusion

The Smart Budget Tracker architecture is designed to be modular, scalable, and secure. It follows modern best practices for web application development and provides a solid foundation for future enhancements.
