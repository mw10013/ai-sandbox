"use client";

import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import type { Route } from "./+types/app.$organizationId.chat3";
import * as React from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { useChat } from "@ai-sdk/react";
import { invariant } from "@epic-web/invariant";
import * as Ai from "ai";
import { CopyIcon, RefreshCcwIcon } from "lucide-react";
import * as ReactRouter from "react-router";

export default function RouteComponent() {
  const [input, setInput] = React.useState("");
  const { organizationId } =
    ReactRouter.useParams<Route.LoaderArgs["params"]>();
  invariant(organizationId, "Missing organizationId");
  const { messages, sendMessage, status, regenerate } = useChat({
    transport: new Ai.DefaultChatTransport({
      api: ReactRouter.href("/app/:organizationId/chat3/api", {
        organizationId,
      }),
    }),
  });

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text) return;
    void sendMessage({ text: message.text });
    setInput("");
  };

  return (
    <div className="mx-auto flex h-screen w-full max-w-md flex-col py-24">
      <Conversation className="h-full">
        <ConversationContent>
          {messages.map((message) => (
            <div key={message.id}>
              {message.parts.map((part, i) => {
                switch (part.type) {
                  case "text":
                    return (
                      <Message
                        key={`${message.id}-${String(i)}`}
                        from={message.role}
                      >
                        <MessageContent>
                          <MessageResponse>{part.text}</MessageResponse>
                        </MessageContent>
                        {message.role === "assistant" &&
                          i === message.parts.length - 1 && (
                            <MessageActions>
                              <MessageAction
                                onClick={() => void regenerate()}
                                label="Retry"
                              >
                                <RefreshCcwIcon className="size-3" />
                              </MessageAction>
                              <MessageAction
                                onClick={() =>
                                  void navigator.clipboard.writeText(part.text)
                                }
                                label="Copy"
                              >
                                <CopyIcon className="size-3" />
                              </MessageAction>
                            </MessageActions>
                          )}
                      </Message>
                    );
                  case "reasoning":
                    return (
                      <Reasoning
                        key={`${message.id}-${String(i)}`}
                        className="w-full"
                        isStreaming={
                          status === "streaming" &&
                          i === message.parts.length - 1 &&
                          message.id === messages.at(-1)?.id
                        }
                      >
                        <ReasoningTrigger />
                        <ReasoningContent>{part.text}</ReasoningContent>
                      </Reasoning>
                    );
                  default:
                    return null;
                }
              })}
            </div>
          ))}
          {status === "submitted" && <Loader />}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <PromptInput onSubmit={handleSubmit} className="mt-4">
        <PromptInputBody>
          <PromptInputTextarea
            onChange={(e) => {
              setInput(e.target.value);
            }}
            value={input}
          />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputSubmit
            disabled={!input && status !== "ready"}
            status={status}
          />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
