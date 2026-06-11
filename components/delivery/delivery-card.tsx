"use client";

import { MapPin, Calendar, Truck, AlertTriangle, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DeliveryCheck {
  city?: string;
  checked_date?: string;
  available?: boolean;
  rate?: number;
  currency?: string;
  reason?: string | null;
  next_available_date?: string | null;
  perishable_warning?: string | null;
}

export function DeliveryCard({ data }: { data: unknown }) {
  if (typeof data === "string" || !data) return null;
  const delivery = data as DeliveryCheck;

  return (
    <div className="max-w-sm rounded-2xl overflow-hidden border border-border/60 bg-linear-to-br from-card via-card to-muted/30">
      {/* Top accent bar */}
      <div className={`h-1 w-full ${delivery.available ? "bg-linear-to-r from-green-500 via-emerald-400 to-green-500" : "bg-linear-to-r from-red-500 via-rose-400 to-red-500"}`} />

      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`flex items-center justify-center h-9 w-9 rounded-xl ${delivery.available ? "bg-green-500/10" : "bg-red-500/10"}`}>
              <Truck className={`h-5 w-5 ${delivery.available ? "text-green-500" : "text-red-500"}`} />
            </div>
            <div>
              <p className="text-sm font-semibold">Delivery Check</p>
              <p className="text-[11px] text-muted-foreground">Kapruka Logistics</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border-0 ${
              delivery.available
                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                : "bg-red-500/10 text-red-600 dark:text-red-400"
            }`}
          >
            {delivery.available ? "Available" : "Unavailable"}
          </Badge>
        </div>

        {/* Route info */}
        <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-3.5 py-2.5">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-medium truncate">{delivery.city}</span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">{delivery.checked_date}</span>
          </div>
        </div>

        {/* Result */}
        {delivery.available ? (
          <div className="rounded-xl bg-green-500/5 border border-green-500/20 p-3.5">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Delivery available</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Flat rate: <span className="font-semibold text-foreground">{delivery.currency} {delivery.rate?.toLocaleString()}</span>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-3.5 space-y-2">
            <div className="flex items-start gap-2.5">
              <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">Not available</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {delivery.reason ?? "Delivery not possible for the selected date"}
                </p>
              </div>
            </div>
            {delivery.next_available_date && (
              <div className="ml-7.5 flex items-center gap-1.5 text-xs">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Next available:</span>
                <span className="font-medium">{delivery.next_available_date}</span>
              </div>
            )}
          </div>
        )}

        {/* Perishable warning */}
        {delivery.perishable_warning && (
          <div className="flex items-start gap-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 p-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              {delivery.perishable_warning}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
