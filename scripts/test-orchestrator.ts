/**
 * Full Orchestration Test
 * Tests: Bedrock → Claude → Tool Calls → MCP → Streamed Response
 *
 * Usage: npx tsx --env-file=.env.local scripts/test-orchestrator.ts
 */
import { createChatStream } from "../lib/ai/orchestrator";
import type { UIMessage } from "ai";

const TEST_QUERIES = [
  "What product categories does Kapruka have?",
  "Search for chocolates",
  "Can you deliver to Colombo 03 tomorrow?",
];

async function testQuery(query: string, index: number) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`[Test ${index + 1}] "${query}"`);
  console.log("=".repeat(60));

  const messages: UIMessage[] = [
    {
      id: `msg-${index}`,
      role: "user",
      parts: [{ type: "text", text: query }],
    },
  ];

  try {
    const result = await createChatStream(messages);

    process.stdout.write("\nAssistant: ");
    for await (const chunk of result.textStream) {
      process.stdout.write(chunk);
    }
    console.log("\n");
  } catch (error) {
    console.error(
      "\n✗ Error:",
      error instanceof Error ? error.message : error
    );
  }
}

async function main() {
  console.log("=== Full Orchestration Test ===");
  console.log("Model: us.anthropic.claude-sonnet-4-5-20250929-v1:0");
  console.log("MCP:   https://mcp.kapruka.com/mcp");

  // Run just the first query by default, or all with --all flag
  const runAll = process.argv.includes("--all");
  const queries = runAll ? TEST_QUERIES : [TEST_QUERIES[0]];

  for (let i = 0; i < queries.length; i++) {
    await testQuery(queries[i], i);
  }

  console.log("\n✓ Orchestration test complete.");
}

main();
