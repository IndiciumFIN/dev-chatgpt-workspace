# Locales: canonical register v2.3.0

Scope: isolated public backup v2.2.0; no other repository, no remote database.

- Inventory: 19 languages (one canonical register).
- Prior UI dictionary: pt-BR, en, es, fr, **partial**; none certified as full translation.
- Header accessibility vocabulary: 19, not linguistically certified.
- SEO: legacy four remain configured for compatibility; **not evidence of approval**. Expansion to 19 is blocked pending full localized published content + review.
- Arabic RTL metadata registered; actual layout/keyboard testing pending.
- Code consumers: header-i18n.ts, translate.ts, seo.ts now use locale-registry.ts.
- No remote translation / publication changes.
- `npm run audit:i18n` static test. Build/typecheck not executed (dependencies unavailable).
