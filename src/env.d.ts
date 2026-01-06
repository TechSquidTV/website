// Import Astro types first to ensure proper precedence
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// Astro uses its own JSX namespace, React components will use React.JSX
declare namespace JSX {
  interface IntrinsicElements {
    // Allow any HTML element with standard HTML attributes for Astro components
    [elemName: string]: any;
  }
}
