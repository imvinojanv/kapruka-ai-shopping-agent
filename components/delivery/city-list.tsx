"use client";

import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface City {
  name: string;
  aliases?: string[];
}

export function CityList({ data }: { data: unknown }) {
  if (typeof data === "string" || !data) return null;

  const obj = data as Record<string, unknown>;
  const cities = (obj.cities ?? []) as City[];
  const totalMatched = (obj.total_matched ?? cities.length) as number;

  if (cities.length === 0) return null;

  return (
    <div className="rounded-lg border p-4 space-y-2 max-w-sm">
      <div className="flex items-center gap-2 text-sm font-medium">
        <MapPin className="h-4 w-4 text-primary" />
        <span>Delivery Cities</span>
        <Badge variant="secondary" className="text-[10px]">
          {totalMatched} found
        </Badge>
      </div>
      <div className="space-y-1">
        {cities.map((city) => (
          <div key={city.name} className="flex items-center gap-2 text-sm py-1">
            <span className="font-medium">{city.name}</span>
            {city.aliases && city.aliases.length > 0 && (
              <span className="text-xs text-muted-foreground">
                ({city.aliases.join(", ")})
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
