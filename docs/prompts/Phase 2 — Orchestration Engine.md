# Task: Phase 2 - AI Orchestration Engine

Read:

/docs/Kapruka AI Shopping Agent Challenge - Blueprint.md

Also review all documentation generated during Phase 1.

You are building the complete orchestration layer.

## Objectives

Implement:

- Bedrock integration
- MCP tool execution
- Vercel AI SDK orchestration
- Streaming responses
- Tool calling loop

## Requirements

Build the following architecture:

/
 ├── lib/
 │    ├── mcp-client.ts
 │    ├── mcp-tools.ts
 │    ├── ai/
 │      ├── bedrock.ts
 │      ├── system-prompt.ts
 │      ├── tool-registry.ts
 │      ├── tool-executor.ts
 │      ├── orchestrator.ts
 │
 ├── app/api/chat/route.ts

### Bedrock

Use:

@ai-sdk/amazon-bedrock

Implement:

- Claude Sonnet model initialization
- Centralized provider

### MCP Layer

Build:

MCPClient

Features:

- Connect
- Reconnect
- Tool discovery
- Tool execution
- Error recovery

### Tool Registry

Automatically map MCP tools into AI SDK tools.

Expected tools:

- search_products
- get_product
- list_categories
- list_delivery_cities
- check_delivery
- create_order
- track_order

### Orchestrator

Implement:

User Message
    ↓
Claude
    ↓
Tool Decision
    ↓
MCP Tool
    ↓
Tool Result
    ↓
Claude
    ↓
Streaming Response

### System Prompt

Design a production-grade system prompt.

Capabilities:

- Shopping assistant
- Sri Lankan context awareness
- Product recommendations
- Cart building
- Delivery guidance
- Checkout assistance

### Safety

Handle:

- Tool failures
- Invalid parameters
- Network failures
- MCP disconnects

### Deliverables

Generate:

- Full implementation
- Typescript types
- Error handling
- Logging
- Architecture documentation

Do not build UI yet.

Only backend orchestration.