# Task: Phase 1 - System Verification & MCP Discovery

You are a senior AI platform engineer.

Read and fully understand the challenge blueprint:

/docs/Kapruka AI Shopping Agent Challenge - Blueprint.md

Your goal is NOT to build the application yet.

Your objective is to perform complete infrastructure verification and MCP discovery.

## Requirements

1. Analyze the blueprint and extract:
   - MCP endpoint
   - Tool definitions
   - Expected architecture
   - Challenge constraints
   - Rate limits
   - Evaluation criteria

2. Verify Amazon Bedrock configuration:
   - Inspect environment variable usage
   - Validate Bedrock client initialization
   - Create a reusable Bedrock provider module

3. Build a local MCP inspection utility that:

   - Connects to:

     https://mcp.kapruka.com/mcp

   - Uses SSE transport

   - Enumerates:
     - Available tools
     - Tool schemas
     - Input payload structures
     - Output payload structures

4. Generate documentation:

   docs/
      mcp-analysis.md
      tool-schemas.md
      payload-examples.md
      architecture-notes.md

5. Create test scripts:

   scripts/
      inspect-mcp.ts
      test-bedrock.ts

6. Capture:

   - Raw JSON payloads
   - Tool metadata
   - Parameter types
   - Error responses
   - Validation requirements

7. Produce a gap-analysis report comparing:

   Blueprint requirements
   vs
   Actual MCP capabilities

## Deliverables

Generate:

- Source code
- Documentation
- Folder structure
- Architecture diagrams (Mermaid)
- Discovery reports

Do not proceed to UI development.

Do not implement chat.

Focus exclusively on verification, inspection, and documentation.

When complete provide:

1. Summary of findings
2. Risks discovered
3. Recommendations for Phase 2