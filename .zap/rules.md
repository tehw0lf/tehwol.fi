# ZAP DAST Ignore Rules

Rules suppressed in `.zap/rules.tsv` with justification:

| Rule ID | Name | Reason |
|---------|------|--------|
| 10035 | Strict-Transport-Security Header Not Set | HSTS is configured in Cloudflare (SSL/TLS → Edge Certificates → HSTS). ZAP scans the HTTP→HTTPS redirect path and does not see the header Cloudflare injects on HTTPS responses. |
| 10055 | CSP: style-src unsafe-inline / Missing Directives | `style-src unsafe-inline` is required by Angular. `form-action` and `base-uri` are explicitly defined in the CSP — ZAP flags these as informational when `default-src` has no fallback for them. |
| 10109 | Modern Web Application | Informational finding — ZAP detected a SPA. Not a vulnerability. |
| 10015 | Re-examine Cache-control Directives | Informational finding about cache headers. Not a vulnerability. |
| 10049 | Storable and Cacheable Content | Informational finding. Static assets are intentionally cacheable. |
| 10096 | Timestamp Disclosure - Unix | Build timestamps embedded in JS bundles by the build tool. Not sensitive data. |
| 10110 | Dangerous JS Functions | `setTimeout`, `setInterval`, and `Function` are used internally by Angular and Zone.js — not by application code. False positive. |
| 10050 | Retrieved from Cache | Cloudflare CDN caching behavior. Not a vulnerability. |
| 90004 | Cross-Origin-Embedder-Policy Header Missing or Invalid | COEP is intentionally set to `unsafe-none`. Switching to `require-corp` was tested (2026-06-20) and breaks the Workbox service worker's `importScripts()` loading, plus would block the GitHub avatar images and GitHub Pages embeds allowed in the CSP `frame-src`/`img-src`, since those origins don't send `Cross-Origin-Resource-Policy` headers. |
