import { 
  streamText, 
  convertToModelMessages, 
  stepCountIs, 
  type UIMessage 
} from "ai";

import { shoppingAgentModel } from "@/lib/bedrock";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";
import { createToolRegistry } from "@/lib/ai/tool-registry";

export async function createChatStream(messages: UIMessage[]) {
  const tools = createToolRegistry();
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: shoppingAgentModel,
    system: SYSTEM_PROMPT,
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
