"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCarousel } from "@/components/product/product-carousel";
import { ProductDetailCard } from "@/components/product/product-detail-card";
import { CategoryExplorer } from "@/components/product/category-explorer";
import { DeliveryCard } from "@/components/delivery/delivery-card";
import { CityList } from "@/components/delivery/city-list";
import { CheckoutCard } from "@/components/order/checkout-card";
import { TrackingTimeline } from "@/components/order/tracking-timeline";

interface ToolPart {
  type: string;
  toolCallId: string;
  state: string;
  input?: unknown;
  output?: unknown;
}

export function ToolResultRenderer({ part }: { part: ToolPart }) {
  const toolName = part.type.replace(/^tool-/, "");

  if (part.state !== "output-available") {
    return <ToolLoadingSkeleton toolName={toolName} />;
  }

  const data = parseResult(part.output);
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="my-4"
    >
      {renderToolCard(toolName, data)}
    </motion.div>
  );
}

function renderToolCard(toolName: string, data: unknown) {
  switch (toolName) {
    case "kapruka_search_products":
      return <ProductCarousel data={data} />;
    case "kapruka_get_product":
      return <ProductDetailCard data={data} />;
    case "kapruka_list_categories":
      return <CategoryExplorer data={data} />;
    case "kapruka_list_delivery_cities":
      return <CityList data={data} />;
    case "kapruka_check_delivery":
      return <DeliveryCard data={data} />;
    case "kapruka_create_order":
      return <CheckoutCard data={data} />;
    case "kapruka_track_order":
      return <TrackingTimeline data={data} />;
    default:
      return null;
  }
}

function parseResult(result: unknown): unknown {
  if (!result) return null;
  if (typeof result === "object" && result !== null && "ok" in result) {
    const r = result as { ok: boolean; data?: unknown };
    if (r.ok) return r.data;
    return null;
  }
  if (typeof result === "string") {
    try {
      return JSON.parse(result);
    } catch {
      return result;
    }
  }
  return result;
}

function ToolLoadingSkeleton({ toolName }: { toolName: string }) {
  const labels: Record<string, string> = {
    kapruka_search_products: "Searching products",
    kapruka_get_product: "Loading product details",
    kapruka_list_categories: "Loading categories",
    kapruka_list_delivery_cities: "Finding delivery cities",
    kapruka_check_delivery: "Checking delivery",
    kapruka_create_order: "Creating order",
    kapruka_track_order: "Tracking order",
  };

  return (
    <div className="my-2 rounded-lg border p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{labels[toolName] ?? "Processing"}...</span>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
