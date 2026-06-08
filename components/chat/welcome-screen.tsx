"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Cake, Gift, Flower2, Truck } from "lucide-react";

const suggestions = [
  {
    icon: Cake,
    text: "I need to buy a birthday cake under Rs. 5000",
  },
  {
    icon: Gift,
    text: "Recommend a gift for my wife",
  },
  {
    icon: Flower2,
    text: "Show flower delivery options in Colombo",
  },
  {
    icon: Truck,
    text: "I am looking for a toy for my baby",
  },
];

export function WelcomeScreen({ onSuggestionClick }: { onSuggestionClick: (text: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4 max-w-lg"
      >
        <Image
          src="/kapruka-light-logo.png"
          alt="Kapruka"
          width={280}
          height={56}
          className="mx-auto rounded-xl"
        />
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome to Kapruka Shopping
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          I can help you find products, check delivery options, and place orders
          across Sri Lanka. Just tell me what you&apos;re looking for!
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 w-full max-w-2xl"
      >
        {suggestions.map((suggestion, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="flex items-start gap-3 rounded-xl border p-4 text-left transition-colors hover:bg-accent hover:border-primary/20"
          >
            <suggestion.icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-sm">{suggestion.text}</span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
