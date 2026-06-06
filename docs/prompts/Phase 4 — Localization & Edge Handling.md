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

## Localization

Create advanced prompt instructions that support:

Sinhala Examples:

"මට කේක් එකක් ඕන"

Tanglish Examples:

"mata hoda cake ekak one"

"sirawatama hoda cake ekak deepan"

Requirements:

- Intent understanding
- Product extraction
- Delivery city extraction
- Checkout guidance

### Prompt Engineering

Create:

src/ai/localization-prompt.ts

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
- User feedback
- Retry strategy
- Graceful degradation

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