"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { useShoppingStore } from "@/lib/store";

interface ProductResult {
  id: string;
  name: string;
  summary?: string;
  price?: { amount: number | null; currency: string };
  in_stock?: boolean;
  stock_level?: string;
  image_url?: string;
  images?: string[];
  url?: string;
}

export function ProductCarousel({ data }: { data: unknown }) {
  if (typeof data === "string") return null;

  const obj = data as Record<string, unknown>;
  const rawResults = (obj.results ?? []) as ProductResult[];

  // Deduplicate by product ID
  const seen = new Set<string>();
  const results = rawResults.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  if (results.length === 0) return null;

  return (
    <div className="w-full my-2 py-2">
      <Carousel
        opts={{ align: "start", loop: false }}
        className="w-full relative"
      >
        <CarouselContent className="-ml-3">
          {results.map((product, i) => (
            <CarouselItem key={`${product.id}-${i}`} className="pl-3 basis-60 sm:basis-70">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="h-full p-[0.5px]"
              >
                <ProductMiniCard product={product} />
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 h-9 w-9 bg-background/90 dark:bg-background/90 hover:dark:bg-background/70 border shadow-md" />
        <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 h-9 w-9 bg-background/90 dark:bg-background/90 hover:dark:bg-background/70 border shadow-md" />
      </Carousel>
    </div>
  );
}

function ProductMiniCard({ product }: { product: ProductResult }) {
  const addToCart = useShoppingStore((s) => s.addToCart);

  const images = product.images?.length
    ? product.images
    : product.image_url
      ? [product.image_url]
      : [];

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price?.amount ?? 0,
      currency: product.price?.currency ?? "LKR",
      quantity: 1,
      imageUrl: images[0],
    });
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col gap-0 p-0 hover:bg-accent/50">
      {images.length > 0 && (
        <ImageSlider images={images} alt={product.name} />
      )}

      <div className="p-3 space-y-2 flex-1 flex flex-col">
        <h4 className="text-sm font-medium leading-tight line-clamp-2">
          {product.name}
        </h4>

        <div className="flex items-center justify-between mt-auto">
          {product.price?.amount != null && (
            <span className="text-sm font-semibold text-primary">
              {product.price.currency} {product.price.amount.toLocaleString()}
            </span>
          )}
          {product.in_stock !== undefined && (
            <Badge
              variant={product.in_stock ? "secondary" : "destructive"}
              className={`text-[11px] ${product.in_stock ? "bg-green-600/20 text-green-600" : ""}`}
            >
              {product.in_stock ? "In Stock" : "Out"}
            </Badge>
          )}
        </div>

        <div className="flex gap-1.5 pt-1">
          <Button size="sm" className="flex-1 h-7 text-xs gap-1" onClick={handleAddToCart}>
            <ShoppingCart className="h-3 w-3" />
            Add
          </Button>
          {product.url && (
            <Button size="sm" variant="outline" className="h-7 w-7 p-0" asChild>
              <a href={product.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function ImageSlider({ images, alt }: { images: string[]; alt: string }) {
  const [current, setCurrent] = useState(0);

  if (images.length === 1) {
    return (
      <div className="w-full overflow-hidden bg-muted">
        <img src={images[0]} alt={alt} className="w-full aspect-4/3 object-cover" />
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden bg-muted group">
      <img
        src={images[current]}
        alt={`${alt} ${current + 1}`}
        className="w-full aspect-4/3 object-cover transition-opacity duration-300"
      />

      <button
        onClick={(e) => {
          e.stopPropagation();
          setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
        }}
        className="absolute left-1.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
        }}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        {images.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${i === current ? "bg-primary" : "bg-background/60"
              }`}
          />
        ))}
      </div>
    </div>
  );
}
