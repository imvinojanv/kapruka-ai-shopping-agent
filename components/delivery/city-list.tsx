"use client";

import { useState, useMemo } from "react";
import { MapPin, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface City {
  name: string;
  aliases?: string[];
}

const PAGE_SIZE = 10;

export function CityList({ data }: { data: unknown }) {
  if (typeof data === "string" || !data) return null;

  const obj = data as Record<string, unknown>;
  const cities = (obj.cities ?? []) as City[];
  const totalMatched = (obj.total_matched ?? cities.length) as number;

  if (cities.length === 0) return null;

  return <CityTable cities={cities} totalMatched={totalMatched} />;
}

function CityTable({ cities, totalMatched }: { cities: City[]; totalMatched: number }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!search.trim()) return cities;
    const q = search.toLowerCase();
    return cities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.aliases?.some((a) => a.toLowerCase().includes(q))
    );
  }, [cities, search]);

  console.log("Filtered cities:", filtered.length);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="rounded-xl border overflow-hidden max-w-lg p-2">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-3 py-1">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-base font-medium">Delivery Cities</span>
          <Badge variant="secondary" className="text-xs font-semibold bg-primary/30 text-primary">
            {totalMatched}
          </Badge>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pt-2 pb-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search cities..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-muted/20 divide-y">
        <div className="grid grid-cols-[1fr_2fr] px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/40">
          <span>City</span>
          <span>Aliases</span>
        </div>
        {paginated.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-muted-foreground">
            No cities found
          </div>
        ) : (
          paginated.map((city) => (
            <div key={city.name} className="grid grid-cols-[1fr_2fr] px-4 py-2 text-sm items-start hover:bg-accent/30 transition-colors">
              <span className="text-sm">{city.name}</span>
              <div className="flex flex-wrap items-center gap-1 mt-0.5">
                {city.aliases && city.aliases.length > 0 ? (
                  city.aliases.map((alias, i) => (
                    <span key={i} className="text-xs font-normal capitalize text-muted-foreground">
                      {alias.split('|').join(', ')}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground ml-1">—</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 pt-2 pb-1">
          <span className="text-[11px] text-muted-foreground">
            {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-[11px] text-muted-foreground min-w-8 text-center">
              {page + 1}/{totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
