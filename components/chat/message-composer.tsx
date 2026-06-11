"use client";

import { useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Send, Zap, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function MessageComposer({
  value,
  onChange,
  onSubmit,
  isLoading,
}: MessageComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (value.trim() && !isLoading) {
          onSubmit();
        }
      }
    },
    [value, isLoading, onSubmit]
  );

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
      const el = e.target;
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 200) + "px";
    },
    [onChange]
  );

  return (
    <div className="w-full bottom-0 left-0 right-0 mx-auto max-w-3xl px-2 pb-1 lg:px-0">
      {/* Outer wrapper for animated border */}
      <div className={`relative rounded-xl p-[1.5px] transition-shadow duration-500 ${focused ? "composer-glow" : ""}`}>
        {/* Animated running border */}
        <div
          className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${focused ? "opacity-100" : "opacity-0"}`}
          style={{
            background: "conic-gradient(from var(--composer-angle, 0deg), transparent 0%, oklch(0.558 0.288 302.321) 10%, transparent 20%, oklch(0.627 0.265 303.9) 30%, transparent 40%)",
            animation: focused ? "composer-spin 3s linear infinite" : "none",
          }}
        />

        {/* Inner content */}
        <div className="relative rounded-xl bg-card backdrop-blur-md shadow-lg shadow-black/5 dark:shadow-black/20">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Ask about products, delivery, or place an order..."
            className="min-h-13 max-h-50 resize-none border-0 bg-transparent px-4 pt-3 pb-12 focus-visible:ring-0 focus-visible:ring-offset-0"
            rows={1}
          />

          {/* Bottom actions row */}
          <div className={`absolute bottom-2 left-2 right-2 flex items-center justify-between ${focused ? "bg-card/40 backdrop-blur-sm rounded-md" : ""}`}>
            {/* Left actions */}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" disabled>
                <Zap className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" disabled>
                <Mic className="h-3.5 w-3.5" />
              </Button>
              <span className="text-[11px] border-l ml-2 pl-4 font-normal text-muted-foreground hidden sm:inline">
                Claude 4.5 Sonnet
              </span>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground hidden sm:inline">
                52% Used
              </span>
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  size="sm"
                  className="h-7 px-3 gap-1.5"
                  onClick={onSubmit}
                  disabled={!value.trim() || isLoading}
                >
                  <Send className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline text-xs">Send</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
