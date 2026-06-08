"use client";

import { useEffect, useState } from "react";
import { CreditCard, Clock, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface OrderSummary {
  checkout_url?: string;
  order_ref?: string;
  summary?: {
    items_total: number;
    delivery_fee: number;
    addons_total: number;
    grand_total: number;
    currency: string;
  };
  expires_at?: string;
}

export function CheckoutCard({ data }: { data: unknown }) {
  if (typeof data === "string" || !data) return null;
  const order = data as OrderSummary;

  return (
    <Card className="max-w-sm overflow-hidden border-primary/20">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Order Ready</span>
          {order.order_ref && (
            <Badge variant="secondary" className="text-[10px] ml-auto">
              {order.order_ref}
            </Badge>
          )}
        </div>

        {order.summary && (
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Items</span>
              <span>{order.summary.currency} {order.summary.items_total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span>{order.summary.currency} {order.summary.delivery_fee.toLocaleString()}</span>
            </div>
            {order.summary.addons_total > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Add-ons</span>
                <span>{order.summary.currency} {order.summary.addons_total.toLocaleString()}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary">
                {order.summary.currency} {order.summary.grand_total.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {order.expires_at && <ExpiryTimer expiresAt={order.expires_at} />}

        {order.checkout_url && (
          <Button className="w-full gap-2" asChild>
            <a href={order.checkout_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Complete Payment
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function ExpiryTimer({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining("Expired");
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setRemaining(`${mins}:${secs.toString().padStart(2, "0")}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const isExpired = remaining === "Expired";

  return (
    <div className={`flex items-center gap-2 text-xs ${isExpired ? "text-destructive" : "text-muted-foreground"}`}>
      <Clock className="h-3 w-3" />
      <span>{isExpired ? "Link expired" : `Expires in ${remaining}`}</span>
    </div>
  );
}
