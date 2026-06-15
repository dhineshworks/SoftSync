import { Link } from "@tanstack/react-router";
import { BRAND_NAME } from "@/lib/brand";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/70 bg-card/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <Logo iconClassName="size-6" showWordmark wordmarkClassName="text-xl" />
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Premium software licenses and subscriptions - delivered by hand, priced for everyone.
          </p>
        </div>
        <div>
          <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-primary/75">Shop</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/products" className="hover:text-foreground">All products</Link></li>
            <li><Link to="/products" search={{ category: "AI Tools" }} className="hover:text-foreground">AI Tools</Link></li>
            <li><Link to="/products" search={{ category: "Design" }} className="hover:text-foreground">Design</Link></li>
            <li><Link to="/products" search={{ category: "Streaming" }} className="hover:text-foreground">Streaming</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-primary/75">Account</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/auth" className="hover:text-foreground">Sign in</Link></li>
            <li><Link to="/profile" className="hover:text-foreground">Orders</Link></li>
            <li><Link to="/wishlist" className="hover:text-foreground">Wishlist</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-primary/75">Help</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><a href="https://wa.me/919677520040" className="hover:text-foreground">WhatsApp support</a></li>
            <li>Mon-Sun · 9am-10pm IST</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 text-xs text-muted-foreground sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.</p>
          <p>Built with care.</p>
        </div>
      </div>
    </footer>
  );
}
