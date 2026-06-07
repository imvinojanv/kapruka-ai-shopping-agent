import { createToolRegistry } from "../lib/ai/tool-registry";

const tools = createToolRegistry();
const toolNames = Object.keys(tools);

console.log(`=== Tool Registry Test ===`);
console.log(`Tools registered: ${toolNames.length}`);
toolNames.forEach((name) => console.log(`  - ${name}`));

if (toolNames.length === 7) {
  console.log("\n✓ All 7 tools registered successfully.");
} else {
  console.error(`\n✗ Expected 7 tools, got ${toolNames.length}`);
  process.exit(1);
}
