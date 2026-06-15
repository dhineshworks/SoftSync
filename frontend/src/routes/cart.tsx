import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/cart")({
  component: Cart,
});

function Cart() {
  const { cart, updateQty, removeFromCart } = useStore();
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl">Your cart</h1>

      {cart.length === 0 ? (
        <div className="mt-16 rounded-2xl border border-dashed border-border p-16 text-center">
          <ShoppingBag className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-4 text-lg">Your cart is empty</p>
          <p className="mt-1 text-sm text-muted-foreground">Discover our hand-picked software bundles.</p>
          <Button asChild className="mt-6 rounded-full"><Link to="/products">Browse products</Link></Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 md:grid-cols-[1fr_360px]">
          <ul className="divide-y divide-border border-y border-border">
            {cart.map((i) => (
              <li key={i.id} className="flex gap-4 py-5">
                <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {i.image_url && <img src={i.image_url} alt={i.name} className="size-full object-cover" />}
                </div>
                <div className="flex-1">
                  <Link to="/products/$slug" params={{ slug: i.slug }} className="font-medium hover:underline">{i.name}</Link>
                  <p className="mt-1 text-sm text-muted-foreground">{formatINR(i.price)}</p>
                  <div className="mt-3 inline-flex items-center rounded-full border border-border">
                    <button onClick={() => updateQty(i.id, i.quantity - 1)} className="grid size-8 place-items-center hover:bg-accent rounded-l-full"><Minus className="size-3" /></button>
                    <span className="w-8 text-center text-sm">{i.quantity}</span>
                    <button onClick={() => updateQty(i.id, i.quantity + 1)} className="grid size-8 place-items-center hover:bg-accent rounded-r-full"><Plus className="size-3" /></button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatINR(i.price * i.quantity)}</p>
                  <button onClick={() => removeFromCart(i.id)} className="mt-3 text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl">Summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatINR(total)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Delivery</dt><dd>Free</dd></div>
            </dl>
            <div className="mt-4 flex justify-between border-t border-border pt-4 font-medium"><span>Total</span><span>{formatINR(total)}</span></div>
            <Button asChild size="lg" className="mt-6 w-full rounded-full"><Link to="/checkout">Checkout via WhatsApp</Link></Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">Manual order confirmation — no online payment yet.</p>
          </aside>
        </div>
      )}
    </div>
  );
}
