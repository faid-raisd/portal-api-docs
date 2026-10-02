# Shared component library

`raisd-campus/design-system` owns the shared React package `@raisd-campus/design-system`. The four portal applications are separate repositories and consume released package versions. The student portal is the first consumer and the source of the initial visual patterns. `control-plane` and `portal-api-docs` do not import React components.

## Ownership decision

Before building a UI element, look in the package catalogue and the [published visual catalogue](https://raisd-campus.github.io/portal-api-docs/design-system/). Import a published component when it expresses the required visual and interaction pattern. Do not copy its source into a portal or run a component generator that creates another local copy. Extend the package when a reusable variant is needed; keep workflow and product decisions in the owning portal.

| Layer | Owner | Examples |
| --- | --- | --- |
| Tokens, type, primitives | `design-system` | Colours, spacing, `Button`, `Badge`, `Input`, `Dialog` |
| Portal-neutral patterns | `design-system` | `PortalShell`, `PortalSidebar`, `PortalHeader`, `PortalAccount`, `SummaryCard`, `RecordSummaryCard`, `DataTable`, `PagePanelLayout` |
| Portal-specific composition | Each portal | Student enrolment context, student profile issues, route selection, Community draft and attachment policy |
| Campus data and rules | `control-plane` / Portal API | Identity, records, authorisation, CMS integration |

The package must not import a portal's `@/` alias, routes, contracts, queries, feature models, or mock data. Shared patterns take presentation data and callbacks. A portal adapter maps its records and actions to those props. A shared component may expose an optional link renderer instead of depending on one portal's router.

## Component-change guardrail

Follow the authoritative [campus-wide component-change guardrail](../AGENTS.md#component-change-guardrail-all-portals) in all four portals. It protects both shared components and established portal-owned components and layouts.

- Compose the requested feature using existing components, documented variants, props and slots. Supply feature content, data, callbacks and workflow decisions within the authorized task scope.
- Importing a shared component does not authorize restyling it. A `className` prop, stylesheet, descendant selector or wrapper must not change established sizing, spacing, typography, surfaces, layout, responsive behaviour or interactions without explicit instruction or approval for that change. This applies to buttons, fields, accordions, navigation, panels and other components equally.
- Before an additional component change, describe the affected component, the specific proposed change, and its impact on other consumers and portals; obtain approval before editing. A feature request alone does not authorize incidental redesigns, and existing explicit authorization does not require another confirmation.
- Put approved reusable changes in `design-system` and follow the release and consumer-upgrade process below. Keep approved portal-specific changes in the owning portal; do not patch installed package files or create a local copy of a published component.

## Standard field sizing

Package 0.5.2 standardizes `Input`, `DropdownSelect` and `DatePicker` at 36px height, 14px text and 20px line height across desktop, tablet, phone and coarse pointers. `DropdownSelect` uses `data-slot="dropdown-select-trigger"`. Do not add local field sizing or font overrides. Textareas retain their multiline height and 14px text; upload, checkbox, radio and other touch geometry remains distinct. Survey answer labels are 14px while headings and choice cards retain their scale. Applicant and Student own matching zoom-suppression viewport metadata; physical iPhone focus, keyboard dismissal and rotation require device verification.

## Shared conversation presentation

Package 0.6.0 moves Student's existing chat presentation into `system/chat-message` (`ChatMessageRow`, `DateDivider`) and `system/chat-composer` (controlled `ChatComposer`), preserving its visuals, sizing, keyboard sending, attachment tiles and image lightbox. Pass display records and callbacks; the composer accepts controlled text, prepared attachment metadata, sending/disabled state and an error. It does not validate, upload, persist or send files.

Each portal adapter owns attachment limits and validation, draft storage, pending requests, preview URLs, read watermarks, identity and workflow status. Student keeps its existing API and Community/Online Forms behavior behind compatibility adapters. Applicant's frontend-only adapter retains conversations and drafts in memory until refresh; reading a reviewer message and answering it are distinct operations. Shared message rows expose optional delete/receipt presentation only when the consuming workflow supplies it.

## Accordion, avatar and read-only file presentation

Package 0.6.1 adds a pointer cursor to enabled `AccordionTrigger` controls and an opt-in `AvatarFallback.surface="subtle"` for the darker `surface-subtle` token on surface backgrounds. Shared chat message rows use the subtle fallback; avatar sizes, images, disabled accordion interaction and header geometry remain unchanged. Consumers own accordion title typography.

Read-only uploaded files use the existing `DetailField` `readOnly` variant with a read-only `FileUploadField` supplied as `value` to align with other label/value columns. `readOnlyStacked` intentionally places a value below its label and is not the default for files.

## Installing in a portal

Use the `@raisd-campus` scope with GitHub Packages and pin a released version in `package.json` and the lockfile. Commit a project `.npmrc` containing only the registry mapping. For local installation, authenticate with a GitHub personal access token (classic) with `read:packages`, held in user-level npm configuration or `NODE_AUTH_TOKEN`; never commit a token. CI uses `GITHUB_TOKEN` with `packages: read` after package read access is granted to the portal repository in the package settings.

If using `NODE_AUTH_TOKEN` locally, put the following interpolation in the **user-level** `.npmrc`; the environment variable alone does not tell npm which registry should receive it. GitHub Actions `setup-node` writes this auth mapping for its job when configured with `registry-url` and `scope`.

```ini
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

For a portal GitHub Actions job, grant that repository **Read** under the package's **Manage Actions access** setting, then use:

```yaml
permissions:
  contents: read
  packages: read
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4
    with:
      node-version: 22
      registry-url: https://npm.pkg.github.com
      scope: '@raisd-campus'
  - run: npm ci
    env:
      NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

```ini
@raisd-campus:registry=https://npm.pkg.github.com
```

```powershell
npm install --save-exact @raisd-campus/design-system@0.6.0
```

Import the stylesheet once in the portal's entry CSS. Tailwind v4 ignores `node_modules` by default, so register the installed package as a source. For a portal stylesheet under `src/`, the setup is:

```css
@import "tailwindcss";
@import "@raisd-campus/design-system/styles.css";
@source "../node_modules/@raisd-campus/design-system/dist";
```

```tsx
import { Button } from "@raisd-campus/design-system/ui/button"
import { SummaryCard } from "@raisd-campus/design-system/system/summary-card"
```

Import individual `ui/<component>` or `system/<component>` subpaths to keep unused components out of the portal's eager bundle. Do not import `dist` internals or use the root barrel for application code. A consumer should read `node_modules/@raisd-campus/design-system/docs/components.md` and the emitted declarations from its **pinned version** for exact props, states, and examples. The [0.6.0 catalogue](https://github.com/raisd-campus/design-system/blob/v0.6.0/docs/components.md) is the stable online reference; `main` may have newer APIs. The [portal design rules](design-system.md) define token meaning and responsive behaviour. Keep dark-only styling until a cross-portal theming decision is approved. Phone, tablet, and desktop layouts must remain usable.

`RecordSummaryCard` presents the reference as a labelled row before the other values, followed by an edge-to-edge status footer. `referenceLabel` defaults to "Reference" and can be tailored by the portal. The portal supplies values, status text and tone, and an optional selection action; it owns reference issuance, dates and record workflow.

`TabbedPagePanel` fills its containing width, including for a single-tab page with short content. Package 0.5.1 explicitly keeps this frame in a column layout. Place route-level completion and editing actions in `PageActionBar` below the panel content.

`DetailField` keeps divided rows by default. Use `variant="editableUndivided"` for editable fields without row dividers; it preserves the shared label/control alignment and narrow-panel stacking. This variant is available from package 0.3.0, with tighter vertical spacing from 0.3.1.

From package 0.4.2, `DetailField` can show a contextual label tooltip through its optional `tooltip` prop. The help icon stays beside the label's final word when it wraps. Omit the prop or pass `tooltipEnabled={false}` to hide the icon. The portal supplies the help content; the shared component owns the trigger, focus, and layout.

From package 0.5.0, `system/survey-layout` exports `SurveyLayout` and `SurveyChoiceGroup` for one-question-at-a-time surveys and wizards. The shared layout owns responsive 32/48px question typography, question focus, progress and answer/action slots. Controlled native radio choices preserve keyboard navigation. The portal owns question order, branching, validation, answer retention and destinations; country selectors can be supplied through the answer slot. Checklist checkboxes must remain separate from accordion expansion buttons.

Use `system/portal-shell` for the shell family in every React portal: `PortalShell`, `PortalSidebar`, `PortalHeader`, `PortalNavItem`, `PortalNavGroup`, `PortalAccount`, `PortalMain`, and `PortalPageContent`. The package owns the full-screen phone drawer, tablet rail, desktop frame, header and 36px avatar, one page scroller, and 16/24/48px gutters. Portals pass a logo, navigation and footer actions, account data, header controls, and an optional sidebar panel. The student portal supplies Community content/resizing and nested route behavior; the applicant portal supplies its own two links. Do not recreate the shell in a portal. Package changes reach an app when its pinned version is deliberately upgraded.

## Changes and releases

1. Change the reusable component and its catalogue in `design-system`; preserve keyboard, focus, disabled, loading, empty, error, and responsive states where relevant.
2. Build and test the package, then publish a versioned release. Use SemVer and record breaking prop or visual changes in the changelog.
3. Upgrade each portal deliberately. Its lockfile must use the released package. Run the portal's own checks before merging.
4. When a shared token, public prop, visual state, interaction or ownership rule observably changes, update the package catalogue and this knowledge base where relevant. Prepare affected `control-plane/docs/design-system/` text/captures, then publish its `portal-api-docs/design-system/` mirror when the new package version is released. The public site always describes a released, installable version. Prop-only changes may need text but no new image; visual changes need fresh captures and provenance. Update `docs/ai/MANIFEST.yaml` only for added knowledge files.
5. When a student-owned reusable pattern observably changes, update the canonical student design guidance and local mirror, then the affected student HTML examples and captures. Do not edit the shared package catalogue unless its exported API or visuals also changed. Internal refactors with no observable change and unrelated tasks do not trigger design documentation edits.

Lecturer and staff add the package when their apps begin. Each portal pins and upgrades a published package version deliberately.
