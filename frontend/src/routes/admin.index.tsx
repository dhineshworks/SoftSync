import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { Package, ShoppingCart, IndianRupee, Star } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.getAdminStats(),
  });

  const cards = [
    { label: "Products", value: stats?.productCount ?? 0, Icon: Package },
    { label: "Featured", value: stats?.featured ?? 0, Icon: Star },
    { label: "Orders", value: stats?.orderCount ?? 0, Icon: ShoppingCart, sub: `${stats?.pending ?? 0} pending` },
    { label: "Revenue", value: formatINR(stats?.totalRevenue ?? 0), Icon: IndianRupee },
  ];

  return (
    <div>
      <h1 className="text-4xl">Overview</h1>
      <p className="mt-2 text-sm text-muted-foreground">A glance at the storefront performance.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, Icon, sub }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
              <Icon className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-3 text-3xl">{value}</p>
            {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-xl">Recent orders</h2>
      <ul className="mt-4 divide-y divide-border border-y border-border">
        {(stats?.recent ?? []).map((o) => (
          <li key={o.id} className="flex items-center justify-between py-4 text-sm">
            <span className="text-muted-foreground">{new Date(o.created_at).toLocaleString()}</span>
            <span className="font-medium">{formatINR(Number(o.total))}</span>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs uppercase tracking-wider">{o.status}</span>
          </li>
        ))}
        {(!stats?.recent || stats.recent.length === 0) && <li className="py-4 text-sm text-muted-foreground">No orders yet.</li>}
      </ul>
    </div>
  );
}
