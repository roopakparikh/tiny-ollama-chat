// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: './', // This changes the base URL to be relative to index.html
  build: {
    // Ensure assets use relative paths
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // Use relative paths for chunks
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        manualChunks: {
          // Core React
          "vendor-react": ["react", "react-dom"],

          // Router
          "vendor-router": ["react-router-dom"],

          // State management
          "vendor-state": ["zustand"],

          // UI Components
          "vendor-ui": [
            "react-hot-toast",
            "lucide-react",
            "react-textarea-autosize",
          ],

          // Markdown processing (usually large)
          "vendor-markdown": [
            "react-markdown",
            "remark-gfm",
            "highlight.js",
          ],
        },
      },
    },
    target: "esnext",
    minify: "esbuild",
  },
});
