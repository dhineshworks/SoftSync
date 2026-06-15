import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { LayoutDashboard, Package, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) navigate({ to: "/auth", search: { redirect: "/admin" } });
      else if (!isAdmin) navigate({ to: "/" });
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading || !user || !isAdmin) {
    return <div className="p-12 text-center text-muted-foreground">Checking access…</div>;
  }

  const nav: Array<{ to: "/admin" | "/admin/products" | "/admin/orders"; label: string; Icon: typeof LayoutDashboard; exact?: boolean }> = [
    { to: "/admin", label: "Overview", Icon: LayoutDashboard, exact: true },
    { to: "/admin/products", label: "Products", Icon: Package },
    { to: "/admin/orders", label: "Orders", Icon: ShoppingCart },
  ];

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[220px_1fr] lg:px-8">
      <aside>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Admin</p>
        <nav className="mt-4 space-y-1">
          {nav.map(({ to, label, Icon, exact }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact }}
              activeProps={{ className: "bg-secondary text-foreground" }}
              className={cn("flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground")}
            >
              <Icon className="size-4" /> {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div><Outlet /></div>
    </div>
  );
}
