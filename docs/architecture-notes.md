# Architecture Notes

## System Architecture

```mermaid
graph TB
    subgraph "Browser"
        UI[React 19 Chat UI]
        ZS[Zustand Store<br/>Cart + Messages + Session]
        FM[Framer Motion<br/>Animations]
    end
    
    subgraph "Next.js 16 Server"
        SA[Server Actions / Route Handlers]
        AISDK[Vercel AI SDK<br/>streamText / generateText]
        MCP_CLIENT[MCP Client<br/>StreamableHTTP Transport]
        TOOLS[Tool Definitions<br/>7 Kapruka tools]
    end
    
    subgraph "External Services"
        BRK[Amazon Bedrock<br/>us-east-1]
        CS4[Claude Sonnet 4<br/>us.anthropic.claude-sonnet-4-20250514-v1:0]
        KMCP[Kapruka MCP<br/>mcp.kapruka.com/mcp]
    end
    
    UI --> SA
    SA --> AISDK
    AISDK --> BRK
    BRK --> CS4
    CS4 -- "tool_use" --> AISDK
    AISDK --> MCP_CLIENT
    MCP_CLIENT --> KMCP
    KMCP --> MCP_CLIENT
    MCP_CLIENT --> AISDK
    AISDK -- "stream" --> SA
    SA -- "stream" --> UI
    UI --> ZS
    ZS --> UI
    FM --> UI
```

## Data Flow: Complete Shopping Conversation

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Chat UI
    participant API as Next.js API
    participant AI as AI SDK + Bedrock
    participant MCP as Kapruka MCP

    U->>UI: "Show me birthday cakes"
    UI->>API: POST /api/chat (messages)
    API->>AI: streamText(model, messages, tools)
    AI->>AI: Claude decides: search_products
    AI-->>API: tool_call: kapruka_search_products
    API->>MCP: StreamableHTTP: tools/call
    MCP-->>API: {results: [...]}
    API->>AI: tool_result → continue generation
    AI-->>API: Streamed text + product data
    API-->>UI: Stream chunks
    UI->>UI: Render product cards (Generative UI)
    
    U->>UI: "Can you deliver this to Colombo 03 on Saturday?"
    UI->>API: POST /api/chat (messages + context)
    API->>AI: streamText(...)
    AI->>AI: Claude decides: check_delivery
    AI-->>API: tool_call: kapruka_check_delivery
    API->>MCP: StreamableHTTP: tools/call
    MCP-->>API: {available: true, rate: 350}
    API->>AI: tool_result → continue
    AI-->>API: "Yes! Delivery available..."
    API-->>UI: Stream
    
    U->>UI: "Order it for Nimal"
    UI->>API: POST /api/chat
    API->>AI: streamText(...)
    AI-->>API: tool_call: kapruka_create_order
    API->>MCP: StreamableHTTP: tools/call
    MCP-->>API: {checkout_url: "...", order_ref: "..."}
    API->>AI: tool_result
    AI-->>API: "Order created! Click to pay..."
    API-->>UI: Stream + checkout link
```

## Key Design Decisions

### 1. Server-Side MCP Connection Only

The MCP client MUST run server-side (API routes / server actions). Reasons:
- AWS credentials are never exposed to the browser
- Rate limiting is per-IP; a single server IP makes tracking predictable
- StreamableHTTP transport requires persistent connections

### 2. Tool Registration with Vercel AI SDK

The AI SDK's `tools` parameter maps MCP tools to Claude's tool-calling format:

```typescript
const tools = {
  kapruka_search_products: {
    description: "...",
    parameters: z.object({
      params: z.object({
        q: z.string().min(3),
        // ... rest of schema
      })
    }),
    execute: async (args) => {
      // Call MCP tool via client
      return await mcpClient.callTool("kapruka_search_products", args);
    }
  }
};
```

### 3. Streaming Architecture

- Use `streamText()` for real-time token streaming
- Tool calls are executed mid-stream
- `useChat()` hook on client handles stream parsing
- Generative UI components render from structured tool results

### 4. State Management

```
Zustand Store
├── messages[]         - Chat history (persisted to localStorage)
├── cart[]             - Shopping cart items
├── deliveryInfo       - Selected city, date, address
├── recipientInfo      - Name, phone
└── sessionId          - For server-side state correlation
```

### 5. Rate Limiting Strategy

| Approach | Implementation |
|----------|---------------|
| Client-side throttle | Debounce user input, queue tool calls |
| Request counting | Track calls/minute in server memory |
| Graceful degradation | Show "busy" state, retry with backoff |
| Order limit | Max 30/hr is generous; unlikely to hit |

### 6. Error Recovery

```mermaid
graph LR
    A[Tool Call] --> B{Success?}
    B -->|Yes| C[Return Result]
    B -->|No| D{Retryable?}
    D -->|Yes| E[Exponential Backoff]
    E --> A
    D -->|No| F[Return Error to Claude]
    F --> G[Claude explains to user]
```

## File Structure (Target)

```
kapruka-ai-shopping-agent/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Chat interface
│   ├── globals.css
│   └── api/
│       └── chat/
│           └── route.ts            # AI SDK streaming endpoint
├── lib/
│   ├── bedrock.ts                  # Bedrock client config
│   ├── mcp-client.ts              # MCP connection manager
│   ├── tools.ts                    # Tool definitions for AI SDK
│   └── store.ts                    # Zustand store
├── components/
│   ├── chat/
│   │   ├── chat-container.tsx
│   │   ├── message-bubble.tsx
│   │   └── input-bar.tsx
│   ├── products/
│   │   ├── product-card.tsx
│   │   └── product-carousel.tsx
│   ├── delivery/
│   │   ├── city-selector.tsx
│   │   └── date-picker.tsx
│   └── order/
│       ├── cart-summary.tsx
│       └── checkout-link.tsx
├── scripts/
│   ├── inspect-mcp.ts
│   └── test-bedrock.ts
├── docs/
│   ├── mcp-analysis.md
│   ├── tool-schemas.md
│   ├── payload-examples.md
│   └── architecture-notes.md
└── .env.local                      # AWS credentials (gitignored)
```

## Technology Constraints

| Constraint | Impact |
|-----------|--------|
| Next.js 16 (App Router) | Must use server components, route handlers, streaming |
| React 19 | Server components, use() hook, transitions |
| `additionalProperties: false` on all MCP inputs | No extra fields allowed; strict schema adherence |
| Output is always `{ result: string }` | Must JSON.parse the result string even in JSON mode |
| 3-page pagination cap | Cannot enumerate full catalog; search must be targeted |
| 60 req/min rate limit | ~1 request/second sustained; multi-tool chains need care |
| Checkout URL expires in 60 min | Must communicate urgency to user |

## Critical Implementation Notes

1. **Params wrapper**: Every tool call wraps arguments in `{ params: {...} }`. The AI must be prompted to do this correctly.

2. **Double-parse outputs**: The MCP returns `{ result: "..." }` where `result` is a JSON string. You must `JSON.parse(result.result)` to get structured data.

3. **Perishable date validation**: The MCP server handles this, but the UI should also prevent past-date selection client-side for better UX.

4. **Order number vs order_ref**: After `create_order`, the user gets an `order_ref`. But `track_order` needs the actual order number from the payment confirmation email — these are different identifiers.

5. **City name matching**: Use `list_delivery_cities` output verbatim as input to `check_delivery` and `create_order`. Don't normalize or abbreviate.
