import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/auth";
import { StoreProvider } from "@/lib/store";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1 items-center justify-center px-4 py-24">
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">404</p>
          <h1 className="mt-2 text-4xl">Page not found</h1>
          <p className="mt-3 text-sm text-muted-foreground">The page you're looking for has moved or doesn't exist.</p>
          <a href="/" className="mt-6 inline-block rounded-md bg-foreground px-4 py-2 text-sm text-background">Back home</a>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  return (
    <AuthProvider>
      <StoreProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
        <a
          href="https://wa.me/919677520040"
          target="_blank"
          rel="noreferrer"
          aria-label="Chat on WhatsApp"
          className="fixed bottom-5 right-5 z-50 inline-flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_18px_45px_rgba(37,211,102,0.35)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(37,211,102,0.45)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/30"
        >
          <svg
            viewBox="0 0 32 32"
            aria-hidden="true"
            className="size-8 fill-current"
          >
            <path d="M16.02 3.2A12.69 12.69 0 0 0 5.2 22.51L3.7 28.3l5.92-1.55A12.68 12.68 0 1 0 16.02 3.2Zm0 23.24c-2.06 0-4.08-.6-5.8-1.74l-.42-.27-3.52.92.94-3.43-.28-.44a10.52 10.52 0 1 1 9.08 4.96Zm5.78-7.88c-.32-.16-1.88-.93-2.17-1.04-.29-.1-.5-.16-.71.16-.21.31-.82 1.03-1 1.24-.19.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.57-.94-.84-1.58-1.88-1.76-2.19-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.19.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.71-1.72-.98-2.35-.26-.62-.52-.53-.71-.54h-.61c-.21 0-.56.08-.85.4-.29.31-1.11 1.09-1.11 2.65s1.14 3.07 1.3 3.28c.16.21 2.25 3.43 5.44 4.81.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.15-1.51.26-.74.26-1.38.18-1.51-.08-.13-.29-.21-.61-.37Z" />
          </svg>
        </a>
        <Toaster />
      </StoreProvider>
    </AuthProvider>
  );
}
