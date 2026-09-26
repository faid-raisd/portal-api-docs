# Raisd Portal API docs

Public OpenAPI description, Swagger UI, and architecture diagrams for the Raisd Portal API.

**Live docs:** https://raisd-campus.github.io/portal-api-docs/ (redirects to the overview)  
**Swagger UI:** https://raisd-campus.github.io/portal-api-docs/openapi.html  
**ERD & DFD:** https://raisd-campus.github.io/portal-api-docs/diagrams/
**Distributed CMS:** https://raisd-campus.github.io/portal-api-docs/diagrams/distributed-cms-architecture.html
**[LUCT CMS](https://raisd-campus.github.io/portal-api-docs/diagrams/old-cms/) analysis:** https://raisd-campus.github.io/portal-api-docs/diagrams/old-cms/
**Botswana CMS:** https://raisd-campus.github.io/portal-api-docs/diagrams/old-cms-botswana/
**Sierra Leone CMS:** https://raisd-campus.github.io/portal-api-docs/diagrams/old-cms-sierra-leone/
**AI knowledge:** https://raisd-campus.github.io/portal-api-docs/ai/
**Design system:** https://raisd-campus.github.io/portal-api-docs/design-system/
**SDD / nomenclature:** https://raisd-campus.github.io/portal-api-docs/sdd/
**Nomenclature HTML:** https://raisd-campus.github.io/portal-api-docs/sdd/15-nomenclature.html (CAP/M hover tooltips on all Pages)

| File | Role |
|------|------|
| [`openapi.yaml`](openapi.yaml) | Published OpenAPI 3.1 spec |
| [`index.html`](index.html) | Swagger UI |
| [`diagrams/`](diagrams/) | Mermaid ERD and DFD HTML pages |
| [`diagrams/distributed-cms-architecture.html`](diagrams/distributed-cms-architecture.html) | Distributed CMS — current milestones → multi-country ideal |
| [`diagrams/old-cms/`](diagrams/old-cms/) | [LUCT CMS](diagrams/old-cms/) comparison, FSD, Obsidian 3D, legacy ERD, flows, DB tech |
| [`design-system/`](design-system/) | Released `@raisd-campus/design-system` catalogue (captures + foundations) |
| [`sdd/`](sdd/) | SDD copies; CAP-* / M* nomenclature ([15-nomenclature.md](sdd/15-nomenclature.html)) |

The implementation and diagram source of truth live in the private [`control-plane`](https://github.com/raisd-campus/control-plane) repo (`portal-api/`, `docs/diagrams/`). Keep this published copy in sync when those change.

**Agent knowledge:** [AGENTS.md](AGENTS.md) → control-plane [`docs/ai/`](https://github.com/raisd-campus/control-plane/tree/main/docs/ai) (OpenAPI source of truth remains `control-plane/openapi.yaml`).
