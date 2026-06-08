"use client";

import { useRef, useCallback } from "react";
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
    <div className="relative">
      <div className="absolute bottom-2 left-0 lg:-left-2.5 right-0 mx-auto max-w-3xl px-2 lg:px-0">
        <div className="relative rounded-xl bg-card border border-border/50 backdrop-blur-md shadow-lg shadow-black/5 dark:shadow-black/20 focus-within:ring-2 focus-within:ring-ring/20 transition-shadow">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask about products, delivery, or place an order..."
            className="min-h-[52px] max-h-[200px] resize-none border-0 bg-transparent px-4 pt-3 pb-12 focus-visible:ring-0 focus-visible:ring-offset-0"
            rows={1}
          />

          {/* Bottom actions row */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
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
