---
stage: 05-b-roll-recording
status: draft
source_workflow: /05-b-roll-recording
upstream_inputs:
  - 04-script/README.md (status: draft)
---

# ep02 B 轨录屏素材清单

按 04 脚本 SSOT 的各镜头 `scene_template`/`track` 标注提取。本期只有 **第 6 段（SSR 落地踩坑）** 走 A/B 轨，需要真实 IDE 录屏；其余段全是 A 轨概念/数据动画（Remotion 模板场景全自动），无录屏需求。

> ⚠️ 04 脚本本次按新 `tutorial.final.md` 六章结构重排为 9 段 36 镜：在「选型」后插入 **§4 Remotion 怎么工作**、在「数字人」后插入 **§8 场景适配**，原 SSR 段顺延为 **§6**。下表镜头号已对齐新编号。

## 录屏任务清单

| # | 录屏 id | 对应镜头 | 录屏内容 | zoom_crop | 预估时长 | A 轨兜底 | 状态 |
|---|---------|---------|---------|-----------|---------|---------|------|
| 1 | `b-ssr-crash` | 6.1 | IDE/终端：组件顶层 `window.innerWidth` 渲染时 `ReferenceError: window is not defined` 红屏 | `crop: terminal_only` | ~14s | `@TerminalScene`（6.1 合成终端） | ⏸ 未录制 → 用 A 轨兜底 |
| 2 | `b-ssr-fix` | 6.2 | IDE：加 `typeof window !== 'undefined'` 守卫 + 写 `.cursor/rules/remotion-ssr.mdc`，重渲通过 | `crop: editor_only` | ~12s | `@TerminalScene`（6.2 合成终端） | ⏸ 未录制 → 用 A 轨兜底 |

## 说明

- 这两处需**真人录屏**（TAD-01：真实操作不可由 AI 伪造），属工作流设计的「挂起等待」项。
- 录屏缺失时，07 组装按 05 工作流约定**自动降级到 A 轨兜底**（`fallback_a_track`）：6.1 / 6.2 用合成 `@TerminalScene`（`type: code_scene`，无需真录屏）呈现报错与修复代码。本期 07 成片即走该兜底路径，画面完整、可独立成片。
- 待用户真人补录后，把 `b-ssr-crash.mp4` / `b-ssr-fix.mp4` 放入 `assets/`，在 07 `ep02-shots.json` 把对应 shot 的 `type` 换成视频 cut（`source` 指向素材）即可，无需改其它段。

## 素材路径

```
content-library/ep02-video-render/05-b-roll/
├── README.md        # 本清单
└── assets/          # 真人录屏落盘处（当前空 → A 轨兜底）
```
