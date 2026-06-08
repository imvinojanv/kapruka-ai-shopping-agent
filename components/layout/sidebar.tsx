"use client";

import { useCallback } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useChatHistoryStore, useSettingsStore } from "@/lib/store";

function ThemeLogo() {
  const theme = useSettingsStore((s) => s.settings.theme);
  const src = theme === "dark" ? "/kapruka-dark-logo.png" : "/kapruka-light-logo.png";
  return (
    <Image
      src={src}
      alt="Kapruka"
      width={160}
      height={32}
      className="rounded-md"
    />
  );
}

export function Sidebar({ onNewChat }: { onNewChat: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { threads, setActiveThread, deleteThread } = useChatHistoryStore();
  const sortedThreads = [...threads].sort((a, b) => b.updatedAt - a.updatedAt);
  const activeThreadId = pathname.startsWith("/chat/") ? pathname.split("/chat/")[1] : null;

  const handleDelete = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      deleteThread(id);
      if (activeThreadId === id) {
        router.push("/");
      }
    },
    [deleteThread, activeThreadId, router]
  );

  return (
    <div className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo + Brand */}
      <div className="flex items-center gap-2 px-4 pt-5 pb-3">
        <ThemeLogo />
        <h2 className="pl-2 pr-2.5 text-xl font-bold bg-primary rounded-sm text-white">AI</h2>
      </div>

      <Separator className="" />

      {/* New Chat */}
      <div className="px-3 py-3">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={onNewChat}
        >
          <Plus className="h-4 w-4" />
          New Conversation
        </Button>
      </div>

      <Separator className="" />

      {/* Chat History */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-3 py-2">
          <AnimatePresence mode="popLayout">
            {sortedThreads.map((thread) => (
              <motion.div
                key={thread.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  onClick={() => {
                    setActiveThread(thread.id);
                    router.push(`/chat/${thread.id}`);
                  }}
                  className={`group flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm cursor-pointer transition-colors ${
                    activeThreadId === thread.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50"
                  }`}
                >
                  <span className="flex-1 truncate min-w-0">{thread.title.length > 30 ? thread.title.slice(0, 28) + "..." : thread.title}</span>
                  <button
                    onClick={(e) => handleDelete(e, thread.id)}
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-destructive/10"
                  >
                    <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {sortedThreads.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">
              No conversations yet
            </p>
          )}
        </ScrollArea>
      </div>

      <Separator className="" />

      {/* User */}
      <div className="flex items-center gap-3 px-4 py-4">
        <Avatar className="h-8 w-8 bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
          VA
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium truncate">Vinojan Abhimanyu</span>
          <span className="text-xs text-muted-foreground truncate">
            imvinojanv@gmail.com
          </span>
        </div>
      </div>
    </div>
  );
}
