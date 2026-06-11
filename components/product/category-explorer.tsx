"use client";

import { motion } from "framer-motion";
import { FolderOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Category {
  name: string;
  url?: string;
  children?: Category[];
}

export function CategoryExplorer({ data }: { data: unknown }) {
  if (typeof data === "string" || !data) return null;

  const obj = data as Record<string, unknown>;
  const categories = (obj.categories ?? []) as Category[];

  if (categories.length === 0) return null;

  return (
    <div className="rounded-xl border p-2 space-y-2 max-w-lg">
      <div className="flex items-center px-2 py-1 gap-2 text-sm font-medium">
        <FolderOpen className="h-4 w-4 text-primary" />
        <span className="text-base font-medium">Product Categories</span>
        <Badge
          variant="secondary"
          className="text-xs font-semibold bg-primary/30 text-primary"
        >
          {categories.length}
        </Badge>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 bg-card p-2 rounded-lg">
        {categories.slice(0, 30).map((cat, i) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.02 }}
          >
            {cat.url ? (
              <a href={cat.url} target="_blank" rel="noopener noreferrer">
                <Badge variant="outline" className="text-xs capitalize cursor-pointer hover:bg-accent transition-colors">
                  {cat.name}
                </Badge>
              </a>
            ) : (
              <Badge variant="outline" className="text-xs">
                {cat.name}
              </Badge>
            )}
          </motion.div>
        ))}
        {categories.length > 30 && (
          <Badge variant="secondary" className="text-xs">
            +{categories.length - 30} more
          </Badge>
        )}
      </div>
    </div>
  );
}
