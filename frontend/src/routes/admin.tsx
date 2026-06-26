import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { LayoutDashboard, Package, ShoppingCart, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { user, isAdmin, isBusiness, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate({ to: "/auth", search: { redirect: "/admin" } });
      } else if (!isAdmin && !isBusiness) {
        navigate({ to: "/" });
      } else if (isBusiness && window.location.pathname === "/admin") {
        navigate({ to: "/admin/products" });
      }
    }
  }, [user, isAdmin, isBusiness, loading, navigate]);

  if (loading || !user || (!isAdmin && !isBusiness)) {
    return <div className="p-12 text-center text-muted-foreground">Checking access…</div>;
  }

  const nav: Array<{ to: "/admin" | "/admin/products" | "/admin/orders" | "/admin/users"; label: string; Icon: typeof LayoutDashboard; exact?: boolean }> = [];
  
  if (isAdmin) {
    nav.push({ to: "/admin", label: "Overview", Icon: LayoutDashboard, exact: true });
  }
  
  if (isAdmin || isBusiness) {
    nav.push({ to: "/admin/products", label: "Products", Icon: Package });
  }
  
  if (isAdmin) {
    nav.push({ to: "/admin/orders", label: "Orders", Icon: ShoppingCart });
    nav.push({ to: "/admin/users", label: "Users", Icon: Users });
  }

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
