// @ts-check

import mdx from "@astrojs/mdx";
import { unified } from "@astrojs/markdown-remark";
import { defineConfig } from "astro/config";
import icon from "astro-icon";
import react from "@astrojs/react";

import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import { remarkReadingTime } from "#utils/remark-reading-time.mjs";
import remarkToc from "remark-toc";
import rehypeExternalLinks from "rehype-external-links";
import { rehypeShadcnTables } from "#utils/rehype-shadcn-tables.mjs";
import { rehypeYouTubeEmbeds } from "#utils/rehype-youtube-embeds.mjs";

import cloudflare from "@astrojs/cloudflare";
import sentry from "@sentry/astro";

const uploadSentrySourceMaps = Boolean(process.env.SENTRY_AUTH_TOKEN);
const isDevServer = process.argv.includes("dev");
const viteOptimizerExclusions = [
  "astro",
  "@sentry/astro",
  "astro:middleware",
  "@sentry/astro/middleware",
];

function viteDependencyOptimizerOptions() {
  return {
    exclude: [...viteOptimizerExclusions],
    noDiscovery: true,
  };
}

function preventAstroComponentDependencyScan() {
  return {
    name: "techsquidtv:prevent-astro-component-dependency-scan",
    apply: "serve",
    enforce: "post",
    configEnvironment() {
      return {
        optimizeDeps: viteDependencyOptimizerOptions(),
      };
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site:
    process.env.NODE_ENV === "development"
      ? "http://localhost:4321"
      : "https://techsquidtv.com",
  session: false,
  experimental: {
    incrementalBuild: true,
  },

  integrations: [
    sitemap(),
    icon(),
    mdx(),
    react(),
    sentry({
      // @sentry/astro injects Node middleware during development, but the
      // Cloudflare adapter runs requests in Workerd where CommonJS require is
      // unavailable. Production uses Sentry's Cloudflare Worker integration.
      enabled: { client: true, server: !isDevServer },
      sourcemaps: { disable: !uploadSentrySourceMaps },
      telemetry: false,
    }),
  ],

  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkReadingTime,
        [remarkToc, { heading: "Table of Contents", maxDepth: 4, tight: true }],
      ],
      rehypePlugins: [
        rehypeYouTubeEmbeds,
        [
          rehypeExternalLinks,
          {
            target: "_blank",
            rel: ["nofollow", "noopener"],
          },
        ],
        rehypeShadcnTables,
      ],
    }),
  },

  redirects: {
    "/blog/Choosing_a_standing_desk": "/blog/choosing-a-standing-desk",
    "/blog/Chrome_media_keys": "/blog/chrome-media-keys",
    "/blog/Ditching_WordPress":
      "/blog/ditching-wordpress-for-nuxtjs-and-netlify",
    "/blog/Facebook_already_created_Garrys_mod_vr":
      "/blog/facebook-already-created-garrys-mod-vr",
    "/blog/How_to_Docker_Compose":
      "/blog/learning-docker-compose-with-wordpress",
    "/blog/How_to_speed_test_your_vps": "/blog/how-to-speed-test-your-vps",
    "/blog/Kubernetes_in_10_minutes": "/blog/kubernetes-in-10-minutes",
    "/blog/Making_your_own_home_media_server_with_plex_and_Docker-Compose":
      "/blog/making-a-home-media-server-with-plex-and-docker-compose",
    "/blog/Synology_ds920plus_nas": "/blog/synology-ds920plus-nas",
    "/blog/Testing_shell_scripts_with_bats":
      "/blog/testing-shell-scripts-with-bats",
    "/blog/The_Windows_Ugly_Sweater": "/blog/the-windows-ugly-sweater",
    "/blog/What_Is_Docker": "/blog/what-is-docker",
    "/blog/Will_We_Ever_Be_Able_To_Download_Our_Brains_Like_In_Westworld":
      "/blog/will-we-ever-be-able-to-download-our-brains-like-in-westworld",
    "/blog/Fixing_an_ugly_terminal": "/blog/your-terminal-is-ugly",
    "/blog/tags": "/blog",
    "/services/": "/services/devrel",
    "/blog/where-in-the-world-is-static-shock-for-gba":
      "https://lostpixellore.com/blog/where-in-the-world-is-static-shock-for-gba",
  },

  vite: {
    plugins: [tailwindcss(), sitemap(), preventAstroComponentDependencyScan()],
    // Astro 7 configures separate Vite environments. Apply this to both the
    // legacy settings and the runnable environments, otherwise Vite scans
    // every .astro component as an optimizer entry during dev startup.
    optimizeDeps: viteDependencyOptimizerOptions(),
    environments: {
      astro: {
        optimizeDeps: viteDependencyOptimizerOptions(),
      },
      ssr: {
        optimizeDeps: viteDependencyOptimizerOptions(),
      },
    },
    // Sentry injects its middleware into Astro's server graph. Keep both
    // modules outside the SSR optimizer so a late Sentry optimization cannot
    // invalidate Astro's virtual middleware module.
    ssr: {
      optimizeDeps: viteDependencyOptimizerOptions(),
    },
  },

  adapter: cloudflare({
    imageService: "compile",
    prerenderEnvironment: "node",
  }),
});
