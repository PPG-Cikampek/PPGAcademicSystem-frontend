import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        tailwindcss(),
        react(),
        visualizer({
            open: true, // opens report in browser
            gzipSize: true, // show gzip sizes
            brotliSize: true, // show brotli sizes
        }),
    ],
    resolve: {
        // Uncomment and customize if you use custom conditions
        // conditions: ['custom', ...defaultClientConditions],
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
    },
});
