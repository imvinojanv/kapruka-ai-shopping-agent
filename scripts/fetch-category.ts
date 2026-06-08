import { callTool } from "../lib/mcp-client";

async function main() {
  const raw = await callTool("kapruka_list_categories", {
    params: { depth: 2, response_format: "json" },
  });
  const data = JSON.parse(raw);
  // Show first 3 categories with full structure
  console.log(JSON.stringify(data.categories.slice(0, 3), null, 2));
}

main();
