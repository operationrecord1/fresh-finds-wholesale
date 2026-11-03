// Separate static build; the Lovable server build remains in vite.config.ts.
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: "/fresh-finds-wholesale/",
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart({ spa: { enabled: true } }),
    react(),
  ],
});
