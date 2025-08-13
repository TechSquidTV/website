!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{};e.SENTRY_RELEASE={id:"b013abdb3690bae9ad9a100e2544054a22743061"};}catch(e){}}();;{try{(function(){var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="cb4115b0-2c5b-4092-946b-82b86e62f45a",e._sentryDebugIdIdentifier="sentry-dbid-cb4115b0-2c5b-4092-946b-82b86e62f45a");})();}catch(e){}};import { renderers } from './renderers.mjs';
import { s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_lBnMjb39.mjs';
import { manifest } from './manifest_BeCZx72T.mjs';
import { createExports } from '@astrojs/netlify/ssr-function.js';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/404.astro.mjs');
const _page1 = () => import('./pages/about.astro.mjs');
const _page2 = () => import('./pages/blog/tags/_tag_.astro.mjs');
const _page3 = () => import('./pages/blog/_post_/_post_-og.png.astro.mjs');
const _page4 = () => import('./pages/blog/_post_.astro.mjs');
const _page5 = () => import('./pages/blog.astro.mjs');
const _page6 = () => import('./pages/contact.astro.mjs');
const _page7 = () => import('./pages/follow.astro.mjs');
const _page8 = () => import('./pages/newsletter.astro.mjs');
const _page9 = () => import('./pages/rss.xml.astro.mjs');
const _page10 = () => import('./pages/services/devrel.astro.mjs');
const _page11 = () => import('./pages/verify.astro.mjs');
const _page12 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["src/pages/404.astro", _page0],
    ["src/pages/about.astro", _page1],
    ["src/pages/blog/tags/[tag].astro", _page2],
    ["src/pages/blog/[post]/[post]-og.png.ts", _page3],
    ["src/pages/blog/[post]/index.astro", _page4],
    ["src/pages/blog/index.astro", _page5],
    ["src/pages/contact.astro", _page6],
    ["src/pages/follow.astro", _page7],
    ["src/pages/newsletter/index.astro", _page8],
    ["src/pages/rss.xml.ts", _page9],
    ["src/pages/services/devrel/index.astro", _page10],
    ["src/pages/verify.astro", _page11],
    ["src/pages/index.astro", _page12]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_noop-actions.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "d91df8e8-7a76-488e-ac07-a4ae209b1649"
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { __astrojsSsrVirtualEntry as default, pageMap };
