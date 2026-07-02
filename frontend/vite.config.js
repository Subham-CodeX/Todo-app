import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({

  plugins: [

    react(),

    VitePWA({

      registerType: "autoUpdate",

      injectRegister: "auto",

      devOptions: {

        enabled: true,

      },

      includeAssets: [

        "favicon.svg",

        "apple-touch-icon.png",

        "maskable-icon-512.png",

      ],

      manifest: {

        id: "/",

        name: "TaskFlow",

        short_name: "TaskFlow",

        description:
          "Modern Todo App built with React",

        theme_color: "#6F42F5",

        background_color: "#ffffff",

        display: "standalone",

        orientation: "portrait",

        start_url: "/",

        scope: "/",

        icons: [

          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },

          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },

          {
            src: "maskable-icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          }

        ]

      }

    })

  ]

});