import { copyFile, access, writeFile } from "node:fs/promises";
const dir = "dist/client";
await access(`${dir}/_shell.html`);
await copyFile(`${dir}/_shell.html`, `${dir}/index.html`);
await writeFile(`${dir}/_redirects`, "/* /index.html 200\n");
console.log("Netlify static site ready in dist/client");
