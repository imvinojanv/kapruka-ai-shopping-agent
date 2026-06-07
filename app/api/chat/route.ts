import { type UIMessage } from "ai";
import { createChatStream } from "@/lib/ai/orchestrator";

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  const result = await createChatStream(messages);

  return result.toUIMessageStreamResponse();
}
