"use client";

import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useShoppingStore } from "@/lib/store";

export function CartModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { cart, removeFromCart, updateQuantity, clearCart } = useShoppingStore();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const currency = cart[0]?.currency ?? "LKR";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Cart
            {cart.length > 0 && (
              <Badge variant="secondary">{cart.length} items</Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="px-4 flex-1 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Your cart is empty</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 h-[300px]">
              <AnimatePresence mode="popLayout">
                {cart.map((item) => (
                  <motion.div
                    key={item.productId}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="py-3 px-4 border-b last:border-0"
                  >
                    <div className="flex gap-3">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-16 w-16 rounded-md object-cover bg-muted shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-sm font-medium leading-snug wrap-break-word">
                          {item.name}
                        </p>
                        <p className="text-sm text-primary font-semibold">
                          {item.currency} {(item.price * item.quantity).toLocaleString()}
                        </p>

                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm w-6 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 ml-auto text-muted-foreground hover:text-destructive"
                            onClick={() => removeFromCart(item.productId)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </ScrollArea>

            <div className="px-4 py-4 border-t space-y-3">
              <div className="flex justify-between text-sm font-semibold">
                <span>Subtotal</span>
                <span>{currency} {total.toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Delivery fees calculated at checkout
              </p>
              <Separator />
              <Button variant="outline" className="w-full" onClick={clearCart}>
                Clear Cart
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
