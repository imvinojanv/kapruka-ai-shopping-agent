"use client";

import { MapPin, Calendar, Truck, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className="max-w-sm overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Delivery Check</span>
          <Badge
            variant={delivery.available ? "secondary" : "destructive"}
            className="ml-auto text-xs"
          >
            {delivery.available ? "Available" : "Unavailable"}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{delivery.city}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{delivery.checked_date}</span>
          </div>
        </div>

        {delivery.available ? (
          <div className="flex items-center gap-2 rounded-md bg-green-50 dark:bg-green-950/20 p-2.5">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm">
              Delivery fee: <strong>{delivery.currency} {delivery.rate}</strong>
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-2.5">
              <XCircle className="h-4 w-4 text-destructive mt-0.5" />
              <span className="text-sm">{delivery.reason ?? "Delivery not available"}</span>
            </div>
            {delivery.next_available_date && (
              <p className="text-xs text-muted-foreground">
                Next available: <strong>{delivery.next_available_date}</strong>
              </p>
            )}
          </div>
        )}

        {delivery.perishable_warning && (
          <div className="flex items-start gap-2 rounded-md bg-amber-50 dark:bg-amber-950/20 p-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
            <span className="text-xs text-amber-800 dark:text-amber-200">
              {delivery.perishable_warning}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
