import { copyFile, access, writeFile } from "node:fs/promises";
const dir = "dist/client";
await access(`${dir}/_shell.html`);
await copyFile(`${dir}/_shell.html`, `${dir}/index.html`);
// GitHub Pages serves this shell for direct links to client-side routes.
await copyFile(`${dir}/_shell.html`, `${dir}/404.html`);
await writeFile(`${dir}/.nojekyll`, "");
console.log("GitHub Pages artifact ready in dist/client");
