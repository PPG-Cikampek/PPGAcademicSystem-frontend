import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        tailwindcss(),
        react(),
        VitePWA({
            registerType: "autoUpdate",
            includeAssets: [
                "icons/*",
                "icons/browserconfig.xml",
            ],
            workbox: {
                clientsClaim: true,
                skipWaiting: true,
                // ensure version.json is not precached so network-first checks work
                globIgnores: ["**/version.json", "**/assets/pdf-*.js"],
                maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // allow up to 10MB assets
                runtimeCaching: [
                    {
                        // always get the latest version info from network first
                        urlPattern: ({ url }) => url.pathname === "/version.json",
                        handler: "NetworkFirst",
                        options: {
                            cacheName: "version",
                            expiration: { maxEntries: 1, maxAgeSeconds: 60 },
                            networkTimeoutSeconds: 3,
                        },
                    },
                ],
            },
            devOptions: {
                enabled: true, // enable PWA in dev to test locally
            },
            manifest: {
                name: "Sistem Akademik Digital PPG",
                short_name: "E-Siakad PPG",
                description: "Sistem Akademik Digital PPG Cikampek",
                start_url: "/",
                scope: "/",
                display: "standalone",
                orientation: "portrait-primary",
                background_color: "#ffffff",
                theme_color: "#ffffff",
                categories: ["education", "productivity"],
                icons: [
                    { src: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png", purpose: "any" },
                    { src: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png", purpose: "any" },
                    { src: "/icons/icon-128x128.png", sizes: "128x128", type: "image/png", purpose: "any" },
                    { src: "/icons/icon-144x144.png", sizes: "144x144", type: "image/png", purpose: "any" },
                    { src: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png", purpose: "any" },
                    { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
                    { src: "/icons/icon-384x384.png", sizes: "384x384", type: "image/png", purpose: "any" },
                    { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
                    { src: "/icons/maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
                ],
            },
        }),
        visualizer({
            open: true, // opens report in browser
            gzipSize: true, // show gzip sizes
            brotliSize: true, // show brotli sizes
        }),
    ],
    resolve: {
        alias: {
            // ensure Vite resolves `buffer` to the browser polyfill package
            buffer: "buffer/",
        },
        // Uncomment and customize if you use custom conditions
        // conditions: ['custom', ...defaultClientConditions],
    },
    optimizeDeps: {
        include: ["buffer"],
    },
    json: {
        stringify: "auto", // Only stringify large JSON files
        namedExports: true, // Named exports respected even with stringify: true
    },
    css: {
        preprocessorOptions: {
            sass: {
                // api: 'legacy' // Uncomment if you need legacy Sass API
            },
            scss: {
                // api: 'legacy' // Uncomment if you need legacy SCSS API
            },
        },
    },
    server: {
        host: "0.0.0.0", // Bind to all available IPs
        port: 3000, // Use the port your server is on
        // https: true
        fs: {
            cachedChecks: false,
        },
        headers: {
            "Service-Worker-Allowed": "/",
        },
        // proxy: { ... } // Add proxy config if needed
    },
    build: {
        chunkSizeWarningLimit: 1000, // Adjust the limit as needed (in KB)
        cssMinify: "esbuild", // Default for SSR too
        commonjsOptions: {
            strictRequires: true, // Now true by default
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    pdf: ["@react-pdf/renderer", "jspdf", "html2canvas"],
                    chart: ["chart.js"],
                    motion: ["framer-motion"],
                },
            },
        },
        // lib: {
        //   entry: './src/index.js',
        //   name: 'MyLib',
        //   fileName: 'my-lib',
        //   cssFileName: 'my-lib', // Set if using library mode
        // },
    },
    ssr: {
        resolve: {
            // Uncomment and customize if you use custom SSR conditions
            // conditions: ['custom', ...defaultServerConditions],
        },
    // prevent Vite from externalizing buffer during SSR builds
    noExternal: ["buffer"],
    },
});
