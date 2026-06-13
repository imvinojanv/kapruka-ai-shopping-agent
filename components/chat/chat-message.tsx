"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { UIMessage } from "ai";
import { useSession } from "next-auth/react";
import { ToolResultRenderer } from "./tool-result-renderer";
import { DynamicForm, type DynamicFormSchema } from "./dynamic-form";
import { useChatContext } from "./chat-context";

interface ChatMessageProps {
  message: UIMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === "assistant";
  const { data: session } = useSession();

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
          </div>
        </div>
      )}

      <div className={`max-w-[85%] space-y-2 ${isAssistant ? "" : "order-first"}`}>
        {message.parts.map((part, i) => {
          if (part.type === "text" && part.text) {
            if (isAssistant) {
              return <AssistantTextPart key={i} text={part.text} />;
            }
            return (
              <div
                key={i}
                className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed bg-primary text-primary-foreground ml-auto"
              >
                <p className="whitespace-pre-wrap">{part.text}</p>
              </div>
            );
          }
          if (part.type.startsWith("tool-")) {
            return <ToolResultRenderer key={i} part={part as any} messageId={message.id} />;
          }
          return null;
        })}
      </div>

      {!isAssistant && (
        <div className="shrink-0 mt-0.5">
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name ?? ""}
              width={32}
              height={32}
              className="size-8 rounded-full"
            />
          ) : (
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
              {session?.user?.name?.charAt(0) ?? "U"}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

const FORM_REGEX = /:::form\s*([\s\S]*?)\s*:::/g;

function AssistantTextPart({ text }: { text: string }) {
  const { sendMessage, isLoading } = useChatContext();

  // Split text into segments: plain markdown and form blocks
  const segments: Array<{ type: "text" | "form"; content: string }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const regex = new RegExp(FORM_REGEX.source, "g");
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: "form", content: match[1] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    segments.push({ type: "text", content: text.slice(lastIndex) });
  }

  // If no forms found, render as plain markdown
  if (segments.length === 1 && segments[0].type === "text") {
    return (
      <div className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed bg-muted text-foreground">
        <MarkdownContent content={text} />
      </div>
    );
  }

  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === "text" && seg.content.trim()) {
          return (
            <div key={i} className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed bg-muted text-foreground">
              <MarkdownContent content={seg.content} />
            </div>
          );
        }
        if (seg.type === "form") {
          try {
            const schema = JSON.parse(seg.content) as DynamicFormSchema;
            return (
              <DynamicForm
                key={i}
                schema={schema}
                onSubmit={(msg) => sendMessage(msg)}
                disabled={isLoading}
              />
            );
          } catch {
            return null;
          }
        }
        return null;
      })}
    </>
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
