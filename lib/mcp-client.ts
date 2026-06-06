import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const MCP_ENDPOINT = "https://mcp.kapruka.com/mcp";
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60_000;

class RateLimiter {
  private timestamps: number[] = [];

  canProceed(): boolean {
    this.prune();
    return this.timestamps.length < RATE_LIMIT_MAX;
  }

  record(): void {
    this.timestamps.push(Date.now());
  }

  remaining(): number {
    this.prune();
    return RATE_LIMIT_MAX - this.timestamps.length;
  }

  msUntilNext(): number {
    if (this.canProceed()) return 0;
    const oldest = this.timestamps[0];
    return oldest + RATE_LIMIT_WINDOW_MS - Date.now();
  }

  private prune(): void {
    const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;
    while (this.timestamps.length > 0 && this.timestamps[0] <= cutoff) {
      this.timestamps.shift();
    }
  }
}

let clientInstance: Client | null = null;
let connectionPromise: Promise<Client> | null = null;
const rateLimiter = new RateLimiter();

async function connect(): Promise<Client> {
  const url = new URL(MCP_ENDPOINT);

  // Try StreamableHTTP first, fall back to SSE
  try {
    const client = new Client({
      name: "kapruka-shopping-agent",
      version: "1.0.0",
    });
    const transport = new StreamableHTTPClientTransport(url);
    await client.connect(transport);
    return client;
  } catch {
    const client = new Client({
      name: "kapruka-shopping-agent",
      version: "1.0.0",
    });
    const transport = new SSEClientTransport(url);
    await client.connect(transport);
    return client;
  }
}

export async function getMcpClient(): Promise<Client> {
  if (clientInstance) return clientInstance;

  if (!connectionPromise) {
    connectionPromise = connect().then((client) => {
      clientInstance = client;
      client.onclose = () => {
        clientInstance = null;
        connectionPromise = null;
      };
      return client;
    });
  }

  return connectionPromise;
}

export async function callTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<string> {
  if (!rateLimiter.canProceed()) {
    const waitMs = rateLimiter.msUntilNext();
    throw new McpRateLimitError(
      `Rate limit reached (${RATE_LIMIT_MAX}/min). Retry in ${Math.ceil(waitMs / 1000)}s.`,
      waitMs
    );
  }

  const client = await getMcpClient();
  rateLimiter.record();

  const result = await client.callTool({
    name: toolName,
    arguments: args,
  });

  // MCP tools return content array with text items
  const textContent = (result.content as Array<{ type: string; text?: string }>)
    .filter((c) => c.type === "text")
    .map((c) => c.text)
    .join("");

  return textContent;
}

export function getRateLimitStatus() {
  return {
    remaining: rateLimiter.remaining(),
    max: RATE_LIMIT_MAX,
    canProceed: rateLimiter.canProceed(),
    msUntilNext: rateLimiter.msUntilNext(),
  };
}

export class McpRateLimitError extends Error {
  constructor(
    message: string,
    public readonly retryAfterMs: number
  ) {
    super(message);
    this.name = "McpRateLimitError";
  }
}
