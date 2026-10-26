import { createFileRoute, notFound } from "@tanstack/react-router";
import { SimplePage } from "@/components/store/SimplePage";

const PAGES: Record<string, string> = {
  "artisan-mart": "About Artisan Mart", sales: "Sales FAQ", "product-download": "Product Download", shipping: "Shipping",
  closeouts: "Closeouts", "fba-sales": "FBA Sales", "community-outreach": "Community Outreach", blog: "Blog",
  "terms-of-sale": "Terms of Sale", privacy: "Privacy Policy", sitemap: "Sitemap",
};

export const Route = createFileRoute("/info/$page")({
  loader: ({ params }) => { const t = PAGES[params.page]; if (!t) throw notFound(); return { title: t }; },
  head: ({ loaderData }) => ({ meta: [
    { title: `${loaderData?.title ?? "Info"} | Artisan Mart` }, { name: "description", content: `${loaderData?.title ?? "Information"} — Artisan Mart.` },
    { property: "og:title", content: `${loaderData?.title ?? "Info"} | Artisan Mart` }, { property: "og:description", content: "Artisan Mart information." },
  ] }),
  component: () => { const { title } = Route.useLoaderData(); return <SimplePage title={title}><p>Artisan Mart's own {title.toLowerCase()} content has not been provided yet.</p></SimplePage>; },
  errorComponent: () => <p className="p-8">Could not load page.</p>,
  notFoundComponent: () => <p className="p-8">Page not found.</p>,
});
