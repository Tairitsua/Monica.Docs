# Monica Public Homepage — UI Design

> Created: 2026-07-13
> Last Updated: 2026-07-13

## Design Thinking

| Dimension | Decision |
|-----------|----------|
| **Purpose** | Give senior .NET developers, architects, and technical leads enough clarity and proof to understand Monica in one visit, decide whether it fits their system, and start from a credible reference application. |
| **Aesthetic Direction** | Technical editorial: the calm authority of a well-designed architecture journal crossed with the immediacy of a live operations console. Warm paper, exposed rules, terse annotations, asymmetric composition, and precise runtime data replace the generic glossy AI landing-page aesthetic. |
| **Typography** | Bricolage Grotesque for high-character display headlines, IBM Plex Sans for readable product copy, and IBM Plex Mono for code, labels, module names, and telemetry. The three voices distinguish ideas, explanation, and evidence. |
| **Color Palette** | Warm paper (`#F2EEE5`) and carbon ink (`#161713`) dominate. Monica violet (`#6841E8`) marks architecture and interaction; runtime green (`#B8F36B`) marks healthy execution. Clay (`#D86145`) is reserved for Labs and warnings. Colors are applied as flat editorial fields, rules, and small signals—not a purple gradient. |
| **Signature Detail** | A living “architecture trace” transforms a plain-language instruction into a ProjectUnit, its module graph, and a completed runtime trace. Visitors can replay it or switch scenarios, making Monica’s architecture-to-observability promise tangible above the fold. |
| **Constraints** | Static browser-runnable prototype; responsive from 360 px upward; keyboard-operable controls; meaningful focus states; motion limited to choreography and state changes; `prefers-reduced-motion` support; English-first with a Chinese preview; no production implementation in this design folder. |

## Overview

The homepage positions Monica as **agent-governed application architecture for observable .NET backends**. It does not sell a bag of utilities. It sells a coherent operating model: architecture that is explicit enough for agents to follow, modular enough for teams to evolve, and observable enough for humans to inspect.

The primary visitor journey is:

1. Understand the promise in the hero.
2. Watch the architecture trace prove that promise.
3. Scan the three product pillars: Structure, Compose, Inspect.
4. See real builder-scoped setup code and a five-minute starter path.
5. Decide where Monica fits relative to raw ASP.NET Core and heavier platforms.
6. Inspect real runtime surfaces, package maturity, and adoption paths.
7. Continue to the reference app, architecture guide, module catalog, or GitHub.

## Content Strategy

### Positioning

- **Category:** agent-governed application architecture for observable .NET backends
- **Hero:** Architecture agents can follow. Systems humans can inspect.
- **Supporting claim:** Monica gives .NET teams explicit application structure, composable infrastructure modules, and runtime evidence without hiding ASP.NET Core.
- **Proof, not hype:** builder code, ProjectUnit vocabulary, module dependency graph, trace timing, package maturity tiers, and a realistic reference application all appear on the page.

### Voice

- Direct and technically literate.
- Short declarative headlines; explanatory copy earns its space.
- No “revolutionary,” “magical,” or vague AI superlatives.
- Architecture terms are always paired with evidence or a concrete outcome.
- English is canonical. The language switch provides a credible Chinese preview while code, API names, and telemetry remain language-neutral.

## Modules

| Module | Description | Key Components |
|--------|-------------|----------------|
| Global header | Keeps brand, launch status, primary information architecture, language control, and GitHub action available without dominating. | Monica monogram, wordmark, RC badge, nav links, EN/中文 toggle, GitHub button, mobile drawer. |
| Hero | States the category and value proposition, then immediately offers a build path and an architectural reading path. | Editorial eyebrow, headline, concise description, primary/secondary CTAs, trust strip, architecture-trace stage. |
| Living proof | Demonstrates that Monica’s architecture remains visible at runtime rather than disappearing after registration. | Runtime “evidence board,” request timeline, ProjectUnit panel, module health, trace metadata. |
| Three pillars | Explains the product model in the minimum useful vocabulary. | Structure / Compose / Inspect cards, numbered editorial markers, concrete outcomes. |
| Five-minute starter | Makes adoption feel small and inspectable while showing the approved builder-scoped direction. | Step rail, CLI command, C# setup snippet, copy action, “open full quick start” link. |
| Where Monica fits | Helps serious buyers self-select and prevents category ambiguity. | Three-column spectrum: raw ASP.NET Core / Monica / heavyweight platform; concise trade-offs; highlighted middle position. |
| Runtime surfaces | Shows product UI as operational evidence, not decorative screenshots. | Interactive tabs for Module Graph, ProjectUnits, and Scheduler; realistic mock panels and telemetry. |
| Adoption paths | Offers a next step for greenfield teams, existing ASP.NET Core systems, and architecture evaluators. | Three path cards with effort and outcome labels. |
| Package tiers | Makes maturity explicit and keeps experimental AI work from weakening core trust. | Stable / Integrations / Labs filters, package cards, maturity labels, compact module metadata. |
| Trust and community | Closes with verifiable release signals and contribution paths. | .NET 10, MIT, zero-warning policy, bilingual docs, reference app, GitHub and roadmap actions. |
| Footer | Carries the architecture statement into a compact, utilitarian close. | Wordmark, repo/docs/community links, language note, version stamp. |

## Visual Hierarchy

1. The headline is the largest element and occupies the calm paper field.
2. The dark architecture-trace panel overlaps the lower hero edge, becoming the first high-density evidence surface.
3. Violet is used for architectural selection and action; green appears only when execution becomes observable or healthy.
4. Thin ink rules, numbered section folios, and marginal notes create editorial rhythm across long scrolling content.
5. Dense console-like panels are balanced by large paper margins and concise copy, avoiding dashboard fatigue.

## Signature Architecture Trace

The hero’s trace has four semantic stages:

```text
Instruction → ProjectUnit → Module graph → Runtime evidence
```

Default scenario:

```text
“Fulfil order #1842”
    → OrderFulfilment
    → UnitOfWork + Repository + EventBus + JobScheduler + OpenTelemetry
    → completed · 184 ms · 7 spans · 0 errors
```

Visitors can select **Fulfil order**, **Reconcile inventory**, or **Notify customer**. “Replay trace” resets the active scenario and moves a green pulse through each stage. The interaction changes realistic labels and timing, rather than replaying purely decorative animation.

## Interactions

### Global navigation

- Desktop navigation anchors to Product, Proof, Start, Modules, and Roadmap.
- The header gains a compact paper shadow after scrolling to preserve orientation.
- Mobile uses an accessible menu button. Selecting a destination closes the drawer.

### Language preview

- The EN/中文 control toggles page metadata, navigation labels, hero copy, section headings, major explanatory copy, and CTAs.
- Code identifiers, package names, and telemetry remain unchanged.
- The browser language attribute changes between `en` and `zh-CN`.
- The choice is stored in `localStorage` for repeat visits.

### Architecture trace

- Scenario chips update the instruction, ProjectUnit, module list, trace ID, latency, and supporting runtime text.
- Replay animates stage activation in a meaningful execution order.
- Keyboard activation works through native buttons.
- With reduced motion, all stages update immediately with no timed pulse.

### Five-minute starter

- Tabs switch between the CLI and builder-scoped C# setup.
- Copy writes the active snippet to the clipboard and confirms success with a short live-region status.
- The C# sample deliberately communicates the future public API direction, not the current ambient static registration API.

### Runtime surfaces

- Tabs switch between Module Graph, ProjectUnits, and Scheduler views.
- The selected tab updates both the panel and a concise evidence caption.
- The graph nodes subtly respond on hover/focus; no fake draggable behavior is implied.

### Package tiers

- Stable, Integrations, and Labs controls filter the catalog.
- A maturity summary and visible card count update with the selected tier.
- Labs use clay accents and explicit “preview” language, keeping them visually distinct from the stable kernel.

## Motion and Animation

| Moment | Behavior | Purpose |
|--------|----------|---------|
| Page entry | Eyebrow, headline lines, copy, CTAs, and trace panel reveal in a restrained 80 ms stagger. | Establish editorial rhythm and direct the eye from promise to proof. |
| Architecture trace | A green signal moves through instruction, ProjectUnit, graph, and runtime states; connectors fill violet-to-green. | Visualize causality rather than add ambient motion. |
| Scroll entry | Major sections rise 18 px and resolve from 0 to 1 opacity once. | Keep the long page paced without distraction. |
| Link/card hover | Rules extend, arrow marks translate 4 px, and selected architectural cards receive a small violet offset shadow. | Make flat editorial surfaces feel tactile. |
| Runtime tabs | Existing panel fades down while the next panel rises 8 px. | Preserve spatial continuity when evidence changes. |
| Mobile drawer | Paper panel slides from the right while the backdrop fades. | Give navigation a clear layer transition. |

`prefers-reduced-motion: reduce` removes staged transforms, smooth scrolling, trace timing, and looping signal effects. State changes remain immediate and legible.

## Responsive Behavior

| Breakpoint | Layout Change |
|------------|---------------|
| Desktop (`lg+`, 1024 px+) | 12-column asymmetric hero; copy occupies five columns and the trace occupies seven. Runtime panels and comparison layouts use wide grids. Marginal notes and section folios sit outside main content columns. Full navigation is visible. |
| Tablet (`md`, 768–1023 px) | Hero stacks with trace below the copy while retaining overlap. Three-column sections become two-plus-one grids. Comparison rows retain labels but reduce descriptive copy. Header keeps compact navigation until 880 px. |
| Mobile (`sm`, below 768 px) | Single-column reading order. Display type clamps down; architecture trace becomes a vertical execution rail; code scrolls horizontally; tabs become horizontally scrollable; module cards stack; sticky CTAs are avoided. Header uses a drawer. Minimum touch target is 44 px. |

## Accessibility

- Semantic landmarks: header, nav, main, sections, complementary annotations, and footer.
- Skip-to-content link appears on keyboard focus.
- Visible focus rings use ink plus paper separation and do not rely on color alone.
- Text and UI contrast target WCAG AA; green is never used as body text on paper.
- Status changes for copy actions and trace replay are announced with `aria-live`.
- Tab groups use `role="tablist"`, `role="tab"`, and `role="tabpanel"` with managed selection.
- Decorative grids, noise, and trace pulses are ignored by assistive technology.
- Language changes update the document `lang` attribute.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Primary visual metaphor | Architecture journal + operations evidence board | Monica needs architectural seriousness and runtime credibility; this pairing makes both visible. |
| Brand evolution | Custom angular M built from flat violet and ink planes | Preserves the recognizable M/purple association without relying on an unavailable raster logo or an AI-style orb. |
| Hero proof | Interactive trace instead of a generic product screenshot | It communicates the central differentiator in one causal story. |
| Main background | Warm paper with subtle registration grid and grain | Makes long-form technical reading approachable while retaining engineered precision. |
| Dark surfaces | Carbon, not blue-black glass | Separates runtime evidence from editorial explanation and avoids generic SaaS styling. |
| Corner language | Mostly square or slightly clipped, with small radii only for controls | Supports the technical-editorial character; avoids a field of interchangeable rounded cards. |
| Section density | Alternate calm explanation with dense evidence panels | Lets expert visitors scan quickly without turning the entire page into a dashboard. |
| Package maturity | Visible tiers on homepage | Honest maturity boundaries build more trust than presenting every package as equally production-ready. |
| Chinese experience | Real toggle of launch-critical copy | Shows bilingual intent without creating a separate mock page or pretending every technical artifact is translated. |
| No hero metrics | No fabricated downloads, stars, or customer logos | The project is pre-promotion; architectural and executable proof are more credible than vanity claims. |

## Prototype File Map

```text
.ui-design/monica-home/
├── design.md     # Product narrative, visual system, interaction and responsive rules
├── index.html    # Semantic page structure and realistic Monica content
├── styles.css    # Visual system, layout, responsive rules, and motion
└── app.js        # Language, navigation, trace, tabs, copy, filtering, and reveal behavior
```

The prototype uses Tailwind’s browser CDN for utility support but keeps the distinctive visual language in readable custom CSS. It has no build step and can be opened through any static file server.

## Production Handoff Notes

- Treat the prototype as a visual and content contract, not an implementation prescription.
- Preserve the architecture trace as the homepage’s signature component.
- Replace prototype links with canonical site routes and replace mocked telemetry with curated, stable reference-app snapshots.
- Keep API-backed or demo data behind the Next.js server boundary; the public docs API should not be called directly from every client component.
- Self-host production fonts and optimize glyph subsets before launch.
- Validate the final production implementation at 360, 768, 1024, and 1440 px, with keyboard-only navigation and reduced-motion emulation.
