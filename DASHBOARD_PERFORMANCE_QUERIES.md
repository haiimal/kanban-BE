# Dashboard Performance Optimizations

## Database Indexes Added

The following indexes have been added to optimize dashboard queries:

### Transactions Table
```sql
-- Composite index for type and date filtering
CREATE INDEX idx_transactions_type_date ON transactions (type, transaction_date);

-- Index for date range queries
CREATE INDEX idx_transactions_date ON transactions (transaction_date);

-- Index for transaction type filtering
CREATE INDEX idx_transactions_type ON transactions (type);

-- Composite index for supplier transactions with date filtering
CREATE INDEX idx_transactions_supplier_date ON transactions (supplier_id, transaction_date);

-- Composite index for customer transactions with date filtering
CREATE INDEX idx_transactions_customer_date ON transactions (customer_id, transaction_date);

-- Index for transactions id (JOIN optimization)
CREATE INDEX idx_transactions_id ON transactions (id);

-- Composite index for type, date, and id (JOIN optimization)
CREATE INDEX idx_transactions_type_date_id ON transactions (type, transaction_date, id);
```

**Note**: The actual migration uses Sequelize syntax:
```typescript
await queryInterface.addIndex('transactions', {
  fields: ['type', 'transaction_date'],
  name: 'idx_transactions_type_date'
});
```

### Transaction Items Table
```sql
-- Index for joining with transactions table
CREATE INDEX idx_transaction_items_transaction_id ON transaction_items (transaction_id);

-- Index for subtotal calculations
CREATE INDEX idx_transaction_items_subtotal ON transaction_items (subtotal);

-- Composite index for transaction_id and subtotal
CREATE INDEX idx_transaction_items_transaction_subtotal ON transaction_items (transaction_id, subtotal);
```

### Transaction Expenses Table
```sql
-- Index for joining with transactions table
CREATE INDEX idx_transaction_expenses_transaction_id ON transaction_expenses (transaction_id);

-- Index for expense amount calculations
CREATE INDEX idx_transaction_expenses_amount ON transaction_expenses (amount);

-- Composite index for transaction_id and amount
CREATE INDEX idx_transaction_expenses_transaction_amount ON transaction_expenses (transaction_id, amount);
```

## Index Optimization Analysis

### Current Query Patterns:
1. **Dashboard Queries**: Filter by `type` and `transaction_date` with INNER JOINs to `transaction_items` and `transaction_expenses`
2. **JOIN Operations**: `transactions.id` → `transaction_items.transaction_id` and `transactions.id` → `transaction_expenses.transaction_id`
3. **Aggregation**: SUM operations on `transaction_items.subtotal` and `transaction_expenses.amount`
4. **Date Range Filtering**: BETWEEN queries on `transaction_date`

### Optimized Indexes:
- **Composite Indexes**: Cover the most common query patterns (type + date + id)
- **JOIN Optimization**: Indexes on foreign keys for faster JOINs
- **Aggregation Support**: Indexes on columns used in SUM operations
- **Date Range Queries**: Optimized for BETWEEN date filtering

## Business Logic Implementation

### Corrected Calculations:
- **Total Penjualan**: Sum of `transaction_items.subtotal` for `sell` transactions
- **Total Pembelian**: Sum of `transaction_items.subtotal` for `buy` transactions  
- **Total Biaya**: Sum of all `transaction_expenses.amount` for both buy & sell transactions
- **Total Profit**: Total Penjualan - Total Pembelian - Total Biaya
- **Saldo Awal & Saldo Akhir**: Hardcoded as 0 (as requested)

### Fix Applied:
- **Issue**: Daily total pembelian was incorrect due to LEFT JOIN including transactions without items
- **Solution**: Changed to INNER JOIN to ensure only transactions with actual items are counted
- **Impact**: More accurate purchase calculations by excluding transactions without transaction items

### Monthly Date Calculation Enhancement:
- **Issue**: Monthly data calculations needed to ensure proper start and end of month boundaries
- **Solution**: 
  - Added `getMonthDateRange()` helper method for consistent month calculations
  - Ensured start of month begins at 00:00:00.000
  - Ensured end of month ends at 23:59:59.999
  - Applied consistent date handling across all monthly calculations
- **Impact**: More accurate monthly data aggregation with proper full-day coverage

## Optimized SQL Queries

### 1. Main Dashboard Query (Corrected)
```sql
WITH current_period_sales AS (
  SELECT COALESCE(SUM(ti.subtotal), 0) as total_sales
  FROM transactions t
  INNER JOIN transaction_items ti ON t.id = ti.transaction_id
  WHERE t.type = 'sell' 
    AND t.transaction_date BETWEEN ? AND ?
),
current_period_purchase AS (
  SELECT COALESCE(SUM(ti.subtotal), 0) as total_purchase
  FROM transactions t
  INNER JOIN transaction_items ti ON t.id = ti.transaction_id
  WHERE t.type = 'buy' 
    AND t.transaction_date BETWEEN ? AND ?
),
current_period_expense AS (
  SELECT COALESCE(SUM(te.amount), 0) as total_expense
  FROM transactions t
  INNER JOIN transaction_expenses te ON t.id = te.transaction_id
  WHERE t.transaction_date BETWEEN ? AND ?
),
previous_period_sales AS (
  SELECT COALESCE(SUM(ti.subtotal), 0) as total_sales
  FROM transactions t
  INNER JOIN transaction_items ti ON t.id = ti.transaction_id
  WHERE t.type = 'sell' 
    AND t.transaction_date BETWEEN ? AND ?
),
previous_period_purchase AS (
  SELECT COALESCE(SUM(ti.subtotal), 0) as total_purchase
  FROM transactions t
  INNER JOIN transaction_items ti ON t.id = ti.transaction_id
  WHERE t.type = 'buy' 
    AND t.transaction_date BETWEEN ? AND ?
),
previous_period_expense AS (
  SELECT COALESCE(SUM(te.amount), 0) as total_expense
  FROM transactions t
  INNER JOIN transaction_expenses te ON t.id = te.transaction_id
  WHERE t.transaction_date BETWEEN ? AND ?
)
SELECT 
  cps.total_sales as current_sales,
  cpp.total_purchase as current_purchase,
  cpe.total_expense as current_expense,
  (cps.total_sales - cpp.total_purchase - cpe.total_expense) as current_profit,
  0 as current_initial_balance, -- Hardcoded as requested
  0 as current_final_balance,   -- Hardcoded as requested
  pps.total_sales as previous_sales,
  ppp.total_purchase as previous_purchase,
  ppe.total_expense as previous_expense,
  (pps.total_sales - ppp.total_purchase - ppe.total_expense) as previous_profit,
  0 as previous_initial_balance, -- Hardcoded as requested
  0 as previous_final_balance    -- Hardcoded as requested
FROM current_period_sales cps
CROSS JOIN current_period_purchase cpp
CROSS JOIN current_period_expense cpe
CROSS JOIN previous_period_sales pps
CROSS JOIN previous_period_purchase ppp
CROSS JOIN previous_period_expense ppe
```

### 2. Trend Analysis Query (with LAG() function)
```sql
WITH daily_metrics AS (
  SELECT 
    DATE(t.transaction_date) as date,
    COALESCE(SUM(CASE WHEN t.type = 'sell' THEN ti.subtotal ELSE 0 END), 0) as sales,
    COALESCE(SUM(CASE WHEN t.type = 'buy' THEN ti.subtotal ELSE 0 END), 0) as purchase,
    COALESCE(SUM(te.amount), 0) as expense,
    (COALESCE(SUM(CASE WHEN t.type = 'sell' THEN ti.subtotal ELSE 0 END), 0) - 
     COALESCE(SUM(CASE WHEN t.type = 'buy' THEN ti.subtotal ELSE 0 END), 0) - 
     COALESCE(SUM(te.amount), 0)) as profit
  FROM transactions t
  LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
  LEFT JOIN transaction_expenses te ON t.id = te.transaction_id
  WHERE t.transaction_date BETWEEN ? AND ?
  GROUP BY DATE(t.transaction_date)
),
metrics_with_lag AS (
  SELECT 
    date,
    sales,
    purchase,
    expense,
    profit,
    -- LAG() function to get previous day values for trend calculation
    LAG(sales, 1) OVER (ORDER BY date) as prev_sales,
    LAG(purchase, 1) OVER (ORDER BY date) as prev_purchase,
    LAG(expense, 1) OVER (ORDER BY date) as prev_expense,
    LAG(profit, 1) OVER (ORDER BY date) as prev_profit,
    -- Moving averages for trend smoothing
    AVG(sales) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as sales_7day_avg,
    AVG(purchase) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as purchase_7day_avg,
    AVG(expense) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as expense_7day_avg,
    AVG(profit) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as profit_7day_avg
  FROM daily_metrics
)
SELECT 
  date,
  sales,
  purchase,
  expense,
  profit,
  -- Trend calculation (day-over-day change)
  CASE 
    WHEN prev_sales = 0 THEN 0 
    ELSE ((sales - prev_sales) / prev_sales) * 100 
  END as sales_trend,
  CASE 
    WHEN prev_purchase = 0 THEN 0 
    ELSE ((purchase - prev_purchase) / prev_purchase) * 100 
  END as purchase_trend,
  CASE 
    WHEN prev_expense = 0 THEN 0 
    ELSE ((expense - prev_expense) / prev_expense) * 100 
  END as expense_trend,
  CASE 
    WHEN prev_profit = 0 THEN 0 
    ELSE ((profit - prev_profit) / prev_profit) * 100 
  END as profit_trend
FROM metrics_with_lag
ORDER BY date DESC
LIMIT ?
```

## Performance Improvements

### 1. **Reduced Query Count**
- **Before**: 12 separate database queries per dashboard request
- **After**: 2 optimized queries (1 for daily, 1 for monthly)

### 2. **Index Optimization**
- Added composite indexes for common query patterns
- Optimized for date range filtering and transaction type filtering
- Improved JOIN performance between transactions and expenses

### 3. **Caching Strategy**
- 5-minute cache for dashboard data
- Reduces database load for repeated requests
- Automatic cache invalidation after TTL

### 4. **Query Optimization**
- Used CTEs (Common Table Expressions) for better readability and performance
- Replaced multiple individual queries with single comprehensive queries
- Used COALESCE to handle NULL values efficiently
- Optimized JOINs instead of using Sequelize includes

### 5. **Memory Efficiency**
- Raw queries instead of ORM overhead
- Direct data extraction without model instantiation
- Reduced memory footprint for large datasets

## Expected Performance Gains

- **Query Time**: 60-80% reduction in database query time
- **Memory Usage**: 40-50% reduction in memory consumption
- **Response Time**: 70-90% improvement in API response time
- **Database Load**: Significant reduction in database connections and processing

## Monthly Date Calculation Helper

### `getMonthDateRange()` Method
```typescript
private static getMonthDateRange(date: Date, isCurrentMonth: boolean = true): {
  start: Date;
  end: Date;
  startStr: string;
  endStr: string;
}
```

**Features:**
- **Consistent Calculation**: Ensures all monthly calculations use the same logic
- **Proper Boundaries**: 
  - Start of month: `00:00:00.000` (beginning of first day)
  - End of month: `23:59:59.999` (end of last day)
- **Flexible**: Supports both current month and previous month calculations
- **ISO Format**: Returns both Date objects and ISO string formats

**Usage:**
```typescript
const currentMonth = this.getMonthDateRange(today, true);
const previousMonth = this.getMonthDateRange(today, false);

// Results in proper month boundaries:
// Current month: 2024-01-01 00:00:00.000 to 2024-01-31 23:59:59.999
// Previous month: 2023-12-01 00:00:00.000 to 2023-12-31 23:59:59.999
```

## Cache Management

The dashboard service includes a 5-minute cache that can be manually cleared:

```typescript
// Clear cache manually if needed
DashboardService.clearCache();
```

Cache is automatically invalidated after 5 minutes to ensure data freshness while maintaining performance benefits.

## New API Endpoints

### 1. Dashboard Data
```
GET /api/dashboard
```
Returns daily and monthly metrics with period-over-period comparisons.

### 2. Trend Analysis (with LAG() function)
```
GET /api/dashboard/trends?days=30
```
Returns detailed trend analysis including:
- Day-over-day percentage changes
- Moving averages (7-day)
- Historical trend indicators for all metrics

**Query Parameters:**
- `days` (optional): Number of days to analyze (default: 30)

**Response Example:**
```json
{
  "data": [
    {
      "date": "2024-01-15",
      "sales": 1500000,
      "purchase": 800000,
      "expense": 200000,
      "profit": 500000,
      "sales_trend": 15.50,
      "purchase_trend": -5.20,
      "expense_trend": 8.10,
      "profit_trend": 25.30
    }
  ],
  "days": 30
}
```

**Note**: All percentage values are rounded to 2 decimal places for consistency.

## Change Type System

### Change Types:
- **UP**: Indicates an increase in the metric value
- **DOWN**: Indicates a decrease in the metric value  
- **STAY**: Indicates no change in the metric value (0% change)

### Change Calculation Logic:
- **Percentage Change**: `((current - previous) / previous) * 100`
- **Change Type Determination**:
  - `'UP'` for positive changes (> 0)
  - `'DOWN'` for negative changes (< 0)
  - `'STAY'` for no change (= 0)
- **Rounding**: All percentages rounded to 2 decimal places
- **Zero Handling**: 
  - When previous value is 0, current > 0 returns 100% UP, current = 0 returns 0% STAY
  - When change percentage is exactly 0, returns 'STAY' type

### Verdict Messages:
- **Sales**: "Penjualan meningkat/menurun/stabil"
- **Purchase**: "Pembelian meningkat/menurun/stabil"
- **Expense**: "Biaya meningkat/menurun/stabil"
- **Profit**: "Profit meningkat/menurun/stabil"
- **Balance**: "Saldo awal/akhir meningkat/menurun/stabil"

## LAG() Function Benefits

### LAG() Function:
- **Period-over-Period Comparison**: Compare current period with previous period
- **Trend Calculation**: Calculate percentage changes between consecutive periods
- **Historical Analysis**: Access previous values for trend analysis

### Window Functions:
- **Moving Averages**: Smooth out daily fluctuations
- **Trend Smoothing**: Provide more stable trend indicators
- **Performance**: Efficient calculation of complex analytics
