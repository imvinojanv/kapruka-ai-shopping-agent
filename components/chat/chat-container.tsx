"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { ChatMessage } from "./chat-message";
import { MessageComposer } from "./message-composer";
import { TypingIndicator } from "./typing-indicator";
import { ChatProvider } from "./chat-context";
import { useShoppingStore } from "@/lib/store";

interface ChatContainerProps {
  chatId: string;
}

export function ChatContainer({ chatId }: ChatContainerProps) {
  const cart = useShoppingStore((s) => s.cart);
  const clearCart = useShoppingStore((s) => s.clearCart);
  const [input, setInput] = useState("");
  const titleUpdated = useRef(false);
  const [loaded, setLoaded] = useState(false);

  const { messages, sendMessage, status, setMessages } = useChat({
    id: chatId,
    onFinish({ message }) {
      // Auto-title from first user message
      if (!titleUpdated.current) {
        const userMsg = messages.find((m) => m.role === "user");
        if (userMsg) {
          const textPart = userMsg.parts.find((p: { type: string }) => p.type === "text");
          if (textPart && "text" in textPart) {
            const title = (textPart.text as string).slice(0, 60).trim();
            fetch(`/api/threads/${chatId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title }),
            }).then(() => {
              // Dispatch event so sidebar can refresh
              window.dispatchEvent(new CustomEvent("thread-updated"));
            });
            titleUpdated.current = true;
          }
        }
      }

      // Clear cart after order creation
      const hasOrderTool = message.parts.some(
        (p: { type: string }) => p.type === "tool-kapruka_create_order"
      );
      if (hasOrderTool) {
        clearCart();
      }
    },
  });

  // Load messages from DB on mount
  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await fetch(`/api/threads/${chatId}/messages`);
        if (res.ok) {
          const dbMessages = await res.json();
          if (dbMessages.length > 0) {
            const uiMessages: UIMessage[] = dbMessages.map(
              (m: { id: string; role: string; content: unknown }) => ({
                id: m.id,
                role: m.role,
                parts: m.content as UIMessage["parts"],
              })
            );
            setMessages(uiMessages);
          }
        }
      } catch {
        // Thread might not exist yet
      }
      setLoaded(true);
    }
    fetchMessages();
  }, [chatId, setMessages]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const hasSentInitial = useRef(false);
  const isLoading = status === "streaming" || status === "submitted";

  // Persist messages to DB (debounced)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (messages.length === 0 || !loaded) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      fetch(`/api/threads/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
    }, 2000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [chatId, messages, loaded]);

  // Pick up the initial message stored by the welcome page
  useEffect(() => {
    if (hasSentInitial.current || !loaded) return;
    const key = `chat-init-${chatId}`;
    const initialText = sessionStorage.getItem(key);
    if (initialText) {
      sessionStorage.removeItem(key);
      hasSentInitial.current = true;
      sendMessage({ text: initialText }, { body: { cart } });
    }
  }, [chatId, sendMessage, loaded, cart]);

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

  if (!loaded) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

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
