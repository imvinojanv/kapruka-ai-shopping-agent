import { type UIMessage } from "ai";
import { createChatStream } from "@/lib/ai/orchestrator";
import { auth } from "@/lib/auth";
import type { CartItem } from "@/lib/store";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages, cart }: { messages: UIMessage[]; cart?: CartItem[] } =
    await request.json();

  const result = await createChatStream(messages, cart);

  return result.toUIMessageStreamResponse();
}
