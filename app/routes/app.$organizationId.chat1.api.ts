import type { UIMessage } from "@ai-sdk/react";
import type { ActionFunctionArgs } from "react-router";
import { RequestContext } from "@/lib/request-context";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { invariant } from "@epic-web/invariant";
import * as Ai from "ai";
import { createAiGateway } from "ai-gateway-provider";

export async function action({ request, context }: ActionFunctionArgs) {
  const requestContext = context.get(RequestContext);
  invariant(requestContext, "Missing request context.");
  const { messages } = await request.json<{ messages: UIMessage[] }>();
  const aiGateway = createAiGateway({
    binding: requestContext.env.AI.gateway("saas-ai-gateway"),
    options: { cacheTtl: 3600 },
  });
  const google = createGoogleGenerativeAI({
    apiKey: requestContext.env.GOOGLE_AI_STUDIO_API_KEY,
  });
  const model = aiGateway([google("gemini-2.5-flash")]);
  const result = Ai.streamText({
    model,
    messages: Ai.convertToModelMessages(messages),
  });
  return result.toUIMessageStreamResponse({ sendReasoning: true });
}
