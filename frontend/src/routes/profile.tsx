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

export const Route = createFileRoute("/profile")({
  component: Profile,
});

function Profile() {
  const { user, loading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ full_name: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [buyingCredits, setBuyingCredits] = useState(false);

  const handleBuyCredits = async (amount: number) => {
    setBuyingCredits(true);
    try {
      const res = await api.buyCredits(amount);
      if (res.success) {
        toast.success(`Successfully purchased ${amount} credits!`);
        await refreshUser();
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBuyingCredits(false);
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
                      onClick={() => handleBuyCredits(pack.amount)} 
                      disabled={buyingCredits}
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
    </div>
  );
}
