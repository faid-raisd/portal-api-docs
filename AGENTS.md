# Portal API docs — agent instructions (pointer)

**Canonical AI knowledge base:** [`control-plane/docs/ai/`](https://github.com/raisd-campus/control-plane/tree/main/docs/ai)

1. Campus: `../control-plane/docs/ai/AGENTS.md`
2. Backend: `../control-plane/docs/ai/backend/portal-api.md`
3. OpenAPI source of truth: `../control-plane/openapi.yaml` (this repo publishes a mirror for GitHub Pages)
4. Design system HTML source: `../control-plane/docs/design-system/` and canonical rule `../control-plane/docs/ai/design/component-library.md`

Do not invent endpoints here that are missing from control-plane `openapi.yaml`.
Mirror design system pages and captures only when an observable shared or student-owned pattern changes. Shared public examples must match a released package version; unrelated tasks do not trigger a design catalogue refresh. Run `python3 scripts/validate-design-system.py .` before publishing.
