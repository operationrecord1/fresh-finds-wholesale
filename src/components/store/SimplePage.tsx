import type { ReactNode } from "react";

export function SimplePage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-title">{title}</h1>
      <div className="space-y-4 rounded bg-card p-6">{children}</div>
    </div>
  );
}

export const Field = ({ label, type = "text", req = true }: { label: string; type?: string; req?: boolean }) => (
  <label className="block text-sm">{label}{req && <span className="text-destructive"> *</span>}<input type={type} required={req} className="mt-1 w-full rounded border p-2" /></label>
);

export const meta = (title: string, description: string) => ({ meta: [
  { title: `${title} | Artisan Mart` }, { name: "description", content: description },
  { property: "og:title", content: `${title} | Artisan Mart` }, { property: "og:description", content: description },
] });
