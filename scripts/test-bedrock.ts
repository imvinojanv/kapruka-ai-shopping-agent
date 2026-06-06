/**
 * Bedrock Connectivity Test
 * Verifies AWS credentials and model access.
 */
import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { generateText } from "ai";

async function main() {
  console.log("=== Amazon Bedrock Connectivity Test ===\n");

  // Check environment variables
  const envVars = ["AWS_REGION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"];
  const missing: string[] = [];

  for (const key of envVars) {
    if (process.env[key]) {
      console.log(`  ✓ ${key} is set`);
    } else {
      console.log(`  ✗ ${key} is missing`);
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.log(
      `\n✗ Missing environment variables: ${missing.join(", ")}`
    );
    console.log("  Create a .env.local file with the required variables.");
    console.log("  See .env.example for the template.");
    process.exit(1);
  }

  const region = process.env.AWS_REGION || "us-east-1";
  console.log(`\nRegion: ${region}`);
  console.log("Model:  us.anthropic.claude-sonnet-4-5-20250929-v1:0");

  // Attempt a minimal generation
  console.log("\nSending test prompt...");

  try {
    const bedrock = createAmazonBedrock({
      region,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    const model = bedrock("us.anthropic.claude-sonnet-4-5-20250929-v1:0");

    const { text, usage } = await generateText({
      model,
      prompt: "Reply with exactly: BEDROCK_OK",
      maxOutputTokens: 120,
    });

    if (text.includes("BEDROCK_OK")) {
      console.log(`  ✓ Model responded correctly: "${text.trim()}"`);
    } else {
      console.log(`  ⚠ Unexpected response: "${text.trim()}"`);
    }

    console.log(`  Tokens used: ${usage.inputTokens} in / ${usage.outputTokens} out`);
    console.log("\n✓ Bedrock connectivity verified successfully.");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`\n✗ Bedrock test failed: ${msg}`);

    if (msg.includes("credentials")) {
      console.log("  → Check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY");
    } else if (msg.includes("region")) {
      console.log("  → Check AWS_REGION value");
    } else if (msg.includes("AccessDenied")) {
      console.log("  → IAM policy may not include bedrock:InvokeModel permission");
    }

    process.exit(1);
  }
}

main();
