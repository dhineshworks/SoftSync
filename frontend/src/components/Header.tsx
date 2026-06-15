import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, ShoppingBag, User, Search, LogOut, Shield } from "lucide-react";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export function Header() {
  const { cart, wishlist } = useStore();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-background/85 shadow-[0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2" aria-label="SoftSync home">
          <Logo showWordmark wordmarkClassName="text-2xl" />
        </Link>

        <nav className="hidden items-center gap-2 rounded-full border border-border/70 bg-card/75 p-1 text-sm font-medium text-muted-foreground shadow-sm md:flex">
          <Link to="/" activeOptions={{ exact: true }} className="rounded-full px-4 py-2 transition hover:bg-accent hover:text-accent-foreground" activeProps={{ className: "bg-primary text-primary-foreground shadow-sm" }}>Home</Link>
          <Link to="/products" className="rounded-full px-4 py-2 transition hover:bg-accent hover:text-accent-foreground" activeProps={{ className: "bg-primary text-primary-foreground shadow-sm" }}>Browse</Link>
          <Link to="/products" search={{ category: "AI Tools" }} className="rounded-full px-4 py-2 transition hover:bg-accent hover:text-accent-foreground">AI Tools</Link>
          <Link to="/products" search={{ category: "Streaming" }} className="rounded-full px-4 py-2 transition hover:bg-accent hover:text-accent-foreground">Streaming</Link>
        </nav>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/products" })} aria-label="Search">
            <Search className="size-4" />
          </Button>
          <Link to="/wishlist" className="relative inline-flex size-9 items-center justify-center rounded-md hover:bg-accent" aria-label="Wishlist">
            <Heart className="size-4" />
            {wishlist.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">{wishlist.length}</span>
            )}
          </Link>
          <Link to="/cart" className="relative inline-flex size-9 items-center justify-center rounded-md hover:bg-accent" aria-label="Cart">
            <ShoppingBag className="size-4" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">{cartCount}</span>
            )}
          </Link>
          {isAdmin && (
            <Link to="/admin" className="inline-flex size-9 items-center justify-center rounded-md hover:bg-accent" aria-label="Admin">
              <Shield className="size-4" />
            </Link>
          )}
          {user ? (
            <>
              <Link to="/profile" className="inline-flex size-9 items-center justify-center rounded-md hover:bg-accent" aria-label="Profile">
                <User className="size-4" />
              </Link>
              <Button variant="ghost" size="icon" onClick={() => signOut().then(() => navigate({ to: "/" }))} aria-label="Sign out">
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="ml-2">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
