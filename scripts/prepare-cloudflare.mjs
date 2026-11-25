import { createHash } from "node:crypto";
import { access, copyFile, readFile, writeFile } from "node:fs/promises";

// Cloudflare Pages static SPA deployment. Do not create a 404.html:
// Pages automatically serves index.html for client-side routes in its absence.
const dir = "dist/client";
await access(`${dir}/_shell.html`);
await copyFile(`${dir}/_shell.html`, `${dir}/index.html`);

let html = await readFile(`${dir}/index.html`, "utf8");
for (const [tag, attributes, body] of [...html.matchAll(/<script\\b([^>]*)>([\\s\\S]*?)<\\/script>/gi)]) {
  if (/\\bsrc\\s*=/i.test(attributes) || !body.trim()) continue;
  const filename = `bootstrap-${createHash("sha256").update(body).digest("hex").slice(0, 16)}.js`;
  await writeFile(`${dir}/assets/${filename}`, body);
  html = html.replace(tag, `<script${attributes} src="/assets/${filename}"></script>`);
}
await writeFile(`${dir}/index.html`, html);
await writeFile(`${dir}/_headers`, `/*
  Content-Security-Policy: script-src 'self'; object-src 'none'; base-uri 'self'
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/images/*
  Cache-Control: public, max-age=86400
`);
console.log("Cloudflare Pages static SPA artifact ready in dist/client");
