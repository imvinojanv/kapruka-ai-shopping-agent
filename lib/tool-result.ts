export type ToolResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

const ERROR_PATTERN = /^Error(?: \((\w+)\))?:\s*([\s\S]+)$/;

export function parseToolResult<T = unknown>(raw: string): ToolResult<T> {
  const errorMatch = raw.match(ERROR_PATTERN);
  if (errorMatch) {
    return {
      ok: false,
      error: errorMatch[2].trim(),
      code: errorMatch[1] || undefined,
    };
  }

  try {
    const data = JSON.parse(raw) as T;
    return { ok: true, data };
  } catch {
    // Non-JSON, non-error response (markdown or plain text)
    return { ok: true, data: raw as unknown as T };
  }
}

export function unwrapToolResult<T = unknown>(raw: string): T {
  const result = parseToolResult<T>(raw);
  if (!result.ok) {
    throw new ToolError(result.error, result.code);
  }
  return result.data;
}

export class ToolError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = "ToolError";
  }
}
