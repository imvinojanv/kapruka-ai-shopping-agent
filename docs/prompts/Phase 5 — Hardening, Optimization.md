# Task: Phase 5 - Production Hardening & Final Delivery

Read:

/docs/Kapruka AI Shopping Agent Challenge - Blueprint.md

Review every implementation completed so far.

Your goal is to transform the project into a competition-ready submission.

## Objectives

1. End-to-end validation
2. Performance optimization
3. Deployment readiness
4. Demo readiness
5. Judging optimization

## Validation

Test complete flows:

Product Search
→ Product Detail
→ Delivery Check
→ Cart
→ Order Creation
→ Checkout

Also test:

- Multi-item carts
- Mixed categories
- Invalid products
- Invalid delivery cities

## Performance

Audit:

- Bundle size
- Re-renders
- Streaming latency
- Animation performance
- Network requests

Optimize:

- React rendering
- Zustand selectors
- Dynamic imports
- Server Components
- Edge compatibility

## Observability

Implement:

- Structured logging
- Error monitoring hooks
- Tool execution tracking
- User session tracing

## Deployment

Prepare:

- Vercel deployment
- Environment validation
- Production configuration

Create:

scripts/
   validate-env.ts

## Documentation

Generate:

README.md

Include:

- Architecture
- Setup
- Environment variables
- Development workflow
- Deployment guide

Generate:

docs/
   architecture.md
   deployment.md
   testing.md
   challenge-submission.md

## Demo Preparation

Create:

demo-script.md

Cover:

1. Product search
2. Sinhala request
3. Tanglish request
4. Gift purchase
5. Delivery calculation
6. Order creation
7. Order tracking

## Rate Limit Load Testing

Create automated tests for:

10 req/min
30 req/min
60 req/min

Verify:

- graceful degradation
- retry behavior
- user feedback

## MCP Compliance Audit

Validate:

✓ Every tool uses params wrapper

✓ Every response parses result.result

✓ No extra fields sent

✓ Server-side MCP execution only

✓ Retry logic works

✓ Pagination safeguards work

✓ Checkout expiry handled

✓ Order tracking flow validated

## Multi-Step Shopping Tests

Test:

1. Search → Delivery → Checkout

2. Multi-item cart creation

3. Sinhala shopping journey

4. Tanglish shopping journey

5. Gift purchase flow

6. Expired checkout link

7. Invalid tracking number

8. MCP outage recovery

## Final Audit

Produce:

FINAL_REVIEW.md

Include:

- Challenge compliance checklist
- Judging rubric mapping
- Risks
- Known limitations
- Future improvements

Only finish when the application is fully production-ready and deployable.