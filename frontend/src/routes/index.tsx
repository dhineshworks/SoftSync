import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, ShieldCheck, Zap, BadgePercent, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { BRAND_NAME } from "@/lib/brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${BRAND_NAME} - Premium software licenses, honestly priced` },
      { name: "description", content: "Canva Pro, ChatGPT Plus, Netflix, Adobe CC, Spotify and more. Trusted licenses with WhatsApp support." },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: featured, isLoading } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => api.getFeaturedProducts(),
  });

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(79,70,229,0.14),rgba(14,165,233,0.12)_45%,rgba(255,255,255,0)_72%)]" />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-12 md:py-24 lg:px-8">
          <div className="md:col-span-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-primary shadow-sm">
              <Sparkles className="size-3.5" /> Software licenses · Curated
            </p>
            <h1 className="mt-5 max-w-3xl text-5xl leading-[1.02] text-foreground md:text-7xl">
              Best Products and Home Appliances, Electronics in Affordable Price.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              Canva Pro, ChatGPT Plus, Netflix, Adobe CC and 100+ more - sourced ethically,
              delivered personally via WhatsApp within minutes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)]">
                Browse catalog <ArrowUpRight className="size-4" />
              </Link>
              <a href="https://wa.me/919677520040" className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-6 py-3 text-sm font-semibold shadow-sm hover:bg-accent">
                Talk to us
              </a>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {["Instant delivery", "Replacement support", "Verified access"].map((item) => (
                <div key={item} className="rounded-2xl border border-border/70 bg-card/70 px-4 py-3 text-sm font-semibold shadow-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="hidden md:col-span-5 md:block">
            <div className="grid h-full grid-cols-2 gap-4">
              {[
                "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&q=80",
                "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80",
                "https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=600&q=80",
                "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&q=80",
              ].map((src) => (
                <div key={src} className="overflow-hidden rounded-3xl border border-white/70 bg-muted shadow-[var(--shadow-soft)]">
                  <img src={src} alt="" className="size-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border/70 bg-card/65">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            { icon: ShieldCheck, t: "Genuine licenses", s: "Every key tested. Replacement guarantee." },
            { icon: Zap, t: "Minutes, not days", s: "Delivered on WhatsApp after order." },
            { icon: BadgePercent, t: "Up to 60% off", s: "Annual plans and bundles available." },
          ].map(({ icon: Icon, t, s }) => (
            <div key={t} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 shadow-sm">
              <Icon className="mt-0.5 size-5 text-primary" />
              <div>
                <p className="text-sm font-semibold">{t}</p>
                <p className="text-sm text-muted-foreground">{s}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary/75">Featured</p>
            <h2 className="mt-2 text-3xl md:text-4xl">Most-loved this month</h2>
          </div>
          <Link to="/products" className="text-sm font-semibold text-primary hover:text-primary/80">View all →</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />)
            : featured?.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      <section className="border-y border-border/70 bg-secondary/45">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            { c: "AI Tools", h: "ChatGPT, Midjourney, Perplexity", img: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80" },
            { c: "Design", h: "Canva, Adobe, Figma", img: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80" },
            { c: "Streaming", h: "Netflix, Spotify, YouTube", img: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&q=80" },
          ].map((x) => (
            <Link key={x.c} to="/products" search={{ category: x.c }} className="group relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/70 shadow-[var(--shadow-soft)]">
              <img src={x.img} alt={x.c} className="size-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-widest opacity-80">{x.c}</p>
                <p className="mt-1 text-2xl font-extrabold">{x.h}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
