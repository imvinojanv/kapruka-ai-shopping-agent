import {
  streamText,
  convertToModelMessages,
  stepCountIs,
  type UIMessage
} from "ai";

import { shoppingAgentModel } from "@/lib/bedrock";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";
import { createToolRegistry } from "@/lib/ai/tool-registry";
import type { CartItem } from "@/lib/store";

function buildSystemPrompt(cart?: CartItem[]): string {
  if (!cart || cart.length === 0) {
    return SYSTEM_PROMPT + "\n\n## Current Cart\n\nThe customer's cart is currently EMPTY. If they ask to place an order or checkout, let them know they need to add products first.";
  }

  const cartLines = cart.map(
    (item, i) => `${i + 1}. ${item.name} (ID: ${item.productId}) — Qty: ${item.quantity} — ${item.currency} ${item.price.toLocaleString()}`
  );
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const currency = cart[0].currency;

  return SYSTEM_PROMPT + `\n\n## Current Cart

The customer has ${cart.length} item(s) in their cart:

${cartLines.join("\n")}

**Subtotal:** ${currency} ${total.toLocaleString()}

When the customer wants to place an order or checkout, use these products from the cart. Do NOT ask them what products they want — they've already selected them. Proceed directly to collecting delivery and recipient details (use the interactive form).`;
}

export async function createChatStream(messages: UIMessage[], cart?: CartItem[]) {
  const tools = createToolRegistry();
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: shoppingAgentModel,
    system: buildSystemPrompt(cart),
    messages: modelMessages,
    tools,
    stopWhen: stepCountIs(10),
    onStepFinish({ toolCalls }) {
      if (toolCalls.length > 0) {
        console.log(
          `[orchestrator] Tool step: ${toolCalls.map((tc) => tc.toolName).join(", ")}`
        );
      }
    },
    onFinish({ steps, usage }) {
      console.log(
        `[orchestrator] Finished: ${steps.length} steps, ${usage.inputTokens} in / ${usage.outputTokens} out`
      );
    },
    onError({ error }) {
      console.error("[orchestrator] Stream error:", error);
    },
  });

  return result;
}
