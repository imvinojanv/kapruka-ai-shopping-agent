"use client";

import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { UIMessage } from "ai";
import { ToolResultRenderer } from "./tool-result-renderer";
import Image from "next/image";

interface ChatMessageProps {
  message: UIMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === "assistant";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex gap-3 px-4 py-3 ${isAssistant ? "" : "justify-end"}`}
    >
      {isAssistant && (
        <div className="shrink-0 mt-0.5">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/20">
            <Bot className="size-5 text-primary" />
            {/* <Image
              src="/kapruka-favicon.png"
              alt="Kapruka"
              width={20}
              height={20}
              className="size-7 rounded-full"
            /> */}
          </div>
        </div>
      )}

      <div className={`max-w-[85%] space-y-2 ${isAssistant ? "" : "order-first"}`}>
        {message.parts.map((part, i) => {
          if (part.type === "text" && part.text) {
            return (
              <div
                key={i}
                className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isAssistant
                    ? "bg-muted text-foreground"
                    : "bg-primary text-primary-foreground ml-auto"
                  }`}
              >
                {isAssistant ? (
                  <MarkdownContent content={part.text} />
                ) : (
                  <p className="whitespace-pre-wrap">{part.text}</p>
                )}
              </div>
            );
          }
          if (part.type.startsWith("tool-")) {
            return <ToolResultRenderer key={i} part={part as any} />;
          }
          return null;
        })}
      </div>

      {!isAssistant && (
        <div className="shrink-0 mt-0.5">
          <div className="flex size-8 items-center justify-center rounded-full bg-secondary">
            <User className="size-5 text-secondary-foreground" />
          </div>
        </div>
      )}
    </motion.div>
  );
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h1 className="text-xl font-bold mt-4 mb-1 font-heading">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-lg font-bold mt-4 mb-1 font-heading">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-base font-semibold mt-3 mb-1">{children}</h3>
        ),
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({ children }) => (
          <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>
        ),
        li: ({ children }) => <li className="text-sm">{children}</li>,
        strong: ({ children }) => (
          <strong className="font-semibold">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        code: ({ children }) => (
          <code className="bg-background/50 px-1.5 py-0.5 rounded text-xs font-mono">
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <pre className="bg-background/50 p-3 rounded-md overflow-x-auto my-2 text-xs">
            {children}
          </pre>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:opacity-80"
          >
            {children}
          </a>
        ),
        hr: () => <hr className="my-3 border-border/50" />,
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-primary/30 pl-3 my-2 italic text-muted-foreground">
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
