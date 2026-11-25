import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CartProvider, CartReady } from "@/lib/cart";
import { SiteHeader } from "@/components/store/SiteHeader";
import { SiteFooter } from "@/components/store/SiteFooter";
import { Toaster } from "@/components/ui/sonner";
import { loadAuthoritativeCatalog } from "@/lib/artisan-live-catalog";
import { ArtisanAuthProvider, artisanSupabase } from "@/lib/artisan-auth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href={import.meta.env.BASE_URL}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: async () => { await loadAuthoritativeCatalog(); },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Artisan Mart | Wholesale General Merchandise" },
      { name: "description", content: "Artisan Mart wholesale general merchandise, closeouts and imports." },
      { property: "og:title", content: "Artisan Mart | Wholesale General Merchandise" },
      { property: "og:description", content: "Artisan Mart wholesale general merchandise, closeouts and imports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: `${import.meta.env.BASE_URL}artisan-favicon-v3.png`, type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&family=Source+Sans+3:wght@400;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [catalogRevision,setCatalogRevision]=useState(0);
  const [catalogState, setCatalogState] = useState<"loading" | "ready" | "error">(
    import.meta.env.MODE === "test" ? "ready" : "loading",
  );
  useEffect(() => {
    if (catalogState !== "loading") return;
    let mounted = true;
    loadAuthoritativeCatalog()
      .then(() => { if (mounted) setCatalogState("ready"); })
      .catch((error) => {
        console.error("Artisan Mart catalog initialization failed", error);
        if (mounted) setCatalogState("error");
      });
    return () => { mounted = false; };
  }, [catalogState]);
  useEffect(()=>{
    if(catalogState!=="ready" || !artisanSupabase || import.meta.env.MODE==="test")return;
    let active=true;
    const refresh=()=>{
      if(!active || document.visibilityState==="hidden")return;
      void loadAuthoritativeCatalog(true).catch(error=>{
        console.error("Live catalog synchronization failed",error);
        if(active)setCatalogState("error");
      });
    };
    const onChange=()=>setCatalogRevision(v=>v+1);
    window.addEventListener("artisan-catalog-updated",onChange);
    window.addEventListener("focus",refresh);
    const channel=artisanSupabase.channel("artisan-products-availability")
      .on("postgres_changes",{event:"*",schema:"public",table:"artisan_products"},refresh)
      .subscribe();
    const timer=window.setInterval(refresh,90_000);
    return()=>{
      active=false;
      window.removeEventListener("artisan-catalog-updated",onChange);
      window.removeEventListener("focus",refresh);
      window.clearInterval(timer);
      void artisanSupabase?.removeChannel(channel);
    };
  },[catalogState]);
  // Never render embedded historical product prices when the authoritative
  // database has not been verified. Keep the original storefront once loaded.
  if (catalogState !== "ready") {
    return <div role={catalogState === "error" ? "alert" : "status"} className="mx-auto max-w-lg px-6 py-20 text-center">
      <h1 className="text-xl font-bold text-primary">{catalogState === "error" ? "Product catalog temporarily unavailable" : "Loading products..."}</h1>
      {catalogState === "error" && <>
        <p className="mt-3 text-sm text-muted-foreground">We couldn't load current product information. No outdated prices are being displayed.</p>
        <button type="button" className="mt-5 rounded bg-primary px-5 py-3 text-primary-foreground" onClick={() => setCatalogState("loading")}>Try again</button>
      </>}
    </div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ArtisanAuthProvider>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <CartProvider>
        <CartReady>
        <SiteHeader />
        <main><Outlet key={catalogRevision}/></main>
        <SiteFooter />
        <Toaster />
        </CartReady>
      </CartProvider>
      </ArtisanAuthProvider>
    </QueryClientProvider>
  );
}
