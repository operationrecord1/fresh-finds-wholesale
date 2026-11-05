import { createHash } from "node:crypto";
import { copyFile, access, writeFile, readFile } from "node:fs/promises";
const dir = "dist/client";
await access(`${dir}/_shell.html`);
await copyFile(`${dir}/_shell.html`, `${dir}/index.html`);
await writeFile(`${dir}/_redirects`, "/* /index.html 200\n");
console.log("Netlify static site ready in dist/client");

// Externalize the generated bootstrap so CSP does not permit arbitrary inline code.
let html = await readFile(`${dir}/index.html`, "utf8");
for (const [tag, attributes, body] of [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]) {
  if (/\bsrc\s*=/i.test(attributes) || !body.trim()) continue;
  const name = `bootstrap-${createHash("sha256").update(body).digest("hex").slice(0,16)}.js`;
  await writeFile(`${dir}/assets/${name}`, body);
  html = html.replace(tag, `<script${attributes} src="/assets/${name}"></script>`);
}
html = html.replace("<head>", `<head><meta http-equiv="Content-Security-Policy" content="script-src https://artisanmart.site/assets/ https://www.artisanmart.site/assets/ https://incandescent-vacherin-bd19b5.netlify.app/assets/ https://lambent-gnome-721faa.netlify.app/assets/; object-src 'none'; base-uri 'self'">`);
await writeFile(`${dir}/index.html`, html);
await writeFile(`${dir}/_headers`, "/*\n  Content-Security-Policy: script-src https://artisanmart.site/assets/ https://www.artisanmart.site/assets/ https://incandescent-vacherin-bd19b5.netlify.app/assets/ https://lambent-gnome-721faa.netlify.app/assets/; object-src 'none'; base-uri 'self'\n");
