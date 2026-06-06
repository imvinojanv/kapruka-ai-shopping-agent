# **Project Blueprint: Kapruka AI Shopping Agent Challenge**

This document establishes the comprehensive technical architecture, baseline challenge parameters, evaluation rubrics, and enhanced user experience designs for participating in the Kapruka AI Shopping Agent Challenge.

## **1\. Challenge Rules, Regulations, and Guidelines**

* **Eligibility:** Open exclusively to solo developers residing and operating within Sri Lanka. This competition is not open to the diaspora or multi-person agencies.  
* **Submission Deadline:** All operational codebases, live deployment links, and demonstration repositories must be submitted by **June 30, 2026**.  
* **Deployment Mandate:** The application must be deployed publicly and remain fully operational via a stable URL (e.g., Vercel edge networks) for judging.  
* **Rate Limits:** Submissions must handle Kapruka's public MCP endpoint throttling limits, which are strictly capped at **60 requests per minute per client IP address**. Exceeding this should be managed gracefully in the client UI without throwing application fatal faults.

## **2\. Project Technical Stack Definition**

To deliver a highly fluid, type-safe, and low-latency implementation capable of handling complex tool execution, the blueprint enforces the following technical baseline:

| Layer | Technology Chosen | Implementation Rationale   |
| :---- | :---- | :---- |
| **Frontend Framework** | Next.js 16 (App Router) with Zustand for global state management | Leverages React 19 server components and server actions to abstract orchestration securely away from public browser networks. Enables streaming UI states natively. |
| **Styling & Animations** | Tailwind CSS \+ Shadcn UI \+ Framer Motion | Ensures clean layout control, utility-first consistency, pre-built accessible primitives, and fluid structural animations for dynamic UI card transitions. |
| **AI Orchestration** | Vercel AI SDK Core & UI components | Industry-standard protocol wrappers designed to easily consume multi-turn stream generation, automated assistant tool calling, and active state management. |
| **Model Provider** | Amazon Bedrock (\`@ai-sdk/amazon-bedrock\`) | Secures private infrastructure piping into enterprise-grade models via custom AWS access configurations, preventing prompt/data exposure. |
| **MCP Integration** | Model Context Protocol Client SDK | Establishes a standardized JSON-RPC link over Server-Sent Events (SSE) to map external retail capabilities directly into the model context window. |

## 

## 

## **3\. Kapruka MCP & AI Model Specifications**

### **Model Profile**

The system leverages **Anthropic Claude Sonnet 4** hosted on Amazon Bedrock. This choice provides industry-leading tool-calling precision, deep contextual understanding of long product catalogs, and exceptional performance in complex localization formatting.

### **AWS Bedrock Client Initialization (Server Context)**

import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';

export const bedrockClient \= createAmazonBedrock({  
  region: process.env.AWS\_REGION || 'us-east-1',  
  accessKeyId: process.env.AWS\_ACCESS\_KEY\_ID,  
  secretAccessKey: process.env.AWS\_SECRET\_ACCESS\_KEY,  
});

export const shoppingAgentModel \= bedrockClient('us.anthropic.claude-sonnet-4-20250514-v1:0');

### **Kapruka MCP Target Server**

The application interacts directly with the official, live remote Kapruka endpoint via SSE Transport Protocol:

* **Production Server Address:**  
  https://mcp.kapruka.com/mcp

### **Exposed Capabilities Mapping**

The application coordinates user chat intents against the 7 foundational backend operations exposed by the protocol layer:

1. **search\_products:** Parameterized catalog matching over keyword vectors.  
2. **get\_product:** High-fidelity detail matching for isolated stock-keeping units (SKUs).  
3. **list\_categories:** Structural exploration of the commercial departmental hierarchy.  
4. **list\_delivery\_cities:** Geo-spatial matching to verify valid shipping destination vectors within Sri Lanka.  
5. **check\_delivery:** Dynamic operational rules check mapping weight, volumetric size, and product category constraints to isolated delivery destinations and lead times.  
6. **create\_order:** Compilation of cart array state and buyer profile payload into a single atomic transactional unit, returning a secure checkout gateway URL.  
7. **track\_order:** Real-time execution checking on active invoices and logistics status.

## **4\. Core & Enhanced Interactive Capabilities**

To exceed basic conversational design constraints, this application deploys interactive, real-time widgets and smart validation filters instead of relying purely on text-based outputs.

### **Interactive Generative UI Cards**

The solution intercepts standard text outputs and streams contextual visual components directly inside the conversation thread:

* **Product Showcases:** Product suggestions render as rich multi-attribute interactive carousels with embedded carousels, pricing conversions, and inline quantities selectors.  
* **Dynamic Delivery Calculator Widget:** Instead of asking the user to type addresses repeatedly, the agent displays an inline interactive form displaying available shipping cities, live distance metrics, and guaranteed arrival timelines.

### **Intelligent Validation Guardrails**

The orchestration layer checks parameters prior to invoking the remote tools:

* **Temporal Verification:** Evaluates orders containing highly perishable items (e.g., cakes, fresh flower bundles) to block impossible or past delivery date selections before passing data to the API.  
* **Input Sanitization:** Formats contact points and numerical strings to conform to Sri Lankan telecommunication and geographic standards (+94 country routing).

### **Conversational State Resiliency**

Utilizes Next.js persistent state synchronization across client sessions. If a browser drops connection or a user accidentally reloads, active shopping carts, address records, and multi-turn message history are restored instantly from client-side storage structures.

## **5\. Judging Rubric & Bonus Points Strategy**

The submission structure maximizes scoring density against the formal criteria outlined by Kapruka's core engineering evaluation team:

| Evaluation Parameter | Target Metrics & Implementation Rules   |
| :---- | :---- |
| **MCP Protocol Fidelity** | Correct usage of tool definitions without payload mutation. Clean handling of JSON-RPC transport layers. Proper connection error recovery. |
| **Conversational Quality** | Zero prompt breakdown during multi-step processing. Graceful deflection of out-of-scope customer commands. Accurate multi-item data aggregation. |
| **Interface Fluidity** | 60 frames per second animations during layout changes using Framer Motion. Fully responsive structures optimized for screens ranging from 375px mobile viewports up to large desktop layouts. |
| **Bonus Strategy: Localization** | The system utilizes advanced system prompt guidance enabling Claude 3.5 Sonnet to process inputs in native Sinhala script and colloquial Tanglish (e.g., mapping "sirawatama hoda cake ekak deepan" into high-fidelity search parameters) while outputting unified native language blocks. |
| **Bonus Strategy: Gift Logistics** | Dedicated visual UI nodes allowing customers to write gift notes, select custom structural wrapping configurations, and split billing profiles from delivery profiles seamlessly inside the active conversation. |

## 

## **6\. Execution Timeline & Milestones**

* **Phase 1 (System Verification):** Connect Bedrock to the remote Kapruka endpoint using the local inspector utility. Map out raw payload expectations.  
* **Phase 2 (Orchestration Engine):** Build Next.js App Router API wrappers. Implement the core tool execution loop via Vercel AI SDK.  
* **Phase 3 (Immersive Interface):** Build custom Shadcn UI interfaces. Configure Framer Motion transitions for streaming elements.  
* **Phase 4 (Localization & Edge Handling):** Tune prompts for Sinhala/Tanglish comprehension. Implement rate-limiting safety guardrails.  
* **Phase 5 (Hardening & Delivery):** End-to-end multi-item checkout validation, performance profiling, and public deployment.