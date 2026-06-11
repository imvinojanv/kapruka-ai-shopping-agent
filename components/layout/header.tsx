"use client";

import { PanelLeft, Settings, ShoppingCart, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
    <TooltipProvider delayDuration={300}>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="h-8 w-8">
                <PanelLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Toggle Sidebar</TooltipContent>
          </Tooltip>


          <Tooltip>
            <TooltipTrigger asChild>
              <Status status="connected">
                <StatusIndicator />
                <StatusLabel />
              </Status>
            </TooltipTrigger>
            <TooltipContent side="bottom">MCP Server Status</TooltipContent>
          </Tooltip>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Settings */}
          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">Settings</TooltipContent>
            </Tooltip>
            <PopoverContent align="end" className="w-72">
              <h4 className="font-medium text-base ml-2">Settings</h4>

              <div className="space-y-3 bg-sidebar-accent p-3 rounded-md">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Language</Label>
                  <Select
                    value={settings.language}
                    onValueChange={(v) => updateSettings({ language: v as "en" | "si" | "ta" })}
                  >
                    <SelectTrigger className="w-28 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="p-1">
                      <SelectItem value="en" className="px-3 py-1.5 font-sans">English</SelectItem>
                      <SelectItem value="si" className="px-3 py-1.5 font-sinhala">සිංහල</SelectItem>
                      <SelectItem value="ta" className="px-3 py-1.5 font-tamil">தமிழ்</SelectItem>
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
                    <SelectContent className="p-1">
                      <SelectItem value="LKR" className="px-3 py-1.5">LKR (Rs.)</SelectItem>
                      <SelectItem value="USD" className="px-3 py-1.5">USD ($)</SelectItem>
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
          <Tooltip>
            <TooltipTrigger asChild>
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
            </TooltipTrigger>
            <TooltipContent side="bottom">Cart</TooltipContent>
          </Tooltip>
        </div>
      </header>
    </TooltipProvider>
  );
}
