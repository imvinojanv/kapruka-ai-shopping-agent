"use client";

import { createContext, useContext } from "react";

interface ChatContextValue {
  sendMessage: (text: string) => void;
  isLoading: boolean;
}

const ChatContext = createContext<ChatContextValue>({
  sendMessage: () => {},
  isLoading: false,
});

export function ChatProvider({
  children,
  sendMessage,
  isLoading,
}: {
  children: React.ReactNode;
  sendMessage: (text: string) => void;
  isLoading: boolean;
}) {
  return (
    <ChatContext.Provider value={{ sendMessage, isLoading }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  return useContext(ChatContext);
}
