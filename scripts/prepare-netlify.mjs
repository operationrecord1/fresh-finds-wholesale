import { createHash } from "node:crypto";
import { copyFile, access, writeFile, readFile } from "node:fs/promises";
const dir = "dist/client";
await access(`${dir}/_shell.html`);
await copyFile(`${dir}/_shell.html`, `${dir}/index.html`);
await writeFile(`${dir}/_redirects`, "/* /index.html 200\n");
console.log("Netlify static site ready in dist/client");

// Allow only our own build's inline bootstrap scripts, never arbitrary inline code.
const html = await readFile(`${dir}/index.html`, "utf8");
const hashes = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter(([, attributes, body]) => !/\bsrc\s*=/i.test(attributes) && body.trim())
  .map(([, , body]) => `'sha256-${createHash("sha256").update(body).digest("base64")}'`);
await writeFile(`${dir}/_headers`, `/*\n  Content-Security-Policy: script-src 'self' ${[...new Set(hashes)].join(" ")}; object-src 'none'; base-uri 'self'\n`);
