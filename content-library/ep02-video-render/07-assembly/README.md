---
stage: 07-video-assembly
status: draft
source_workflow: /07-video-assembly
---

# ep02 视频组装记录（镜头级 SSOT → Remotion 成片）

端到端验证新的 shot 镜头层：04 SSOT 的 28 个镜头**一镜一 cut** 映射到 Remotion `Explainer` 合成，渲染出成片。画面随镜头 ~每 8–18s 换一次，彻底消除「一大段口播绑死单一画面」。

## 引擎与映射

- 引擎：`OpenMontage/remotion-composer`（Remotion 4，`Explainer` 按 `cut.type` 分发场景组件）。
- 生成器：`OpenMontage/build_ep02_shots_props.py` —— 读取 04 SSOT，结构（镜头顺序 / 每镜时长 / 覆盖的口播）全部来自 SSOT，仅每镜的画面可渲染细节（标题/卡片/表格行/终端代码/对比项）在生成器的 `SHOT_CONTENT` 里补全（即 07 视频工程师的工作）。
- 产物 props：`OpenMontage/remotion-composer/public/demo-props/ep02-shots.json`（28 个 cut，375s = 11250 帧 @30fps）。
- 合成注册：`src/Root.tsx` 新增 `<Composition id="ep02-shots">`。

### scene_template → Explainer cut.type

引擎无 `@SplitLayout` cut，左右分屏/对比镜头落到 `comparison`（`@ComparisonCard`）：

| 04 `scene_template` | Explainer `cut.type` | 组件 |
|---|---|---|
| `@IntroScene` | `intro_scene` | IntroScene |
| `@ConceptScene` | `concept_scene` | ConceptScene |
| `@TableScene` | `table_scene` | TableScene |
| `@TerminalScene` | `terminal_scene` | TerminalScene（合成终端，无需真录屏）|
| `@SplitLayout` | `comparison` | ComparisonCard |
| `@OutroScene` | `outro_scene` | OutroScene |

cut 数按类型：`intro_scene×3, concept_scene×10, table_scene×5, comparison×4, terminal_scene×4, outro_scene×2` = **28**，等于 SSOT 全部镜头数（`pipeline_lint.py` 的组装一致性即用此数校验）。

## 镜头编排表（cut = shot）

| cut | 段 | type | 起→止 (s) | 时长 |
|-----|----|------|----------|------|
| shot-1.1 | S1 | intro_scene | 0–10 | 10 |
| shot-1.2 | S1 | intro_scene | 10–22 | 12 |
| shot-1.3 | S1 | intro_scene | 22–30 | 8 |
| shot-2.1 | S2 | concept_scene | 30–43 | 13 |
| shot-2.2 | S2 | concept_scene | 43–57 | 14 |
| shot-2.3 | S2 | concept_scene | 57–72 | 15 |
| shot-2.4 | S2 | concept_scene | 72–80 | 8 |
| shot-3.1 | S3 | table_scene | 80–95 | 15 |
| shot-3.2 | S3 | table_scene | 95–113 | 18 |
| shot-3.3 | S3 | table_scene | 113–128 | 15 |
| shot-3.4 | S3 | comparison | 128–146 | 18 |
| shot-3.5 | S3 | comparison | 146–162 | 16 |
| shot-3.6 | S3 | comparison | 162–170 | 8 |
| shot-4.1 | S4 | concept_scene | 170–184 | 14 |
| shot-4.2 | S4 | concept_scene | 184–200 | 16 |
| shot-4.3 | S4 | terminal_scene | 200–215 | 15 |
| shot-4.4 | S4 | terminal_scene | 215–230 | 15 |
| shot-4.5 | S4 | comparison | 230–248 | 18 |
| shot-4.6 | S4 | concept_scene | 248–260 | 12 |
| shot-5.1 | S5 | terminal_scene (B 轨兜底) | 260–274 | 14 |
| shot-5.2 | S5 | terminal_scene (B 轨兜底) | 274–286 | 12 |
| shot-5.3 | S5 | concept_scene | 286–295 | 9 |
| shot-6.1 | S6 | concept_scene | 295–310 | 15 |
| shot-6.2 | S6 | table_scene | 310–327 | 17 |
| shot-6.3 | S6 | table_scene | 327–342 | 15 |
| shot-6.4 | S6 | concept_scene | 342–355 | 13 |
| shot-7.1 | S7 | outro_scene | 355–367 | 12 |
| shot-7.2 | S7 | outro_scene | 367–375 | 8 |

关键验证：第 3、4 段（各 90s）旧版只能挂一个 `scene_template`，现在各拆成 6 个镜头跨多个组件接力（S3：表格×3 → 对比×3；S4：概念×2 → 终端×2 → 对比 → 概念），画面不再有 >18s 的静止。

## 复现

```bash
# 1) 由 04 SSOT 生成 Remotion props（一镜一 cut）
python OpenMontage/build_ep02_shots_props.py

# 2) 渲染成片（半分辨率快速校验：~960x540）
cd OpenMontage/remotion-composer
npx remotion render src/index.tsx ep02-shots out/ep02-shots.mp4 --concurrency=8 --scale=0.5

# 全高清 1920x1080：去掉 --scale
# 本地预览：npx remotion studio  → 打开 ep02-shots 合成
```

## 产物

- 成片：`OpenMontage/remotion-composer/out/ep02-shots.mp4`（视觉轨；narration 待 06 补真音后用 `--props` 注入 `audio` 块）。
- 当前为视觉验证版：未叠 narration（06 待补真音）、未叠数字人 VRM（A 轨可全自动，先验证画面快切）。

## 待办

- 06 补真音后：时间轴改由 06 实测时长驱动（替换 `build_ep02_shots_props.py` 里的时长源），并注入 narration 音频。
- 05 真人补录 `b-ssr-crash`/`b-ssr-fix` 后：把 5.1/5.2 两镜从 `terminal_scene` 兜底换成视频 cut。
- 叠数字人：生成器去掉无 avatar 限制即可（引擎已支持按场景自动选 VRM 取景预设）。
