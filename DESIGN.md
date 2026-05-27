## Overview

ClickHouse's marketing surface is the highest-contrast interface in the database / data-platform category. The base atmosphere is **near-pure black canvas** (`{colors.canvas}` — #0a0a0a) with **deep olive** (`{colors.primary}` — #7C7E2C) as the singular brand voltage. The olive handles every primary CTA, every stat-callout number, every "GET STARTED" badge — used scarcely on individual elements but generously on full-bleed olive CTA cards. White typography in confident weight-700 sans-serif anchors the editorial body.

The olive + white pairing is what makes ClickHouse instantly recognizable. Where Snowflake uses cool blue gradients and Databricks uses red + slate, ClickHouse leans hard into one deep olive that does all the brand work. Code blocks, terminal output, and product UI fragments embed directly in dark `{colors.surface-card}` (#1a1a1a) cards across every page.

Type voice runs **Inter** at confident weights — 700 for display headlines (with negative letter-spacing -1 to -2.5px), 600 for sub-titles and buttons, 400 for body. The system has no display-serif counter-voice; everything is one geometric humanist sans, scaled and weighted for hierarchy.

**Key Characteristics:**
- Near-pure black canvas (`{colors.canvas}` — #0a0a0a) with white type. The system has no light-mode marketing surface.
- Deep olive primary (`{colors.primary}` — #7C7E2C). Used on primary CTAs, large stat-callout numbers ("2.8k+", "74k+"), and full-bleed olive CTA bands.
- Inter at weight 700 for display, weight 600 for sub-titles + buttons, weight 400 for body. No serif counterpoint.
- Dark surface cards (`{colors.surface-card}` — #1a1a1a) for feature cards, code windows, and product mockups. Cards barely lighter than canvas — color-block contrast is subtle.
- Code blocks render in JetBrains Mono inside `{colors.surface-card}`. SQL syntax-highlighted in muted blues / olives / grays.
- Stat numbers in olive + sans-700 + huge size carry the credibility moment ("779+", "2.8k+", "47k+" community / contributor / star counts).
- Border radius is hierarchical: `{rounded.md}` (8px) for buttons, `{rounded.lg}` (12px) for content cards. No pill except in tag badges.
- Section rhythm `{spacing.section}` (96px) between major editorial bands.

## Colors

### Brand & Accent
- **Primary (Deep Olive)** (`{colors.primary}` — #7C7E2C): The signature brand color. All primary CTA backgrounds, large stat-callout numbers, full-bleed olive CTA cards. The olive is the brand.
- **Primary Active** (`{colors.primary-active}` — #686A24): Press / hover-darker variant.
- **Primary Disabled** (`{colors.primary-disabled}` — #2f3014): Desaturated dark-olive on dark canvas.

### Surface
- **Canvas** (`{colors.canvas}` — #0a0a0a): The default page floor. Near-pure black.
- **Surface Soft** (`{colors.surface-soft}` — #121212): Section dividers, very-soft band tints.
- **Surface Card** (`{colors.surface-card}` — #1a1a1a): Feature cards, code windows, product mockups, pricing tier cards.
- **Surface Elevated** (`{colors.surface-elevated}` — #242424): Nested cards inside larger dark cards.
- **Surface Olive Band** (`{colors.surface-olive-band}` — #7C7E2C): The olive CTA card / band fill — same hex as primary.
- **Hairline** (`{colors.hairline}` — #2a2a2a): 1px borders on cards.
- **Hairline Strong** (`{colors.hairline-strong}` — #3a3a3a): Heavier divider on input underlines and emphasis.

### Text
- **Ink / On Dark** (`{colors.on-dark}` — #ffffff): All headline and primary text.
- **Body** (`{colors.body}` — #cccccc): Default running-text color.
- **Body Strong** (`{colors.body-strong}` — #e6e6e6): Emphasized paragraphs.
- **Muted** (`{colors.muted}` — #888888): Footer links, captions, breadcrumbs.
- **Muted Soft** (`{colors.muted-soft}` — #5a5a5a): Tertiary text — fine print.
- **On Primary / On Olive** (`{colors.on-primary}` / `{colors.on-olive}` — #ffffff): White text on olive CTAs and olive CTA bands. The high-contrast olive + white combo is the brand action signal.

### Semantic / Accent
- **Accent Emerald** (`{colors.accent-emerald}` — #22c55e): Success states, "active" status indicators in product UI.
- **Accent Rose** (`{colors.accent-rose}` — #ef4444): Error states, "down" indicators.
- **Accent Blue** (`{colors.accent-blue}` — #3b82f6): Info states, code-syntax highlighting.

## Typography

### Font Family
The system runs **Inter** for everything — display, body, navigation, buttons, captions. **JetBrains Mono** handles code blocks. The fallback stack walks `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.

The single-family approach is deliberate: Inter at weight 700 + 600 + 400 covers the entire hierarchy without needing a serif or display counter-voice. The geometric humanist character of Inter at confident bold weight gives ClickHouse a precise, engineered feel that matches the database's performance-first positioning.

### Hierarchy

| Token                            | Size | Weight | Line Height | Letter Spacing | Use                                            |
| -------------------------------- | ---- | ------ | ----------- | -------------- | ---------------------------------------------- |
| `{typography.display-xl}`        | 72px | 700    | 1.05        | -2.5px         | Homepage h1 ("The leading database for AI")    |
| `{typography.display-lg}`        | 56px | 700    | 1.1         | -2px           | Section heads                                  |
| `{typography.display-md}`        | 40px | 700    | 1.15        | -1.5px         | Sub-section heads, CTA-band heads              |
| `{typography.display-sm}`        | 32px | 700    | 1.2         | -1px           | Card titles, pricing tier prices               |
| `{typography.title-lg}`          | 24px | 700    | 1.3         | -0.3px         | Pricing plan names, larger feature titles      |
| `{typography.title-md}`          | 18px | 600    | 1.4         | 0              | Card titles, intro paragraphs                  |
| `{typography.title-sm}`          | 16px | 600    | 1.4         | 0              | Small card titles, list labels                 |
| `{typography.stat-display}`      | 56px | 700    | 1.0         | -1.5px         | Stat callouts ("779+", "47k+") — ALWAYS olive |
| `{typography.body-md}`           | 16px | 400    | 1.55        | 0              | Default running-text                           |
| `{typography.body-sm}`           | 14px | 400    | 1.55        | 0              | Footer body, fine-print                        |
| `{typography.caption}`           | 13px | 500    | 1.4         | 0              | Badge labels, captions                         |
| `{typography.caption-uppercase}` | 12px | 600    | 1.4         | 1.5px          | Section labels, "NEW" badges                   |
| `{typography.code}`              | 14px | 400    | 1.55        | 0              | Code blocks — JetBrains Mono                   |
| `{typography.button}`            | 14px | 600    | 1.0         | 0              | Standard button labels                         |
| `{typography.nav-link}`          | 14px | 500    | 1.4         | 0              | Top-nav menu items                             |

### Principles
Display weights stay at 700 across all sizes. Negative letter-spacing (-1 to -2.5px) is essential — Inter at weight 700 without negative tracking reads as too wide / Apple-marketing. The tightened tracking gives ClickHouse the precise, engineered feel.

Body and labels stay at weights 400 / 500 / 600. The hierarchy is built on size + weight, not on family contrast.

### Note on Font Substitutes
Inter is open-source and the documented choice. **Söhne** is a close commercial alternative if licensed. **Geist** is another modern alternative.

## Layout

### Spacing System
- **Base unit:** 4px.
- **Tokens:** `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.xxl}` 48px · `{spacing.section}` 96px.
- **Section padding:** `{spacing.section}` (96px) between major bands.
- **Card internal padding:** `{spacing.xl}` (32px) for feature cards, pricing tiers; `{spacing.lg}` (24px) for code-window cards and event cards.

### Grid & Container
- **Max content width:** ~1280px centered.
- **Editorial body:** Single 12-column grid; hero often uses 7/5 split (h1 left, code mockup right).
- **Feature card grids:** 3-up at desktop, 2-up at tablet, 1-up at mobile.
- **Pricing grid:** 3-4 up at desktop, 1-up at mobile.

### Whitespace Philosophy
ClickHouse uses dense, slightly-compressed whitespace appropriate for a developer-tooling brand — generous enough to read editorially, tight enough to feel "engineering-grade" rather than "marketing-soft." Section rhythm at 96px is standard; card internal padding stays at 32px for feature cards.

## Elevation & Depth

| Level         | Treatment                                      | Use                                       |
| ------------- | ---------------------------------------------- | ----------------------------------------- |
| Flat          | No shadow, no border                           | Body sections, top nav, hero              |
| Soft hairline | 1px `{colors.hairline}` border                 | Code-window cards, content cards          |
| Surface card  | `{colors.surface-card}` background — no shadow | Feature cards, pricing tiers, event cards |
| Olive band   | `{colors.primary}` background — no shadow      | Full-bleed olive CTA cards / bands       |

The system uses no drop shadows. Depth comes from the contrast between black canvas and `{colors.surface-card}` (a barely-lighter-than-canvas tone) — the contrast is subtle, more like an "engineering-grade dim panel" than an "elevated card."

### Decorative Depth
- Code-window cards carry their own internal product chrome — line numbers, syntax highlighting, status bars at the bottom — adding visual density without external shadows.
- The olive-on-black contrast does most of the elevation work for CTAs.

## Shapes

### Border Radius Scale

| Token            | Value        | Use                                             |
| ---------------- | ------------ | ----------------------------------------------- |
| `{rounded.xs}`   | 4px          | Reserved for badge accents                      |
| `{rounded.sm}`   | 6px          | Small inline buttons                            |
| `{rounded.md}`   | 8px          | Standard CTA buttons, text inputs               |
| `{rounded.lg}`   | 12px         | Content cards, code-window cards, pricing tiers |
| `{rounded.pill}` | 9999px       | Badge pills                                     |
| `{rounded.full}` | 9999px / 50% | Avatars, icon buttons                           |

## Components

### Top Navigation

**`top-nav`** — Black nav bar pinned to top. 64px tall, `{colors.canvas}` background. Carries the ClickHouse logo + wordmark at left, primary horizontal menu (Product, Use Cases, Pricing, Resources, Customers) center-left, right-side cluster with "Sign in" + "Get Started" `{component.button-primary}` (olive). Menu items in `{typography.nav-link}` (Inter 14px / 500).

### Buttons

**`button-primary`** — The signature olive CTA. Background `{colors.primary}` (#7C7E2C), text `{colors.on-primary}` (white), type `{typography.button}` (Inter 14px / 600), padding 12px × 20px, height 40px, rounded `{rounded.md}` (8px). The olive + white combination is iconic.

**`button-secondary`** — Dark surface card button. Background `{colors.surface-card}`, text `{colors.on-dark}`, same shape as primary.

**`button-text-link`** — Inline text button, no background. Used for "Sign in" and inline link CTAs.

**`text-link`** — Inline body links in `{colors.primary}` (olive on dark). Underlined.

**`button-icon-circular`** — 36 × 36 circular icon button on dark.

### Cards & Containers

**`hero-band`** — Black-canvas hero with 7-5 grid: h1 + sub-headline + button row on the left, code-window or product mockup on the right. Vertical padding `{spacing.section}` (96px).

**`hero-stat-card`** — Olive stat-display numbers ("779+", "47k+") inline on the canvas. No card surface — just olive text in `{typography.stat-display}` (56px / 700).

**`feature-card-olive`** — Full-bleed olive card ("Built for every modern data challenge"). Background `{colors.primary}`, text `{colors.on-olive}` (white), rounded `{rounded.lg}` (12px), padding `{spacing.xl}` (32px). The olive card IS the visual emphasis.

**`feature-card-dark`** — Standard dark feature card. Background `{colors.surface-card}`, text `{colors.on-dark}`, rounded `{rounded.lg}`, padding `{spacing.xl}` (32px).

**`code-window-card`** — Dark card showing a SQL code block. Background `{colors.surface-card}`, code in JetBrains Mono with syntax highlighting, rounded `{rounded.lg}`, padding `{spacing.lg}` (24px). Often the hero's right-side artifact on developer-focused pages.

**`product-mockup-card`** — Card showing actual ClickHouse product UI (query editor, dashboard, monitoring panel). Same shape as `{component.feature-card-dark}` but with embedded product chrome inside.

**`pricing-tier-card`** — Standard tier card. Background `{colors.surface-card}`, rounded `{rounded.lg}`, padding `{spacing.xl}` (32px).

**`pricing-tier-card-featured`** — The featured tier flips to `{colors.primary}` (olive). The olive surface IS the featured signal.

**`stat-callout`** — Inline olive stat numbers ("779+", "2.8k+", "47k+"). Transparent background, text `{colors.primary}`, type `{typography.stat-display}`. Used as a flat layout block, not a card with surface.

**`events-card`** — Used on /company/events. Dark card with event title, date in `{typography.caption-uppercase}`, location, and a "Register" CTA. Rounded `{rounded.lg}`, padding `{spacing.lg}`.

**`customer-logo-strip`** — Horizontal monochrome customer-logo strip. Background `{colors.canvas}`, logos in `{colors.muted}`, vertical padding `{spacing.xl}` (32px).

### Inputs & Forms

**`text-input`** — Dark text input. Background `{colors.surface-card}`, text `{colors.on-dark}`, rounded `{rounded.md}` (8px), padding 10px × 14px, height 40px.

**`text-input-focused`** — Border thickens to `{colors.primary}` (olive) for emphasis.

### Tags / Badges

**`badge-pill`** — Small dark pill label. Background `{colors.surface-card}`, text `{colors.on-dark}`, type `{typography.caption}`, rounded `{rounded.pill}`.

**`badge-olive`** — Olive pill for "NEW", "GET STARTED" emphasis. Background `{colors.primary}`, text `{colors.on-primary}`, type `{typography.caption-uppercase}`, rounded `{rounded.pill}`.

### Tab / Filter

**`category-tab`** + **`category-tab-active`** — Dark tab navigation. Inactive: transparent + muted text. Active: surface-card background + on-dark text. Padding 8px × 14px, rounded `{rounded.md}`.

### CTA / Footer

**`cta-band-olive`** — A pre-footer "Deploy your way" CTA band. Full olive fill, white type, rounded `{rounded.lg}`, padding 64px. Carries an h2 in `{typography.display-md}` and a CTA — usually a dark-button on the olive surface.

**`footer`** — Black footer that closes every page. Background `{colors.canvas}`, text `{colors.muted}`. 4-column link list at desktop covering Product / Use Cases / Resources / Company. Vertical padding 64px. The ClickHouse wordmark sits at the top in `{colors.on-dark}`.

## Do's and Don'ts

### Do
- Anchor every page on the black canvas. The olive + white pairing is the brand voltage.
- Reserve `{colors.primary}` (olive) for primary CTAs, stat-callout numbers, and full-bleed olive CTA bands. The olive's scarcity at the element level + abundance at the band level is what makes it powerful.
- Use Inter at weight 700 for every display headline, with -1 to -2.5px letter-spacing.
- Show actual SQL code blocks inside `{component.code-window-card}` — ClickHouse is a database; show the query, don't paint marketing illustrations of queries.
- Use `{component.stat-callout}` numbers to establish credibility (community size, contributors, performance benchmarks). The olive stat numbers are signature.
- Anchor every band with `{spacing.section}` (96px) vertical rhythm.

### Don't
- Don't introduce a second brand color. ClickHouse is monochromatic + olive.
- Don't bold display weight beyond 700 or use weight 500 for headlines. The hierarchy depends on size, not on weight gradation.
- Don't use olive for body text or large surface fills outside of intentional olive cards.
- Don't use rounded buttons / pills outside of small badges. The standard button radius is 8px (md).
- Don't repeat the same surface mode in two consecutive bands. Black canvas → dark feature card → olive CTA card → black canvas → code-window card.
- Don't replace SQL code mockups with abstract illustrations. The code IS the marketing voltage.
- Don't add hover state styling beyond what the system already encodes.

## Responsive Behavior

### Breakpoints

| Name    | Width       | Key Changes                                                  |
| ------- | ----------- | ------------------------------------------------------------ |
| Mobile  | < 768px     | Hamburger nav; hero h1 72→36px; code-window-card stacks below; feature grids 1-up; pricing 1-up |
| Tablet  | 768–1024px  | Top nav tightens; feature cards 2-up; pricing 2-up           |
| Desktop | 1024–1440px | Full top-nav; 3-up feature cards; 3-4 up pricing tiers       |
| Wide    | > 1440px    | Same as desktop with more breathing room; max content 1280px |

### Touch Targets
- `{component.button-primary}` at minimum 40 × 40px.
- `{component.button-icon-circular}` at exactly 36 × 36 — slightly under WCAG 44, visually centered.
- `{component.text-input}` height is 40px.

### Collapsing Strategy
- Top nav collapses to hamburger at < 768px.
- Hero 7-5 grid → single-column on mobile.
- Feature card grids reduce columns rather than scaling.
- Code-window cards retain font-size; horizontal scroll inside the card on mobile.
- Pricing tier cards collapse 4 → 2 → 1; featured tier olive stays distinct.

### Image Behavior
- Code blocks inside dark mockups stay at fixed font-size; horizontal scroll on mobile rather than wrapping.
- Customer logos in monochrome strip retain native widths; row wraps on mobile.

## Iteration Guide

1. Focus on ONE component at a time. Reference its YAML key (`{component.code-window-card}`, `{component.pricing-tier-card-featured}`).
2. Variants of an existing component (`-active`, `-disabled`, `-focused`) live as separate entries.
3. Use `{token.refs}` everywhere — never inline hex.
4. Never document hover. Default and Active/Pressed states only.
5. Display headlines stay Inter 700 with negative letter-spacing. Body stays Inter 400.
6. The olive + white pairing is the brand contract. Don't soften with secondary accents.
7. When in doubt about emphasis: bigger Inter 700 before adding color.

## Known Gaps

- The exact olive hex (#7C7E2C) was sampled from the screenshot; ClickHouse may publish an official brand color slightly differently.
- Inter weight axis values beyond 400 / 500 / 600 / 700 are not formalized — only the static weights observed are documented.
- Animation and transition timings (code typewriter effects, stat counter animations) are not in scope.
- Form validation states beyond `{component.text-input-focused}` are not extracted.
- The actual ClickHouse Cloud product surface (query console, monitoring dashboards, table browser) shares some tokens with the marketing site but adds many product-specific components that are out of scope.
- The customer logo strip's exact opacity / treatment varies — the muted gray is approximate.
