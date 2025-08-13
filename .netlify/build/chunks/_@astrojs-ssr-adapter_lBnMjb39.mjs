!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{};e.SENTRY_RELEASE={id:"b013abdb3690bae9ad9a100e2544054a22743061"};}catch(e){}}();;{try{(function(){var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="af7a5d13-e154-44c9-acd4-c56b8e0e2c37",e._sentryDebugIdIdentifier="sentry-dbid-af7a5d13-e154-44c9-acd4-c56b8e0e2c37");})();}catch(e){}};import * as ssrFunction_js from '@astrojs/netlify/ssr-function.js';

function _mergeNamespaces(n, m) {
	for (var i = 0; i < m.length; i++) {
		const e = m[i];
		if (typeof e !== 'string' && !Array.isArray(e)) { for (const k in e) {
			if (k !== 'default' && !(k in n)) {
				const d = Object.getOwnPropertyDescriptor(e, k);
				if (d) {
					Object.defineProperty(n, k, d.get ? d : {
						enumerable: true,
						get: () => e[k]
					});
				}
			}
		} }
	}
	return Object.freeze(Object.defineProperty(n, Symbol.toStringTag, { value: 'Module' }));
}

const serverEntrypointModule = /*#__PURE__*/_mergeNamespaces({
	__proto__: null
}, [ssrFunction_js]);

export { serverEntrypointModule as s };
