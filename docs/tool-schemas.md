# MCP Tool Schemas Reference

All tools accept input wrapped in a `params` object. All tools return `{ result: string }` where the string contains either markdown or JSON depending on `response_format`.

---

## 1. `kapruka_list_categories`

**Purpose**: List top-level product categories with browse URLs.

### Input Schema

```typescript
{
  params: {
    depth?: 1 | 2;              // Sub-category levels (default: 1)
    response_format?: string;   // 'markdown' | 'json' (default: 'markdown')
  }
}
```

### Output (JSON mode)

```typescript
{
  categories: Array<{
    name: string;
    url: string;                // kapruka.com category landing page
    children?: Array<{name: string; url: string; children?: ...}>;
  }>;
}
```

### Annotations
- Read-only: Yes
- Idempotent: Yes
- Cached: 30 minutes server-side

---

## 2. `kapruka_get_product`

**Purpose**: Fetch full product details by ID.

### Input Schema

```typescript
{
  params: {
    product_id: string;         // Required. Min 3, max 80 chars. e.g. 'cake00ka002034'
    currency?: string;          // 'LKR' | 'USD' | 'GBP' | 'AUD' | 'CAD' | 'EUR' (default: 'LKR')
    type?: string | null;       // Optional type hint e.g. 'specialgifts'
    response_format?: string;   // 'markdown' | 'json' (default: 'markdown')
  }
}
```

### Output (JSON mode)

```typescript
{
  id: string;
  name: string;
  description: string;
  summary: string;
  price: { amount: number; currency: string };
  compare_at_price: { amount: number; currency: string } | null;
  in_stock: boolean;
  stock_level: 'low' | 'medium' | 'high';
  category: { id: string; name: string; slug: string; path: string };
  variants: Array<{
    id: string;
    name: string;
    sku: string;
    price: { amount: number; currency: string };
    in_stock: boolean;
    stock_level: string;
    attributes: Record<string, unknown>;
  }>;
  images: string[];             // Full-resolution URLs
  attributes: { type: string; subtype: string; weight: string; vendor: string };
  shipping: {
    ships_from: string;
    ships_internationally: boolean;
    restricted_countries: string[];
  };
  rating: null;
  url: string;
}
```

### Notes
- IDs starting with `CATSYM` are category pages, not purchasable products.
- Annotations: Read-only, Idempotent.

---

## 3. `kapruka_search_products`

**Purpose**: Keyword search with filters and pagination.

### Input Schema

```typescript
{
  params: {
    q: string;                  // Required. Min 3 chars, max 200. Must contain specific terms.
    category?: string | null;   // Category filter e.g. 'Birthday', 'Flowers'
    limit?: number;             // 1-50 (default: 10)
    cursor?: string | null;     // Pagination cursor from previous response
    currency?: string;          // 'LKR' | 'USD' | 'GBP' | 'AUD' | 'CAD' | 'EUR'
    min_price?: number | null;  // Min price (inclusive), >= 0
    max_price?: number | null;  // Max price (inclusive), >= 0
    in_stock_only?: boolean;    // Default: false
    sort?: string;              // 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'bestseller'
    include_stubs?: boolean;    // Include CATSYM entries (default: false)
    response_format?: string;   // 'markdown' | 'json'
  }
}
```

### Output (JSON mode)

```typescript
{
  results: Array<{
    id: string;
    name: string;
    summary: string;
    price: { amount: number | null; currency: string };
    compare_at_price: { amount: number; currency: string } | null;
    in_stock: boolean;
    stock_level: string;
    image_url: string | null;
    category: { id: string; name: string; slug: string };
    rating: null;
    ships_internationally: boolean;
    url: string;
  }>;
  next_cursor: string | null;   // null after page 3
  applied_filters: { q: string; limit: number; in_stock_only: boolean };
}
```

### Constraints
- Pagination capped at 3 pages per query
- Pure stopword queries rejected
- CATSYM stubs (price=0) excluded by default

---

## 4. `kapruka_list_delivery_cities`

**Purpose**: List/search Sri Lankan cities Kapruka delivers to.

### Input Schema

```typescript
{
  params: {
    query?: string | null;      // Partial match filter, max 50 chars
    limit?: number;             // 1-50 (default: 25)
    response_format?: string;   // 'markdown' | 'json'
  }
}
```

### Output (JSON mode)

```typescript
{
  cities: Array<{ name: string; aliases: string[] }>;
  total_matched: number;
  showing: number;
}
```

---

## 5. `kapruka_check_delivery`

**Purpose**: Check delivery feasibility, date availability, and rate.

### Input Schema

```typescript
{
  params: {
    city: string;               // Required. Canonical city name. Min 2, max 100 chars.
    delivery_date?: string | null; // YYYY-MM-DD (Asia/Colombo). Defaults to today.
    product_id?: string | null; // Enables perishable warnings for CAKE*/FLOWER*/COMBO*
    response_format?: string;   // 'markdown' | 'json'
  }
}
```

### Output (JSON mode)

```typescript
{
  city: string;
  now: string;                  // ISO timestamp, Sri Lanka time
  checked_date: string;         // YYYY-MM-DD
  available: boolean;
  rate: number;                 // Flat LKR rate per order
  currency: 'LKR';
  reason: string | null;        // Populated when available=false
  next_available_date: string | null; // Populated when available=false
  perishable_warning: string | null;  // When product_id is perishable + date > 1 day out
}
```

### Notes
- Flat rate per order regardless of item count
- Perishable detection: codes starting with CAKE, FLOWER, COMBO

---

## 6. `kapruka_create_order`

**Purpose**: Create guest-checkout order, get payment link.

### Input Schema

```typescript
{
  params: {
    cart: Array<{
      product_id: string;       // Required. Min 3, max 80 chars.
      quantity?: number;        // 1-99 (default: 1)
      icing_text?: string | null; // Max 120 chars. Cakes only.
    }>;                         // 1-30 items
    recipient: {
      name: string;             // Min 1, max 80 chars
      phone: string;            // E.164 (+9477...) or local (077...). Min 7, max 30 chars.
    };
    delivery: {
      address: string;          // Min 3, max 250 chars
      city: string;             // Must be Kapruka-deliverable. Min 2, max 100 chars.
      location_type?: string;   // 'house' | 'apartment' | 'office' | 'other' (default: 'house')
      date: string;             // YYYY-MM-DD, today or future (Asia/Colombo)
      instructions?: string | null; // Max 250 chars
    };
    sender: {
      name: string;             // Min 1, max 80 chars
      anonymous?: boolean;      // Default: false
    };
    gift_message?: string | null; // Max 300 chars
    currency?: string;          // 'LKR' | 'USD' | 'GBP' | 'AUD' | 'CAD' | 'EUR'
    response_format?: string;   // 'markdown' | 'json'
  }
}
```

### Output (JSON mode)

```typescript
{
  checkout_url: string;         // Click to pay (no login required)
  order_ref: string;            // e.g. "ORD-20260520-7823"
  summary: {
    items_total: number;
    delivery_fee: number;
    addons_total: number;
    grand_total: number;
    currency: string;
  };
  expires_at: string;           // ISO 8601 - link valid for 60 minutes
}
```

### Error Codes
- `empty_cart`
- `missing_field`
- `past_delivery_date`
- `product_not_found`
- `product_out_of_stock`
- `city_not_deliverable`
- `date_not_deliverable`

### Rate Limit
- 30 orders/hour/IP

---

## 7. `kapruka_track_order`

**Purpose**: Track order status by order number (post-payment).

### Input Schema

```typescript
{
  params: {
    order_number: string;       // Required. Min 4, max 40 chars. e.g. 'VIMP34456CB2'
    response_format?: string;   // 'markdown' | 'json'
  }
}
```

### Output (JSON mode)

```typescript
{
  order_number: string;
  pnref: string;                // Internal payment reference
  status: string;               // received | confirmed | shipped | delivered | cancelled
  status_display: string;       // Human label
  order_date: string;           // Asia/Colombo formatted
  delivery_date: string;
  shipped_date: string | null;
  amount: string;               // LKR string e.g. "15500.00"
  payment_method: string;
  comments: string | null;
  recipient: { name: string; phone: string; address: string; city: string };
  greeting_message: string | null;
  special_instructions: string | null;
  progress: Array<{ step: string; timestamp: string }>;
  live_tracking_available: boolean;
  has_delivery_video: boolean;
  has_delivery_photo: boolean;
  items: Array<{
    product_id: string;
    name: string;
    quantity: number;
    selling_price: number;
  }>;
}
```

### Notes
- `order_number` is NOT the `order_ref` from create_order. It's assigned after payment.
- Delivery photo/video availability flagged.
