import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import dotenvExpand from "dotenv-expand";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
    // This check is important!
    // https://github.com/vercel/storage/tree/main/packages/postgres#readme
    if (mode === "development") {
        const env = loadEnv(mode, process.cwd(), "");
        dotenvExpand.expand({ parsed: env });
    }

    return {
        plugins: [
            vue(),
            basicSsl(),
            VitePWA({
                includeAssets: ["logo.png", "assets/*"],
                manifest: {
                    name: "EchoShare online sharing",
                    short_name: "EchoShare  haring",
                    description:
                        "EchoShare，A WebRTC-based online screen casting tool",
                    start_url: "/",
                    background_color: "#ffffff",
                    theme_color: "#000000",
                    display: "standalone",
                    icons: [
                        {
                            src: "/logo-144x144.png",
                            sizes: "144x144",
                            type: "image/png",
                        },
                    ],
                },
                workbox: {
                    globPatterns: [
                        "**/*.{js,css,html,ico,png,svg,webmanifest}",
                    ],
                },
            }),
        ],
        define: {
            __TITLE__: '"Online Screen Sharing"',
        },
    };
});
