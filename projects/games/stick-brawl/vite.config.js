import { defineConfig } from "vite";

export default defineConfig({
    root: 'public',
    publicDir: 'assets',
    server: {
        open: true,
        port: 5173
    },
    build: {
        outDir: '../dist',
        emptyOutDir: true
    }
}); 