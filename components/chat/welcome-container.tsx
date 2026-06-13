"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WelcomeScreen } from "./welcome-screen";
import { MessageComposer } from "./message-composer";

export function WelcomeContainer() {
  const router = useRouter();
  const [input, setInput] = useState("");

  const startChat = async (text: string) => {
    if (!text.trim()) return;
    const id = crypto.randomUUID();

    // Create thread in DB
    await fetch("/api/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

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
