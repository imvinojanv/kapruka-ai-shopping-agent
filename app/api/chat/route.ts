import { type UIMessage } from "ai";
import { createChatStream } from "@/lib/ai/orchestrator";
import type { CartItem } from "@/lib/store";

export async function POST(request: Request) {
  const { messages, cart }: { messages: UIMessage[]; cart?: CartItem[] } =
    await request.json();

  const result = await createChatStream(messages, cart);

  return result.toUIMessageStreamResponse();
}
