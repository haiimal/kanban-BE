<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_docs" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./public/light-logo.png">
      <img alt="Clerk Logo for light background" src="./public/dark-logo.png" height="64">
    </picture>
  </a>
  <br />
</p>
<div align="center">
  <h1>
    Clerk Express Quickstart with Sequelize
  </h1>
  <a href="https://www.npmjs.com/package/@clerk/clerk-js">
    <img alt="Downloads" src="https://img.shields.io/npm/dm/@clerk/clerk-js" />
  </a>
  <a href="https://discord.com/invite/b5rXHjAg7A">
    <img alt="Discord" src="https://img.shields.io/discord/856971667393609759?color=7389D8&label&logo=discord&logoColor=ffffff" />
  </a>
  <a href="https://twitter.com/clerkdev">
    <img alt="Twitter" src="https://img.shields.io/twitter/url.svg?label=%40clerkdev&style=social&url=https%3A%2F%2Ftwitter.com%2Fclerkdev" />
  </a>
  <br />
  <br />
  <img alt="Clerk Hero Image" src="./public/hero.png">
</div>

## Introduction

A complete Node.js Express application with Sequelize ORM, implementing a full CRUD API for a transaction management system with built-in performance monitoring.

Clerk is a developer-first authentication and user management solution. It provides pre-built React components and hooks for sign-in, sign-up, user profile, and organization management. This quickstart demonstrates how to integrate Clerk authentication with a full-featured Express API.

After following this guide, you'll have learned how to:

- Install `@clerk/express`
- Set your Clerk API keys
- Add `clerkMiddleware()` to your application
- Protect your routes using `requireAuth()`
- Build a complete transaction management API
- Monitor API performance in real-time

## Database Schema

The application implements the following entities:
- **Contacts**: Suppliers and customers
- **Brands**: Product brands
- **Items**: Products with specifications
- **Expense Types**: Categories for transaction expenses
- **Transactions**: Sales and Purchase transactions (date-only format)
- **Transaction Items**: Items within transactions
- **Transaction Expenses**: Additional expenses for transactions

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/clerk/clerk-express-quickstart
cd clerk-express-quickstart
npm install
```

### 2. Environment Configuration

Create a `.env` file with the following configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=clerk_express_db

# Clerk Configuration
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Server Configuration
PORT=3002
NODE_ENV=development

# Performance Monitoring (Optional)
PERFORMANCE_DETAILED_LOGGING=true
PERFORMANCE_LOG_ALL=true
```

### 3. Clerk Setup

1. Sign up for a Clerk account at [https://clerk.com](https://dashboard.clerk.com/sign-up?utm_source=DevRel&utm_medium=docs&utm_campaign=templates&utm_content=clerk-express-quickstart)

2. Go to the [Clerk dashboard](https://dashboard.clerk.com?utm_source=DevRel&utm_medium=docs&utm_campaign=templates&utm_content=clerk-express-quickstart) and create an application

3. Copy your API keys from the Clerk dashboard to your `.env` file

### 4. Database Setup

- Create a PostgreSQL database
- Update your `.env` file with the correct database credentials

### 5. Start the Application

```bash
npm run dev
```

The application will automatically:
- Connect to the database
- Create all tables with proper relationships
- Start the server on the specified port (default: 3002)

## API Endpoints

All endpoints are available under `/api` and require Clerk authentication:

### Contacts
- `GET /api/contacts` - Get all contacts with pagination
- `GET /api/contacts/:id` - Get contact by ID
- `POST /api/contacts` - Create contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Brands
- `GET /api/brands` - Get all brands with pagination
- `GET /api/brands/:id` - Get brand by ID
- `POST /api/brands` - Create brand
- `PUT /api/brands/:id` - Update brand
- `DELETE /api/brands/:id` - Delete brand

### Expense Types
- `GET /api/expense-types` - Get all expense types
- `GET /api/expense-types/:id` - Get expense type by ID
- `POST /api/expense-types` - Create expense type
- `PUT /api/expense-types/:id` - Update expense type
- `DELETE /api/expense-types/:id` - Delete expense type

### Items
- `GET /api/items` - Get all items with pagination (includes brand info)
- `GET /api/items/:id` - Get item by ID (includes brand info)
- `POST /api/items` - Create item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Transactions
- `GET /api/transactions` - Get all transactions with pagination and filtering (includes full details)
- `GET /api/transactions/:id` - Get transaction by ID (includes full details)
- `POST /api/transactions` - Create transaction with items and expenses
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Transaction Items
- `GET /api/transaction-items` - Get all transaction items with pagination

### Transaction Expenses
- `GET /api/transaction-expenses` - Get all transaction expenses with pagination

### Dashboard
- `GET /api/dashboard` - Get dashboard analytics and summary data

## Sample API Requests

### Create Contact
```json
POST /api/contacts
{
  "name": "ABC Supplier",
  "phone": "+1234567890"
}
```

### Create Brand
```json
POST /api/brands
{
  "name": "Apple"
}
```

### Create Item
```json
POST /api/items
{
  "brand_id": "brand-uuid",
  "model_name": "iPhone 15 Pro",
  "ram_gb": 8,
  "storage_gb": 256,
  "display_name": "iPhone 15 Pro 256GB"
}
```

### Create Transaction
```json
POST /api/transactions
{
  "transaction_date": "2024-01-15",
  "type": "buy",
  "supplier_id": "supplier-uuid",
  "notes": "Purchase of smartphones for inventory",
  "transaction_products": [
    {
      "brand_id": "brand-uuid",
      "product_id": "item-uuid",
      "quantity": 2,
      "amount_per_product": 12000000,
      "sub_total": 24000000
    }
  ],
  "transaction_expenses": [
    {
      "expense_type": "expense-type-uuid",
      "notes": "Shipping cost",
      "amount": 500000
    }
  ],
  "sub_total_products": 24000000,
  "sub_total_expenses": 500000,
  "total": 23500000
}
```

## Performance Monitoring

This application includes comprehensive performance monitoring to help you identify slow endpoints and optimize your API performance.

### Features

#### Real-time Request Logging
Every request is logged with execution time, HTTP status, and performance indicators:

- 🟢 **Green**: Fast requests (< 100ms)
- 🟠 **Orange**: Moderate requests (100-500ms)  
- 🟡 **Yellow**: Medium requests (500ms-1s)
- 🔴 **Red**: Slow requests (≥ 1s)

#### Console Output Examples
```
🟡 [2024-01-15T10:30:45.123Z] GET /api/transactions - 750ms - Status: 200
🔴 [2024-01-15T10:31:12.456Z] POST /api/transactions - 1500ms - Status: 201
⚠️  SLOW REQUEST DETECTED: POST /api/transactions took 1500ms
```

### Performance Configuration

#### Default Behavior
- **Without environment variables**: Only logs requests ≥ 500ms
- **With `PERFORMANCE_LOG_ALL=true`**: Logs all requests
- **With `PERFORMANCE_DETAILED_LOGGING=true`**: Includes additional request details (IP, User-Agent, Content-Length)

#### Performance Thresholds

| Color | Time Range | Description |
|-------|------------|-------------|
| 🟢 | < 100ms | Excellent performance |
| 🟠 | 100-500ms | Good performance |
| 🟡 | 500ms-1s | Moderate performance |
| 🔴 | ≥ 1s | Poor performance - investigate |

#### Best Practices
1. **Monitor Console Logs**: Watch for performance indicators in real-time
2. **Investigate Red Requests**: Any request ≥ 1s should be investigated
3. **Environment Tuning**: Adjust logging levels based on your needs

#### Troubleshooting
If logs become too verbose:
- Remove `PERFORMANCE_LOG_ALL=true`
- Keep only `PERFORMANCE_DETAILED_LOGGING=true` for detailed analysis

## Project Structure

```
src/
├── config/
│   ├── config.ts              # Environment configuration
│   └── database.ts            # Database configuration
├── controllers/
│   ├── contactController.ts
│   ├── brandController.ts
│   ├── expenseTypeController.ts
│   ├── itemController.ts
│   ├── transactionController.ts
│   ├── transactionItemController.ts
│   ├── transactionExpenseController.ts
│   └── dashboardController.ts
├── middleware/
│   ├── clerkIdInjector.ts     # Clerk ID injection middleware
│   ├── performanceLogger.ts   # Performance monitoring middleware
│   └── index.ts
├── migrations/
│   ├── 002-create-contacts.ts
│   ├── 003-create-brands.ts
│   ├── 004-create-expense-types.ts
│   ├── 005-create-items.ts
│   ├── 006-create-transactions.ts
│   ├── 007-create-transaction-items.ts
│   ├── 008-create-transaction-expenses.ts
│   ├── 010-add-audit-fields-contacts.ts
│   ├── 011-add-audit-fields-brands.ts
│   ├── 012-add-audit-fields-items.ts
│   ├── 013-add-audit-fields-expense-types.ts
│   ├── 014-add-audit-fields-transactions.ts
│   ├── 015-add-audit-fields-transaction-items.ts
│   ├── 016-add-audit-fields-transaction-expenses.ts
│   ├── 017-update-transaction-type-enum.ts
│   └── 018-alter-transaction-date-to-dateonly.ts
├── models/
│   ├── Contact.ts
│   ├── Brand.ts
│   ├── ExpenseType.ts
│   ├── Item.ts
│   ├── Transaction.ts
│   ├── TransactionItem.ts
│   ├── TransactionExpense.ts
│   └── index.ts               # Model associations
├── routes/
│   ├── contactRoutes.ts
│   ├── brandRoutes.ts
│   ├── expenseTypeRoutes.ts
│   ├── itemRoutes.ts
│   ├── transactionRoutes.ts
│   ├── transactionItemRoutes.ts
│   ├── transactionExpenseRoutes.ts
│   ├── dashboardRoutes.ts
│   └── index.ts               # Route aggregation
├── services/
│   ├── contactService.ts
│   ├── brandService.ts
│   ├── expenseTypeService.ts
│   ├── itemService.ts
│   ├── transactionService.ts
│   ├── transactionItemService.ts
│   ├── transactionExpenseService.ts
│   └── index.ts
├── types/
│   ├── brand.ts
│   ├── contact.ts
│   ├── dashboard.ts
│   ├── expense.ts
│   ├── item.ts
│   ├── transaction.ts
│   └── index.ts               # TypeScript interfaces
└── index.ts                   # Main application file
```

## Features

- ✅ Complete CRUD operations for all entities
- ✅ Proper foreign key relationships
- ✅ TypeScript interfaces and DTOs
- ✅ Sequelize migrations
- ✅ Error handling with detailed logging
- ✅ Transaction type ENUM (`buy`, `sell`)
- ✅ Eager loading for related data
- ✅ Clean folder structure
- ✅ Async/await pattern
- ✅ Input validation
- ✅ Clerk authentication integration
- ✅ Performance monitoring with real-time metrics
- ✅ Pagination support for large datasets
- ✅ Date-only transaction dates (no time component)
- ✅ Audit trails (created_by, updated_by, timestamps)
- ✅ Comprehensive API documentation
- ✅ Environment-based configuration

## Deploy

Easily deploy the template to Vercel with the button below. You will need to set the required environment variables in the Vercel dashboard.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fclerk%2Fclerk-express-quickstart&env=NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,CLERK_SECRET_KEY&envDescription=Clerk%20API%20keys&envLink=https%3A%2F%2Fclerk.com%2Fdocs%2Fquickstart%express&redirect-url=https%3A%2F%2Fclerk.com%2Fdocs%2Fquickstart%express)

## Integration with Monitoring Tools

This performance monitoring can be integrated with:
- Application Performance Monitoring (APM) tools
- Log aggregation services (ELK stack, Splunk)
- Metrics collection systems (Prometheus, Grafana)
- Alerting systems for slow request thresholds

## Learn More

To learn more about Clerk and Express, check out the following resources:

- [Quickstart: Get started with Clerk and Express](https://clerk.com/docs/quickstarts/express?utm_source=DevRel&utm_medium=docs&utm_campaign=templates&utm_content=clerk-express-quickstart)
- [Clerk Documentation](https://clerk.com/docs?utm_source=DevRel&utm_medium=docs&utm_campaign=templates&utm_content=clerk-express-quickstart)
- [Express Documentation](https://expressjs.com/en/starter/installing.html)
- [Sequelize Documentation](https://sequelize.org/)

## Found an Issue?

If you have found an issue with the quickstart, please create an [issue](https://github.com/clerk/clerk-express-quickstart/issues).

If it's a quick fix, such as a misspelled word or a broken link, feel free to skip creating an issue.
Go ahead and create a [pull request](https://github.com/clerk/clerk-express-quickstart/pulls) with the solution. :rocket:

## Want to Leave Feedback?

Feel free to create an [issue](https://github.com/clerk/clerk-express-quickstart/issues) with the **feedback** label. Our team will take a look at it and get back to you as soon as we can!

## Connect with Us

You can discuss ideas, ask questions, and meet others from the community in our [Discord](https://discord.com/invite/b5rXHjAg7A).

If you prefer, you can also find support through our [Twitter](https://twitter.com/ClerkDev), or you can [email](mailto:support@clerk.dev) us!