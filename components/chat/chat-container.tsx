"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { ChatMessage } from "./chat-message";
import { MessageComposer } from "./message-composer";
import { TypingIndicator } from "./typing-indicator";
import { ChatProvider } from "./chat-context";
import { useChatHistoryStore, useShoppingStore } from "@/lib/store";

interface ChatContainerProps {
  chatId: string;
}

function loadMessages(chatId: string): UIMessage[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(`chat-messages-${chatId}`);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveMessages(chatId: string, messages: UIMessage[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`chat-messages-${chatId}`, JSON.stringify(messages));
}

export function ChatContainer({ chatId }: ChatContainerProps) {
  const { updateThreadTitle, touchThread, threads } = useChatHistoryStore();
  const cart = useShoppingStore((s) => s.cart);
  const [input, setInput] = useState("");
  const titleUpdated = useRef(false);

  const { messages, sendMessage, status, setMessages } = useChat({
    id: chatId,
    messages: loadMessages(chatId),
    onFinish({ message }) {
      touchThread(chatId);
      // Auto-title: update from first user message
      const thread = threads.find((t) => t.id === chatId);
      if (!titleUpdated.current && thread?.title === "New conversation") {
        // Use the first user message as the title
        const userMsg = messages.find((m) => m.role === "user");
        if (userMsg) {
          const textPart = userMsg.parts.find((p: { type: string }) => p.type === "text");
          if (textPart && "text" in textPart) {
            const title = (textPart.text as string).slice(0, 60).trim();
            updateThreadTitle(chatId, title);
            titleUpdated.current = true;
          }
        }
      }
    },
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const hasSentInitial = useRef(false);
  const isLoading = status === "streaming" || status === "submitted";

  // Persist messages whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      saveMessages(chatId, messages);
    }
  }, [chatId, messages]);

  // Pick up the initial message stored by the welcome page
  useEffect(() => {
    if (hasSentInitial.current) return;
    const key = `chat-init-${chatId}`;
    const initialText = sessionStorage.getItem(key);
    if (initialText) {
      sessionStorage.removeItem(key);
      hasSentInitial.current = true;
      sendMessage({ text: initialText }, { body: { cart } });
    }
  }, [chatId, sendMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    sendMessage({ text }, { body: { cart } });
  };

  const handleFormSubmit = useCallback((text: string) => {
    sendMessage({ text }, { body: { cart } });
  }, [sendMessage, cart]);

  return (
    <ChatProvider sendMessage={handleFormSubmit} isLoading={isLoading}>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl pt-4 pb-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
          </div>
        </div>

      <MessageComposer
        value={input}
        onChange={setInput}
        onSubmit={handleSend}
        isLoading={isLoading}
      />
      </div>
    </ChatProvider>
  );
}
