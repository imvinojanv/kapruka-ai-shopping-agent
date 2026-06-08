"use client";

import { PanelLeft, Settings, ShoppingCart, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useSettingsStore, useShoppingStore } from "@/lib/store";
import { Status, StatusIndicator, StatusLabel } from "../ui/status";

export function Header({
  onToggleSidebar,
  onOpenCart,
}: {
  onToggleSidebar: () => void;
  onOpenCart: () => void;
}) {
  const { settings, updateSettings } = useSettingsStore();
  const cart = useShoppingStore((s) => s.cart);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4">
      {/* Left */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="h-8 w-8">
          <PanelLeft className="h-4 w-4" />
        </Button>

        <Status status="connected">
          <StatusIndicator />
          <StatusLabel />
        </Status>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Settings */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 space-y-4">
            <h4 className="font-medium text-sm">Settings</h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Language</Label>
                <Select
                  value={settings.language}
                  onValueChange={(v) => updateSettings({ language: v as "en" | "si" | "ta" })}
                >
                  <SelectTrigger className="w-28 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="si">සිංහල</SelectItem>
                    <SelectItem value="ta">தமிழ்</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Currency</Label>
                <Select
                  value={settings.currency}
                  onValueChange={(v) => updateSettings({ currency: v as "LKR" | "USD" })}
                >
                  <SelectTrigger className="w-28 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LKR">LKR (Rs.)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Dark Mode</Label>
                <Switch
                  checked={settings.theme === "dark"}
                  onCheckedChange={(checked) =>
                    updateSettings({ theme: checked ? "dark" : "light" })
                  }
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Cart */}
        <Button variant="ghost" size="icon" className="relative h-8 w-8" onClick={onOpenCart}>
          <ShoppingCart className="h-4 w-4" />
          <AnimatePresence>
            {cartCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1"
              >
                <Badge className="h-4 min-w-4 px-1 text-[10px] flex items-center justify-center">
                  {cartCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </header>
  );
}
