import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { BRAND_NAME } from "@/lib/brand";

type Search = { category?: string; q?: string };

export const Route = createFileRoute("/products")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    category: typeof s.category === "string" ? s.category : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: `Browse all software licenses - ${BRAND_NAME}` },
      { name: "description", content: "Browse our full catalog of premium software subscriptions, AI tools, design apps and streaming services." },
    ],
  }),
  component: Products,
});

function Products() {
  const { category, q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [query, setQuery] = useState(q ?? "");
  const [sort, setSort] = useState<"new" | "low" | "high">("new");

  const { data, isLoading } = useQuery({
    queryKey: ["products", "all"],
    queryFn: () => api.getProducts(),
  });

  const categories = useMemo(() => {
    const set = new Set(data?.map((p) => p.category) ?? []);
    return Array.from(set);
  }, [data]);

  const filtered = useMemo(() => {
    let list = data ?? [];
    if (category) list = list.filter((p) => p.category === category);
    if (query.trim()) {
      const ql = query.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(ql) || p.category.toLowerCase().includes(ql));
    }
    if (sort === "low") list = [...list].sort((a, b) => (a.offer_price ?? a.price) - (b.offer_price ?? b.price));
    if (sort === "high") list = [...list].sort((a, b) => (b.offer_price ?? b.price) - (a.offer_price ?? a.price));
    return list;
  }, [data, category, query, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="rounded-3xl border border-border/70 bg-card/70 p-8 shadow-[var(--shadow-soft)]">
        <p className="text-xs font-bold uppercase tracking-widest text-primary/75">Catalog</p>
        <h1 className="mt-2 text-4xl md:text-5xl">
          {category ? <>Category · <span className="text-primary">{category}</span></> : "All products"}
        </h1>
      </header>

      <div className="mt-8 grid gap-8 md:grid-cols-[220px_1fr]">
        <aside className="h-fit space-y-6 rounded-2xl border border-border/70 bg-card/75 p-5 shadow-sm">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary/75">Categories</p>
            <ul className="space-y-1.5 text-sm">
              <li>
                <Link to="/products" className={!category ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"}>All</Link>
              </li>
              {categories.map((c) => (
                <li key={c}>
                  <Link to="/products" search={{ category: c }} className={category === c ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"}>
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary/75">Sort</p>
            <select value={sort} onChange={(e) => setSort(e.target.value as "new" | "low" | "high")} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-ring/30">
              <option value="new">Newest</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>
          </div>
        </aside>

        <div>
          <div className="relative mb-6">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => { setQuery(e.target.value); navigate({ search: (prev: Search) => ({ ...prev, q: e.target.value || undefined }) }); }}
              placeholder="Search software, brands, categories..."
              className="h-11 rounded-2xl bg-card/80 pl-9 shadow-sm"
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-card/60 py-20 text-center text-sm text-muted-foreground">No products match your filters.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {filtered.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
