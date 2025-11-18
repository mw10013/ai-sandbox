"use client";

import type { Route } from "./+types/app.$organizationId.chat1";
import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { invariant } from "@epic-web/invariant";
import { DefaultChatTransport } from "ai";
import * as ReactRouter from "react-router";

export default function RouteComponent() {
  const [input, setInput] = useState("");
  const { organizationId } =
    ReactRouter.useParams<Route.LoaderArgs["params"]>();
  invariant(organizationId, "Missing organizationId");
  const { messages, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: ReactRouter.href("/app/:organizationId/chat1/api", {
        organizationId,
      }),
    }),
  });
  return (
    <div className="stretch mx-auto flex w-full max-w-md flex-col py-24">
      {messages.map((message) => (
        <div key={message.id} className="whitespace-pre-wrap">
          {message.role === "user" ? "User: " : "AI: "}
          {message.parts.map((part, i) => {
            switch (part.type) {
              case "text":
                return (
                  <div key={`${message.id}-${String(i)}`}>{part.text}</div>
                );
            }
          })}
        </div>
      ))}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          console.log("Submitting message:", input);
          void sendMessage({ text: input });
          setInput("");
        }}
      >
        <input
          className="fixed bottom-0 mb-8 w-full max-w-md rounded border border-zinc-300 p-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
          value={input}
          placeholder="Say something..."
          onChange={(e) => {
            setInput(e.currentTarget.value);
          }}
        />
      </form>
    </div>
  );
}
