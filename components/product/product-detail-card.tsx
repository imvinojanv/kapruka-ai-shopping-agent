"use client";

import Image from "next/image";
import { ShoppingCart, ExternalLink, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
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
    <Card className="overflow-hidden max-w-md p-0 gap-0">
      {product.images && product.images.length > 0 && (
        <DetailImageCarousel images={product.images} alt={product.name} />
      )}
      <CardContent className="px-4 pt-3 pb-2 space-y-3">
        <div>
          {product.category?.name && (
            <Badge variant="secondary" className="text-[10px] mb-2 -ml-1">
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

function DetailImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  if (images.length === 1) {
    return (
      <div className="relative w-full aspect-4/3 overflow-hidden bg-muted">
        <Image
          src={images[0]}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 448px) 100vw, 448px"
        />
      </div>
    );
  }

  return (
    <Carousel opts={{ align: "start", loop: true }} className="w-full">
      <CarouselContent className="ml-0">
        {images.map((src, i) => (
          <CarouselItem key={i} className="pl-0 basis-full">
            <div className="relative w-full aspect-4/3 overflow-hidden bg-muted">
              <Image
                src={src}
                alt={`${alt} ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 448px) 100vw, 448px"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2 h-8 w-8 bg-background/80 backdrop-blur-sm border shadow-sm" />
      <CarouselNext className="right-2 h-8 w-8 bg-background/80 backdrop-blur-sm border shadow-sm" />
    </Carousel>
  );
}
