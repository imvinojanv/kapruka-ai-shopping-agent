"use client";

import { useState } from "react";
import { ShoppingCart, ExternalLink, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useShoppingStore } from "@/lib/store";

interface ProductDetail {
  id: string;
  name: string;
  description?: string;
  summary?: string;
  price?: { amount: number; currency: string };
  compare_at_price?: { amount: number; currency: string } | null;
  in_stock?: boolean;
  stock_level?: string;
  images?: string[];
  url?: string;
  category?: { name: string };
  shipping?: { ships_from?: string; ships_internationally?: boolean };
}

export function ProductDetailCard({ data }: { data: unknown }) {
  if (typeof data === "string" || !data) return null;
  const product = data as ProductDetail;
  const addToCart = useShoppingStore((s) => s.addToCart);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price?.amount ?? 0,
      currency: product.price?.currency ?? "LKR",
      quantity: 1,
      imageUrl: product.images?.[0],
    });
  };

  return (
    <Card className="overflow-hidden max-w-md">
      {product.images && product.images.length > 0 && (
        <DetailImageSlider images={product.images} alt={product.name} />
      )}
      <CardContent className="p-4 space-y-3">
        <div>
          {product.category?.name && (
            <Badge variant="secondary" className="text-[10px] mb-1">
              {product.category.name}
            </Badge>
          )}
          <h3 className="font-semibold text-base leading-tight">{product.name}</h3>
          {product.summary && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {product.summary}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {product.price && (
            <span className="text-lg font-bold text-primary">
              {product.price.currency} {product.price.amount.toLocaleString()}
            </span>
          )}
          {product.compare_at_price && (
            <span className="text-sm text-muted-foreground line-through">
              {product.compare_at_price.currency} {product.compare_at_price.amount.toLocaleString()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Package className="h-3 w-3" />
          <span>
            {product.in_stock ? `In Stock (${product.stock_level})` : "Out of Stock"}
          </span>
          {product.shipping?.ships_from && (
            <>
              <span>·</span>
              <span>Ships from {product.shipping.ships_from}</span>
            </>
          )}
        </div>

        <Separator />

        <div className="flex gap-2">
          <Button className="flex-1 gap-2" onClick={handleAddToCart} disabled={!product.in_stock}>
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
          {product.url && (
            <Button variant="outline" size="icon" asChild>
              <a href={product.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function DetailImageSlider({ images, alt }: { images: string[]; alt: string }) {
  const [current, setCurrent] = useState(0);

  if (images.length === 1) {
    return (
      <div className="aspect-4/3 overflow-hidden bg-muted">
        <img src={images[0]} alt={alt} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div className="relative aspect-4/3 overflow-hidden bg-muted group">
      <img
        src={images[current]}
        alt={`${alt} ${current + 1}`}
        className="h-full w-full object-cover transition-opacity duration-300"
      />

      <button
        onClick={() => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1))}
        className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={() => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1))}
        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 w-2 rounded-full transition-colors ${
              i === current ? "bg-primary" : "bg-background/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
