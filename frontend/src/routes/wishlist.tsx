import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";
import { ProductCard, type Product } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/wishlist")({
  component: Wishlist,
});

function Wishlist() {
  const { wishlist } = useStore();
  const { data } = useQuery({
    queryKey: ["wishlist-products", wishlist],
    queryFn: () => (wishlist.length === 0 ? Promise.resolve([]) : api.getProducts(wishlist)),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl">Wishlist</h1>
      {(!data || data.length === 0) ? (
        <div className="mt-16 rounded-2xl border border-dashed border-border p-16 text-center">
          <Heart className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-4 text-lg">Nothing saved yet</p>
          <Button asChild className="mt-6 rounded-full"><Link to="/products">Discover products</Link></Button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {data.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}
