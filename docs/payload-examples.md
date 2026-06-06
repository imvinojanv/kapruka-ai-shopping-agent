# Payload Examples

Example request/response payloads for each MCP tool. All examples use `response_format: 'json'`.

---

## 1. List Categories

### Request
```json
{
  "params": {
    "depth": 2,
    "response_format": "json"
  }
}
```

### Expected Response Shape
```json
{
  "categories": [
    {
      "name": "Birthday",
      "url": "https://www.kapruka.com/birthday",
      "children": [
        { "name": "Birthday Cakes", "url": "https://www.kapruka.com/birthday-cakes", "children": [] }
      ]
    },
    {
      "name": "Flowers",
      "url": "https://www.kapruka.com/flowers",
      "children": []
    }
  ]
}
```

---

## 2. Get Product

### Request
```json
{
  "params": {
    "product_id": "cake00ka002034",
    "currency": "LKR",
    "response_format": "json"
  }
}
```

### Expected Response Shape
```json
{
  "id": "cake00ka002034",
  "name": "Chocolate Fudge Cake 1kg",
  "description": "Rich dark chocolate fudge cake...",
  "summary": "1kg chocolate fudge cake",
  "price": { "amount": 4500.00, "currency": "LKR" },
  "compare_at_price": null,
  "in_stock": true,
  "stock_level": "high",
  "category": { "id": "cakes", "name": "Cakes", "slug": "cakes", "path": "Cakes > Chocolate" },
  "variants": [],
  "images": ["https://cdn.kapruka.com/img/cake00ka002034_1.jpg"],
  "attributes": { "type": "cake", "subtype": "chocolate", "weight": "1kg", "vendor": "Kapruka" },
  "shipping": { "ships_from": "Colombo", "ships_internationally": false, "restricted_countries": [] },
  "rating": null,
  "url": "https://www.kapruka.com/product/cake00ka002034"
}
```

---

## 3. Search Products

### Request
```json
{
  "params": {
    "q": "birthday cake",
    "category": "Cakes",
    "limit": 5,
    "currency": "LKR",
    "in_stock_only": true,
    "sort": "relevance",
    "response_format": "json"
  }
}
```

### Expected Response Shape
```json
{
  "results": [
    {
      "id": "cake00ka002034",
      "name": "Chocolate Fudge Cake 1kg",
      "summary": "Rich chocolate fudge cake",
      "price": { "amount": 4500.00, "currency": "LKR" },
      "compare_at_price": null,
      "in_stock": true,
      "stock_level": "high",
      "image_url": "https://cdn.kapruka.com/img/cake00ka002034_thumb.jpg",
      "category": { "id": "cakes", "name": "Cakes", "slug": "cakes" },
      "rating": null,
      "ships_internationally": false,
      "url": "https://www.kapruka.com/product/cake00ka002034"
    }
  ],
  "next_cursor": "eyJwYWdlIjoyLCJxIjoiYmlydGhkYXkgY2FrZSJ9",
  "applied_filters": { "q": "birthday cake", "limit": 5, "in_stock_only": true }
}
```

### Pagination (page 2)
```json
{
  "params": {
    "q": "birthday cake",
    "cursor": "eyJwYWdlIjoyLCJxIjoiYmlydGhkYXkgY2FrZSJ9",
    "limit": 5,
    "response_format": "json"
  }
}
```

---

## 4. List Delivery Cities

### Request
```json
{
  "params": {
    "query": "colombo",
    "limit": 10,
    "response_format": "json"
  }
}
```

### Expected Response Shape
```json
{
  "cities": [
    { "name": "Colombo 01", "aliases": ["Fort", "Colombo Fort"] },
    { "name": "Colombo 02", "aliases": ["Slave Island"] },
    { "name": "Colombo 03", "aliases": ["Kollupitiya", "Colpetty"] },
    { "name": "Colombo 04", "aliases": ["Bambalapitiya"] },
    { "name": "Colombo 05", "aliases": ["Havelock Town"] }
  ],
  "total_matched": 15,
  "showing": 10
}
```

---

## 5. Check Delivery

### Request
```json
{
  "params": {
    "city": "Colombo 03",
    "delivery_date": "2026-06-08",
    "product_id": "cake00ka002034",
    "response_format": "json"
  }
}
```

### Expected Response Shape (available)
```json
{
  "city": "Colombo 03",
  "now": "2026-06-06T20:30:00+05:30",
  "checked_date": "2026-06-08",
  "available": true,
  "rate": 350,
  "currency": "LKR",
  "reason": null,
  "next_available_date": null,
  "perishable_warning": "This is a perishable item (cake). Delivery is 2 days out - freshness may be affected."
}
```

### Expected Response Shape (unavailable)
```json
{
  "city": "Batticaloa",
  "now": "2026-06-06T20:30:00+05:30",
  "checked_date": "2026-06-07",
  "available": false,
  "rate": 800,
  "currency": "LKR",
  "reason": "Delivery not available on Sundays for this region",
  "next_available_date": "2026-06-08",
  "perishable_warning": null
}
```

---

## 6. Create Order

### Request
```json
{
  "params": {
    "cart": [
      { "product_id": "cake00ka002034", "quantity": 1, "icing_text": "Happy Birthday Nimal!" },
      { "product_id": "flower_rose_red_12", "quantity": 1 }
    ],
    "recipient": {
      "name": "Nimal Perera",
      "phone": "+94771234567"
    },
    "delivery": {
      "address": "42 Galle Road, Kollupitiya",
      "city": "Colombo 03",
      "location_type": "apartment",
      "date": "2026-06-08",
      "instructions": "Ring bell at gate, 3rd floor"
    },
    "sender": {
      "name": "Kamala Silva",
      "anonymous": false
    },
    "gift_message": "Wishing you a wonderful birthday! With love from Kamala.",
    "currency": "LKR",
    "response_format": "json"
  }
}
```

### Expected Response Shape
```json
{
  "checkout_url": "https://www.kapruka.com/checkout/pay/ORD-20260606-4521",
  "order_ref": "ORD-20260606-4521",
  "summary": {
    "items_total": 8200.00,
    "delivery_fee": 350.00,
    "addons_total": 0,
    "grand_total": 8550.00,
    "currency": "LKR"
  },
  "expires_at": "2026-06-06T16:30:00Z"
}
```

### Error Response Example
```json
"Error (past_delivery_date): Delivery date 2026-06-05 is in the past. Earliest available: 2026-06-06."
```

---

## 7. Track Order

### Request
```json
{
  "params": {
    "order_number": "VIMP34456CB2",
    "response_format": "json"
  }
}
```

### Expected Response Shape
```json
{
  "order_number": "VIMP34456CB2",
  "pnref": "123456789",
  "status": "shipped",
  "status_display": "Out for Delivery",
  "order_date": "June 05, 2026 2:30 PM",
  "delivery_date": "June 06, 2026",
  "shipped_date": "June 06, 2026 9:00 AM",
  "amount": "8550.00",
  "payment_method": "Visa ending 4242",
  "comments": null,
  "recipient": {
    "name": "Nimal Perera",
    "phone": "+94771234567",
    "address": "42 Galle Road, Kollupitiya",
    "city": "Colombo 03"
  },
  "greeting_message": "Wishing you a wonderful birthday!",
  "special_instructions": "Ring bell at gate, 3rd floor",
  "progress": [
    { "step": "Order Received", "timestamp": "2026-06-05T14:30:00+05:30" },
    { "step": "Payment Confirmed", "timestamp": "2026-06-05T14:35:00+05:30" },
    { "step": "Processing", "timestamp": "2026-06-06T08:00:00+05:30" },
    { "step": "Out for Delivery", "timestamp": "2026-06-06T09:00:00+05:30" }
  ],
  "live_tracking_available": true,
  "has_delivery_video": false,
  "has_delivery_photo": false,
  "items": [
    { "product_id": "cake00ka002034", "name": "Chocolate Fudge Cake 1kg", "quantity": 1, "selling_price": 4500.00 },
    { "product_id": "flower_rose_red_12", "name": "Red Roses Bouquet (12)", "quantity": 1, "selling_price": 3700.00 }
  ]
}
```

---

## Common Patterns

### All tools accept `response_format`
Always pass `"json"` for programmatic use. The `"markdown"` format is for human-readable chat display.

### Params wrapper
Every tool call wraps its arguments in a `params` object:
```json
{ "params": { ...actual_arguments } }
```

### Error format
Errors are returned as plain strings prefixed with `"Error"`:
- General: `"Error: <message>"`
- With code: `"Error (<code>): <message>"`

### Currency codes
Supported across all pricing tools: `LKR`, `USD`, `GBP`, `AUD`, `CAD`, `EUR`
