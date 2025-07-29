"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface DebugMessage {
  type: "info" | "error" | "success";
  message: string;
  timestamp: Date;
}

interface DebugConsoleContextType {
  messages: DebugMessage[];
  addMessage: (message: string, type?: "info" | "error" | "success") => void;
  clearMessages: () => void;
}

const DebugConsoleContext = createContext<DebugConsoleContextType | undefined>(undefined);

export function DebugConsoleProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<DebugMessage[]>([]);

  const addMessage = (message: string, type: "info" | "error" | "success" = "info") => {
    setMessages((prev) => [...prev, { message, type, timestamp: new Date() }]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <DebugConsoleContext.Provider value={{ messages, addMessage, clearMessages }}>
      {children}
    </DebugConsoleContext.Provider>
  );
}

export function useDebugConsole() {
  const context = useContext(DebugConsoleContext);
  if (context === undefined) {
    throw new Error("useDebugConsole must be used within a DebugConsoleProvider");
  }
  return context;
} 