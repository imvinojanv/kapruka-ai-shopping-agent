import { callTool, McpRateLimitError } from "@/lib/mcp-client";
import { 
  parseToolResult, 
  type ToolResult 
} from "@/lib/tool-result";

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

export async function executeTool(
  toolName: string,
  input: Record<string, unknown>
): Promise<ToolResult> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const raw = await callTool(toolName, input);
      return parseToolResult(raw);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (error instanceof McpRateLimitError) {
        return {
          ok: false,
          error: `Rate limit reached. Please wait ${Math.ceil(error.retryAfterMs / 1000)} seconds before trying again.`,
          code: "rate_limited",
        };
      }

      // Retry on transient network errors
      if (attempt < MAX_RETRIES && isTransientError(error)) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }

      break;
    }
  }

  return {
    ok: false,
    error: `Tool execution failed: ${lastError?.message ?? "Unknown error"}`,
    code: "execution_error",
  };
}

function isTransientError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes("econnreset") ||
      msg.includes("econnrefused") ||
      msg.includes("etimedout") ||
      msg.includes("socket hang up") ||
      msg.includes("fetch failed")
    );
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
