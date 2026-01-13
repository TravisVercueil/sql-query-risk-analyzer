# SQL Query Test Suite

Test queries for the SQL Query Risk Analyzer, organized from basic to advanced.

## Basic Queries

### 1. Simple SELECT
```sql
SELECT * FROM users;
```

### 2. SELECT with WHERE
```sql
SELECT * FROM users WHERE id = 1;
```

### 3. SELECT specific columns
```sql
SELECT name, email FROM users WHERE active = true;
```

### 4. SELECT with ORDER BY
```sql
SELECT * FROM products ORDER BY price DESC;
```

### 5. SELECT with LIMIT
```sql
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;
```

## Intermediate Queries

### 6. JOIN - Inner Join
```sql
SELECT u.name, o.total_amount 
FROM users u 
INNER JOIN orders o ON u.id = o.user_id 
WHERE o.status = 'completed';
```

### 7. JOIN - Left Join
```sql
SELECT p.name, oi.quantity, oi.price
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
WHERE p.category = 'electronics';
```

### 8. Multiple JOINs
```sql
SELECT 
  u.name,
  o.order_date,
  p.name as product_name,
  oi.quantity
FROM users u
JOIN orders o ON u.id = o.user_id
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE o.status = 'pending';
```

### 9. Aggregation with GROUP BY
```sql
SELECT 
  category,
  COUNT(*) as total_products,
  AVG(price) as avg_price,
  MAX(price) as max_price
FROM products
GROUP BY category;
```

### 10. Aggregation with HAVING
```sql
SELECT 
  user_id,
  COUNT(*) as order_count,
  SUM(total_amount) as total_spent
FROM orders
GROUP BY user_id
HAVING COUNT(*) > 5;
```

### 11. Subquery in WHERE
```sql
SELECT * FROM products
WHERE category IN (
  SELECT DISTINCT category 
  FROM products 
  WHERE price > 100
);
```

### 12. EXISTS Subquery
```sql
SELECT u.*
FROM users u
WHERE EXISTS (
  SELECT 1 
  FROM orders o 
  WHERE o.user_id = u.id 
  AND o.total_amount > 1000
);
```

## Advanced Queries

### 13. Complex Aggregation with Multiple JOINs
```sql
SELECT 
  c.name as category_name,
  COUNT(DISTINCT p.id) as product_count,
  COUNT(DISTINCT oi.order_id) as order_count,
  SUM(oi.quantity * oi.price) as total_revenue,
  AVG(oi.price) as avg_item_price
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'completed'
GROUP BY c.id, c.name
HAVING COUNT(DISTINCT p.id) > 0
ORDER BY total_revenue DESC;
```

### 14. Window Functions
```sql
SELECT 
  user_id,
  order_date,
  total_amount,
  SUM(total_amount) OVER (PARTITION BY user_id ORDER BY order_date) as running_total,
  ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY order_date DESC) as order_rank,
  LAG(total_amount) OVER (PARTITION BY user_id ORDER BY order_date) as previous_order_amount
FROM orders
WHERE status = 'completed';
```

### 15. CTE (Common Table Expression)
```sql
WITH user_stats AS (
  SELECT 
    user_id,
    COUNT(*) as order_count,
    SUM(total_amount) as lifetime_value
  FROM orders
  WHERE status = 'completed'
  GROUP BY user_id
),
top_users AS (
  SELECT user_id
  FROM user_stats
  WHERE lifetime_value > 5000
)
SELECT 
  u.name,
  u.email,
  us.order_count,
  us.lifetime_value
FROM users u
JOIN top_users tu ON u.id = tu.user_id
JOIN user_stats us ON u.id = us.user_id
ORDER BY us.lifetime_value DESC;
```

### 16. Multiple CTEs with Complex Logic
```sql
WITH recent_orders AS (
  SELECT 
    user_id,
    order_id,
    total_amount,
    order_date
  FROM orders
  WHERE order_date >= CURRENT_DATE - INTERVAL '30 days'
    AND status = 'completed'
),
user_metrics AS (
  SELECT 
    user_id,
    COUNT(*) as recent_order_count,
    SUM(total_amount) as recent_spend,
    AVG(total_amount) as avg_order_value
  FROM recent_orders
  GROUP BY user_id
),
product_popularity AS (
  SELECT 
    product_id,
    COUNT(DISTINCT order_id) as times_ordered,
    SUM(quantity) as total_quantity_sold
  FROM order_items oi
  JOIN recent_orders ro ON oi.order_id = ro.order_id
  GROUP BY product_id
)
SELECT 
  u.name,
  u.email,
  um.recent_order_count,
  um.recent_spend,
  um.avg_order_value,
  pp.times_ordered,
  pp.total_quantity_sold,
  p.name as favorite_product
FROM user_metrics um
JOIN users u ON um.user_id = u.id
LEFT JOIN (
  SELECT DISTINCT ON (user_id) 
    user_id,
    product_id
  FROM order_items oi
  JOIN recent_orders ro ON oi.order_id = ro.order_id
  ORDER BY user_id, quantity DESC
) fav ON u.id = fav.user_id
LEFT JOIN products p ON fav.product_id = p.id
LEFT JOIN product_popularity pp ON p.id = pp.product_id
WHERE um.recent_order_count >= 3
ORDER BY um.recent_spend DESC;
```

## Super Advanced Query

### 17. Ultra Complex - Multiple CTEs, Window Functions, Subqueries, and Complex Joins
```sql
WITH date_range AS (
  SELECT 
    DATE_TRUNC('month', generate_series(
      CURRENT_DATE - INTERVAL '12 months',
      CURRENT_DATE,
      '1 month'::interval
    )) as month_start
),
monthly_sales AS (
  SELECT 
    DATE_TRUNC('month', o.order_date) as sale_month,
    c.id as category_id,
    c.name as category_name,
    COUNT(DISTINCT o.id) as order_count,
    COUNT(DISTINCT oi.product_id) as unique_products_sold,
    SUM(oi.quantity) as total_units_sold,
    SUM(oi.quantity * oi.price) as total_revenue,
    AVG(oi.price) as avg_item_price
  FROM orders o
  JOIN order_items oi ON o.id = oi.order_id
  JOIN products p ON oi.product_id = p.id
  JOIN categories c ON p.category_id = c.id
  WHERE o.status = 'completed'
    AND o.order_date >= CURRENT_DATE - INTERVAL '12 months'
  GROUP BY DATE_TRUNC('month', o.order_date), c.id, c.name
),
category_growth AS (
  SELECT 
    category_id,
    category_name,
    sale_month,
    total_revenue,
    LAG(total_revenue) OVER (
      PARTITION BY category_id 
      ORDER BY sale_month
    ) as previous_month_revenue,
    total_revenue - LAG(total_revenue) OVER (
      PARTITION BY category_id 
      ORDER BY sale_month
    ) as month_over_month_change,
    ROUND(
      ((total_revenue - LAG(total_revenue) OVER (
        PARTITION BY category_id 
        ORDER BY sale_month
      )) / NULLIF(LAG(total_revenue) OVER (
        PARTITION BY category_id 
        ORDER BY sale_month
      ), 0)) * 100, 
      2
    ) as growth_percentage,
    SUM(total_revenue) OVER (
      PARTITION BY category_id 
      ORDER BY sale_month 
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) as cumulative_revenue,
    RANK() OVER (
      PARTITION BY sale_month 
      ORDER BY total_revenue DESC
    ) as monthly_rank
  FROM monthly_sales
),
top_categories_by_month AS (
  SELECT 
    sale_month,
    category_name,
    total_revenue,
    monthly_rank
  FROM category_growth
  WHERE monthly_rank <= 3
),
user_segments AS (
  SELECT 
    u.id as user_id,
    u.name,
    COUNT(DISTINCT o.id) as total_orders,
    SUM(o.total_amount) as lifetime_value,
    MAX(o.order_date) as last_order_date,
    CASE 
      WHEN SUM(o.total_amount) >= 10000 THEN 'VIP'
      WHEN SUM(o.total_amount) >= 5000 THEN 'Premium'
      WHEN SUM(o.total_amount) >= 1000 THEN 'Regular'
      ELSE 'New'
    END as customer_segment,
    COUNT(DISTINCT DATE_TRUNC('month', o.order_date)) as active_months
  FROM users u
  LEFT JOIN orders o ON u.id = o.user_id AND o.status = 'completed'
  GROUP BY u.id, u.name
),
category_user_preferences AS (
  SELECT 
    us.user_id,
    us.customer_segment,
    c.id as preferred_category_id,
    c.name as preferred_category,
    COUNT(DISTINCT oi.order_id) as orders_in_category,
    SUM(oi.quantity * oi.price) as spend_in_category,
    ROW_NUMBER() OVER (
      PARTITION BY us.user_id 
      ORDER BY SUM(oi.quantity * oi.price) DESC
    ) as category_preference_rank
  FROM user_segments us
  JOIN orders o ON us.user_id = o.user_id AND o.status = 'completed'
  JOIN order_items oi ON o.id = oi.order_id
  JOIN products p ON oi.product_id = p.id
  JOIN categories c ON p.category_id = c.id
  GROUP BY us.user_id, us.customer_segment, c.id, c.name
)
SELECT 
  dr.month_start,
  COALESCE(cg.category_name, 'No Sales') as category_name,
  COALESCE(cg.total_revenue, 0) as monthly_revenue,
  COALESCE(cg.month_over_month_change, 0) as revenue_change,
  COALESCE(cg.growth_percentage, 0) as growth_pct,
  COALESCE(cg.cumulative_revenue, 0) as cumulative_revenue,
  COALESCE(cg.monthly_rank, 999) as category_rank,
  COUNT(DISTINCT cup.user_id) FILTER (
    WHERE cup.category_preference_rank = 1 
    AND cup.preferred_category_id = cg.category_id
  ) as top_category_users,
  COUNT(DISTINCT cup.user_id) FILTER (
    WHERE cup.customer_segment = 'VIP' 
    AND cup.preferred_category_id = cg.category_id
  ) as vip_users_in_category,
  (
    SELECT COUNT(DISTINCT us.user_id)
    FROM user_segments us
    WHERE us.last_order_date >= dr.month_start
      AND us.last_order_date < dr.month_start + INTERVAL '1 month'
  ) as active_users_this_month
FROM date_range dr
LEFT JOIN category_growth cg ON dr.month_start = cg.sale_month
LEFT JOIN category_user_preferences cup ON cg.category_id = cup.preferred_category_id
WHERE dr.month_start <= CURRENT_DATE
GROUP BY 
  dr.month_start,
  cg.category_id,
  cg.category_name,
  cg.total_revenue,
  cg.month_over_month_change,
  cg.growth_percentage,
  cg.cumulative_revenue,
  cg.monthly_rank
HAVING COALESCE(cg.total_revenue, 0) > 0 
   OR dr.month_start >= CURRENT_DATE - INTERVAL '3 months'
ORDER BY 
  dr.month_start DESC,
  cg.monthly_rank NULLS LAST,
  cg.total_revenue DESC NULLS LAST;
```

## Query Complexity Notes

- **Basic (1-5)**: Simple SELECT statements, good for testing basic validation
- **Intermediate (6-12)**: JOINs, aggregations, subqueries - test common patterns
- **Advanced (13-16)**: Window functions, CTEs, complex aggregations - test optimization recommendations
- **Super Advanced (17)**: Everything combined - multiple CTEs, window functions, correlated subqueries, complex filtering, and aggregations. This should trigger comprehensive analysis and optimization suggestions.

## Testing Tips

1. Start with basic queries to ensure the tool works correctly
2. Progress through intermediate queries to see different risk patterns
3. Use advanced queries to test optimization recommendations
4. The super advanced query should reveal multiple optimization opportunities:
   - Missing indexes on join columns
   - Window function performance considerations
   - CTE optimization opportunities
   - Subquery performance issues
   - Complex aggregation optimization
