import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, ShoppingBag, CheckCircle2, MessageCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/products/$slug")({
  component: Detail,
});

function Detail() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isWished } = useStore();

  const { data: p, isLoading, error } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      try {
        return await api.getProductBySlug(slug);
      } catch {
        throw notFound();
      }
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 md:grid-cols-2 lg:px-8">
        <Skeleton className="aspect-square rounded-3xl" />
        <div className="space-y-4"><Skeleton className="h-8 w-2/3" /><Skeleton className="h-4 w-1/3" /><Skeleton className="h-24" /></div>
      </div>
    );
  }
  if (error || !p) return <div className="p-12 text-center">Product not found.</div>;

  const active = p.offer_price ?? p.price;
  const wished = isWished(p.id);

  const handleAdd = () => {
    addToCart({ id: p.id, name: p.name, slug: p.slug, price: active, image_url: p.image_url });
    toast.success("Added to cart");
  };

  const handleBuyNow = () => {
    addToCart({ id: p.id, name: p.name, slug: p.slug, price: active, image_url: p.image_url });
    navigate({ to: "/checkout" });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to="/products" className="text-sm font-semibold text-primary hover:text-primary/80">← All products</Link>

      <div className="mt-6 grid gap-12 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-secondary to-accent/70 shadow-[var(--shadow-soft)]">
          {p.image_url && <img src={p.image_url} alt={p.name} className="aspect-square w-full object-cover" />}
        </div>

        <div className="rounded-3xl border border-border/70 bg-card/75 p-6 shadow-[var(--shadow-soft)] md:p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-primary/75">{p.category}</p>
          <h1 className="mt-2 text-4xl md:text-5xl">{p.name}</h1>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatINR(active)}</span>
            {p.offer_price && (
              <>
                <span className="text-lg text-muted-foreground line-through">{formatINR(p.price)}</span>
                <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-bold text-success">
                  Save {Math.round(((p.price - p.offer_price) / p.price) * 100)}%
                </span>
              </>
            )}
          </div>

          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4 text-success" />
            {p.stock_status === "in_stock" ? "In stock - delivered in minutes" : "Out of stock"}
          </p>

          <p className="mt-6 text-base leading-relaxed text-muted-foreground">{p.description}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={handleBuyNow} size="lg" className="rounded-full px-6">
              <ShoppingBag className="mr-2 size-4" /> Buy now
            </Button>
            <Button onClick={handleAdd} size="lg" variant="outline" className="rounded-full px-6">
              Add to cart
            </Button>
            <Button onClick={() => toggleWishlist(p.id)} size="lg" variant="ghost" className="rounded-full">
              <Heart className={cn("size-4", wished && "fill-destructive text-destructive")} />
            </Button>
          </div>

          <a href="https://wa.me/919677520040" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
            <MessageCircle className="size-4" /> Questions? Chat on WhatsApp
          </a>

          <dl className="mt-10 grid grid-cols-2 gap-4 border-t border-border pt-6 text-sm">
            <div><dt className="text-muted-foreground">Category</dt><dd className="mt-1 font-medium">{p.category}</dd></div>
            <div><dt className="text-muted-foreground">Delivery</dt><dd className="mt-1 font-medium">Manual · WhatsApp</dd></div>
            <div><dt className="text-muted-foreground">Warranty</dt><dd className="mt-1 font-medium">Full term replacement</dd></div>
            <div><dt className="text-muted-foreground">Support</dt><dd className="mt-1 font-medium">9am-10pm IST</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}
