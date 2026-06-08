"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WelcomeScreen } from "./welcome-screen";
import { MessageComposer } from "./message-composer";
import { useChatHistoryStore } from "@/lib/store";

export function WelcomeContainer() {
  const router = useRouter();
  const { createThread } = useChatHistoryStore();
  const [input, setInput] = useState("");

  const startChat = (text: string) => {
    if (!text.trim()) return;
    const id = crypto.randomUUID();
    createThread(id);
    // Store the initial message so the chat page can pick it up
    sessionStorage.setItem(`chat-init-${id}`, text.trim());
    router.push(`/chat/${id}`);
  };

  const handleSend = () => {
    startChat(input);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <WelcomeScreen onSuggestionClick={startChat} />

      <MessageComposer
        value={input}
        onChange={setInput}
        onSubmit={handleSend}
        isLoading={false}
      />
    </div>
  );
}
