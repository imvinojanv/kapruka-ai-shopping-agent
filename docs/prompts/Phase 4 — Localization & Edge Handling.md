# Task: Phase 4 - Localization, Safety & Reliability

Read:

/docs/Kapruka AI Shopping Agent Challenge - Blueprint.md

Review all existing implementation.

Focus on:

- Sinhala support
- Tanglish support
- Guardrails
- Rate limiting
- Error resilience

## MCP Schema Compliance

Before tool execution:

- Remove unknown fields
- Validate against strict Zod schemas
- Enforce additionalProperties:false

Never send malformed payloads to MCP.

## Localization

Create advanced prompt instructions that support:

Sinhala Examples:

"මට කේක් එකක් ඕන"

Tamil Examples:

"எனக்கு ஒரு கேக் வேண்டும்"

Tanglish Examples:

"mata hoda cake ekak one"

"enakku oru cake vendum"

Requirements:

- Intent understanding
- Product extraction
- Delivery city extraction
- Checkout guidance

### Prompt Engineering

Create:

lib/ai/localization-prompt.ts

Add:

- Examples
- Few-shot samples
- Transliteration guidance
- Sri Lankan shopping context

## Rate Limiting

Challenge limit:

60 requests per minute

Implement:

- Server-side limiter
- Client-side debouncing
- User feedback
- Retry strategy
- Graceful degradation
- Exponential backoff

Never crash UI.

## Validation

Implement:

### Phone Validation

Sri Lanka formats:

+947xxxxxxxx

07xxxxxxxx

### Delivery Validation

Validate:

- Delivery city
- Delivery date
- Delivery availability

### Order Tracking Validation

Important:

order_ref returned by create_order
≠
tracking identifier used by track_order

The assistant must explain this distinction.

If a user attempts tracking using order_ref:

- Explain the difference
- Request the correct order number

### Gift Validation

Validate:

- Gift note length
- Delivery recipient

### Perishable Item Validation

Detect:

- Cakes
- Flowers
- Fresh products

Prevent:

- Past dates
- Impossible delivery schedules

## Pagination Guardrails

The MCP service limits catalog exploration.

Implement:

- Search refinement prompts
- Query optimization
- Result narrowing

Avoid excessive category traversal.

## Error Recovery

Handle:

- MCP timeout
- SSE disconnect
- Bedrock failure
- Invalid tool response

## Deliverables

Generate:

- Validation library
- Middleware
- Prompt updates
- Localization testing suite
- Reliability documentation

Provide test scenarios covering:

- Sinhala
- Tamil
- Tanglish
- Mixed language input