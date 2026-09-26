# Published design system catalogue source

These five HTML pages are the canonical source for the public mirror at
`raisd-campus/portal-api-docs/design-system/`. They describe the **released**
`@raisd-campus/design-system` package and separate student-owned compositions.
The PNGs contain mock data. The `captures.json` manifest records each capture's
viewport, owner, source route, package version, and student portal commit.
Top-level provenance applies to entries unless an entry overrides its source
route, package version, or source commit.

Update this catalogue only when a shared token, public prop, visual state,
interaction, ownership rule, or student-owned reusable pattern observably
changes. Edit only affected text, examples, and captures. An unrelated task or
an internal refactor without an observable change needs no edit.

For a shared package change, prepare captures from the package consumer fixture
or a portal running the candidate release with mock data. For student-owned
examples, use the relevant student feature route with mock data. Record the
release that consumers can install in `captures.json`; do not publish candidate
changes before their package release. Capture affected phone, tablet, and
desktop states when their layouts differ. Keep historical provenance for
unchanged images; update each changed image's metadata and source commit.

For `system/portal-shell`, start the package's `examples/consumer` Vite fixture
on port 4183 and run `node capture-shell.mjs <this-directory>/assets` from that
fixture. It writes mock phone, tablet, and desktop PNGs. Review all three before
updating their entries in `captures.json` and rebuilding the pages.

From the `control-plane` root, regenerate and validate:

```sh
# Edit docs/site-nav.yaml for Primary header + design-system in-page strip
python scripts/build-design-system-pages.py
python docs/sdd/_pages/build-dropdown-nav.py
python scripts/validate-design-system.py docs
```

Primary site navigation is **only** defined in [`docs/site-nav.yaml`](../site-nav.yaml). Do not hand-edit `<nav class="nav">` in HTML — re-run the generator so control-plane and `portal-api-docs` stay identical.

Mirror the five HTML files, `styles.css`, `assets/`, and `captures.json` into
`portal-api-docs/design-system/`, then run
`python scripts/validate-design-system.py .` in that repository. Compare at
phone, tablet, and desktop widths before pushing. The navigation generator may
also update existing site pages when a top-level section changes.
