"use client";

import { useEffect, useState } from "react";
import { CreditCard, Clock, ExternalLink, Package, Truck, Download, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useShoppingStore, usePendingOrderStore } from "@/lib/store";
import { generateOrderReceipt, type ReceiptData } from "@/lib/pdf/generate-receipt";

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

export function CheckoutCard({ data, messageId }: { data: unknown; messageId?: string }) {
  if (typeof data === "string" || !data) return null;
  const order = data as OrderSummary;
  const clearCart = useShoppingStore((s) => s.clearCart);
  const pendingOrder = usePendingOrderStore((s) => s.pendingOrder);
  const clearPendingOrder = usePendingOrderStore((s) => s.clearPendingOrder);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handlePaymentClick = async () => {
    if (!order.summary || !order.order_ref || !order.checkout_url || !order.expires_at) return;

    setSaving(true);
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderRef: order.order_ref,
          checkoutUrl: order.checkout_url,
          expiresAt: order.expires_at,
          chatMessageId: messageId || null,
          items: pendingOrder?.items ?? [],
          summary: order.summary,
          recipient: pendingOrder?.recipient ?? { name: "Customer", phone: "N/A" },
          delivery: pendingOrder?.delivery ?? { address: "N/A", city: "N/A", date: "N/A", locationType: "house" },
          sender: pendingOrder?.sender ?? { name: "N/A" },
          giftMessage: pendingOrder?.giftMessage || null,
        }),
      });
    } catch (e) {
      console.error("Failed to save order:", e);
    } finally {
      setSaving(false);
    }

    clearPendingOrder();
    clearCart();
  };

  const handleGenerateReceipt = async () => {
    if (!order.order_ref) return;

    setGenerating(true);
    try {
      const res = await fetch(`/api/orders/${order.order_ref}`);
      if (!res.ok) throw new Error("Order not found");

      const dbOrder = await res.json();
      const receiptData: ReceiptData = {
        orderRef: dbOrder.orderRef,
        checkoutUrl: dbOrder.checkoutUrl,
        expiresAt: dbOrder.expiresAt,
        items: dbOrder.items ?? [],
        summary: dbOrder.summary,
        recipient: dbOrder.recipient ?? { name: "Customer", phone: "N/A" },
        delivery: dbOrder.delivery ?? { address: "N/A", city: "N/A", date: "N/A", locationType: "house" },
        sender: dbOrder.sender ?? { name: "N/A" },
        giftMessage: dbOrder.giftMessage || undefined,
      };
      const dataUri = generateOrderReceipt(receiptData);
      setReceiptUrl(dataUri);
    } catch (e) {
      console.error("Failed to generate receipt:", e);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!receiptUrl || !order.order_ref) return;
    const base64 = receiptUrl.split(",")[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Order-${order.order_ref}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-sm rounded-2xl overflow-hidden border border-border/80 bg-card/20">
      {/* Top accent bar */}
      <div className="h-1 w-full bg-linear-to-r from-primary via-purple-400 to-primary" />

      <div className="p-4 space-y-4 bg-linear-to-br from-card via-card to-muted/30 rounded-b-2xl border-b border-border/60">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary/15">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Order Ready</p>
              <p className="text-[11px] text-muted-foreground">Guest Checkout</p>
            </div>
          </div>
          {order.order_ref && (
            <Badge
              variant="outline"
              className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full border-0 bg-primary/20 text-primary"
            >
              {order.order_ref}
            </Badge>
          )}
        </div>

        {/* Order breakdown */}
        {order.summary && (
          <div className="rounded-xl bg-muted/50 p-3.5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-3">
              <span>Order Summary</span>
            </div>

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="h-3.5 w-3.5" />
                  <span>Items</span>
                </div>
                <span>{order.summary.currency} {order.summary.items_total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Truck className="h-3.5 w-3.5" />
                  <span>Delivery</span>
                </div>
                <span>{order.summary.currency} {order.summary.delivery_fee.toLocaleString()}</span>
              </div>
              {order.summary.addons_total > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground ml-5.5">Add-ons</span>
                  <span>{order.summary.currency} {order.summary.addons_total.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="border-t border-border/50 pt-2.5 mt-2.5">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Grand Total</span>
                <span className="text-lg font-bold text-primary">
                  {order.summary.currency} {order.summary.grand_total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Expiry timer */}
        {order.expires_at && <ExpiryTimer expiresAt={order.expires_at} />}

        {/* Payment button */}
        <div>
          <p className="mb-1 text-xs text-center font-light text-muted-foreground">
            Make the payment to complete your order
          </p>
          {order.checkout_url && (
            <Button
              asChild
              className="w-full h-10 gap-2 rounded-xl font-medium"
              disabled={saving}
              onClick={handlePaymentClick}
            >
              <a href={order.checkout_url} target="_blank" rel="noopener noreferrer">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                {saving ? "Saving Order..." : "Complete Payment"}
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Download receipt button */}
      <div className="px-4 py-3">
        {receiptUrl ? (
          <Button
            variant="outline"
            className="w-full h-9 gap-2 rounded-xl text-sm"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
            Download Order Receipt
          </Button>
        ) : (
          order.order_ref && (
            <Button
              variant="ghost"
              className="w-full h-9 gap-2 rounded-xl text-sm text-muted-foreground"
              disabled={generating}
              onClick={handleGenerateReceipt}
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              {generating ? "Generating..." : "Generate Receipt PDF"}
            </Button>
          )
        )}
      </div>
    </div>
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
    <div className={`flex items-center justify-between gap-2.5 rounded-xl py-2 pl-3 pr-4 ${isExpired
      ? "bg-red-500/5 border border-red-500/20"
      : "bg-amber-500/5 border border-amber-500/20"
      }`}>
      <div className="flex items-center gap-2">
        <Clock className={`h-4 w-4 ${isExpired ? "text-red-500" : "text-amber-500"}`} />
        <p className={`text-sm font-medium ${isExpired ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}`}>
          {isExpired ? "Payment link expired" : "Link expires soon"}
        </p>
      </div>
      {!isExpired && (
        <p className="text-sm text-muted-foreground">
          <span className="font-mono font-medium">{remaining}</span>
        </p>
      )}
    </div>
  );
}
