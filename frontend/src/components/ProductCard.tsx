import { Link } from "@tanstack/react-router";
import { Heart, Plus } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  offer_price: number | null;
  image_url: string | null;
  stock_status: string;
  is_featured?: boolean;
};

export function ProductCard({ p }: { p: Product }) {
  const { toggleWishlist, isWished, addToCart } = useStore();
  const active = p.offer_price ?? p.price;
  const wished = isWished(p.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({ id: p.id, name: p.name, slug: p.slug, price: active, image_url: p.image_url });
    toast.success(`${p.name} added to cart`);
  };

  return (
    <Link
      to="/products/$slug"
      params={{ slug: p.slug }}
      className="group relative block overflow-hidden rounded-2xl border border-border/80 bg-card/90 shadow-[var(--shadow-soft)] transition duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[var(--shadow-hover)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-secondary to-accent/70">
        {p.image_url && (
          <img
            src={p.image_url}
            alt={p.name}
            loading="lazy"
            className="size-full object-cover transition duration-700 group-hover:scale-105"
          />
        )}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); toggleWishlist(p.id); }}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full border border-white/70 bg-background/90 shadow-sm backdrop-blur transition hover:scale-105"
          aria-label="Toggle wishlist"
        >
          <Heart className={cn("size-4", wished ? "fill-destructive text-destructive" : "text-foreground")} />
        </button>
        {p.offer_price && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm">
            Save {Math.round(((p.price - p.offer_price) / p.price) * 100)}%
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-primary/75">{p.category}</p>
        <h3 className="mt-1 font-sans text-base font-semibold text-foreground">{p.name}</h3>
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold">{formatINR(active)}</span>
            {p.offer_price && (
              <span className="text-xs text-muted-foreground line-through">{formatINR(p.price)}</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleAdd}
            aria-label={`Add ${p.name} to cart`}
            className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm transition hover:scale-105 hover:bg-primary/90"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
