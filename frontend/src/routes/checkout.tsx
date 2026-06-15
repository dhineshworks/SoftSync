import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { formatINR, WHATSAPP_NUMBER } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { BRAND_NAME } from "@/lib/brand";

export const Route = createFileRoute("/checkout")({
  component: Checkout,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Name is required").max(80),
  email: z.string().trim().email("Valid email required").max(120),
  phone: z.string().trim().regex(/^[0-9+\-\s]{7,15}$/, "Valid phone required"),
  notes: z.string().trim().max(500).optional(),
});

function Checkout() {
  const { cart, clearCart } = useStore();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/checkout" } });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      api.getProfile().then((data) => {
        setForm((f) => ({
          ...f,
          full_name: data.full_name || f.full_name,
          phone: data.phone || f.phone,
          email: user.email ?? f.email,
        }));
      }).catch(() => {});
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) { toast.error("Your cart is empty"); return; }
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    if (!user) return;
    setSubmitting(true);
    try {
      await api.createOrder({
        customer_name: parsed.data.full_name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        notes: parsed.data.notes,
        items: cart,
        total,
      });

      const lines = cart.map((i) => `• ${i.name} × ${i.quantity} — ${formatINR(i.price * i.quantity)}`).join("\n");
      const msg = `*New order request — ${BRAND_NAME}*%0A%0A` +
        `*Name:* ${parsed.data.full_name}%0A` +
        `*Email:* ${parsed.data.email}%0A` +
        `*Phone:* ${parsed.data.phone}%0A%0A` +
        `*Items:*%0A${encodeURIComponent(lines)}%0A%0A` +
        `*Total:* ${formatINR(total)}` +
        (parsed.data.notes ? `%0A%0A*Notes:* ${encodeURIComponent(parsed.data.notes)}` : "");
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
      clearCart();
      toast.success("Order placed — redirecting to WhatsApp");
      window.open(url, "_blank");
      setTimeout(() => navigate({ to: "/profile" }), 800);
    } catch (err) {
      toast.error((err as Error).message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) return <div className="p-12 text-center text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl">Checkout</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Confirm your details. We'll send the order to WhatsApp and reply within minutes.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-10 md:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="phone">Phone (WhatsApp)</Label>
            <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl">Order summary</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {cart.map((i) => (
              <li key={i.id} className="flex justify-between gap-3">
                <span className="text-muted-foreground">{i.name} <span className="text-foreground">× {i.quantity}</span></span>
                <span>{formatINR(i.price * i.quantity)}</span>
              </li>
            ))}
            {cart.length === 0 && <li className="text-muted-foreground">Cart is empty. <Link to="/products" className="underline">Shop now</Link>.</li>}
          </ul>
          <div className="mt-4 flex justify-between border-t border-border pt-4 font-medium"><span>Total</span><span>{formatINR(total)}</span></div>
          <Button type="submit" disabled={submitting || cart.length === 0} size="lg" className="mt-6 w-full rounded-full">
            {submitting ? "Sending…" : "Confirm & send to WhatsApp"}
          </Button>
        </aside>
      </form>
    </div>
  );
}
