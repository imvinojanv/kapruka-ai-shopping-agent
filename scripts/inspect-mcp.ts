/**
 * MCP Inspection Utility
 * Connects to Kapruka MCP endpoint, enumerates tools, and captures schemas.
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { writeFileSync } from "fs";
import { resolve } from "path";

const MCP_ENDPOINT = "https://mcp.kapruka.com/mcp";
const OUTPUT_DIR = resolve(import.meta.dirname, "../docs");

interface ToolSchema {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
}

interface InspectionResult {
  endpoint: string;
  transportUsed: string;
  serverInfo: Record<string, unknown> | null;
  capabilities: Record<string, unknown> | null;
  tools: ToolSchema[];
  timestamp: string;
  errors: string[];
}

async function connectToMCP(): Promise<{
  client: Client;
  transportType: string;
}> {
  const url = new URL(MCP_ENDPOINT);

  // Try StreamableHTTP first (modern), fall back to SSE (legacy)
  const client = new Client({
    name: "kapruka-mcp-inspector",
    version: "1.0.0",
  });

  try {
    console.log("[1/3] Trying StreamableHTTP transport...");
    const transport = new StreamableHTTPClientTransport(url);
    await client.connect(transport);
    console.log("  ✓ Connected via StreamableHTTP");
    return { client, transportType: "streamable-http" };
  } catch (err) {
    console.log(
      `  ✗ StreamableHTTP failed: ${err instanceof Error ? err.message : err}`
    );
  }

  try {
    console.log("[1/3] Falling back to SSE transport...");
    const sseClient = new Client({
      name: "kapruka-mcp-inspector",
      version: "1.0.0",
    });
    const sseTransport = new SSEClientTransport(url);
    await sseClient.connect(sseTransport);
    console.log("  ✓ Connected via SSE");
    return { client: sseClient, transportType: "sse" };
  } catch (err) {
    throw new Error(
      `Both transports failed. SSE error: ${err instanceof Error ? err.message : err}`
    );
  }
}

async function listTools(client: Client): Promise<ToolSchema[]> {
  console.log("[2/3] Enumerating tools...");
  const result = await client.listTools();
  const tools: ToolSchema[] = (result as any).tools || [];
  console.log(`  ✓ Found ${tools.length} tools`);
  return tools;
}

async function main() {
  const result: InspectionResult = {
    endpoint: MCP_ENDPOINT,
    transportUsed: "",
    serverInfo: null,
    capabilities: null,
    tools: [],
    timestamp: new Date().toISOString(),
    errors: [],
  };

  try {
    const { client, transportType } = await connectToMCP();
    result.transportUsed = transportType;
    result.serverInfo = (client as any).serverVersion ?? (client as any).getServerVersion?.() ?? null;
    result.capabilities = (client as any).serverCapabilities ?? (client as any).getServerCapabilities?.() ?? null;

    const tools = await listTools(client);
    result.tools = tools;

    console.log("\n[3/3] Writing results...");

    // Write full inspection result
    const outputPath = resolve(OUTPUT_DIR, "mcp-inspection-raw.json");
    writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`  ✓ Raw data: ${outputPath}`);

    // Write tool schemas
    const schemasPath = resolve(OUTPUT_DIR, "tool-schemas-raw.json");
    writeFileSync(schemasPath, JSON.stringify(tools, null, 2));
    console.log(`  ✓ Tool schemas: ${schemasPath}`);

    // Print summary
    console.log("\n=== INSPECTION SUMMARY ===");
    console.log(`Endpoint:  ${MCP_ENDPOINT}`);
    console.log(`Transport: ${transportType}`);
    console.log(`Tools:     ${tools.length}`);
    console.log("");

    for (const tool of tools) {
      console.log(`  [${tool.name}]`);
      if (tool.description) {
        console.log(`    ${tool.description}`);
      }
      if (tool.inputSchema) {
        const props = (tool.inputSchema as any).properties || {};
        const required = (tool.inputSchema as any).required || [];
        const paramNames = Object.keys(props);
        if (paramNames.length > 0) {
          console.log(`    Params: ${paramNames.join(", ")}`);
          if (required.length > 0) {
            console.log(`    Required: ${required.join(", ")}`);
          }
        }
      }
      console.log("");
    }

    await client.close();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    result.errors.push(msg);
    console.error(`\n✗ Error: ${msg}`);

    // Still write partial results
    const outputPath = resolve(OUTPUT_DIR, "mcp-inspection-raw.json");
    writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`  Partial results saved to: ${outputPath}`);
    process.exit(1);
  }
}

main();
