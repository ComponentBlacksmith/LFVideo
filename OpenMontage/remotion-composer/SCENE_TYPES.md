# Remotion Composer — Scene & Overlay Cheat Sheet

Authoritative list of `cut.type` and `overlay.type` values the `Explainer` composition accepts. Each row maps to a dispatch case in `src/Explainer.tsx`.

When you add a new component, append it here and in `src/components/index.ts`.

---

## Cut types (`cut.type`)

| `type` | Component | Required fields | Common fields | Purpose |
|---|---|---|---|---|
| *(none — video)* | `OffthreadVideo` | `source` (path to mp4) | `source_in_seconds`, `animation` (zoom-in, ken-burns), `in_seconds`, `out_seconds` | Play an MP4 clip directly |
| *(none — image)* | `Img` | `source` (path to png/jpg) | `animation`, `in_seconds`, `out_seconds` | Play a still with Ken Burns |
| `text_card` | `TextCard` | `text` | `fontSize`, `backgroundVideo`, `backgroundOverlay`, `color` | Large-typography beat |
| `hero_title` | `HeroTitle` | `text` | `heroSubtitle`, `backgroundVideo`, `backgroundOverlay` | Title/end card |
| `stat_card` | `StatCard` | `stat` | `subtitle`, `accentColor`, `backgroundVideo` | A single big number |
| `callout` | `CalloutBox` | `text` | `callout_type` (info/warning/tip/quote), `title`, `backgroundVideo` | Boxed message with bullets |
| `comparison` | `ComparisonScene` | `leftLabel`, `leftValue`, `rightLabel`, `rightValue` | `title` | Side-by-side compare (legacy alias of `comparison_scene`) |
| `bar_chart` | `BarChart` | `chartData` | `chartAnimation`, `showValues`, `showGrid`, `backgroundVideo` | Animated bars |
| `line_chart` | `LineChart` | `chartSeries` | `chartAnimation`, `xLabel`, `yLabel`, `showMarkers` | Animated line |
| `pie_chart` | `PieChart` | `chartData` | `donut`, `centerLabel`, `centerValue`, `showLegend` | Pie / donut |
| `kpi_grid` | `KPIGrid` | `chartData` | `title`, `columns`, `chartAnimation` | 2–4 column KPI grid |
| `progress_bar` | `ProgressBar` | `progress` | `progressLabel`, `progressColor`, `progressSegments` | Animated progress |
| `anime_scene` | `AnimeScene` | `images` (list) | `particles`, `lightingFrom`, `lightingTo`, `vignette` | Still-image anime scene with particles + camera motion |
| **`terminal_scene`** | **`CodeScene`** | **`steps`** (list of cmd/out/pause/pill) | **`terminalTitle`, `prompt`** | **Synthetic terminal animation — NO real capture needed (legacy alias of `code_scene`). See [`.agents/skills/synthetic-screen-recording/SKILL.md`](../.agents/skills/synthetic-screen-recording/SKILL.md)** |
| **`screenshot_scene`** | **`ScreenshotScene`** | **`backgroundImage`** (path in `public/`), **`screenshotSteps`** (list of overlays) | **`screenshotSize` (natural px w/h), `cursorStartAt`, `accentColor`** | **Approach-1 synthetic UI — drop any screenshot, animate scripted overlays on top (cursor, click_pulse, type_into, bubble_append, typing_dots, highlight_box, callout_balloon). Viewer-indistinguishable from a real recording for 15–30s focused demos. Coordinates are normalized (0–1) against the contain-fit rect. See [`.agents/skills/synthetic-ui-recording/SKILL.md`](../.agents/skills/synthetic-ui-recording/SKILL.md) (planned).** |

---

<!-- BEGIN AUTO-GENERATED: template-scenes -->

## Template-library scenes (`custom-templates`)

Auto-generated from `src/custom-templates/scene-types.json` by `scripts/gen_scene_types_md.py` — **do not edit by hand**. These scenes render fully transparent over the single independent `Background` layer and read colors/fonts from `useTheme()`.

| `type` | Template | Required fields | Optional fields | Purpose |
|---|---|---|---|---|
| `intro_scene` | `@IntroScene` | `title` | `subtitle` | 全屏开场标题（渐变描边主标题 + 可选副标题）。 |
| `outro_scene` | `@OutroScene` | `headline` | `cta` | 全屏收尾（大标题 + 脉冲 CTA 按钮）。 |
| `concept_scene` | `@ConceptScene` | `title`, `items` | `eyebrow`, `enter` | 纵向概念卡列表（图标 + 标签 + 标题 + 描述）。enter 为可选的元素入场过渡。 |
| `timeline_scene` | `@TimelineScene` | `title`, `events` | `eyebrow`, `enter` | 横向时间线卡片（年份 + 图标 + 标题 + 描述），带进度连线。enter 为可选的元素入场过渡。 |
| `table_scene` | `@TableScene` | `title`, `headers`, `rows` | `eyebrow`, `highlightCell`, `enter` | 通用表格：列由 headers 决定，每行是与之对齐的 cells[]。highlightCell 用 "行-列" 标注高亮。enter 为可选的行入场过渡。 |
| `comparison_scene` | `@SplitLayout` | `leftLabel`, `leftValue`, `rightLabel`, `rightValue` | `title`, `enter` | 左右对比双卡（基于 SplitLayout），value 走正文字号、自适应长句。enter 为可选的卡片入场过渡。 |
| `code_scene` | `@TerminalScene` | `steps` | `terminalTitle`, `prompt` | 合成终端 / 代码场景：主题驱动配色、等宽字体，step 协议 cmd/out/pause/pill。 |
| `section_scene` | `@SectionScene` | `title` | `index`, `eyebrow` | 章节分隔过渡卡：大号序号 + 章节标题，把长片切成清晰段落。 |
| `bullet_scene` | `@BulletScene` | `items` | `eyebrow`, `title`, `ordered`, `enter` | 轻量要点 / 步骤清单：逐行错峰入场，items 可为字符串或 {text, icon}；ordered=true 用序号。enter 为可选的行入场过渡。 |
| `flow_scene` | `@FlowScene` | `steps` | `eyebrow`, `title`, `orientation`, `enter` | 流程图 A→B→C：步骤卡（序号 + 图标 + 标题 + 描述）以箭头连接，支持横向/纵向。enter 为可选的卡片入场过渡。 |
| `chart_scene` | `@ChartScene` | `kind`, `data` | `title`, `donut`, `showValues` | 主题驱动图表：kind ∈ bar/line/pie/kpi，data 为对应图表的数据数组，复用 components/charts 并注入主题配色。 |
| `stat_scene` | `@StatScene` | `stat` | `subtitle`, `label` | 单个核心数字 / 硬指标：渐变大字弹入 + 可选小标签与副标题。 |
| `callout_scene` | `@CalloutScene` | `text` | `callout_type`, `title`, `items`, `enter` | 提示 / 避坑框：callout_type ∈ info/warning/tip/quote，左侧强调条 + 图标 + 可选标题与要点列表。enter 为可选的入场过渡。 |
| `quote_scene` | `@QuoteScene` | `text` | `attribution` | 全屏金句 / 大字报：引号装饰 + 大字陈述 + 可选署名，用于中段强调一句观点。 |

<!-- END AUTO-GENERATED: template-scenes -->

---

## Overlay types (`overlay.type`)

| `type` | Component | Required fields | Common fields | Purpose |
|---|---|---|---|---|
| `section_title` | `SectionTitle` | `text` | `accentColor`, `position` (top-left, etc.) | Tiny section label |
| `stat_reveal` | `StatReveal` | `text` | `subtitle`, `accentColor`, `position` | Corner stat badge |
| `hero_title` | `HeroTitle` (as overlay) | `text` | `subtitle` | Full-frame title overlay |
| **`provider_chip`** | **`ProviderChip`** | **`providers`** (list of strings) | **`cycleSeconds`, `position`, `accentColor`, `label`** | **Rotating badge that cycles through provider names — used in AI-generated-motion scenes to show which model produced the clip** |

---

## Digital host (VRM avatar) — per-scene framing

The VRM host is rendered **once** in a canonical full-body framing; each scene
shows it via a 2D crop + placement **preset**. You normally do **nothing** —
picking a `cut.type` auto-selects a sensible preset (table → corner head, intro →
full body on the side, etc.). Override only when needed.

### Presets (`avatar` value)

| preset | look | placement | use for |
|---|---|---|---|
| `hidden` | — | — | scenes that must use the whole frame |
| `corner-bust` | small head+shoulders | bottom-right corner | dense full-screen info (tables, charts, terminals) |
| `corner-bust-left` | small head+shoulders | bottom-left corner | same, when content sits on the right |
| `bust-right` | half/¾ body | right side | talking-head explanation, content on the left |
| `bust-left` | half/¾ body | left side | explanation, content on the right |
| `full-right` | full body | right side | intros/outros/empty-side beats |
| `full-left` | full body | left side | title cards with right-side space |
| `presenter` | large ¾ body | bottom-center | host-only beats with no centered title |
| `corner-circle-tr` | head in a **circular** badge (amber ring) | top-right corner | dense info, when a framed "webcam bubble" look is wanted |
| `corner-rounded-tr` | head+shoulders in a **rounded-rect** badge (amber ring) | top-right corner | same, slightly larger card-style frame |

`corner-circle-tr` / `corner-rounded-tr` are clipped **badge** frames (border + soft
fill + shadow); the crop is cover-fit and centered. They're opt-in (not in the
built-in mapping) — set them via `cut.avatar` or `avatar.byType`.

### Default `cut.type → preset` mapping (built-in)

`intro_scene`/`outro_scene`/`hero_title`/`text_card`/`stat_card` → full body to a side ·
`concept_scene`/`timeline_scene`/`callout` → `bust-right` ·
`table_scene`/`terminal_scene`/`screenshot_scene`/`comparison`/`*_chart`/`kpi_grid`/`progress_bar` → `corner-bust`.

Source of truth: `src/components/avatarPresets.ts` (`AVATAR_PRESETS`, `AVATAR_BY_TYPE`).

### How to override

Resolution order (high → low): `cut.avatar` → `avatar.byType[cut.type]` → built-in `AVATAR_BY_TYPE` → `avatar.default` → `bust-right`.

```jsonc
// top-level props
"avatar": {
  "enabled": true,
  "default": "bust-right",          // fallback when nothing else matches
  "byType": { "table_scene": "corner-bust-left" }  // per-episode overrides
}

// per cut: a preset name…
{ "type": "table_scene", "avatar": "corner-bust-left" }
// …or an inline tweak of a preset
{ "type": "concept_scene", "avatar": { "preset": "bust-right", "screenWidth": 0.28 } }
```

The host eases between framings over ~9 frames at each scene boundary, so just set
the right preset per scene and transitions are automatic.

---

## Adding a new scene type

1. Create the React component in `src/components/MyScene.tsx`. Use `interpolate(frame, [inFrame, outFrame], [from, to])` and `spring(...)` for motion. Read `useCurrentFrame()` and `useVideoConfig()`.
2. Export it in `src/components/index.ts`.
3. Add the `type` to the `Cut` interface in `src/Explainer.tsx` (and any new prop fields).
4. Add a dispatch case in `SceneRenderer`:
   ```tsx
   if (cut.type === "my_scene" && cut.mySceneData) {
     return maybeWrapWithBg(<MyScene ... />);
   }
   ```
5. Document it in this file. That's what makes it discoverable to the next agent.

## Existing synthetic-UI components

Currently only `TerminalScene` exists. The pattern generalizes — likely candidates to add next, if a pipeline needs them:

- `ChatTranscript` — Claude/Cursor/GPT chat-bubble timeline with typing animation
- `EditorScene` — VS Code-style code editor with syntax highlight + cursor motion
- `PrReview` — GitHub PR diff view with inline-comment reveals
- `SlackThread` — Slack thread with avatars + reaction pops
- `TicketBoard` — Jira / Linear card moving across columns

Pattern: follow `TerminalScene.tsx` — a `steps` list of timeline primitives, cursor-advancing durations, spring-based reveals, optional non-blocking pills/badges.
