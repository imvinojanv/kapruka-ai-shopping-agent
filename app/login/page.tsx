"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Moon, Sun } from "lucide-react";
import { signIn } from "next-auth/react";
import { useSettingsStore } from "@/lib/store";

export default function LoginPage() {
  const { settings, updateSettings } = useSettingsStore();
  const isDark = settings.theme === "dark";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background via-background to-primary/10 dark:to-primary/20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8 text-center"
      >
        {/* Card with grid pattern */}
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg">
          {/* Grid pattern overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
            style={{
              backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
              backgroundSize: "28px 28px",
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center px-8 py-10 sm:px-12 sm:py-12">
            {/* Theme toggle - top right */}
            <motion.button
              onClick={() => updateSettings({ theme: isDark ? "light" : "dark" })}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-background/80 text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
              whileTap={{ scale: 0.85, rotate: 180 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <motion.span
                key={isDark ? "sun" : "moon"}
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3 }}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </motion.span>
            </motion.button>

            {/* Logo */}
            <div className="space-y-3 mb-8">
              <Image
                src="/kapruka-dark-logo.png"
                alt="Kapruka"
                width={200}
                height={40}
                className="mx-auto hidden dark:block"
              />
              <Image
                src="/kapruka-light-logo.png"
                alt="Kapruka"
                width={200}
                height={40}
                className="mx-auto dark:hidden"
              />
            </div>

            {/* Heading */}
            <div className="space-y-2 text-center mb-8">
              <h1 className="text-2xl font-bold font-heading">Welcome to Kapruka AI</h1>
              <p className="text-sm text-muted-foreground">
                Sign in to continue shopping with your AI assistant
              </p>
            </div>

            {/* Google Sign-in Button */}
            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-border/80 bg-accent px-5 py-3.5 text-sm font-medium transition-colors hover:bg-background"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* Footer text */}
            <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
              By continuing, you agree to Kapruka&apos;s Terms of <br/>Service and Privacy Policy.
            </p>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground">
          © 2026 imvinojanv.dev. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
    </svg>
  );
}
