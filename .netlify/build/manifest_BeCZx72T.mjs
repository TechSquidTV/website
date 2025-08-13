!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{};e.SENTRY_RELEASE={id:"b013abdb3690bae9ad9a100e2544054a22743061"};}catch(e){}}();;{try{(function(){var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="c676b8bd-f556-42c6-b6dc-b41e6bef5e15",e._sentryDebugIdIdentifier="sentry-dbid-c676b8bd-f556-42c6-b6dc-b41e6bef5e15");})();}catch(e){}};import { N as NOOP_MIDDLEWARE_HEADER, t as decodeKey } from './chunks/astro/server_C7Me25bh.mjs';

var dist = {};

var hasRequiredDist;

function requireDist () {
	if (hasRequiredDist) return dist;
	hasRequiredDist = 1;
	Object.defineProperty(dist, "__esModule", { value: true });
	dist.parse = parse;
	dist.serialize = serialize;
	/**
	 * RegExp to match cookie-name in RFC 6265 sec 4.1.1
	 * This refers out to the obsoleted definition of token in RFC 2616 sec 2.2
	 * which has been replaced by the token definition in RFC 7230 appendix B.
	 *
	 * cookie-name       = token
	 * token             = 1*tchar
	 * tchar             = "!" / "#" / "$" / "%" / "&" / "'" /
	 *                     "*" / "+" / "-" / "." / "^" / "_" /
	 *                     "`" / "|" / "~" / DIGIT / ALPHA
	 *
	 * Note: Allowing more characters - https://github.com/jshttp/cookie/issues/191
	 * Allow same range as cookie value, except `=`, which delimits end of name.
	 */
	const cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
	/**
	 * RegExp to match cookie-value in RFC 6265 sec 4.1.1
	 *
	 * cookie-value      = *cookie-octet / ( DQUOTE *cookie-octet DQUOTE )
	 * cookie-octet      = %x21 / %x23-2B / %x2D-3A / %x3C-5B / %x5D-7E
	 *                     ; US-ASCII characters excluding CTLs,
	 *                     ; whitespace DQUOTE, comma, semicolon,
	 *                     ; and backslash
	 *
	 * Allowing more characters: https://github.com/jshttp/cookie/issues/191
	 * Comma, backslash, and DQUOTE are not part of the parsing algorithm.
	 */
	const cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
	/**
	 * RegExp to match domain-value in RFC 6265 sec 4.1.1
	 *
	 * domain-value      = <subdomain>
	 *                     ; defined in [RFC1034], Section 3.5, as
	 *                     ; enhanced by [RFC1123], Section 2.1
	 * <subdomain>       = <label> | <subdomain> "." <label>
	 * <label>           = <let-dig> [ [ <ldh-str> ] <let-dig> ]
	 *                     Labels must be 63 characters or less.
	 *                     'let-dig' not 'letter' in the first char, per RFC1123
	 * <ldh-str>         = <let-dig-hyp> | <let-dig-hyp> <ldh-str>
	 * <let-dig-hyp>     = <let-dig> | "-"
	 * <let-dig>         = <letter> | <digit>
	 * <letter>          = any one of the 52 alphabetic characters A through Z in
	 *                     upper case and a through z in lower case
	 * <digit>           = any one of the ten digits 0 through 9
	 *
	 * Keep support for leading dot: https://github.com/jshttp/cookie/issues/173
	 *
	 * > (Note that a leading %x2E ("."), if present, is ignored even though that
	 * character is not permitted, but a trailing %x2E ("."), if present, will
	 * cause the user agent to ignore the attribute.)
	 */
	const domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
	/**
	 * RegExp to match path-value in RFC 6265 sec 4.1.1
	 *
	 * path-value        = <any CHAR except CTLs or ";">
	 * CHAR              = %x01-7F
	 *                     ; defined in RFC 5234 appendix B.1
	 */
	const pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
	const __toString = Object.prototype.toString;
	const NullObject = /* @__PURE__ */ (() => {
	    const C = function () { };
	    C.prototype = Object.create(null);
	    return C;
	})();
	/**
	 * Parse a cookie header.
	 *
	 * Parse the given cookie header string into an object
	 * The object has the various cookies as keys(names) => values
	 */
	function parse(str, options) {
	    const obj = new NullObject();
	    const len = str.length;
	    // RFC 6265 sec 4.1.1, RFC 2616 2.2 defines a cookie name consists of one char minimum, plus '='.
	    if (len < 2)
	        return obj;
	    const dec = options?.decode || decode;
	    let index = 0;
	    do {
	        const eqIdx = str.indexOf("=", index);
	        if (eqIdx === -1)
	            break; // No more cookie pairs.
	        const colonIdx = str.indexOf(";", index);
	        const endIdx = colonIdx === -1 ? len : colonIdx;
	        if (eqIdx > endIdx) {
	            // backtrack on prior semicolon
	            index = str.lastIndexOf(";", eqIdx - 1) + 1;
	            continue;
	        }
	        const keyStartIdx = startIndex(str, index, eqIdx);
	        const keyEndIdx = endIndex(str, eqIdx, keyStartIdx);
	        const key = str.slice(keyStartIdx, keyEndIdx);
	        // only assign once
	        if (obj[key] === undefined) {
	            let valStartIdx = startIndex(str, eqIdx + 1, endIdx);
	            let valEndIdx = endIndex(str, endIdx, valStartIdx);
	            const value = dec(str.slice(valStartIdx, valEndIdx));
	            obj[key] = value;
	        }
	        index = endIdx + 1;
	    } while (index < len);
	    return obj;
	}
	function startIndex(str, index, max) {
	    do {
	        const code = str.charCodeAt(index);
	        if (code !== 0x20 /*   */ && code !== 0x09 /* \t */)
	            return index;
	    } while (++index < max);
	    return max;
	}
	function endIndex(str, index, min) {
	    while (index > min) {
	        const code = str.charCodeAt(--index);
	        if (code !== 0x20 /*   */ && code !== 0x09 /* \t */)
	            return index + 1;
	    }
	    return min;
	}
	/**
	 * Serialize data into a cookie header.
	 *
	 * Serialize a name value pair into a cookie string suitable for
	 * http headers. An optional options object specifies cookie parameters.
	 *
	 * serialize('foo', 'bar', { httpOnly: true })
	 *   => "foo=bar; httpOnly"
	 */
	function serialize(name, val, options) {
	    const enc = options?.encode || encodeURIComponent;
	    if (!cookieNameRegExp.test(name)) {
	        throw new TypeError(`argument name is invalid: ${name}`);
	    }
	    const value = enc(val);
	    if (!cookieValueRegExp.test(value)) {
	        throw new TypeError(`argument val is invalid: ${val}`);
	    }
	    let str = name + "=" + value;
	    if (!options)
	        return str;
	    if (options.maxAge !== undefined) {
	        if (!Number.isInteger(options.maxAge)) {
	            throw new TypeError(`option maxAge is invalid: ${options.maxAge}`);
	        }
	        str += "; Max-Age=" + options.maxAge;
	    }
	    if (options.domain) {
	        if (!domainValueRegExp.test(options.domain)) {
	            throw new TypeError(`option domain is invalid: ${options.domain}`);
	        }
	        str += "; Domain=" + options.domain;
	    }
	    if (options.path) {
	        if (!pathValueRegExp.test(options.path)) {
	            throw new TypeError(`option path is invalid: ${options.path}`);
	        }
	        str += "; Path=" + options.path;
	    }
	    if (options.expires) {
	        if (!isDate(options.expires) ||
	            !Number.isFinite(options.expires.valueOf())) {
	            throw new TypeError(`option expires is invalid: ${options.expires}`);
	        }
	        str += "; Expires=" + options.expires.toUTCString();
	    }
	    if (options.httpOnly) {
	        str += "; HttpOnly";
	    }
	    if (options.secure) {
	        str += "; Secure";
	    }
	    if (options.partitioned) {
	        str += "; Partitioned";
	    }
	    if (options.priority) {
	        const priority = typeof options.priority === "string"
	            ? options.priority.toLowerCase()
	            : undefined;
	        switch (priority) {
	            case "low":
	                str += "; Priority=Low";
	                break;
	            case "medium":
	                str += "; Priority=Medium";
	                break;
	            case "high":
	                str += "; Priority=High";
	                break;
	            default:
	                throw new TypeError(`option priority is invalid: ${options.priority}`);
	        }
	    }
	    if (options.sameSite) {
	        const sameSite = typeof options.sameSite === "string"
	            ? options.sameSite.toLowerCase()
	            : options.sameSite;
	        switch (sameSite) {
	            case true:
	            case "strict":
	                str += "; SameSite=Strict";
	                break;
	            case "lax":
	                str += "; SameSite=Lax";
	                break;
	            case "none":
	                str += "; SameSite=None";
	                break;
	            default:
	                throw new TypeError(`option sameSite is invalid: ${options.sameSite}`);
	        }
	    }
	    return str;
	}
	/**
	 * URL-decode string value. Optimized to skip native call when no %.
	 */
	function decode(str) {
	    if (str.indexOf("%") === -1)
	        return str;
	    try {
	        return decodeURIComponent(str);
	    }
	    catch (e) {
	        return str;
	    }
	}
	/**
	 * Determine if value is a Date.
	 */
	function isDate(val) {
	    return __toString.call(val) === "[object Date]";
	}
	
	return dist;
}

requireDist();

const NOOP_MIDDLEWARE_FN = async (_ctx, next) => {
  const response = await next();
  response.headers.set(NOOP_MIDDLEWARE_HEADER, "true");
  return response;
};

const codeToStatusMap = {
  // Implemented from IANA HTTP Status Code Registry
  // https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  CONTENT_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  MISDIRECTED_REQUEST: 421,
  UNPROCESSABLE_CONTENT: 422,
  LOCKED: 423,
  FAILED_DEPENDENCY: 424,
  TOO_EARLY: 425,
  UPGRADE_REQUIRED: 426,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  VARIANT_ALSO_NEGOTIATES: 506,
  INSUFFICIENT_STORAGE: 507,
  LOOP_DETECTED: 508,
  NETWORK_AUTHENTICATION_REQUIRED: 511
};
Object.entries(codeToStatusMap).reduce(
  // reverse the key-value pairs
  (acc, [key, value]) => ({ ...acc, [value]: key }),
  {}
);

/* es-module-lexer 1.7.0 */
var ImportType;!function(A){A[A.Static=1]="Static",A[A.Dynamic=2]="Dynamic",A[A.ImportMeta=3]="ImportMeta",A[A.StaticSourcePhase=4]="StaticSourcePhase",A[A.DynamicSourcePhase=5]="DynamicSourcePhase",A[A.StaticDeferPhase=6]="StaticDeferPhase",A[A.DynamicDeferPhase=7]="DynamicDeferPhase";}(ImportType||(ImportType={}));1===new Uint8Array(new Uint16Array([1]).buffer)[0];const E=()=>{return A="AGFzbQEAAAABKwhgAX8Bf2AEf39/fwBgAAF/YAAAYAF/AGADf39/AX9gAn9/AX9gA39/fwADMTAAAQECAgICAgICAgICAgICAgICAgIAAwMDBAQAAAUAAAAAAAMDAwAGAAAABwAGAgUEBQFwAQEBBQMBAAEGDwJ/AUHA8gALfwBBwPIACwd6FQZtZW1vcnkCAAJzYQAAAWUAAwJpcwAEAmllAAUCc3MABgJzZQAHAml0AAgCYWkACQJpZAAKAmlwAAsCZXMADAJlZQANA2VscwAOA2VsZQAPAnJpABACcmUAEQFmABICbXMAEwVwYXJzZQAUC19faGVhcF9iYXNlAwEKzkQwaAEBf0EAIAA2AoAKQQAoAtwJIgEgAEEBdGoiAEEAOwEAQQAgAEECaiIANgKECkEAIAA2AogKQQBBADYC4AlBAEEANgLwCUEAQQA2AugJQQBBADYC5AlBAEEANgL4CUEAQQA2AuwJIAEL0wEBA39BACgC8AkhBEEAQQAoAogKIgU2AvAJQQAgBDYC9AlBACAFQSRqNgKICiAEQSBqQeAJIAQbIAU2AgBBACgC1AkhBEEAKALQCSEGIAUgATYCACAFIAA2AgggBSACIAJBAmpBACAGIANGIgAbIAQgA0YiBBs2AgwgBSADNgIUIAVBADYCECAFIAI2AgQgBUEANgIgIAVBA0EBQQIgABsgBBs2AhwgBUEAKALQCSADRiICOgAYAkACQCACDQBBACgC1AkgA0cNAQtBAEEBOgCMCgsLXgEBf0EAKAL4CSIEQRBqQeQJIAQbQQAoAogKIgQ2AgBBACAENgL4CUEAIARBFGo2AogKQQBBAToAjAogBEEANgIQIAQgAzYCDCAEIAI2AgggBCABNgIEIAQgADYCAAsIAEEAKAKQCgsVAEEAKALoCSgCAEEAKALcCWtBAXULHgEBf0EAKALoCSgCBCIAQQAoAtwJa0EBdUF/IAAbCxUAQQAoAugJKAIIQQAoAtwJa0EBdQseAQF/QQAoAugJKAIMIgBBACgC3AlrQQF1QX8gABsLCwBBACgC6AkoAhwLHgEBf0EAKALoCSgCECIAQQAoAtwJa0EBdUF/IAAbCzsBAX8CQEEAKALoCSgCFCIAQQAoAtAJRw0AQX8PCwJAIABBACgC1AlHDQBBfg8LIABBACgC3AlrQQF1CwsAQQAoAugJLQAYCxUAQQAoAuwJKAIAQQAoAtwJa0EBdQsVAEEAKALsCSgCBEEAKALcCWtBAXULHgEBf0EAKALsCSgCCCIAQQAoAtwJa0EBdUF/IAAbCx4BAX9BACgC7AkoAgwiAEEAKALcCWtBAXVBfyAAGwslAQF/QQBBACgC6AkiAEEgakHgCSAAGygCACIANgLoCSAAQQBHCyUBAX9BAEEAKALsCSIAQRBqQeQJIAAbKAIAIgA2AuwJIABBAEcLCABBAC0AlAoLCABBAC0AjAoL3Q0BBX8jAEGA0ABrIgAkAEEAQQE6AJQKQQBBACgC2Ak2ApwKQQBBACgC3AlBfmoiATYCsApBACABQQAoAoAKQQF0aiICNgK0CkEAQQA6AIwKQQBBADsBlgpBAEEAOwGYCkEAQQA6AKAKQQBBADYCkApBAEEAOgD8CUEAIABBgBBqNgKkCkEAIAA2AqgKQQBBADoArAoCQAJAAkACQANAQQAgAUECaiIDNgKwCiABIAJPDQECQCADLwEAIgJBd2pBBUkNAAJAAkACQAJAAkAgAkGbf2oOBQEICAgCAAsgAkEgRg0EIAJBL0YNAyACQTtGDQIMBwtBAC8BmAoNASADEBVFDQEgAUEEakGCCEEKEC8NARAWQQAtAJQKDQFBAEEAKAKwCiIBNgKcCgwHCyADEBVFDQAgAUEEakGMCEEKEC8NABAXC0EAQQAoArAKNgKcCgwBCwJAIAEvAQQiA0EqRg0AIANBL0cNBBAYDAELQQEQGQtBACgCtAohAkEAKAKwCiEBDAALC0EAIQIgAyEBQQAtAPwJDQIMAQtBACABNgKwCkEAQQA6AJQKCwNAQQAgAUECaiIDNgKwCgJAAkACQAJAAkACQAJAIAFBACgCtApPDQAgAy8BACICQXdqQQVJDQYCQAJAAkACQAJAAkACQAJAAkACQCACQWBqDgoQDwYPDw8PBQECAAsCQAJAAkACQCACQaB/ag4KCxISAxIBEhISAgALIAJBhX9qDgMFEQYJC0EALwGYCg0QIAMQFUUNECABQQRqQYIIQQoQLw0QEBYMEAsgAxAVRQ0PIAFBBGpBjAhBChAvDQ8QFwwPCyADEBVFDQ4gASkABELsgISDsI7AOVINDiABLwEMIgNBd2oiAUEXSw0MQQEgAXRBn4CABHFFDQwMDQtBAEEALwGYCiIBQQFqOwGYCkEAKAKkCiABQQN0aiIBQQE2AgAgAUEAKAKcCjYCBAwNC0EALwGYCiIDRQ0JQQAgA0F/aiIDOwGYCkEALwGWCiICRQ0MQQAoAqQKIANB//8DcUEDdGooAgBBBUcNDAJAIAJBAnRBACgCqApqQXxqKAIAIgMoAgQNACADQQAoApwKQQJqNgIEC0EAIAJBf2o7AZYKIAMgAUEEajYCDAwMCwJAQQAoApwKIgEvAQBBKUcNAEEAKALwCSIDRQ0AIAMoAgQgAUcNAEEAQQAoAvQJIgM2AvAJAkAgA0UNACADQQA2AiAMAQtBAEEANgLgCQtBAEEALwGYCiIDQQFqOwGYCkEAKAKkCiADQQN0aiIDQQZBAkEALQCsChs2AgAgAyABNgIEQQBBADoArAoMCwtBAC8BmAoiAUUNB0EAIAFBf2oiATsBmApBACgCpAogAUH//wNxQQN0aigCAEEERg0EDAoLQScQGgwJC0EiEBoMCAsgAkEvRw0HAkACQCABLwEEIgFBKkYNACABQS9HDQEQGAwKC0EBEBkMCQsCQAJAAkACQEEAKAKcCiIBLwEAIgMQG0UNAAJAAkAgA0FVag4EAAkBAwkLIAFBfmovAQBBK0YNAwwICyABQX5qLwEAQS1GDQIMBwsgA0EpRw0BQQAoAqQKQQAvAZgKIgJBA3RqKAIEEBxFDQIMBgsgAUF+ai8BAEFQakH//wNxQQpPDQULQQAvAZgKIQILAkACQCACQf//A3EiAkUNACADQeYARw0AQQAoAqQKIAJBf2pBA3RqIgQoAgBBAUcNACABQX5qLwEAQe8ARw0BIAQoAgRBlghBAxAdRQ0BDAULIANB/QBHDQBBACgCpAogAkEDdGoiAigCBBAeDQQgAigCAEEGRg0ECyABEB8NAyADRQ0DIANBL0ZBAC0AoApBAEdxDQMCQEEAKAL4CSICRQ0AIAEgAigCAEkNACABIAIoAgRNDQQLIAFBfmohAUEAKALcCSECAkADQCABQQJqIgQgAk0NAUEAIAE2ApwKIAEvAQAhAyABQX5qIgQhASADECBFDQALIARBAmohBAsCQCADQf//A3EQIUUNACAEQX5qIQECQANAIAFBAmoiAyACTQ0BQQAgATYCnAogAS8BACEDIAFBfmoiBCEBIAMQIQ0ACyAEQQJqIQMLIAMQIg0EC0EAQQE6AKAKDAcLQQAoAqQKQQAvAZgKIgFBA3QiA2pBACgCnAo2AgRBACABQQFqOwGYCkEAKAKkCiADakEDNgIACxAjDAULQQAtAPwJQQAvAZYKQQAvAZgKcnJFIQIMBwsQJEEAQQA6AKAKDAMLECVBACECDAULIANBoAFHDQELQQBBAToArAoLQQBBACgCsAo2ApwKC0EAKAKwCiEBDAALCyAAQYDQAGokACACCxoAAkBBACgC3AkgAEcNAEEBDwsgAEF+ahAmC/4KAQZ/QQBBACgCsAoiAEEMaiIBNgKwCkEAKAL4CSECQQEQKSEDAkACQAJAAkACQAJAAkACQAJAQQAoArAKIgQgAUcNACADEChFDQELAkACQAJAAkACQAJAAkAgA0EqRg0AIANB+wBHDQFBACAEQQJqNgKwCkEBECkhA0EAKAKwCiEEA0ACQAJAIANB//8DcSIDQSJGDQAgA0EnRg0AIAMQLBpBACgCsAohAwwBCyADEBpBAEEAKAKwCkECaiIDNgKwCgtBARApGgJAIAQgAxAtIgNBLEcNAEEAQQAoArAKQQJqNgKwCkEBECkhAwsgA0H9AEYNA0EAKAKwCiIFIARGDQ8gBSEEIAVBACgCtApNDQAMDwsLQQAgBEECajYCsApBARApGkEAKAKwCiIDIAMQLRoMAgtBAEEAOgCUCgJAAkACQAJAAkACQCADQZ9/ag4MAgsEAQsDCwsLCwsFAAsgA0H2AEYNBAwKC0EAIARBDmoiAzYCsAoCQAJAAkBBARApQZ9/ag4GABICEhIBEgtBACgCsAoiBSkAAkLzgOSD4I3AMVINESAFLwEKECFFDRFBACAFQQpqNgKwCkEAECkaC0EAKAKwCiIFQQJqQbIIQQ4QLw0QIAUvARAiAkF3aiIBQRdLDQ1BASABdEGfgIAEcUUNDQwOC0EAKAKwCiIFKQACQuyAhIOwjsA5Ug0PIAUvAQoiAkF3aiIBQRdNDQYMCgtBACAEQQpqNgKwCkEAECkaQQAoArAKIQQLQQAgBEEQajYCsAoCQEEBECkiBEEqRw0AQQBBACgCsApBAmo2ArAKQQEQKSEEC0EAKAKwCiEDIAQQLBogA0EAKAKwCiIEIAMgBBACQQBBACgCsApBfmo2ArAKDwsCQCAEKQACQuyAhIOwjsA5Ug0AIAQvAQoQIEUNAEEAIARBCmo2ArAKQQEQKSEEQQAoArAKIQMgBBAsGiADQQAoArAKIgQgAyAEEAJBAEEAKAKwCkF+ajYCsAoPC0EAIARBBGoiBDYCsAoLQQAgBEEGajYCsApBAEEAOgCUCkEBECkhBEEAKAKwCiEDIAQQLCEEQQAoArAKIQIgBEHf/wNxIgFB2wBHDQNBACACQQJqNgKwCkEBECkhBUEAKAKwCiEDQQAhBAwEC0EAQQE6AIwKQQBBACgCsApBAmo2ArAKC0EBECkhBEEAKAKwCiEDAkAgBEHmAEcNACADQQJqQawIQQYQLw0AQQAgA0EIajYCsAogAEEBEClBABArIAJBEGpB5AkgAhshAwNAIAMoAgAiA0UNBSADQgA3AgggA0EQaiEDDAALC0EAIANBfmo2ArAKDAMLQQEgAXRBn4CABHFFDQMMBAtBASEECwNAAkACQCAEDgIAAQELIAVB//8DcRAsGkEBIQQMAQsCQAJAQQAoArAKIgQgA0YNACADIAQgAyAEEAJBARApIQQCQCABQdsARw0AIARBIHJB/QBGDQQLQQAoArAKIQMCQCAEQSxHDQBBACADQQJqNgKwCkEBECkhBUEAKAKwCiEDIAVBIHJB+wBHDQILQQAgA0F+ajYCsAoLIAFB2wBHDQJBACACQX5qNgKwCg8LQQAhBAwACwsPCyACQaABRg0AIAJB+wBHDQQLQQAgBUEKajYCsApBARApIgVB+wBGDQMMAgsCQCACQVhqDgMBAwEACyACQaABRw0CC0EAIAVBEGo2ArAKAkBBARApIgVBKkcNAEEAQQAoArAKQQJqNgKwCkEBECkhBQsgBUEoRg0BC0EAKAKwCiEBIAUQLBpBACgCsAoiBSABTQ0AIAQgAyABIAUQAkEAQQAoArAKQX5qNgKwCg8LIAQgA0EAQQAQAkEAIARBDGo2ArAKDwsQJQuFDAEKf0EAQQAoArAKIgBBDGoiATYCsApBARApIQJBACgCsAohAwJAAkACQAJAAkACQAJAAkAgAkEuRw0AQQAgA0ECajYCsAoCQEEBECkiAkHkAEYNAAJAIAJB8wBGDQAgAkHtAEcNB0EAKAKwCiICQQJqQZwIQQYQLw0HAkBBACgCnAoiAxAqDQAgAy8BAEEuRg0ICyAAIAAgAkEIakEAKALUCRABDwtBACgCsAoiAkECakGiCEEKEC8NBgJAQQAoApwKIgMQKg0AIAMvAQBBLkYNBwtBACEEQQAgAkEMajYCsApBASEFQQUhBkEBECkhAkEAIQdBASEIDAILQQAoArAKIgIpAAJC5YCYg9CMgDlSDQUCQEEAKAKcCiIDECoNACADLwEAQS5GDQYLQQAhBEEAIAJBCmo2ArAKQQIhCEEHIQZBASEHQQEQKSECQQEhBQwBCwJAAkACQAJAIAJB8wBHDQAgAyABTQ0AIANBAmpBoghBChAvDQACQCADLwEMIgRBd2oiB0EXSw0AQQEgB3RBn4CABHENAgsgBEGgAUYNAQtBACEHQQchBkEBIQQgAkHkAEYNAQwCC0EAIQRBACADQQxqIgI2ArAKQQEhBUEBECkhCQJAQQAoArAKIgYgAkYNAEHmACECAkAgCUHmAEYNAEEFIQZBACEHQQEhCCAJIQIMBAtBACEHQQEhCCAGQQJqQawIQQYQLw0EIAYvAQgQIEUNBAtBACEHQQAgAzYCsApBByEGQQEhBEEAIQVBACEIIAkhAgwCCyADIABBCmpNDQBBACEIQeQAIQICQCADKQACQuWAmIPQjIA5Ug0AAkACQCADLwEKIgRBd2oiB0EXSw0AQQEgB3RBn4CABHENAQtBACEIIARBoAFHDQELQQAhBUEAIANBCmo2ArAKQSohAkEBIQdBAiEIQQEQKSIJQSpGDQRBACADNgKwCkEBIQRBACEHQQAhCCAJIQIMAgsgAyEGQQAhBwwCC0EAIQVBACEICwJAIAJBKEcNAEEAKAKkCkEALwGYCiICQQN0aiIDQQAoArAKNgIEQQAgAkEBajsBmAogA0EFNgIAQQAoApwKLwEAQS5GDQRBAEEAKAKwCiIDQQJqNgKwCkEBECkhAiAAQQAoArAKQQAgAxABAkACQCAFDQBBACgC8AkhAQwBC0EAKALwCSIBIAY2AhwLQQBBAC8BlgoiA0EBajsBlgpBACgCqAogA0ECdGogATYCAAJAIAJBIkYNACACQSdGDQBBAEEAKAKwCkF+ajYCsAoPCyACEBpBAEEAKAKwCkECaiICNgKwCgJAAkACQEEBEClBV2oOBAECAgACC0EAQQAoArAKQQJqNgKwCkEBECkaQQAoAvAJIgMgAjYCBCADQQE6ABggA0EAKAKwCiICNgIQQQAgAkF+ajYCsAoPC0EAKALwCSIDIAI2AgQgA0EBOgAYQQBBAC8BmApBf2o7AZgKIANBACgCsApBAmo2AgxBAEEALwGWCkF/ajsBlgoPC0EAQQAoArAKQX5qNgKwCg8LAkAgBEEBcyACQfsAR3INAEEAKAKwCiECQQAvAZgKDQUDQAJAAkACQCACQQAoArQKTw0AQQEQKSICQSJGDQEgAkEnRg0BIAJB/QBHDQJBAEEAKAKwCkECajYCsAoLQQEQKSEDQQAoArAKIQICQCADQeYARw0AIAJBAmpBrAhBBhAvDQcLQQAgAkEIajYCsAoCQEEBECkiAkEiRg0AIAJBJ0cNBwsgACACQQAQKw8LIAIQGgtBAEEAKAKwCkECaiICNgKwCgwACwsCQAJAIAJBWWoOBAMBAQMACyACQSJGDQILQQAoArAKIQYLIAYgAUcNAEEAIABBCmo2ArAKDwsgAkEqRyAHcQ0DQQAvAZgKQf//A3ENA0EAKAKwCiECQQAoArQKIQEDQCACIAFPDQECQAJAIAIvAQAiA0EnRg0AIANBIkcNAQsgACADIAgQKw8LQQAgAkECaiICNgKwCgwACwsQJQsPC0EAIAJBfmo2ArAKDwtBAEEAKAKwCkF+ajYCsAoLRwEDf0EAKAKwCkECaiEAQQAoArQKIQECQANAIAAiAkF+aiABTw0BIAJBAmohACACLwEAQXZqDgQBAAABAAsLQQAgAjYCsAoLmAEBA39BAEEAKAKwCiIBQQJqNgKwCiABQQZqIQFBACgCtAohAgNAAkACQAJAIAFBfGogAk8NACABQX5qLwEAIQMCQAJAIAANACADQSpGDQEgA0F2ag4EAgQEAgQLIANBKkcNAwsgAS8BAEEvRw0CQQAgAUF+ajYCsAoMAQsgAUF+aiEBC0EAIAE2ArAKDwsgAUECaiEBDAALC4gBAQR/QQAoArAKIQFBACgCtAohAgJAAkADQCABIgNBAmohASADIAJPDQEgAS8BACIEIABGDQICQCAEQdwARg0AIARBdmoOBAIBAQIBCyADQQRqIQEgAy8BBEENRw0AIANBBmogASADLwEGQQpGGyEBDAALC0EAIAE2ArAKECUPC0EAIAE2ArAKC2wBAX8CQAJAIABBX2oiAUEFSw0AQQEgAXRBMXENAQsgAEFGakH//wNxQQZJDQAgAEEpRyAAQVhqQf//A3FBB0lxDQACQCAAQaV/ag4EAQAAAQALIABB/QBHIABBhX9qQf//A3FBBElxDwtBAQsuAQF/QQEhAQJAIABBpglBBRAdDQAgAEGWCEEDEB0NACAAQbAJQQIQHSEBCyABC0YBA39BACEDAkAgACACQQF0IgJrIgRBAmoiAEEAKALcCSIFSQ0AIAAgASACEC8NAAJAIAAgBUcNAEEBDwsgBBAmIQMLIAMLgwEBAn9BASEBAkACQAJAAkACQAJAIAAvAQAiAkFFag4EBQQEAQALAkAgAkGbf2oOBAMEBAIACyACQSlGDQQgAkH5AEcNAyAAQX5qQbwJQQYQHQ8LIABBfmovAQBBPUYPCyAAQX5qQbQJQQQQHQ8LIABBfmpByAlBAxAdDwtBACEBCyABC7QDAQJ/QQAhAQJAAkACQAJAAkACQAJAAkACQAJAIAAvAQBBnH9qDhQAAQIJCQkJAwkJBAUJCQYJBwkJCAkLAkACQCAAQX5qLwEAQZd/ag4EAAoKAQoLIABBfGpByghBAhAdDwsgAEF8akHOCEEDEB0PCwJAAkACQCAAQX5qLwEAQY1/ag4DAAECCgsCQCAAQXxqLwEAIgJB4QBGDQAgAkHsAEcNCiAAQXpqQeUAECcPCyAAQXpqQeMAECcPCyAAQXxqQdQIQQQQHQ8LIABBfGpB3AhBBhAdDwsgAEF+ai8BAEHvAEcNBiAAQXxqLwEAQeUARw0GAkAgAEF6ai8BACICQfAARg0AIAJB4wBHDQcgAEF4akHoCEEGEB0PCyAAQXhqQfQIQQIQHQ8LIABBfmpB+AhBBBAdDwtBASEBIABBfmoiAEHpABAnDQQgAEGACUEFEB0PCyAAQX5qQeQAECcPCyAAQX5qQYoJQQcQHQ8LIABBfmpBmAlBBBAdDwsCQCAAQX5qLwEAIgJB7wBGDQAgAkHlAEcNASAAQXxqQe4AECcPCyAAQXxqQaAJQQMQHSEBCyABCzQBAX9BASEBAkAgAEF3akH//wNxQQVJDQAgAEGAAXJBoAFGDQAgAEEuRyAAEChxIQELIAELMAEBfwJAAkAgAEF3aiIBQRdLDQBBASABdEGNgIAEcQ0BCyAAQaABRg0AQQAPC0EBC04BAn9BACEBAkACQCAALwEAIgJB5QBGDQAgAkHrAEcNASAAQX5qQfgIQQQQHQ8LIABBfmovAQBB9QBHDQAgAEF8akHcCEEGEB0hAQsgAQveAQEEf0EAKAKwCiEAQQAoArQKIQECQAJAAkADQCAAIgJBAmohACACIAFPDQECQAJAAkAgAC8BACIDQaR/ag4FAgMDAwEACyADQSRHDQIgAi8BBEH7AEcNAkEAIAJBBGoiADYCsApBAEEALwGYCiICQQFqOwGYCkEAKAKkCiACQQN0aiICQQQ2AgAgAiAANgIEDwtBACAANgKwCkEAQQAvAZgKQX9qIgA7AZgKQQAoAqQKIABB//8DcUEDdGooAgBBA0cNAwwECyACQQRqIQAMAAsLQQAgADYCsAoLECULC3ABAn8CQAJAA0BBAEEAKAKwCiIAQQJqIgE2ArAKIABBACgCtApPDQECQAJAAkAgAS8BACIBQaV/ag4CAQIACwJAIAFBdmoOBAQDAwQACyABQS9HDQIMBAsQLhoMAQtBACAAQQRqNgKwCgwACwsQJQsLNQEBf0EAQQE6APwJQQAoArAKIQBBAEEAKAK0CkECajYCsApBACAAQQAoAtwJa0EBdTYCkAoLQwECf0EBIQECQCAALwEAIgJBd2pB//8DcUEFSQ0AIAJBgAFyQaABRg0AQQAhASACEChFDQAgAkEuRyAAECpyDwsgAQs9AQJ/QQAhAgJAQQAoAtwJIgMgAEsNACAALwEAIAFHDQACQCADIABHDQBBAQ8LIABBfmovAQAQICECCyACC2gBAn9BASEBAkACQCAAQV9qIgJBBUsNAEEBIAJ0QTFxDQELIABB+P8DcUEoRg0AIABBRmpB//8DcUEGSQ0AAkAgAEGlf2oiAkEDSw0AIAJBAUcNAQsgAEGFf2pB//8DcUEESSEBCyABC5wBAQN/QQAoArAKIQECQANAAkACQCABLwEAIgJBL0cNAAJAIAEvAQIiAUEqRg0AIAFBL0cNBBAYDAILIAAQGQwBCwJAAkAgAEUNACACQXdqIgFBF0sNAUEBIAF0QZ+AgARxRQ0BDAILIAIQIUUNAwwBCyACQaABRw0CC0EAQQAoArAKIgNBAmoiATYCsAogA0EAKAK0CkkNAAsLIAILMQEBf0EAIQECQCAALwEAQS5HDQAgAEF+ai8BAEEuRw0AIABBfGovAQBBLkYhAQsgAQumBAEBfwJAIAFBIkYNACABQSdGDQAQJQ8LQQAoArAKIQMgARAaIAAgA0ECakEAKAKwCkEAKALQCRABAkAgAkEBSA0AQQAoAvAJQQRBBiACQQFGGzYCHAtBAEEAKAKwCkECajYCsAoCQAJAAkACQEEAECkiAUHhAEYNACABQfcARg0BQQAoArAKIQEMAgtBACgCsAoiAUECakHACEEKEC8NAUEGIQIMAgtBACgCsAoiAS8BAkHpAEcNACABLwEEQfQARw0AQQQhAiABLwEGQegARg0BC0EAIAFBfmo2ArAKDwtBACABIAJBAXRqNgKwCgJAQQEQKUH7AEYNAEEAIAE2ArAKDwtBACgCsAoiACECA0BBACACQQJqNgKwCgJAAkACQEEBECkiAkEiRg0AIAJBJ0cNAUEnEBpBAEEAKAKwCkECajYCsApBARApIQIMAgtBIhAaQQBBACgCsApBAmo2ArAKQQEQKSECDAELIAIQLCECCwJAIAJBOkYNAEEAIAE2ArAKDwtBAEEAKAKwCkECajYCsAoCQEEBECkiAkEiRg0AIAJBJ0YNAEEAIAE2ArAKDwsgAhAaQQBBACgCsApBAmo2ArAKAkACQEEBECkiAkEsRg0AIAJB/QBGDQFBACABNgKwCg8LQQBBACgCsApBAmo2ArAKQQEQKUH9AEYNAEEAKAKwCiECDAELC0EAKALwCSIBIAA2AhAgAUEAKAKwCkECajYCDAttAQJ/AkACQANAAkAgAEH//wNxIgFBd2oiAkEXSw0AQQEgAnRBn4CABHENAgsgAUGgAUYNASAAIQIgARAoDQJBACECQQBBACgCsAoiAEECajYCsAogAC8BAiIADQAMAgsLIAAhAgsgAkH//wNxC6sBAQR/AkACQEEAKAKwCiICLwEAIgNB4QBGDQAgASEEIAAhBQwBC0EAIAJBBGo2ArAKQQEQKSECQQAoArAKIQUCQAJAIAJBIkYNACACQSdGDQAgAhAsGkEAKAKwCiEEDAELIAIQGkEAQQAoArAKQQJqIgQ2ArAKC0EBECkhA0EAKAKwCiECCwJAIAIgBUYNACAFIARBACAAIAAgAUYiAhtBACABIAIbEAILIAMLcgEEf0EAKAKwCiEAQQAoArQKIQECQAJAA0AgAEECaiECIAAgAU8NAQJAAkAgAi8BACIDQaR/ag4CAQQACyACIQAgA0F2ag4EAgEBAgELIABBBGohAAwACwtBACACNgKwChAlQQAPC0EAIAI2ArAKQd0AC0kBA39BACEDAkAgAkUNAAJAA0AgAC0AACIEIAEtAAAiBUcNASABQQFqIQEgAEEBaiEAIAJBf2oiAg0ADAILCyAEIAVrIQMLIAMLC+wBAgBBgAgLzgEAAHgAcABvAHIAdABtAHAAbwByAHQAZgBvAHIAZQB0AGEAbwB1AHIAYwBlAHIAbwBtAHUAbgBjAHQAaQBvAG4AcwBzAGUAcgB0AHYAbwB5AGkAZQBkAGUAbABlAGMAbwBuAHQAaQBuAGkAbgBzAHQAYQBuAHQAeQBiAHIAZQBhAHIAZQB0AHUAcgBkAGUAYgB1AGcAZwBlAGEAdwBhAGkAdABoAHIAdwBoAGkAbABlAGkAZgBjAGEAdABjAGYAaQBuAGEAbABsAGUAbABzAABB0AkLEAEAAAACAAAAAAQAAEA5AAA=","undefined"!=typeof Buffer?Buffer.from(A,"base64"):Uint8Array.from(atob(A),(A=>A.charCodeAt(0)));var A;};WebAssembly.compile(E()).then(WebAssembly.instantiate).then((({exports:A})=>{}));

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///workspace/","cacheDir":"file:///workspace/node_modules/.astro/","outDir":"file:///workspace/dist/","srcDir":"file:///workspace/src/","publicDir":"file:///workspace/public/","buildClientDir":"file:///workspace/dist/","buildServerDir":"file:///workspace/.netlify/build/","adapterName":"@astrojs/netlify","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"404.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/404","isIndex":false,"type":"page","pattern":"^\\/404\\/?$","segments":[[{"content":"404","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/404.astro","pathname":"/404","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"about/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/about","isIndex":false,"type":"page","pattern":"^\\/about\\/?$","segments":[[{"content":"about","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/about.astro","pathname":"/about","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"blog/Choosing_a_standing_desk/index.html","links":[],"scripts":[],"styles":[],"routeData":{"type":"redirect","isIndex":false,"route":"/blog/choosing_a_standing_desk","pattern":"^\\/blog\\/Choosing_a_standing_desk\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"Choosing_a_standing_desk","dynamic":false,"spread":false}]],"params":[],"component":"/blog/Choosing_a_standing_desk","pathname":"/blog/Choosing_a_standing_desk","prerender":true,"redirect":"/blog/choosing-a-standing-desk","fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"blog/Chrome_media_keys/index.html","links":[],"scripts":[],"styles":[],"routeData":{"type":"redirect","isIndex":false,"route":"/blog/chrome_media_keys","pattern":"^\\/blog\\/Chrome_media_keys\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"Chrome_media_keys","dynamic":false,"spread":false}]],"params":[],"component":"/blog/Chrome_media_keys","pathname":"/blog/Chrome_media_keys","prerender":true,"redirect":"/blog/chrome-media-keys","fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"blog/Ditching_WordPress/index.html","links":[],"scripts":[],"styles":[],"routeData":{"type":"redirect","isIndex":false,"route":"/blog/ditching_wordpress","pattern":"^\\/blog\\/Ditching_WordPress\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"Ditching_WordPress","dynamic":false,"spread":false}]],"params":[],"component":"/blog/Ditching_WordPress","pathname":"/blog/Ditching_WordPress","prerender":true,"redirect":"/blog/ditching-wordpress-for-nuxtjs-and-netlify","fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"blog/Facebook_already_created_Garrys_mod_vr/index.html","links":[],"scripts":[],"styles":[],"routeData":{"type":"redirect","isIndex":false,"route":"/blog/facebook_already_created_garrys_mod_vr","pattern":"^\\/blog\\/Facebook_already_created_Garrys_mod_vr\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"Facebook_already_created_Garrys_mod_vr","dynamic":false,"spread":false}]],"params":[],"component":"/blog/Facebook_already_created_Garrys_mod_vr","pathname":"/blog/Facebook_already_created_Garrys_mod_vr","prerender":true,"redirect":"/blog/facebook-already-created-garrys-mod-vr","fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"blog/Fixing_an_ugly_terminal/index.html","links":[],"scripts":[],"styles":[],"routeData":{"type":"redirect","isIndex":false,"route":"/blog/fixing_an_ugly_terminal","pattern":"^\\/blog\\/Fixing_an_ugly_terminal\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"Fixing_an_ugly_terminal","dynamic":false,"spread":false}]],"params":[],"component":"/blog/Fixing_an_ugly_terminal","pathname":"/blog/Fixing_an_ugly_terminal","prerender":true,"redirect":"/blog/your-terminal-is-ugly","fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"blog/How_to_Docker_Compose/index.html","links":[],"scripts":[],"styles":[],"routeData":{"type":"redirect","isIndex":false,"route":"/blog/how_to_docker_compose","pattern":"^\\/blog\\/How_to_Docker_Compose\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"How_to_Docker_Compose","dynamic":false,"spread":false}]],"params":[],"component":"/blog/How_to_Docker_Compose","pathname":"/blog/How_to_Docker_Compose","prerender":true,"redirect":"/blog/learning-docker-compose-with-wordpress","fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"blog/How_to_speed_test_your_vps/index.html","links":[],"scripts":[],"styles":[],"routeData":{"type":"redirect","isIndex":false,"route":"/blog/how_to_speed_test_your_vps","pattern":"^\\/blog\\/How_to_speed_test_your_vps\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"How_to_speed_test_your_vps","dynamic":false,"spread":false}]],"params":[],"component":"/blog/How_to_speed_test_your_vps","pathname":"/blog/How_to_speed_test_your_vps","prerender":true,"redirect":"/blog/how-to-speed-test-your-vps","fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"blog/Kubernetes_in_10_minutes/index.html","links":[],"scripts":[],"styles":[],"routeData":{"type":"redirect","isIndex":false,"route":"/blog/kubernetes_in_10_minutes","pattern":"^\\/blog\\/Kubernetes_in_10_minutes\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"Kubernetes_in_10_minutes","dynamic":false,"spread":false}]],"params":[],"component":"/blog/Kubernetes_in_10_minutes","pathname":"/blog/Kubernetes_in_10_minutes","prerender":true,"redirect":"/blog/kubernetes-in-10-minutes","fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"blog/Making_your_own_home_media_server_with_plex_and_Docker-Compose/index.html","links":[],"scripts":[],"styles":[],"routeData":{"type":"redirect","isIndex":false,"route":"/blog/making_your_own_home_media_server_with_plex_and_docker-compose","pattern":"^\\/blog\\/Making_your_own_home_media_server_with_plex_and_Docker-Compose\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"Making_your_own_home_media_server_with_plex_and_Docker-Compose","dynamic":false,"spread":false}]],"params":[],"component":"/blog/Making_your_own_home_media_server_with_plex_and_Docker-Compose","pathname":"/blog/Making_your_own_home_media_server_with_plex_and_Docker-Compose","prerender":true,"redirect":"/blog/making-a-home-media-server-with-docker-compose","fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"blog/Synology_ds920plus_nas/index.html","links":[],"scripts":[],"styles":[],"routeData":{"type":"redirect","isIndex":false,"route":"/blog/synology_ds920plus_nas","pattern":"^\\/blog\\/Synology_ds920plus_nas\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"Synology_ds920plus_nas","dynamic":false,"spread":false}]],"params":[],"component":"/blog/Synology_ds920plus_nas","pathname":"/blog/Synology_ds920plus_nas","prerender":true,"redirect":"/blog/synology-ds920plus-nas","fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"blog/tags/index.html","links":[],"scripts":[],"styles":[],"routeData":{"type":"redirect","isIndex":false,"route":"/blog/tags","pattern":"^\\/blog\\/tags\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"tags","dynamic":false,"spread":false}]],"params":[],"component":"/blog/tags","pathname":"/blog/tags","prerender":true,"redirect":"/blog","redirectRoute":{"route":"/blog","isIndex":true,"type":"page","pattern":"^\\/blog\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog/index.astro","pathname":"/blog","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}},"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"blog/Testing_shell_scripts_with_bats/index.html","links":[],"scripts":[],"styles":[],"routeData":{"type":"redirect","isIndex":false,"route":"/blog/testing_shell_scripts_with_bats","pattern":"^\\/blog\\/Testing_shell_scripts_with_bats\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"Testing_shell_scripts_with_bats","dynamic":false,"spread":false}]],"params":[],"component":"/blog/Testing_shell_scripts_with_bats","pathname":"/blog/Testing_shell_scripts_with_bats","prerender":true,"redirect":"/blog/testing-shell-scripts-with-bats","fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"blog/The_Windows_Ugly_Sweater/index.html","links":[],"scripts":[],"styles":[],"routeData":{"type":"redirect","isIndex":false,"route":"/blog/the_windows_ugly_sweater","pattern":"^\\/blog\\/The_Windows_Ugly_Sweater\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"The_Windows_Ugly_Sweater","dynamic":false,"spread":false}]],"params":[],"component":"/blog/The_Windows_Ugly_Sweater","pathname":"/blog/The_Windows_Ugly_Sweater","prerender":true,"redirect":"/blog/the-windows-ugly-sweater","fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"blog/What_Is_Docker/index.html","links":[],"scripts":[],"styles":[],"routeData":{"type":"redirect","isIndex":false,"route":"/blog/what_is_docker","pattern":"^\\/blog\\/What_Is_Docker\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"What_Is_Docker","dynamic":false,"spread":false}]],"params":[],"component":"/blog/What_Is_Docker","pathname":"/blog/What_Is_Docker","prerender":true,"redirect":"/blog/what-is-docker","fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"blog/where-in-the-world-is-static-shock-for-gba/index.html","links":[],"scripts":[],"styles":[],"routeData":{"type":"redirect","isIndex":false,"route":"/blog/where-in-the-world-is-static-shock-for-gba","pattern":"^\\/blog\\/where-in-the-world-is-static-shock-for-gba\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"where-in-the-world-is-static-shock-for-gba","dynamic":false,"spread":false}]],"params":[],"component":"/blog/where-in-the-world-is-static-shock-for-gba","pathname":"/blog/where-in-the-world-is-static-shock-for-gba","prerender":true,"redirect":"https://lostpixellore.com/blog/where-in-the-world-is-static-shock-for-gba","fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"blog/Will_We_Ever_Be_Able_To_Download_Our_Brains_Like_In_Westworld/index.html","links":[],"scripts":[],"styles":[],"routeData":{"type":"redirect","isIndex":false,"route":"/blog/will_we_ever_be_able_to_download_our_brains_like_in_westworld","pattern":"^\\/blog\\/Will_We_Ever_Be_Able_To_Download_Our_Brains_Like_In_Westworld\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"Will_We_Ever_Be_Able_To_Download_Our_Brains_Like_In_Westworld","dynamic":false,"spread":false}]],"params":[],"component":"/blog/Will_We_Ever_Be_Able_To_Download_Our_Brains_Like_In_Westworld","pathname":"/blog/Will_We_Ever_Be_Able_To_Download_Our_Brains_Like_In_Westworld","prerender":true,"redirect":"/blog/will-we-ever-be-able-to-download-our-brains-like-in-westworld","fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"blog/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/blog","isIndex":true,"type":"page","pattern":"^\\/blog\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog/index.astro","pathname":"/blog","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"contact/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/contact","isIndex":false,"type":"page","pattern":"^\\/contact\\/?$","segments":[[{"content":"contact","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/contact.astro","pathname":"/contact","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"follow/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/follow","isIndex":false,"type":"page","pattern":"^\\/follow\\/?$","segments":[[{"content":"follow","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/follow.astro","pathname":"/follow","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"newsletter/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/newsletter","isIndex":true,"type":"page","pattern":"^\\/newsletter\\/?$","segments":[[{"content":"newsletter","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/newsletter/index.astro","pathname":"/newsletter","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"rss.xml","links":[],"scripts":[],"styles":[],"routeData":{"route":"/rss.xml","isIndex":false,"type":"endpoint","pattern":"^\\/rss\\.xml\\/?$","segments":[[{"content":"rss.xml","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/rss.xml.ts","pathname":"/rss.xml","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"services/devrel/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/services/devrel","isIndex":true,"type":"page","pattern":"^\\/services\\/devrel\\/?$","segments":[[{"content":"services","dynamic":false,"spread":false}],[{"content":"devrel","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/services/devrel/index.astro","pathname":"/services/devrel","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"services/index.html","links":[],"scripts":[],"styles":[],"routeData":{"type":"redirect","isIndex":false,"route":"/services","pattern":"^\\/services\\/?$","segments":[[{"content":"services","dynamic":false,"spread":false}]],"params":[],"component":"/services/","pathname":"/services","prerender":true,"redirect":"/services/devrel","redirectRoute":{"route":"/services/devrel","isIndex":true,"type":"page","pattern":"^\\/services\\/devrel\\/?$","segments":[[{"content":"services","dynamic":false,"spread":false}],[{"content":"devrel","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/services/devrel/index.astro","pathname":"/services/devrel","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}},"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"verify/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/verify","isIndex":false,"type":"page","pattern":"^\\/verify\\/?$","segments":[[{"content":"verify","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/verify.astro","pathname":"/verify","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"site":"https://techsquidtv.com","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/workspace/src/pages/about.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/about@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astrojs-ssr-virtual-entry",{"propagation":"in-tree","containsHead":false}],["/workspace/src/pages/blog/[post]/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/blog/[post]/index@_@astro",{"propagation":"in-tree","containsHead":false}],["/workspace/src/pages/follow.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/follow@_@astro",{"propagation":"in-tree","containsHead":false}],["/workspace/src/pages/newsletter/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/newsletter/index@_@astro",{"propagation":"in-tree","containsHead":false}],["/workspace/src/components/PostList.astro",{"propagation":"in-tree","containsHead":false}],["/workspace/src/pages/blog/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/blog/index@_@astro",{"propagation":"in-tree","containsHead":false}],["/workspace/src/pages/blog/tags/[tag].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/blog/tags/[tag]@_@astro",{"propagation":"in-tree","containsHead":false}],["/workspace/src/pages/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/index@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000astro:content",{"propagation":"in-tree","containsHead":false}],["/workspace/src/pages/blog/[post]/[post]-og.png.ts",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/blog/[post]/[post]-og.png@_@ts",{"propagation":"in-tree","containsHead":false}],["/workspace/src/pages/rss.xml.ts",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/rss.xml@_@ts",{"propagation":"in-tree","containsHead":false}],["/workspace/src/pages/404.astro",{"propagation":"none","containsHead":true}],["/workspace/src/pages/contact.astro",{"propagation":"none","containsHead":true}],["/workspace/src/pages/verify.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000noop-actions":"_noop-actions.mjs","\u0000@astro-page:src/pages/404@_@astro":"pages/404.astro.mjs","\u0000@astro-page:src/pages/about@_@astro":"pages/about.astro.mjs","\u0000@astro-page:src/pages/blog/tags/[tag]@_@astro":"pages/blog/tags/_tag_.astro.mjs","\u0000@astro-page:src/pages/blog/[post]/[post]-og.png@_@ts":"pages/blog/_post_/_post_-og.png.astro.mjs","\u0000@astro-page:src/pages/blog/[post]/index@_@astro":"pages/blog/_post_.astro.mjs","\u0000@astro-page:src/pages/blog/index@_@astro":"pages/blog.astro.mjs","\u0000@astro-page:src/pages/contact@_@astro":"pages/contact.astro.mjs","\u0000@astro-page:src/pages/follow@_@astro":"pages/follow.astro.mjs","\u0000@astro-page:src/pages/newsletter/index@_@astro":"pages/newsletter.astro.mjs","\u0000@astro-page:src/pages/rss.xml@_@ts":"pages/rss.xml.astro.mjs","\u0000@astro-page:src/pages/services/devrel/index@_@astro":"pages/services/devrel.astro.mjs","\u0000@astro-page:src/pages/verify@_@astro":"pages/verify.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_BeCZx72T.mjs","/workspace/src/images/assets/tstv-404.svg?raw":"chunks/tstv-404_DW7oJ5m9.mjs","/workspace/.astro/content-assets.mjs":"chunks/content-assets_D9WpZMzt.mjs","/workspace/.astro/content-modules.mjs":"chunks/content-modules_aI-twvfB.mjs","\u0000astro:data-layer-content":"chunks/_astro_data-layer-content_BhwXePLQ.mjs","/workspace/node_modules/.pnpm/node-fetch-native@1.6.7/node_modules/node-fetch-native/dist/chunks/multipart-parser.mjs":"chunks/multipart-parser_BoTmlYBk.mjs","/workspace/src/content/blog/choosing-a-standing-desk.mdx?astroPropagatedAssets":"chunks/choosing-a-standing-desk_Di3WGp74.mjs","/workspace/src/content/blog/chrome-media-keys.mdx?astroPropagatedAssets":"chunks/chrome-media-keys_Bw06ynfC.mjs","/workspace/src/content/blog/creating-custom-gpt-agents.mdx?astroPropagatedAssets":"chunks/creating-custom-gpt-agents_paMEqQnO.mjs","/workspace/src/content/blog/creating-social-graph-images.mdx?astroPropagatedAssets":"chunks/creating-social-graph-images_DfarPMbg.mjs","/workspace/src/content/blog/ditching-wordpress-for-nuxtjs.mdx?astroPropagatedAssets":"chunks/ditching-wordpress-for-nuxtjs_gZck_477.mjs","/workspace/src/content/blog/fetching-youtube-videos-with-astro.mdx?astroPropagatedAssets":"chunks/fetching-youtube-videos-with-astro_BOUuXoZc.mjs","\u0000astro:assets":"chunks/_astro_assets_DLmpV0SS.mjs","/workspace/src/content/blog/facebook-already-created-garrys-mod-vr.mdx?astroPropagatedAssets":"chunks/facebook-already-created-garrys-mod-vr_CH6Vs5-2.mjs","/workspace/src/content/blog/flash-should-be-blue.mdx?astroPropagatedAssets":"chunks/flash-should-be-blue_-8zgAKAD.mjs","/workspace/src/content/blog/how-to-docker-compose.mdx?astroPropagatedAssets":"chunks/how-to-docker-compose_Bap-fLbm.mjs","/workspace/src/content/blog/how-to-speed-test-your-vps.mdx?astroPropagatedAssets":"chunks/how-to-speed-test-your-vps_D7Nxxjfm.mjs","/workspace/src/content/blog/how-vector-databases-make-ai-smart.mdx?astroPropagatedAssets":"chunks/how-vector-databases-make-ai-smart_BEVjF9D1.mjs","/workspace/src/content/blog/kubernetes-in-10-minutes.mdx?astroPropagatedAssets":"chunks/kubernetes-in-10-minutes_4K0GGSM8.mjs","/workspace/src/content/blog/make-a-home-media-server-with-plex-and-docker-compose.mdx?astroPropagatedAssets":"chunks/make-a-home-media-server-with-plex-and-docker-compose_VhFOI1uV.mjs","/workspace/src/content/blog/synology-ds920plus_nas.mdx?astroPropagatedAssets":"chunks/synology-ds920plus_nas_NgxMSvDR.mjs","/workspace/src/content/blog/testing-shell-scripts-with-bats.mdx?astroPropagatedAssets":"chunks/testing-shell-scripts-with-bats_Dn-vN1A2.mjs","/workspace/src/content/blog/the-windows-ugly-sweater.mdx?astroPropagatedAssets":"chunks/the-windows-ugly-sweater_CT1crQ-R.mjs","/workspace/src/content/blog/what-is-docker.mdx?astroPropagatedAssets":"chunks/what-is-docker_8Y6PG4YH.mjs","/workspace/src/content/blog/will-we-ever-be-able-to-download-our-brains-like-in-westworld.mdx?astroPropagatedAssets":"chunks/will-we-ever-be-able-to-download-our-brains-like-in-westworld_CCuvwGbP.mjs","/workspace/src/content/blog/your-terminal-is-ugly.mdx?astroPropagatedAssets":"chunks/your-terminal-is-ugly_DhLK31y1.mjs","/workspace/src/content/blog/choosing-a-standing-desk.mdx":"chunks/choosing-a-standing-desk_DMR5P29J.mjs","/workspace/src/content/blog/chrome-media-keys.mdx":"chunks/chrome-media-keys_DMFZDR-5.mjs","/workspace/src/content/blog/creating-custom-gpt-agents.mdx":"chunks/creating-custom-gpt-agents_CbDTnpNs.mjs","/workspace/src/content/blog/creating-social-graph-images.mdx":"chunks/creating-social-graph-images_CnlLMSiE.mjs","/workspace/src/content/blog/ditching-wordpress-for-nuxtjs.mdx":"chunks/ditching-wordpress-for-nuxtjs_BH59Dni5.mjs","/workspace/src/content/blog/fetching-youtube-videos-with-astro.mdx":"chunks/fetching-youtube-videos-with-astro_D3WfpZYt.mjs","/workspace/src/content/blog/facebook-already-created-garrys-mod-vr.mdx":"chunks/facebook-already-created-garrys-mod-vr_DqgYRkur.mjs","/workspace/src/content/blog/flash-should-be-blue.mdx":"chunks/flash-should-be-blue_DmtdnTeB.mjs","/workspace/src/content/blog/how-to-docker-compose.mdx":"chunks/how-to-docker-compose_GVcbeB_S.mjs","/workspace/src/content/blog/how-to-speed-test-your-vps.mdx":"chunks/how-to-speed-test-your-vps_CoCC2eQ4.mjs","/workspace/src/content/blog/how-vector-databases-make-ai-smart.mdx":"chunks/how-vector-databases-make-ai-smart_B-z-hEQz.mjs","/workspace/src/content/blog/kubernetes-in-10-minutes.mdx":"chunks/kubernetes-in-10-minutes_CVsGXcif.mjs","/workspace/src/content/blog/make-a-home-media-server-with-plex-and-docker-compose.mdx":"chunks/make-a-home-media-server-with-plex-and-docker-compose_BYeGE4V9.mjs","/workspace/src/content/blog/synology-ds920plus_nas.mdx":"chunks/synology-ds920plus_nas_BY-lJzfy.mjs","/workspace/src/content/blog/testing-shell-scripts-with-bats.mdx":"chunks/testing-shell-scripts-with-bats_Dg3Pfoe9.mjs","/workspace/src/content/blog/the-windows-ugly-sweater.mdx":"chunks/the-windows-ugly-sweater_LHJH7cZX.mjs","/workspace/src/content/blog/what-is-docker.mdx":"chunks/what-is-docker_BmX1Bhg1.mjs","/workspace/src/content/blog/will-we-ever-be-able-to-download-our-brains-like-in-westworld.mdx":"chunks/will-we-ever-be-able-to-download-our-brains-like-in-westworld_B_kO8iut.mjs","/workspace/src/content/blog/your-terminal-is-ugly.mdx":"chunks/your-terminal-is-ugly_DYxLeE-Z.mjs","@components/Nav/NavTOC":"_astro/NavTOC.wli9661-.js","@components/Nav/NavMain":"_astro/NavMain.DPUCh4hX.js","@astrojs/react/client.js":"_astro/client.DuSjjHra.js","/workspace/node_modules/.pnpm/@astro-community+astro-embed-youtube@0.5.6_astro@5.12.9_@netlify+blobs@10.0.8_@types+no_b94fa157a6392e47b5d36fb307b06a32/node_modules/@astro-community/astro-embed-youtube/YouTube.astro?astro&type=script&index=0&lang.ts":"_astro/YouTube.astro_astro_type_script_index_0_lang.93Joh3Cm.js","/workspace/node_modules/.pnpm/@astro-community+astro-embed-vimeo@0.3.10_astro@5.12.9_@netlify+blobs@10.0.8_@types+nod_43dabfb2b1852a2a4dca4f59efd0d5e6/node_modules/@astro-community/astro-embed-vimeo/Vimeo.astro?astro&type=script&index=0&lang.ts":"_astro/Vimeo.astro_astro_type_script_index_0_lang.DzilCb4D.js","/workspace/node_modules/.pnpm/astro@5.12.9_@netlify+blobs@10.0.8_@types+node@24.2.1_jiti@2.5.1_lightningcss@1.30.1_ro_8bea888d461345c2cbc79369019d6bab/node_modules/astro/components/ClientRouter.astro?astro&type=script&index=0&lang.ts":"_astro/ClientRouter.astro_astro_type_script_index_0_lang.Xqy5Pijw.js","astro:scripts/page.js":"_astro/page.BXQme7JB.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["/workspace/node_modules/.pnpm/@astro-community+astro-embed-youtube@0.5.6_astro@5.12.9_@netlify+blobs@10.0.8_@types+no_b94fa157a6392e47b5d36fb307b06a32/node_modules/@astro-community/astro-embed-youtube/YouTube.astro?astro&type=script&index=0&lang.ts","(function(){try{var n=typeof window<\"u\"?window:typeof global<\"u\"?global:typeof globalThis<\"u\"?globalThis:typeof self<\"u\"?self:{};n.SENTRY_RELEASE={id:\"b013abdb3690bae9ad9a100e2544054a22743061\"}}catch{}})();try{(function(){var n=typeof window<\"u\"?window:typeof global<\"u\"?global:typeof globalThis<\"u\"?globalThis:typeof self<\"u\"?self:{},e=new n.Error().stack;e&&(n._sentryDebugIds=n._sentryDebugIds||{},n._sentryDebugIds[e]=\"0b90d441-cc21-41c8-83bb-97f717bcc735\",n._sentryDebugIdIdentifier=\"sentry-dbid-0b90d441-cc21-41c8-83bb-97f717bcc735\")})()}catch{}class i extends HTMLElement{connectedCallback(){this.videoId=this.getAttribute(\"videoid\");let e=this.querySelector(\".lty-playbtn\");if(this.playLabel=e&&e.textContent.trim()||this.getAttribute(\"playlabel\")||\"Play\",this.dataset.title=this.getAttribute(\"title\")||\"\",this.style.backgroundImage||(this.style.backgroundImage=`url(\"https://i.ytimg.com/vi/${this.videoId}/hqdefault.jpg\")`,this.upgradePosterImage()),e||(e=document.createElement(\"button\"),e.type=\"button\",e.classList.add(\"lty-playbtn\"),this.append(e)),!e.textContent){const t=document.createElement(\"span\");t.className=\"lyt-visually-hidden\",t.textContent=this.playLabel,e.append(t)}this.addNoscriptIframe(),e.nodeName===\"A\"&&(e.removeAttribute(\"href\"),e.setAttribute(\"tabindex\",\"0\"),e.setAttribute(\"role\",\"button\"),e.addEventListener(\"keydown\",t=>{(t.key===\"Enter\"||t.key===\" \")&&(t.preventDefault(),this.activate())})),this.addEventListener(\"pointerover\",i.warmConnections,{once:!0}),this.addEventListener(\"focusin\",i.warmConnections,{once:!0}),this.addEventListener(\"click\",this.activate),this.needsYTApi=this.hasAttribute(\"js-api\")||navigator.vendor.includes(\"Apple\")||navigator.userAgent.includes(\"Mobi\")}static addPrefetch(e,t,a){const r=document.createElement(\"link\");r.rel=e,r.href=t,a&&(r.as=a),document.head.append(r)}static warmConnections(){i.preconnected||(i.addPrefetch(\"preconnect\",\"https://www.youtube-nocookie.com\"),i.addPrefetch(\"preconnect\",\"https://www.google.com\"),i.addPrefetch(\"preconnect\",\"https://googleads.g.doubleclick.net\"),i.addPrefetch(\"preconnect\",\"https://static.doubleclick.net\"),i.preconnected=!0)}fetchYTPlayerApi(){window.YT||window.YT&&window.YT.Player||(this.ytApiPromise=new Promise((e,t)=>{var a=document.createElement(\"script\");a.src=\"https://www.youtube.com/iframe_api\",a.async=!0,a.onload=r=>{YT.ready(e)},a.onerror=t,this.append(a)}))}async getYTPlayer(){return this.playerPromise||await this.activate(),this.playerPromise}async addYTPlayerIframe(){this.fetchYTPlayerApi(),await this.ytApiPromise;const e=document.createElement(\"div\");this.append(e);const t=Object.fromEntries(this.getParams().entries());this.playerPromise=new Promise(a=>{let r=new YT.Player(e,{width:\"100%\",videoId:this.videoId,playerVars:t,events:{onReady:s=>{s.target.playVideo(),a(r)}}})})}addNoscriptIframe(){const e=this.createBasicIframe(),t=document.createElement(\"noscript\");t.innerHTML=e.outerHTML,this.append(t)}getParams(){const e=new URLSearchParams(this.getAttribute(\"params\")||[]);return e.append(\"autoplay\",\"1\"),e.append(\"playsinline\",\"1\"),e}async activate(){if(this.classList.contains(\"lyt-activated\"))return;if(this.classList.add(\"lyt-activated\"),this.needsYTApi)return this.addYTPlayerIframe(this.getParams());const e=this.createBasicIframe();this.append(e),e.focus()}createBasicIframe(){const e=document.createElement(\"iframe\");return e.width=560,e.height=315,e.title=this.playLabel,e.allow=\"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture\",e.allowFullscreen=!0,e.src=`https://www.youtube-nocookie.com/embed/${encodeURIComponent(this.videoId)}?${this.getParams().toString()}`,e}upgradePosterImage(){setTimeout(()=>{const e=`https://i.ytimg.com/vi_webp/${this.videoId}/sddefault.webp`,t=new Image;t.fetchPriority=\"low\",t.referrerpolicy=\"origin\",t.src=e,t.onload=a=>{a.target.naturalHeight==90&&a.target.naturalWidth==120||(this.style.backgroundImage=`url(\"${e}\")`)}},100)}}customElements.define(\"lite-youtube\",i);"],["/workspace/node_modules/.pnpm/@astro-community+astro-embed-vimeo@0.3.10_astro@5.12.9_@netlify+blobs@10.0.8_@types+nod_43dabfb2b1852a2a4dca4f59efd0d5e6/node_modules/@astro-community/astro-embed-vimeo/Vimeo.astro?astro&type=script&index=0&lang.ts","(function(){try{var a=typeof window<\"u\"?window:typeof global<\"u\"?global:typeof globalThis<\"u\"?globalThis:typeof self<\"u\"?self:{};a.SENTRY_RELEASE={id:\"b013abdb3690bae9ad9a100e2544054a22743061\"}}catch{}})();try{(function(){var a=typeof window<\"u\"?window:typeof global<\"u\"?global:typeof globalThis<\"u\"?globalThis:typeof self<\"u\"?self:{},e=new a.Error().stack;e&&(a._sentryDebugIds=a._sentryDebugIds||{},a._sentryDebugIds[e]=\"e29284a2-210e-4897-9182-d1dde6324186\",a._sentryDebugIdIdentifier=\"sentry-dbid-e29284a2-210e-4897-9182-d1dde6324186\")})()}catch{}class n extends HTMLElement{constructor(){super(...arguments),this.videoId=encodeURIComponent(this.dataset.id)}static{this.preconnected=!1}connectedCallback(){this.addEventListener(\"pointerover\",n.warmConnections,{once:!0}),this.addEventListener(\"click\",t=>this.addIframe(t));const e=this.querySelector(\"a\");if(e){const t=document.createElement(\"button\");t.classList.add(...e.classList.values()),t.setAttribute(\"aria-label\",e.getAttribute(\"aria-label\")),e.replaceWith(t)}}static addPrefetch(e,t){const s=document.createElement(\"link\");s.rel=e,s.href=t,document.head.append(s)}static warmConnections(){n.preconnected||(n.addPrefetch(\"preconnect\",\"https://player.vimeo.com\"),n.addPrefetch(\"preconnect\",\"https://i.vimeocdn.com\"),n.addPrefetch(\"preconnect\",\"https://f.vimeocdn.com\"),n.addPrefetch(\"preconnect\",\"https://fresnel.vimeocdn.com\"),n.preconnected=!0)}addIframe(e){if(this.classList.contains(\"ltv-activated\"))return;e.preventDefault(),this.classList.add(\"ltv-activated\");const t=encodeURIComponent(this.dataset.t||\"0m\"),s=new URLSearchParams(this.dataset.params||[]),d=document.createElement(\"iframe\");d.width=\"640\",d.height=\"360\",d.allow=\"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture\",d.allowFullscreen=!0,d.src=`https://player.vimeo.com/video/${this.videoId}?${s.toString()}#t=${t}`,this.append(d)}}customElements.get(\"lite-vimeo\")||customElements.define(\"lite-vimeo\",n);"]],"assets":["/_astro/ec.mpm3y.css","/_astro/ec.p1z7b.js","/_astro/tstvprofile.BJbsZxoX.png","/_astro/github-issue-search-filter.B8YYrKfT.png","/_astro/github-new-issue-with-templates.BszqFiLa.png","/_astro/mbp-about-this-mac.Dljl2_wU.png","/_astro/attach-files-github-issue.fd1xXuVV.png","/_astro/sd-card-label-9-pen.XelaOsfz.png","/_astro/audio-issues.Drm2Pw97.jpg","/_astro/horizon-gmod.Btg4jR-i.jpg","/_astro/docker-compose-thumbnail.4U4MLMs-.png","/_astro/docker-in-5-thumbnail.Bz6sDCS-.png","/_astro/vectorspace-thumbnail.CqvX_d09.png","/_astro/synology-thumbnail.CVxILMAd.png","/_astro/what-is-kubernetes-thumbnail.Bl4itdzD.png","/_astro/windows-xp-ugly-sweater-thumbnail.D9GicJmU.png","/_astro/astro-youtube-rss.URY3E6T0.png","/_astro/the-flash-blue-thumbnail.CLUNKZuO.png","/_astro/your-terminal-is-ugly.CZBee4ZT.png","/_astro/thumbnail-open-github-issue.Dov86_LF.png","/_astro/standing-desk-video-thumbnail.g_PKTHbB.png","/_astro/open-graph-3d-render.DrHyvrV6.png","/_astro/nuxtjs-blog.BE2NfXFn.png","/_astro/steam-deck-sd-card.CD1LSGpO.png","/_astro/bats-testing.3RJ1yEjk.png","/_astro/vps-speed.DtFZcPK1.png","/_astro/ai-bot-factory-thumbnail.QuARRfFr.png","/_astro/download-brain.DBwgsvNS.png","/_astro/steam-deck-cards-top.GxOTYmIE.png","/_astro/plex-server.Chq2dHTy.png","/_astro/sd-cards-with-labels.s_SQoCUQ.png","/_astro/desk-riser.CdRZBdVH.jpg","/_astro/vultr-cpu-leak.CloqaQQQ.jpg","/_astro/nuxt-v-wordpress-speed.C7rvyL93.jpg","/_astro/nuxt-performance.BiQH-jwP.jpg","/_astro/fb-horizon-paper-airplane-toss.CiDzVC-n.jpg","/_astro/fb-horizon-karaoke.C9i-XpAu.jpg","/_astro/fb-horizon-script-editor-panel.B9xBfDbd.jpg","/_astro/redshift-doppler.CxYpxa2O.gif","/_astro/fb-horizon-worlds-gizmos.4Y-dCwvm.jpg","/_astro/windows-lucky-day.tFGNC7qn.jpg","/_astro/ebay-windows-sweater.D48dOnI1.jpg","/_astro/docker-container-ship.H7IRYZhX.jpg","/_astro/what-is-container.gy5A3u-u.png","/_astro/captcha.vbj0J1cY.jpg","/_astro/tstv-website-wordpress.TMiCiSN-.png","/_astro/sd-card-wallet.CxvtVJjP.png","/_astro/westworld-natural-language.CoWkCbJC.gif","/_astro/inter-cyrillic-ext-wght-normal.B2xhLi22.woff2","/_astro/inter-greek-ext-wght-normal.CGAr0uHJ.woff2","/_astro/inter-cyrillic-wght-normal.CMZtQduZ.woff2","/_astro/inter-vietnamese-wght-normal.CBcvBZtf.woff2","/_astro/inter-greek-wght-normal.CaVNZxsx.woff2","/_astro/inter-latin-ext-wght-normal.DO1Apj_S.woff2","/_astro/inter-latin-wght-normal.Dx4kXJAl.woff2","/_astro/outfit-latin-ext-wght-normal.BKoAQiX9.woff2","/_astro/outfit-latin-wght-normal.BKjeiFaL.woff2","/_astro/google-play-music-permissions.C1xjEdiy.jpg","/_astro/play-music-extension.D2AClVdY.jpg","/_astro/chevy-chatbot-fail.CG0b7Hvn.png","/_astro/chatgpt-center-of-us.oWZ_lE53.png","/_astro/go-tutor-avatar.DHcpecla.webp","/_astro/wallstreet-doctor-avatar.R1b-TaWn.png","/_astro/philly-gpt-avatar.jH8FIZeS.webp","/_astro/my-gpts.BmagWYds.png","/_astro/create-gpt-form.9wnEh2ZU.png","/_astro/phillygpt-daily.CGYtVzfo.png","/_astro/gpt-instructions-example.D6kPgYjC.png","/_astro/custom-gpts-launch.CwfIR1y9.png","/_astro/df-utility.BxREAR78.jpg","/_astro/plex-setup.C2lbLLJx.jpg","/_astro/k8pods.DGwO7uUh.jpg","/_astro/emby.CbF1eDPx.png","/_astro/kubectl-version.dphEYWNx.png","/_astro/similarity-search-embeddings.99Yk5bl5.png","/_astro/youtube-flash-rss.4eHpsV4k.jpg","/_astro/zapier-youtube-netlify.DN5cKQDr.png","/_astro/copy-channel-id.CRbjeBlW.png","/_astro/jellyfin.B-cYpIJq.png","/_astro/simplified-vector-space.BgpL7GqE.png","/_astro/k8-cluster-v.DYFLmdSv.png","/_astro/rag-diagram.DS7BjUES.png","/_astro/chrome.f1eQSm4k.svg","/_astro/safari.CdqjFDzc.svg","/_astro/firefox.CMmddY9p.svg","/_astro/edge.B7O1xshw.svg","/_astro/windows-terminal.e_XkYSiB.png","/_astro/vscode-terminal.CA1NZaI5.png","/_astro/oh-my-zsh-sticker.C1CNNhGR.png","/_astro/tabby-sh.CoTNexE2.png","/_astro/bat-cli.TOWnnGWZ.png","/_astro/powerlevel10k.Dd0DZrjX.png","/_astro/lunarvim.VnAkAeEU.png","/_astro/neovim-nightfox.atLIsC9K.png","/_astro/htop.3iqJ6Tpg.png","/_astro/astro-og-dist.qZAOWJ3X.png","/_astro/iterm2._f7gfPhl.png","/_astro/generating-open-graph-images-for-astro-og.Cxr_uGFX.png","/_astro/og-breakdown-3d.CfoxsdLV.png","/_astro/about.QDwKrLSf.css","/chunks/BaselineStatus_astro_astro_type_style_index_0_lang.45cfe489_h-u9Un7Y.mjs.map","/chunks/astro_BMPZ6owI.mjs.map","/chunks/astro/server_C7Me25bh.mjs.map","/chunks/post_astro_astro_type_style_index_0_lang.12f62fdf_h-u9Un7Y.mjs.map","/chunks/Newsletter_uA9If1GH.mjs.map","/chunks/tstvprofile_MYlF40GN.mjs.map","/chunks/techsquidtv_KIVLv8za.mjs.map","/chunks/PostList_vodb9WPy.mjs.map","/chunks/PostMeta_B3KAHiZ3.mjs.map","/chunks/_astro_content_AxZYxoz7.mjs.map","/chunks/consts_BeMa1T6N.mjs.map","/chunks/LayoutBase_BaKAafgA.mjs.map","/chunks/page-ssr_CND3ilT1.mjs.map","/manifest_BeCZx72T.mjs.map","/chunks/_@astrojs-ssr-adapter_lBnMjb39.mjs.map","/chunks/netlify-blobs_Btuq9YaR.mjs.map","/chunks/tstv-404_DW7oJ5m9.mjs.map","/chunks/content-assets_D9WpZMzt.mjs.map","/chunks/content-modules_aI-twvfB.mjs.map","/chunks/_astro_data-layer-content_BhwXePLQ.mjs.map","/chunks/multipart-parser_BoTmlYBk.mjs.map","/chunks/choosing-a-standing-desk_Di3WGp74.mjs.map","/chunks/chrome-media-keys_Bw06ynfC.mjs.map","/chunks/creating-custom-gpt-agents_paMEqQnO.mjs.map","/chunks/creating-social-graph-images_DfarPMbg.mjs.map","/chunks/ditching-wordpress-for-nuxtjs_gZck_477.mjs.map","/chunks/fetching-youtube-videos-with-astro_BOUuXoZc.mjs.map","/chunks/Icon_CMdNJefD.mjs.map","/chunks/_astro_assets_DLmpV0SS.mjs.map","/chunks/LatestYouTube_CRs4oIhE.mjs.map","/chunks/download-brain_B2eVifwT.mjs.map","/chunks/facebook-already-created-garrys-mod-vr_CH6Vs5-2.mjs.map","/chunks/flash-should-be-blue_-8zgAKAD.mjs.map","/chunks/how-to-docker-compose_Bap-fLbm.mjs.map","/chunks/how-to-speed-test-your-vps_D7Nxxjfm.mjs.map","/chunks/how-vector-databases-make-ai-smart_BEVjF9D1.mjs.map","/chunks/kubernetes-in-10-minutes_4K0GGSM8.mjs.map","/chunks/make-a-home-media-server-with-plex-and-docker-compose_VhFOI1uV.mjs.map","/chunks/synology-ds920plus_nas_NgxMSvDR.mjs.map","/chunks/testing-shell-scripts-with-bats_Dn-vN1A2.mjs.map","/chunks/the-windows-ugly-sweater_CT1crQ-R.mjs.map","/chunks/what-is-docker_8Y6PG4YH.mjs.map","/chunks/will-we-ever-be-able-to-download-our-brains-like-in-westworld_CCuvwGbP.mjs.map","/chunks/your-terminal-is-ugly_DhLK31y1.mjs.map","/chunks/choosing-a-standing-desk_DMR5P29J.mjs.map","/chunks/post_WhtVEyTV.mjs.map","/chunks/chrome-media-keys_DMFZDR-5.mjs.map","/chunks/creating-custom-gpt-agents_CbDTnpNs.mjs.map","/chunks/creating-social-graph-images_CnlLMSiE.mjs.map","/chunks/ditching-wordpress-for-nuxtjs_BH59Dni5.mjs.map","/chunks/fetching-youtube-videos-with-astro_D3WfpZYt.mjs.map","/chunks/facebook-already-created-garrys-mod-vr_DqgYRkur.mjs.map","/chunks/flash-should-be-blue_DmtdnTeB.mjs.map","/chunks/how-to-docker-compose_GVcbeB_S.mjs.map","/chunks/how-to-speed-test-your-vps_CoCC2eQ4.mjs.map","/chunks/how-vector-databases-make-ai-smart_B-z-hEQz.mjs.map","/chunks/kubernetes-in-10-minutes_CVsGXcif.mjs.map","/chunks/make-a-home-media-server-with-plex-and-docker-compose_BYeGE4V9.mjs.map","/chunks/synology-ds920plus_nas_BY-lJzfy.mjs.map","/chunks/testing-shell-scripts-with-bats_Dg3Pfoe9.mjs.map","/chunks/the-windows-ugly-sweater_LHJH7cZX.mjs.map","/chunks/what-is-docker_BmX1Bhg1.mjs.map","/chunks/will-we-ever-be-able-to-download-our-brains-like-in-westworld_B_kO8iut.mjs.map","/chunks/your-terminal-is-ugly_DYxLeE-Z.mjs.map","/_noop-middleware.mjs.map","/_noop-actions.mjs.map","/pages/404.astro.mjs.map","/pages/about.astro.mjs.map","/pages/blog/tags/_tag_.astro.mjs.map","/pages/blog/_post_/_post_-og.png.astro.mjs.map","/pages/blog/_post_.astro.mjs.map","/pages/blog.astro.mjs.map","/pages/contact.astro.mjs.map","/pages/follow.astro.mjs.map","/pages/newsletter.astro.mjs.map","/pages/rss.xml.astro.mjs.map","/pages/services/devrel.astro.mjs.map","/pages/verify.astro.mjs.map","/pages/index.astro.mjs.map","/entry.mjs.map","/renderers.mjs.map","/_@astrojs-ssr-adapter.mjs.map","/android-chrome-192x192.png","/android-chrome-512x512.png","/apple-touch-icon-120x120.png","/apple-touch-icon-152x152.png","/apple-touch-icon-180x180.png","/apple-touch-icon-60x60.png","/apple-touch-icon-76x76.png","/apple-touch-icon.png","/browserconfig.xml","/favicon-16x16.png","/favicon-32x32.png","/favicon.ico","/favicon.svg","/mstile-150x150.png","/robots.txt","/safari-pinned-tab.svg","/site.webmanifest","/_astro/ClientRouter.astro_astro_type_script_index_0_lang.Xqy5Pijw.js","/_astro/ClientRouter.astro_astro_type_script_index_0_lang.Xqy5Pijw.js.map","/_astro/NavMain.DPUCh4hX.js","/_astro/NavMain.DPUCh4hX.js.map","/_astro/NavTOC.wli9661-.js","/_astro/NavTOC.wli9661-.js.map","/_astro/Vimeo.astro_astro_type_script_index_0_lang.DzilCb4D.js.map","/_astro/YouTube.astro_astro_type_script_index_0_lang.93Joh3Cm.js.map","/_astro/client.DuSjjHra.js","/_astro/client.DuSjjHra.js.map","/_astro/index.Bo_HpAOh.js","/_astro/index.Bo_HpAOh.js.map","/_astro/menu.CM-cQeib.js","/_astro/menu.CM-cQeib.js.map","/_astro/page.BXQme7JB.js","/_astro/page.BXQme7JB.js.map","/assets/noise.svg","/sig/A606F9A583AD5E69738E241226BF4A861BD3AE79.asc","/static/images/devrel-service-og.png","/_astro/page.BXQme7JB.js","/404.html","/about/index.html","/blog/Choosing_a_standing_desk/index.html","/blog/Chrome_media_keys/index.html","/blog/Ditching_WordPress/index.html","/blog/Facebook_already_created_Garrys_mod_vr/index.html","/blog/Fixing_an_ugly_terminal/index.html","/blog/How_to_Docker_Compose/index.html","/blog/How_to_speed_test_your_vps/index.html","/blog/Kubernetes_in_10_minutes/index.html","/blog/Making_your_own_home_media_server_with_plex_and_Docker-Compose/index.html","/blog/Synology_ds920plus_nas/index.html","/blog/tags/index.html","/blog/Testing_shell_scripts_with_bats/index.html","/blog/The_Windows_Ugly_Sweater/index.html","/blog/What_Is_Docker/index.html","/blog/where-in-the-world-is-static-shock-for-gba/index.html","/blog/Will_We_Ever_Be_Able_To_Download_Our_Brains_Like_In_Westworld/index.html","/blog/index.html","/contact/index.html","/follow/index.html","/newsletter/index.html","/rss.xml","/services/devrel/index.html","/services/index.html","/verify/index.html","/index.html"],"buildFormat":"directory","checkOrigin":true,"serverIslandNameMap":[],"key":"KUu6ObL4sC6D4QGkLMzAtXPY3yfuNPoRgvIxsu56leg=","sessionConfig":{"driver":"netlify-blobs","options":{"name":"astro-sessions","consistency":"strong"}}});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = () => import('./chunks/netlify-blobs_Btuq9YaR.mjs').then(n => n.n);

export { manifest };
