# Gap Analysis: Blueprint vs Actual MCP Capabilities

## Summary

The Kapruka MCP endpoint at `https://mcp.kapruka.com/mcp` is fully operational and exposes all 7 tools documented in the blueprint. The API is well-designed with comprehensive schemas, input validation, and helpful error codes. A few discrepancies between the blueprint's assumptions and the actual implementation are noted below.

---

## Blueprint Requirements vs Reality

### Transport Protocol

| Blueprint States | Actual Finding | Impact |
|-----------------|----------------|--------|
| "SSE Transport Protocol" | **StreamableHTTP** (modern `2025-03-26` protocol) | Low. MCP SDK handles both. Code should attempt StreamableHTTP first with SSE fallback. |

**Action**: Use `StreamableHTTPClientTransport` as primary. The SDK's backward-compatible client pattern handles this automatically.

---

### Tool Name Mapping

| Blueprint Name | Actual MCP Tool Name | Match |
|---------------|---------------------|-------|
| `search_products` | `kapruka_search_products` | Prefixed with `kapruka_` |
| `get_product` | `kapruka_get_product` | Prefixed |
| `list_categories` | `kapruka_list_categories` | Prefixed |
| `list_delivery_cities` | `kapruka_list_delivery_cities` | Prefixed |
| `check_delivery` | `kapruka_check_delivery` | Prefixed |
| `create_order` | `kapruka_create_order` | Prefixed |
| `track_order` | `kapruka_track_order` | Prefixed |

**Action**: All tool names have a `kapruka_` prefix. Use the actual names in tool definitions.

---

### Model Reference

| Blueprint States | Recommendation |
|-----------------|---------------|
| "Claude Sonnet 4" / `us.anthropic.claude-sonnet-4-20250514-v1:0` | Correct model ID confirmed |
| Bonus section mentions "Claude 3.5 Sonnet" | Ignore — this is a stale reference in the blueprint. Use Sonnet 4. |

---

### Input Schema Structure

**Blueprint assumption**: Tools accept flat parameters.
**Reality**: All tools wrap inputs in a `params` object:

```json
// Blueprint assumed:
{ "q": "birthday cake", "limit": 10 }

// Actual required format:
{ "params": { "q": "birthday cake", "limit": 10 } }
```

**Impact**: HIGH. Tool definitions for Vercel AI SDK must account for this wrapper. The system prompt must guide Claude to include the `params` wrapper when calling tools.

---

### Output Structure

**Blueprint assumption**: Tools return structured JSON objects.
**Reality**: All tools return `{ result: string }` where `result` is a serialized JSON or markdown string.

**Impact**: MEDIUM. Tool result handlers must:
1. Extract `result` from the MCP response
2. `JSON.parse(result)` to get the actual structured data
3. Handle cases where `result` is an error string (starts with "Error")

---

### Rate Limits

| Source | Limit | Notes |
|--------|-------|-------|
| Blueprint | 60 req/min/IP | General endpoint limit |
| `kapruka_create_order` description | 30 orders/hour/IP | Order-specific limit |
| `kapruka_search_products` description | 3 pages max per query | Pagination cap |

**Gap**: Blueprint only mentions the 60/min general limit. The per-tool limits are discovered only via tool descriptions. The order limit (30/hr) is unlikely to be hit in normal use.

---

### Features Documented in MCP But NOT in Blueprint

| Feature | Details |
|---------|---------|
| **Currency conversion** | All pricing tools support 6 currencies. Blueprint doesn't mention this. |
| **Price filtering** | Search supports `min_price` and `max_price`. Blueprint doesn't mention. |
| **Sort options** | 5 sort modes (relevance, price_asc, price_desc, newest, bestseller). |
| **Stock level granularity** | Products report `stock_level: low|medium|high`, not just boolean. |
| **Perishable warnings** | Built into `check_delivery` for CAKE/FLOWER/COMBO products. |
| **City aliases** | Delivery cities include vernacular spellings (useful for Sinhala/Tamil input). |
| **Icing text** | Cart items support optional `icing_text` for cakes. |
| **Delivery instructions** | Free-form field on orders. |
| **Checkout URL expiry** | 60-minute window explicitly returned. |
| **Idempotent order creation** | Auto-generated keys prevent duplicates on retry. |
| **Order tracking media** | `has_delivery_video` and `has_delivery_photo` flags. |
| **Annotations** | Each tool has MCP annotations (readOnlyHint, destructiveHint, etc.) |

---

### Blueprint Features NOT Found in MCP

| Blueprint Feature | MCP Coverage | Gap |
|------------------|--------------|-----|
| Gift wrapping configuration | Only `gift_message` field (300 chars) | No wrapping options in schema |
| Split billing profiles | Not supported | Single sender/recipient model only |
| Weight/volumetric size checks | Handled server-side transparently | No client-facing weight API |
| Cart management/editing | No update/delete endpoints | Must rebuild order from scratch |
| Product ratings/reviews | `rating: null` on all products | Not populated |
| Account/login system | Guest checkout only | No user auth flow needed |

---

### Validation Requirements Discovered

| Field | Constraint |
|-------|-----------|
| Search query (`q`) | Min 3 chars, no pure stopwords |
| Product ID | Min 3, max 80 chars |
| City name | Min 2, max 100 chars |
| Phone number | Min 7, max 30 chars, E.164 or local SL format |
| Address | Min 3, max 250 chars |
| Gift message | Max 300 chars |
| Icing text | Max 120 chars |
| Delivery instructions | Max 250 chars |
| Cart size | 1-30 items |
| Item quantity | 1-99 |
| Results per page | 1-50 |

---

## Risk Assessment

### High Priority

1. **Params wrapper requirement** — If the AI model doesn't consistently produce the `{ params: {...} }` wrapper, every tool call fails. Must be reinforced in system prompt and validated in tool execution layer.

2. **Double-parse output** — The `result` field is a string that needs parsing. If the AI tries to use it as-is, structured extraction breaks.

3. **Order number confusion** — `create_order` returns `order_ref` but `track_order` requires a different `order_number` (assigned post-payment). The UI must clearly explain this to users.

### Medium Priority

4. **3-page pagination cap** — For "show me more" style interactions, the agent must explain the limit and suggest refining the search rather than paginating indefinitely.

5. **Perishable date logic** — Server warns but doesn't block. The client should proactively prevent ordering perishables for far-future dates.

6. **City name matching** — Must use exact canonical names from `list_delivery_cities`. Fuzzy matching should happen client-side before calling `check_delivery`.

### Low Priority

7. **No cart persistence** — MCP is stateless. Cart must be maintained entirely client-side (Zustand + localStorage).

8. **Rating field always null** — Don't build rating UI components; they'll never have data.

9. **Transport fallback** — StreamableHTTP works now, but should still implement SSE fallback for resilience.

---

## Recommendations for Phase 2

1. **System Prompt Engineering**: Include explicit instruction for the `params` wrapper pattern and `response_format: 'json'` default.

2. **MCP Client Singleton**: Create a connection-pooled singleton that handles reconnection and rate limiting transparently.

3. **Tool Result Parser**: Build a utility that extracts `result` string, attempts `JSON.parse`, and falls back to raw string on error responses.

4. **Validation Layer**: Implement client-side validation matching the MCP schemas before sending — reduces wasted requests against rate limit.

5. **Streaming UI Strategy**: Since tool calls interrupt the stream, pre-render loading skeletons for known tool patterns (search → product cards, check_delivery → delivery widget).

6. **Localization Hook**: City aliases provide Sinhala/Tamil mappings — use these to normalize user input before city lookup.

7. **Order Flow State Machine**: Model the order lifecycle (browse → cart → validate delivery → create → redirect to pay → track) as explicit states in Zustand.
