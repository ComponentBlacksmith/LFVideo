# AI Instructions — RemotionMG Theme Render Kit

## Quick Start

```bash
npm install
npx remotion render src/index.ts SceneTheme out.mp4 --props=@theme.json
```

The above command renders the configured theme into `out.mp4` (1920x1080, 30fps).

## What's in this package

| File | Purpose |
|------|---------|
| `theme.json` | Theme configuration (single source of truth) |
| `package.json` | Dependencies (Remotion, React, Zod) |
| `src/` | Remotion source code for rendering |
| `AI_INSTRUCTIONS.md` | This file |
| `README.md` | Human-readable summary |

## Environment

- **Node.js 18+** required
- `npm install` downloads ~200MB of dependencies (Remotion + Chromium)
- Rendering takes 10-60 seconds depending on duration

## Configuration (theme.json)

Theme: **故障赛博** (Glitch)
Active scenes: 主标题 (Hero) → 列表 (List) → 角标 (Lower-third) → 字幕 (Caption) → 强调 (Emphasis)
Timing: in=20f, hold=40f, out=16f (30fps)

### How to modify

1. **Change text content** — Edit `content` in theme.json:
   - `content.hero.entries[]` — Each entry: `{text, sub?}`
   - `content.list.items[]` — Each item: `{text}`, optional `title`
   - `content.lowerThird.entries[]` — Each entry: `{name, role}`
   - `content.caption.lines[]` — Each line: `{text}`
   - `content.emphasis.lines[]` — Each line: `{pre, token, post}`

2. **Switch theme** — Change `"theme"` to: glitch, soft, bouncy, minimal, elegant

3. **Override timing** — Add `"timing": {"inF": 20, "holdF": 40, "outF": 16}`

4. **Override colors** — Add `"style": {"background": "#...", "color": "#...", "accent": "#..."}`

5. **Override effects per scene** — Add `"effects": {"hero": {"inEffectId": 72, "outEffectId": 95}}`

6. **Override layout per scene** — Add `"sceneStyle"`:
   ```json
   "sceneStyle": {
     "hero":    {"offsetX": 0, "offsetY": -100, "fontSize": 160, "align": "left", "vAlign": "bottom"},
     "caption": {"offsetX": 50, "offsetY": 30, "fontSize": 48, "align": "right"},
     "lowerThird": {"offsetX": 20, "offsetY": -10, "fontSize": 72},
     "list":    {"fontSize": 56},
     "emphasis": {"fontSize": 100, "align": "left"}
   }
   ```
   Supported per scene: hero(offsetX/Y,fontSize,align,vAlign), caption(offsetX/Y,fontSize,align), lowerThird(offsetX/Y,fontSize), list(fontSize), emphasis(fontSize,align)

## Effect Library (effectId 1-100)

| Range | Category | Description |
|-------|----------|-------------|
| 1-10 | A: Opacity | Fade curves (linear, quadratic, exponential, etc.) |
| 11-20 | B: Motion | Slide, bounce, elastic, gravity, magnetic snap |
| 21-30 | C: Scale/3D | Spring pop, rotate-zoom, perspective, 3D flip |
| 31-38 | D: Blur | Focus, ink bleed, glow bloom, chromatic aberration |
| 39-50 | E: Wave | Sine wave, pendulum, Lissajous, polar spiral |
| 51-62 | F: Per-char | Typewriter, stagger, domino, word pop |
| 63-70 | G: Mask | Wipe, iris, diagonal reveal, scanline |
| 71-80 | H: Noise | Jitter, scramble/decode, sand reform, Brownian |
| 81-88 | I: Particle | Assemble, shatter, shockwave, voxel stack |
| 89-94 | J: Color | Hue-rotate, gradient sweep, neon sequential |
| 95-97 | K: Glitch | RGB tear, datamosh, square-wave strobe |
| 98-100 | L: Fractal | Fractal unfold, attractor settle, logistic bifurcation |

## Remotion Studio (interactive preview)

```bash
npm run dev
```
Opens browser at localhost:3000 with the SceneTheme composition. Edit props interactively.

## Advanced: Render specific format

```bash
# MP4 (default)
npx remotion render src/index.ts SceneTheme out.mp4 --props=@theme.json

# GIF
npx remotion render src/index.ts SceneTheme out.gif --props=@theme.json

# PNG sequence
npx remotion render src/index.ts SceneTheme frames/ --image-format=png --props=@theme.json
```
