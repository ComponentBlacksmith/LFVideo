---
stage: 06-tts-synthesis
status: draft
source_workflow: /06-tts-synthesis
---

# ep02 TTS 语音合成记录

逐段提取 04 脚本 `[口播]` 文本，按**段 (section)** 切分为 7 个合成片段（与 SSOT 段一一对应）。每段时长取自 04 SSOT 各镜头 `duration_seconds` 之和（即分镜稿的目标时长）；真音合成后用实测时长回填，并按 `voice_slice` 把段时长分配到镜头上对齐画面。

## 配置

- 语言：zh-CN
- 引擎：**待定（pending）** —— 当前环境无云 TTS API Key、也未安装本地 Piper 中文声学模型，故本阶段先产出**时长清单 + 分段文本**驱动 07 时间轴；narration 音频留待补齐。
- 采样率（目标）：44.1kHz / 16bit WAV
- 命名规范：`voice-s<段号>.wav`（如 `voice-s1.wav`）

## 素材清单（时长来自 04 SSOT 镜头时长）

| 段 | segment_id | 轨 | 镜头数 | 时长 | 口播摘要 | 音频 |
|----|-----------|----|-------|------|---------|------|
| S1 | S1 | A | 3 | 30s | 一句话点题 + 数据驱动认知 + 三步路线 | ⏸ pending |
| S2 | S2 | A | 4 | 50s | 把选型丢给 AI，摆出六条路线、同一内核 | ⏸ pending |
| S3 | S3 | A | 6 | 90s | 选型最易翻车：看清每条路的坑，对需求做减法 | ⏸ pending |
| S4 | S4 | A | 6 | 90s | 引擎怎么干活：配置→分发→现成组件，TS 兜底 | ⏸ pending |
| S5 | S5 | A/B | 3 | 35s | SSR 坑与守卫，把规矩固化成 MDC 规则 | ⏸ pending |
| S6 | S6 | A | 4 | 60s | 数字人选型：陪衬定位，选 3D 风格化 VRM | ⏸ pending |
| S7 | S7 | A | 2 | 20s | 三步收束 + 下期预告 | ⏸ pending |

**合计：375 秒（约 6 分 15 秒）**

## 产物

- `assets/manifest.json` —— 机器可读的分段时长清单（含每段 `voice`、每镜头 `duration_seconds` 与 `voice_slice`，`audio_status: pending_tts`）。07 组装当前用其中的时长驱动画面时间轴；补真音后把 `audio_file`/`provider`/实测 `duration_seconds` 回填即可。

## 待办（补真音）

提供以下任一即可让我合成真 narration：
- 豆包 `DOUBAO_SPEECH_API_KEY`（中文首选，`tools/audio/doubao_tts.py`）
- 或 `OPENAI_API_KEY` / `ELEVENLABS_API_KEY` / `GOOGLE_API_KEY`
- 或允许安装本地 Piper 中文模型（离线、零成本，`tools/audio/piper_tts.py`）
