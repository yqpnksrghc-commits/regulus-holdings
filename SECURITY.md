# Security Posture — Regulus Automation Website

## Accepted Risks

### Advisory: PostCSS XSS via Unescaped `</style>` (GHSA-qx2v-qp2m-jg93)

| Field | Value |
|-------|-------|
| **Advisory ID** | GHSA-qx2v-qp2m-jg93 |
| **Affected package** | postcss < 8.5.10 |
| **Dependency path** | `next@15.5.20` → `node_modules/next/node_modules/postcss` |
| **Severity** | Moderate (build-time, not runtime) |
| **Runtime reachability** | **NOT reachable at runtime.** This is a CSS stringifier XSS in postcss that runs only during the Next.js build phase. The static site contains pre-generated HTML; no CSS is re-stringified at runtime. |
| **Exposure conditions** | Only triggered if an attacker: (1) controls CSS input during build, OR (2) can execute arbitrary build commands. Both require compromising the build system, not the deployed site. |
| **Available remediation** | npm proposes `npm audit fix --force`, which downgrades Next.js to 9.3.3 (breaking change). Upgrading Next.js does not help because Next vendors its own postcss copy; only Next major versions update the vendored postcss. |
| **Reason for acceptance** | The vulnerability is build-time only and the site is statically generated. There is no runtime CSS parsing. The cost of downgrading Next.js far exceeds the risk. This advisory will be re-reviewed when Next.js upgrades its vendored postcss. |
| **Review trigger / expiry** | Next.js version upgrade, or 2026-10-13 (whichever is sooner). |

---

## Resolution Summary

- **Total advisories:** 2 moderate (same package, same root cause)
- **Relevant to deployed site:** 0 (both are build-time only)
- **Classification:** **PASS WITH ACCEPTED RISK**

The static site is secure at runtime. The build pipeline requires trusted inputs (no untrusted CSS injection).
