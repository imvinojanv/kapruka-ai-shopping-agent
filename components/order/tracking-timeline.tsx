"use client";

import { Package, CheckCircle2, Circle, Camera, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TrackingData {
  order_number?: string;
  status?: string;
  status_display?: string;
  order_date?: string;
  delivery_date?: string;
  recipient?: { name: string; city: string };
  progress?: Array<{ step: string; timestamp: string }>;
  has_delivery_photo?: boolean;
  has_delivery_video?: boolean;
  items?: Array<{ name: string; quantity: number }>;
}

export function TrackingTimeline({ data }: { data: unknown }) {
  if (typeof data === "string" || !data) return null;
  const tracking = data as TrackingData;

  const statusColors: Record<string, string> = {
    delivered: "bg-green-500",
    shipped: "bg-blue-500",
    confirmed: "bg-amber-500",
    received: "bg-gray-500",
    cancelled: "bg-destructive",
  };

  return (
    <Card className="max-w-sm overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Order Tracking</span>
          </div>
          {tracking.status && (
            <Badge variant="secondary" className="text-xs capitalize">
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 ${statusColors[tracking.status] ?? "bg-gray-400"}`}
              />
              {tracking.status_display ?? tracking.status}
            </Badge>
          )}
        </div>

        {tracking.order_number && (
          <p className="text-xs text-muted-foreground">
            Order: <strong>{tracking.order_number}</strong>
          </p>
        )}

        {/* Timeline */}
        {tracking.progress && tracking.progress.length > 0 && (
          <div className="space-y-0 pl-2">
            {tracking.progress.map((step, i) => {
              const isLast = i === tracking.progress!.length - 1;
              return (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    {isLast ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    {i < tracking.progress!.length - 1 && (
                      <div className="w-px flex-1 bg-border my-1" />
                    )}
                  </div>
                  <div className="pb-3">
                    <p className="text-sm font-medium leading-tight">{step.step}</p>
                    <p className="text-xs text-muted-foreground">{step.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Media indicators */}
        <div className="flex gap-2">
          {tracking.has_delivery_photo && (
            <Badge variant="outline" className="text-xs gap-1">
              <Camera className="h-3 w-3" /> Photo
            </Badge>
          )}
          {tracking.has_delivery_video && (
            <Badge variant="outline" className="text-xs gap-1">
              <Video className="h-3 w-3" /> Video
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
