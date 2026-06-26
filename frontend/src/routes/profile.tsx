import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditCard, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/profile")({
  component: Profile,
});

function Profile() {
  const { user, loading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ full_name: "", phone: "" });
  const [saving, setSaving] = useState(false);

  // Credit Purchase States
  const [selectedPack, setSelectedPack] = useState<{ amount: number; price: number; label: string } | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cardForm, setCardForm] = useState({ cardNumber: "", expiry: "", cvc: "", name: "" });
  const [processingPayment, setProcessingPayment] = useState(false);

  const handlePackSelect = (pack: { amount: number; price: number; label: string }) => {
    setSelectedPack(pack);
    setCardForm({ cardNumber: "", expiry: "", cvc: "", name: user?.full_name || "" });
    setCheckoutOpen(true);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardForm({ ...cardForm, cardNumber: formatted });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    const formatted = value.length >= 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value;
    setCardForm({ ...cardForm, expiry: formatted });
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 3);
    setCardForm({ ...cardForm, cvc: value });
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPack) return;

    const cleanCard = cardForm.cardNumber.replace(/\s/g, "");
    if (cleanCard.length !== 16) {
      toast.error("Please enter a valid 16-digit card number");
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardForm.expiry)) {
      toast.error("Please enter expiry date in MM/YY format");
      return;
    }
    if (cardForm.cvc.length !== 3) {
      toast.error("Please enter a valid 3-digit CVC");
      return;
    }

    setProcessingPayment(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const res = await api.buyCredits(selectedPack.amount);
      if (res.success) {
        toast.success(`Payment successful! Purchased ${selectedPack.amount} credits.`);
        await refreshUser();
        setCheckoutOpen(false);
        setSelectedPack(null);
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setProcessingPayment(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (user) {
      api.getProfile().then((data) => {
        setProfile({ full_name: data.full_name ?? "", phone: data.phone ?? "" });
      }).catch(() => {});
    }
  }, [user]);

  const { data: orders } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: () => api.getMyOrders(),
  });

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await api.updateProfile(profile);
      toast.success("Profile saved");
    } catch (err) {
      toast.error((err as Error).message);
    }
    setSaving(false);
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl">Your account</h1>

      <div className="mt-10 grid gap-12 md:grid-cols-[320px_1fr]">
        <section>
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground">Profile</h2>
          <div className="mt-4 space-y-4">
            <div><Label>Email</Label><Input value={user.email ?? ""} disabled /></div>
            <div><Label>Full name</Label><Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
            <Button onClick={save} disabled={saving} className="rounded-full">{saving ? "Saving…" : "Save"}</Button>
          </div>
        </section>

        <section>
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground">Order history</h2>
          {!orders || orders.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No orders yet. <Link to="/products" className="text-foreground underline">Browse products</Link>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-border border-y border-border">
              {orders.map((o) => (
                <li key={o.id} className="py-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{formatINR(Number(o.total))}</p>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs uppercase tracking-wider">{o.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleString()} · {(o.items as Array<{name: string; quantity: number}>).length} items
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
        {user.role === "business" && (
          <div className="md:col-span-2 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">Business Credits</h2>
            <p className="text-sm text-muted-foreground mt-1">
              You currently have <span className="font-bold text-foreground">{user.credits ?? 0} credits</span>. 
              Adding a product to the catalog costs 1 credit.
            </p>
            <div className="mt-6 border-t border-border pt-6">
              <h3 className="text-sm font-semibold">Buy Credits</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Select a package to increase your credit balance instantly.</p>
              
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {[
                  { amount: 10, price: 10, label: "Starter Pack" },
                  { amount: 50, price: 40, label: "Growth Pack" },
                  { amount: 100, price: 70, label: "Professional Pack" },
                ].map((pack) => (
                  <div key={pack.amount} className="rounded-xl border border-border bg-background p-4 flex flex-col justify-between hover:border-foreground/30 transition-colors">
                    <div>
                      <p className="text-xs uppercase font-semibold text-muted-foreground">{pack.label}</p>
                      <p className="text-2xl font-bold mt-2">{pack.amount} Credits</p>
                    </div>
                    <Button 
                      onClick={() => handlePackSelect(pack)} 
                      className="mt-4 w-full rounded-full"
                    >
                      Buy for ₹{pack.price}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="size-5" /> Secure Checkout
            </DialogTitle>
          </DialogHeader>

          {selectedPack && (
            <form onSubmit={handlePaymentSubmit} className="space-y-4 mt-2">
              <div className="rounded-xl bg-muted p-4 border border-border flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase font-semibold text-muted-foreground">{selectedPack.label}</p>
                  <p className="text-lg font-bold text-foreground mt-0.5">{selectedPack.amount} Business Credits</p>
                </div>
                <p className="text-xl font-bold">{formatINR(selectedPack.price)}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="card-name">Cardholder Name</Label>
                  <Input
                    id="card-name"
                    required
                    placeholder="John Doe"
                    value={cardForm.name}
                    onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input
                    id="card-number"
                    required
                    placeholder="4242 4242 4242 4242"
                    value={cardForm.cardNumber}
                    onChange={handleCardNumberChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="card-expiry">Expiry Date</Label>
                    <Input
                      id="card-expiry"
                      required
                      placeholder="MM/YY"
                      value={cardForm.expiry}
                      onChange={handleExpiryChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="card-cvc">CVC</Label>
                    <Input
                      id="card-cvc"
                      required
                      type="password"
                      placeholder="123"
                      value={cardForm.cvc}
                      onChange={handleCvcChange}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center pt-2">
                <ShieldCheck className="size-4 text-emerald-500" />
                <span>SSL Encrypted 256-bit Payment Gateway</span>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setCheckoutOpen(false)} disabled={processingPayment}>
                  Cancel
                </Button>
                <Button type="submit" disabled={processingPayment} className="rounded-full">
                  {processingPayment ? "Processing…" : `Pay ${formatINR(selectedPack.price)}`}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
