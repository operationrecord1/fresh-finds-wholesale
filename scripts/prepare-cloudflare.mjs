import { createHash } from "node:crypto";
import { access, copyFile, readFile, writeFile } from "node:fs/promises";

// Cloudflare Pages static SPA deployment. Do not create a 404.html:
// Pages automatically serves index.html for client-side routes in its absence.
const dir = "dist/client";
await access(`${dir}/_shell.html`);
await copyFile(`${dir}/_shell.html`, `${dir}/index.html`);

let html = await readFile(`${dir}/index.html`, "utf8");
// Use a deployment-specific URL for CSS to avoid stale HTML cached for a newly created asset.
for (const [, filename] of [...html.matchAll(/href="\/assets\/(index-[^"/]+\.css)"/g)]) {
  const css = await readFile(`${dir}/assets/${filename}`);
  const freshName = `header-${createHash("sha256").update(css).digest("hex").slice(0, 16)}.css`;
  await copyFile(`${dir}/assets/${filename}`, `${dir}/assets/${freshName}`);
  html = html.replaceAll(`/assets/${filename}`, `/assets/${freshName}`);
}

for (const [tag, attributes, body] of [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]) {
  if (/\bsrc\s*=/i.test(attributes) || !body.trim()) continue;
  const filename = `bootstrap-${createHash("sha256").update(body).digest("hex").slice(0, 16)}.js`;
  await writeFile(`${dir}/assets/${filename}`, body);
  html = html.replace(tag, `<script${attributes} src="/assets/${filename}"></script>`);
}
await writeFile(`${dir}/index.html`, html);
await writeFile(`${dir}/_headers`, `/*
  Content-Security-Policy: script-src 'self' https://js.stripe.com https://*.js.stripe.com; connect-src 'self' https://api.stripe.com https://gbsyaembvdtadkuldpbe.supabase.co wss://gbsyaembvdtadkuldpbe.supabase.co; frame-src https://js.stripe.com https://*.js.stripe.com https://hooks.stripe.com; object-src 'none'; base-uri 'self'
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/images/*
  Cache-Control: public, max-age=86400
`);
console.log("Cloudflare Pages static SPA artifact ready in dist/client");

