# Finance Dashboard Backend

A secure, scalable, and modular backend for a finance dashboard using Node.js, Express, and MongoDB.

## Features

- **JWT-based Authentication** with robust password hashing (bcrypt)
- **Role-Based Access Control (RBAC)** (Viewer, Analyst, Admin)
- **Financial Record Management** with filtering, sorting, and pagination
- **Optimized Aggregation Endpoints** for dynamic dashboard summaries
- **Centralized Error Handling** and input validation (express-validator)
- **Security Middlewares** including Helmet, CORS, and Express Rate Limit
- **Swagger Documentation**

## Setup

1. Copy `.env.example` to `.env` and configure your environment variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/finance-dashboard
   JWT_SECRET=supersecret12345
   JWT_EXPIRES_IN=1d
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   # Optional: Seed the database with an Admin, Analyst, Viewer, and dummy transactions
   npm run seed

   # Development mode
   npm run dev

   # Or standard execution
   node server.js
   ```

## Roles

- **Viewer:** Has read-only access to summaries and aggregation APIs.
- **Analyst:** Can view all individual financial records and summaries.
- **Admin:** Has full control over users, role management, and financial records (Create, Update, Delete).

## API Endpoints Overview

### Authentication
- `POST /api/auth/login` - Authenticate a user and receive a JWT.

### Users (Admin Only)
- `POST /api/users/register` - Create a new user.
- `GET /api/users` - Retrieve all users.
- `PATCH /api/users/:id/role` - Update a user's role (`Viewer`, `Analyst`, `Admin`).
- `PATCH /api/users/:id/status` - Activate or deactivate a user account.
- `DELETE /api/users/:id` - Soft delete a user.

### Financial Records
- `POST /api/records` - (Admin) Create a financial record. 
- `GET /api/records` - (Admin/Analyst) Get records with pagination, filtering, and search.
- `PUT /api/records/:id` - (Admin) Update an existing record.
- `DELETE /api/records/:id` - (Admin) Soft delete a record.

### Dashboard Summaries
- `GET /api/summary/*` - Multiple endpoints calculating net balance, category distributions, monthly trends, etc. accessible to all authenticated users.

## Design Decisions, Assumptions, & Trade-offs

- **Architecture:** The application follows an MVC layered architecture (Routes -> Controllers -> Models), promoting strong separation of concerns. Controllers handle business logic and HTTP context, while routing and validation are decoupled securely using middlewares. 
- **Database & Data Modeling:** MongoDB was selected for its schema flexibility and powerful aggregation framework, making the summary analytics fast and efficient natively in the database. 
- **Soft Deletes:** Records and users are never hard-deleted; an `isDeleted` boolean is toggled natively monitored by Mongoose pre-hooks. This preserves referential integrity for historical financial trails.
- **Reliability & Validation:** `express-validator` intercepts bad input before controller logic runs. A centralized error handler alongside a robust `catchAsync` wrapper prevents unhandled promise crashes, maintaining optimal Node.js event loop health.
- **Security Considerations:** Protected routes use JWT-based authentication combined with an RBAC `authorize` middleware. Password encryption (`bcrypt`), standard security headers (`helmet`), and API rate limiters (`express-rate-limit`) are enabled.
- **Trade-offs:** 
  - A dedicated `Services` layer was omitted to avoid over-engineering; business logic sits elegantly within controllers for now. 
  - Refresh tokens were deemed out of scope for V1 to streamline integration, prioritizing short/medium-lived access tokens.

## API Documentation

Once the server is running, navigate to `http://localhost:5000/api-docs` to access the Swagger API documentation.
