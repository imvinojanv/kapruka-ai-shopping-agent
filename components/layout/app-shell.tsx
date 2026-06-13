"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { CartModal } from "@/components/order/cart-modal";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useSettingsStore } from "@/lib/store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Don't wrap login page with shell
  if (pathname === "/login") {
    return <>{children}</>;
  }
  const { sidebarOpen, setSidebarOpen, settings } = useSettingsStore();
  const [cartOpen, setCartOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
  }, [settings.theme]);

  const handleNewChat = useCallback(() => {
    router.push("/");
    if (isMobile) setMobileSidebarOpen(false);
  }, [router, isMobile]);

  const handleToggleSidebar = useCallback(() => {
    if (isMobile) {
      setMobileSidebarOpen((v) => !v);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  }, [isMobile, sidebarOpen, setSidebarOpen]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="h-full overflow-hidden border-r"
            >
              <Sidebar onNewChat={handleNewChat} />
            </motion.aside>
          )}
        </AnimatePresence>
      )}

      {/* Mobile Sidebar (Sheet) */}
      {isMobile && (
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="w-70 p-0">
            <Sidebar onNewChat={handleNewChat} />
          </SheetContent>
        </Sheet>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onToggleSidebar={handleToggleSidebar}
          onOpenCart={() => setCartOpen(true)}
        />
        {children}
      </div>

      {/* Cart */}
      <CartModal open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  );
}
