# PRD: Lead details experience & V1 widget layout configurator

**Status:** Draft (aligned to current `sirrus` implementation)  
**Last updated:** April 2026  
**Owners:** Product + Engineering (CRM / lead management)

---

## 1. Executive summary

### 1.1 Problem

Operators spend most of their time on the **all leads** list and the **lead details** surface. Lead details bundles identity, summary fields, activity, journey, overview, and stage change in one place. Org admins need a **safe way to tune** which summary fields appear in the **left rail** without shipping code, and to **preview** the result before it affects live workflows.

### 1.2 Solution (current scope)

- **All leads** remains the primary entry; **opening a lead** launches the **lead details** experience (full-screen drawer on manage-leads).
- **Lead details** is a structured shell: **left summary rail**, **main column** (project strip, tabs, tab body), and **mobile** affordances.
- **V1 Widget & layout** (`/developer/widgets-config`) provides a **widget catalog**, a **left-rail field configurator** for the “Lead Details” widget, and a **live preview** that mirrors the manage-leads shell using **deterministic sample data**.
- **Persistence today:** left-rail layout is stored in **`localStorage`** in the browser (per key below), not on the server.

### 1.3 Success criteria (suggested)

- Admin can show/hide/reorder all supported left-rail fields, save, refresh, and see the same layout on manage-leads lead details (same browser).
- Preview reflects changes **immediately** while configuring; saved layout matches after reload.
- No real PII in the **configurator preview** lead (generic “John Doe” sample).
- Left rail remains **scrollable** when many fields are visible (nested layout / developer shell constraints resolved).

---

## 2. Definitions

| Term | Meaning |
|------|--------|
| **All leads** | Table/list view of leads (`ManageLeadsView`). |
| **Lead details** | Post-click experience: `LeadDetailDrawer` (portal) on manage-leads, or `LeadDetailPagePreview` in developer tools. |
| **Left rail** | Narrow column: temperature, name, ID, stage, quick actions, then **configurable summary rows**. |
| **V1 configurator** | Developer page **Widget & layout** — catalog + left-rail panel + preview. |
| **V2 configurator** | Separate track: canvas + per-tab widgets + `LEFT_RAIL_FIELD_STORAGE_KEY_V2` (see §12). |

---

## 3. User personas & entry points

| Persona | Primary goals | Entry |
|--------|----------------|--------|
| **Sales / CRM user** | Find lead, open details, act (call, notes, tasks, stage). | App → **Manage leads** (`/developer/manage-leads` in this repo). |
| **Org admin / product** | Tune visible summary fields; sanity-check layout. | **Developer → Widget & layout** (`/developer/widgets-config`). |
| **Engineer / QA** | Validate lead shell, Activity hub, V2 sync. | **Developer → Lead detail (track 2)** (`/developer/lead-detail`) — uses V2 storage + `LeadDetailPagePreview` with `syncV2Configurator`. |

---

## 4. User journeys

### 4.1 CRM user: list → details → back

1. User is on **all leads** (stage tabs, pagination, search, filters, add lead).
2. User clicks a **row** (or equivalent) to select a lead.
3. **`LeadDetailDrawer`** opens (fixed overlay): left rail + main area.
4. User switches **tabs** (Activity default), reads/edits where supported, closes drawer (**Escape** or close control).
5. **Edge:** drawer sets `document.body.style.overflow = 'hidden'` while open; restored on close.

### 4.2 Org admin: configure left rail (V1)

1. Open **Widget & layout**.
2. In **Widgets** card, expand **Lead Details** (only row with **Configure** + chevron).
3. **Search / show-hide / reorder** fields (see §8).
4. Click **Save layout** — persists to `localStorage` and dispatches a custom event so other tabs/components refresh.
5. Open **manage leads** → lead details: rail reflects saved **visible** fields and order.
6. Optional: **Show all fields** (UI only until Save) or **Reset** (writes default + saves).

### 4.3 Cross-page consistency

- **Manage leads drawer** reads **`sirrus.left-rail-fields.v1`** via `useLeftRailFieldConfig` / `LeadDetailLeftRail` (no `summaryFieldIds` prop).
- **V1 preview** passes `leftRailFieldIds` from React state updated by the panel (`onVisibleIdsChange`) — can differ from saved until user saves and reloads manage-leads (or same tab listens to event).

---

## 5. All leads page (reference)

**Implemented in:** `components/manage-leads/ManageLeadsView.tsx`, `app/developer/manage-leads/page.tsx`.

**High-level capabilities (non-exhaustive):**

- Stage tabs with counts (`STAGE_TAB_COUNTS`), pagination, page size, search, **Filters** drawer, **Add lead** flow, **Import** affordance (UI).
- Row selection drives `selectedId` → `LeadDetailDrawer` with `lead`, `onPatchLead`, `onStageChange`, `onRequestEditLeadForm`.

**Out of scope for this PRD:** backend persistence of leads, auth, production URL scheme.

---

## 6. Lead details page / drawer

**Implemented in:** `LeadDetailDrawer.tsx` (production-style), `LeadDetailPagePreview.tsx` (embedded / full-page preview).

### 6.1 Shell layout

| Region | Behavior |
|--------|------------|
| **Left rail** | Fixed width `300px` (`lg`: `352px`); hidden below `md` in preview/drawer (`hidden md:block`). Scroll: **outer column** uses `relative` + inner `absolute inset-0 overflow-y-auto` so long field lists scroll inside the column. |
| **Main column** | `flex-1 min-w-0`: header (project strip, close in drawer, optional **Preview** badge), **LeadDetailMobileBar** on small screens, **tab strip**, **tab content** in a rounded white card with vertical scroll where defined. |
| **Portal drawer** | `fixed inset-0 z-[100]`, `md:flex-row`, Escape closes. |

### 6.2 Tabs (labels are product copy)

**Source:** `lib/lead-detail-tabs.ts` — `LEAD_DETAIL_TABS`:

1. **Activity** — real content: `LeadActivityHub`.
2. **AI Insights** — placeholder: *“AI Insights — content placeholder”*.
3. **Lead Journey** — `LeadJourneyPanel` (`variant="full"`, filters, collapsible dates).
4. **Lead Overview** — `LeadOverviewPanel` (inline edits / `onPatchLead`).
5. **Change Stage** — `LeadStageChangeForm`; cancel returns to Activity tab index 0 on save path in preview.
6. **Quotations** — placeholder: *“Quotations — content placeholder”*.

**Edge:** Tab index is client state; switching lead resets some child state via `key={lead.id}` where applicable (e.g. stage form).

### 6.3 Left rail — static chrome (not configurable in V1)

| Element | Copy / behavior |
|---------|-----------------|
| Temperature | `LeadTempBadge` from `lead.temp` (e.g. “Warm”). |
| Name | `lead.name` (`<h2>`). |
| Lead ID | `lead.leadId` (caption). |
| Stage | Pill with stage text; colors from `stageDotColor` / `STAGE_PILL_BORDER`. |
| **Edit** | Button opens lead form when `onEditLead` provided (drawer); aria **“Edit lead form”**. |
| **Call** | Decorative / UX button (no dialer integration in sample). |
| **Chat** | WhatsApp-styled icon; aria **“Chat on WhatsApp”**. |
| **Add comment** | Icon + label **“Add comment”**. |

**Region aria:** left rail component `aria-label="Lead summary"` (`LeadDetailLeftRail`).

### 6.4 Left rail — configurable summary (`LeftRailSummaryFields`)

**Field ids & default labels** (`lib/left-rail-field-registry.ts`):

| Id | Label | Registry hint |
|----|-------|----------------|
| `phone` | Phone | — |
| `alternate` | Alternate | — |
| `email` | Email | — |
| `source` | Source | — |
| `subSource` | Sub source | — |
| `interestedIn` | Interested in | — |
| `budget` | Budget | — |
| `leadOwner` | Lead owner | — |
| `assigned` | Assigned | — |
| `created` | Created | **Read-only** |
| `lastUpdated` | Last updated | **Read-only** |
| `siteVisit` | Site visit | **Read-only** |
| `siteRevisit` | Site revisit | **Read-only** |

**Formatting / masking (examples):**

- Phone uses `whatsapp` with display rules (`+91-` prefix for non-leading `+` patterns in helper).
- Email may render masked in display mode (`EditableLeadSummaryField` / overview model).
- Empty values generally shown as **“-”** where helpers use `emptyToDash`.

**Edge — field list source (`LeadDetailLeftRail`):**

- If `summaryFieldIds` **prop is passed** (V1/V2 preview): use that array **exactly** (may be **empty** if user hides all in preview).
- If **not passed** (manage-leads drawer): use `useLeftRailFieldConfig()` visible ids; if that resolves to **empty**, fall back to **`DEFAULT_LEFT_RAIL_FIELD_ORDER`** so the rail is not blank by accident.

---

## 7. Activity tab — widget-level detail

**Component:** `LeadActivityHub.tsx`  
**Layout:** Top full-width **PAIR + AI summary strip**; below, **3-column grid** on large screens: **Lead status history** \| **Remarks** \| **All tasks** (proportions `2fr / 3.75fr / 2.25fr`).

### 7.1 PAIR / AI summary strip (`LeadScoresAiSummaryStrip`)

- Driven by `getAiSummaryStripInsightForLead(lead)` (`lib/lead-ai-summary-strip-data.ts`).
- For **configurator preview lead** (`id === CONFIGURATOR_V1_PREVIEW_LEAD_ID`), copy comes from **`CONFIGURATOR_V1_PREVIEW_AI_INSIGHT`** in `lib/configurator-v1-preview-content.ts` (summary body, next steps, last updated label).

### 7.2 Lead status history (`LeadStatusHistoryCard`)

- Title includes **“Lead status history”** and count when embedded in grid.
- Preview lead uses **`CONFIGURATOR_V1_PREVIEW_STATUS_HISTORY`** (entries with `statusLabel`, `tone`, `modifiedLabel`, `modifiedBy`).

### 7.3 Remarks (Notes widget in catalog)

| UI string | Condition |
|-----------|-----------|
| **Remarks (N)** | `N = sortedRemarks.length`. |
| Sort **Recent first** / **Recent last** | `<select>`; sr-only **“Sort remarks”**. |
| **Filter chips** | **Call feedback form**, **Comment**, **Change Stage** — `aria-pressed` toggles. |
| **Add a note** | `sr-only` label; textarea **placeholder:** `Add a note…` |
| **Send note** | `aria-label="Send note"`; `title="Send note (Ctrl+Enter)"` |
| **No remarks yet.** | `remarks.length === 0` (no seed + no local). |
| **No remarks match these filters.** | Filters exclude all. |

**Local notes:** Appends with author fallback: `assignedDisplayName` → `assignedTitle` → `assigned` → **“You”**; `source: "Comment"`.

### 7.4 All tasks (Open tasks in catalog)

| UI string | Condition |
|-----------|-----------|
| **All tasks (N)** | Header; `N = tasks.length`. |
| **No tasks yet.** | `tasks.length === 0`. |
| Columns | **Task type**, due label, **status** (table row). |

**Preview tasks:** `CONFIGURATOR_V1_PREVIEW_TASKS` — mix of **Pending**, **Overdue**, **Completed**.

### 7.5 Remarks seed data (configurator preview)

**`CONFIGURATOR_V1_PREVIEW_REMARKS`** — six items (authors, text, `timeLabel`, `source`). Used when lead id is **`cfg-org-admin-v1`**.

---

## 8. V1 Widget & layout configurator

**Route:** `/developer/widgets-config`  
**Page title (H1):** **Widget & layout**  
**Layout:** On `lg+`, two columns: **sticky** widget catalog (max height `calc(100vh - 5.5rem)`, scrollable) + **lead detail preview** section.

### 8.1 Widgets card — static copy

- **Heading:** **Widgets** (uppercase styling).
- **Body:** *“Open a widget to configure it. Others stay locked until their panel ships.”*

### 8.2 Widget catalog rows

Each row: **title**, optional **lock** or **Configure** + chevron.

| Catalog `id` | Title | Description (tooltip + `sr-only` on locked rows) | Configurator |
|--------------|-------|-----------------------------------------------------|--------------|
| `pair` | PAIR Score | Perception, Ability, Intent, and Readiness score cards on the Activity tab. | Locked |
| `ai-summary` | AI Summary | AI-generated summary strip with expandable rationale. | Locked |
| `open-tasks` | All Tasks | All tasks with due dates and status (pending, overdue, completed) in the Activity column. | Locked |
| `notes` | Notes | Remarks and filters (Call feedback, comments, stage changes). | Locked |
| `lead-details` | Lead Details | Main lead detail tabs: Activity, Journey, Overview, stage change, etc. | **leadRail** — `LeadRailFieldConfiguratorPanel` |
| `lead-status-history` | Lead status history | Timeline of stage changes in the Activity grid. | Locked |

**Locked row aria:** `{title}, locked`.

**Expanded row:** `aria-expanded`, `aria-controls` → region **“Left rail field configuration”** (`LeadRailFieldConfiguratorPanel`).

### 8.3 Preview panel

- **Lead:** `createConfiguratorV1PreviewLead()` — see §9.
- **Props:** `builderCanvas`, `showPreviewBadge={false}`, `leftRailFieldIds={orderedVisibleIds}`, patch/stage callbacks update preview state only.
- **Chrome:** Preview container heights use `vh`-based min heights (`~52vh`–`68vh` caps) + `max-h` on large screens so it fits under developer chrome.

---

## 9. Preview default sample data (V1)

**Lead factory:** `lib/configurator-v1-preview-lead.ts`  
**Stable id:** `CONFIGURATOR_V1_PREVIEW_LEAD_ID` = **`cfg-org-admin-v1`**

| Field | Sample value |
|-------|----------------|
| `name` | John Doe |
| `temp` | Warm |
| `leadId` | L-PREVIEW-0001 |
| `stage` | Booked |
| `source` | Website |
| `subSource` | Contact form |
| `project` | Sample Heights |
| `lud` | 16.04.2026 |
| `assigned` / initials / title / display | JS / JS / Sales Manager / Jane Smith |
| `drawerFundingSource` | Self funded |
| `createDate` | ISO `2026-02-12T13:46:37.441Z` |
| `whatsapp` | +1 555 010 0199 |
| `altNumber` | +1 555 010 0200 |
| `email` | john.doe@example.com |
| `preferredUnit` | Tower A — 12th floor |
| `budgetRange` | USD 450k – 520k |
| `purpose` | Primary residence |
| `otherPrefs` | Prefers east-facing units |
| `occupation` | Software engineer |
| `company` | Acme Corporation |
| `state` / `city` / `region` | California / San Francisco / Bay Area |
| `designation` | Director |
| Various `-` fields | `maxBudget`, `propertyStatus`, `qualification`, `funding`, `gender` as **"-"** |

**Branching:** `lib/lead-activity-data.ts`, `lead-status-history-data.ts`, `lead-ai-summary-strip-data.ts`, `lead-journey-sample-data.ts` (and related) serve **`CONFIGURATOR_V1_PREVIEW_*`** fixtures when the lead id matches — avoids coupling preview to unrelated production sample rows.

**Journey preview:** `CONFIGURATOR_V1_PREVIEW_JOURNEY` — multi-day events (notes, booking block, call feedback, comment, AI summary bullets / next steps).

---

## 10. Left rail field configurator — UX & copy

**Component:** `components/developer/LeadRailFieldConfiguratorPanel.tsx`  
**Storage key (V1):** `sirrus.left-rail-fields.v1` (`LEFT_RAIL_FIELD_STORAGE_KEY`)  
**Change event:** `sirrus:left-rail-field-config-changed` (`LEFT_RAIL_FIELD_CONFIG_CHANGED_EVENT`)

### 10.1 States

| State | UI |
|-------|-----|
| **Hydrating** | Paragraph: **“Loading…”** |
| **Ready** | Search + list + actions |

### 10.2 Search

- **Placeholder:** `Search fields…`
- **Aria:** **“Search left rail fields by name or id”**
- **Clear** button: aria **“Clear field search”** (visible when query non-empty).
- **No matches:** list item **“No fields match your search.”**
- **While search active:** helper *“Drag reorder is off while search is active. Clear search to reorder.”* — drag handles **disabled** (`cursor-not-allowed`, `aria-disabled`, `draggable={false}`).

### 10.3 Row actions

- **Grip** `aria-label`: **“Reorder {label}”**
- **Eye / eye-off** `title`: **“Hide from left rail”** / **“Show in left rail”**; `aria-label`: **“Hide {label}”** / **“Show {label}”**
- Hidden rows use muted typography.

### 10.4 Footer actions

| Button | Behavior |
|--------|----------|
| **Save layout** | Writes `{ orderedIds, hiddenIds }` to `localStorage`, dispatches change event, normalizes empty save to default internally if `orderedIds` length 0. |
| **Show all fields** | Clears `hiddenIds` in UI (does not auto-save unless user clicks Save). |
| **Reset** | Restores default config + **persists** immediately. |

### 10.5 Footnote

- *`localStorage` in this browser.* (shown as small print with `<code>` styling.)

### 10.6 Persistence schema

**Type:** `LeftRailFieldPersistedConfig`

- `orderedIds`: full permutation of known ids (invalid/unknown ids stripped; dedupe; if empty after normalize → default order).
- `hiddenIds`: subset of `orderedIds` marked hidden.

**Migration:** If legacy JSON had only `orderedVisibleIds`, load migrates to `orderedIds` + `hiddenIds`.

**Safety:** If parsed config would yield **zero visible** fields but `orderedIds` non-empty → treat as corrupt / unsafe → **default config**.

---

## 11. Edge cases & acceptance checklist

| # | Scenario | Expected |
|---|----------|----------|
| 1 | All fields hidden in **preview** (`summaryFieldIds` = []) | Summary section **empty** (no fallback — reflects admin choice in preview only). |
| 2 | All fields hidden in **storage** + manage-leads | **Fallback** to full default order so rail never blank. |
| 3 | Corrupt / non-JSON `localStorage` | **Default** config. |
| 4 | Unknown field ids in JSON | **Stripped** on load. |
| 5 | Duplicate ids in JSON | **Deduped** preserving first occurrence. |
| 6 | Save with `orderedIds` empty | **Replaced** with defaults before save (implementation). |
| 7 | Search active | Reorder **off**; messaging visible. |
| 8 | Another tab updates `localStorage` same key | `storage` event + custom event → `useLeftRailFieldConfig` **refresh**. |
| 9 | **md** breakpoint | Left rail **hidden** in preview/drawer; mobile bar shows name/id. |
| 10 | Very tall left rail | Column **scrolls independently** (not only page scroll). |
| 11 | Developer shell | Main content column uses **`min-h-0 flex-1`** so nested `h-full` / scrollports resolve (regression test after layout changes). |
| 12 | Stage change in preview | Updates preview lead state only (sample). |
| 13 | `onPatchLead` on overview / editable fields | Merges into preview or list state depending on surface. |

---

## 12. Future scope (out of current V1 delivery)

### 12.1 Widgets V2 & canvas

- **Route:** `/developer/widgets-config-v2` (referenced from `/developer/lead-detail`).
- **Behavior:** Per-tab **widget canvas**, draggable blocks, **`LEFT_RAIL_FIELD_STORAGE_KEY_V2`** + `sirrus:left-rail-field-config-changed-v2`.
- **`LeadDetailPagePreview`** supports `syncV2Configurator` — when current tab has placed widgets, **fixed left rail can hide** to avoid duplicating “lead details” placed on canvas (`hideFixedLeftRail`).
- **PRD follow-ups:** widget palette taxonomy, undo/redo, publish pipeline, role permissions, version history, conflict resolution between V1 rail and V2 canvas.

### 12.2 Server-side layout

- Persist `orderedIds` / `hiddenIds` (and future canvas JSON) per **org / role / user**.
- Audit log when admins change customer-facing layouts.

### 12.3 Additional configurators (catalog locked today)

- **PAIR Score**, **AI Summary**, **All Tasks**, **Notes**, **Lead status history** — unlock configurators (thresholds, which columns, remark templates, etc.) when product defines scope.

### 12.4 Product completion

- Replace **AI Insights** / **Quotations** placeholders with real modules.
- Journey / overview parity with backend events.

### 12.5 Accessibility & i18n

- Full WCAG pass on configurator drag-drop + keyboard reorder.
- Externalize strings for translation.

---

## 13. Engineering reference (file map)

| Area | Key files |
|------|-----------|
| Manage leads | `ManageLeadsView.tsx`, `app/developer/manage-leads/page.tsx` |
| Lead detail drawer | `LeadDetailDrawer.tsx` |
| Lead detail preview | `LeadDetailPagePreview.tsx` |
| Left rail | `LeadDetailLeftRail.tsx`, `LeftRailSummaryFields.tsx`, `EditableLeadSummaryField.tsx` |
| Activity hub | `LeadActivityHub.tsx`, `LeadStatusHistoryCard.tsx`, `LeadScoresAiSummaryStrip.tsx` |
| V1 page | `WidgetLayoutAdminPage.tsx` |
| Field panel | `LeadRailFieldConfiguratorPanel.tsx` |
| Registry / persistence | `left-rail-field-registry.ts`, `left-rail-field-config.ts`, `useLeftRailFieldConfig.ts` |
| Preview lead + fixtures | `configurator-v1-preview-lead.ts`, `configurator-v1-preview-content.ts`, `lead-activity-data.ts`, … |
| Developer layout (scroll) | `app/developer/layout.tsx` |
| Tabs copy | `lead-detail-tabs.ts` |
| Track 2 lead detail page | `app/developer/lead-detail/page.tsx` |

---

## 14. Open questions for product

1. Should **“all hidden”** be allowed in production manage-leads, or always enforce **minimum visible set**?
2. Who may access **`/developer/*`** routes in production (feature flag, role, environment)?
3. When V2 goes live, does V1 storage migrate or remain a **fallback**?
4. Legal/compliance: retention of **local** admin changes vs server audit.

---

*End of PRD.*
