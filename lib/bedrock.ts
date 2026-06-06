import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";

export const bedrockClient = createAmazonBedrock({
  region: process.env.AWS_REGION || "us-east-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export const shoppingAgentModel = bedrockClient(
  "us.anthropic.claude-sonnet-4-5-20250929-v1:0"
);

// us.anthropic.claude-sonnet-4-5-20250929-v1:0[1m]  Custom Sonnet model (1M context)
// us.anthropic.claude-opus-4-6-v1[1m]               Custom Opus model (1M context)
// us.anthropic.claude-haiku-4-5-20251001-v1:0       Custom Haiku model