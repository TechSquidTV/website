import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import embeds from "astro-embed/integration";
import sentry from "@sentry/astro";
import spotlightjs from "@spotlightjs/astro";
import expressiveCode from "astro-expressive-code";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: process.env.NODE_ENV === "development" ? "http://localhost:4321" : "https://techsquidtv.com",
  integrations: [tailwind(), sitemap(), react(), embeds(), expressiveCode(), mdx(), sentry(), spotlightjs()],
  redirects: {
    "/blog/Choosing_a_standing_desk": "/blog/choosing-a-standing-desk",
    "/blog/Chrome_media_keys": "/blog/chrome-media-keys",
    "/blog/Ditching_WordPress": "/blog/ditching-wordpress-for-nuxtjs-and-netlify",
    "/blog/Facebook_already_created_Garrys_mod_vr": "/blog/facebook-already-created-garrys-mod-vr",
    "/blog/How_to_Docker_Compose": "/blog/learning-docker-compose-with-wordpress",
    "/blog/How_to_speed_test_your_vps": "/blog/how-to-speed-test-your-vps",
    "/blog/Kubernetes_in_10_minutes": "/blog/kubernetes-in-10-minutes",
    "/blog/Making_your_own_home_media_server_with_plex_and_Docker-Compose": "/blog/making-a-home-media-server-with-plex-and-docker-compose",
    "/blog/Synology_ds920plus_nas": "/blog/synology-ds920plus-nas",
    "/blog/Testing_shell_scripts_with_bats": "/blog/testing-shell-scripts-with-bats",
    "/blog/The_Windows_Ugly_Sweater": "/blog/the-windows-ugly-sweater",
    "/blog/What_Is_Docker": "/blog/what-is-docker",
    "/blog/Will_We_Ever_Be_Able_To_Download_Our_Brains_Like_In_Westworld": "/blog/will-we-ever-be-able-to-download-our-brains-like-in-westworld",
    "/blog/Fixing_an_ugly_terminal": "/blog/your-terminal-is-ugly",
    "/blog/tags": "/blog"
  }
});