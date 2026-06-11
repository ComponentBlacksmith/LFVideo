---
stage: 06-tts-synthesis
status: approved
source_workflow: /06-tts-synthesis
upstream_inputs:
  - 04-script/README.md (status: draft)
  - shared/docs/remotion-spec.md
engine: piper-tts
model: zh_CN-huayan-medium
---

# ep02 TTS 语音合成（Piper TTS 本地跑通）

## 引擎选型

|| 维度 | 值 |
|------|---|
| **当前引擎** | Piper TTS（本地、免费、零 API 依赖） |
| **模型** | `zh_CN-huayan-medium`（63MB ONNX，中文女声，VITS 架构） |
| **采样率** | 22050 Hz / 16bit 单声道 |
| **后续升级** | 豆包/OpenAI TTS（需 API Key，中文情感更自然、支持逐字时间戳） |

### Piper TTS 优势（跑通阶段）

- **零成本**：无需 API Key，完全本地推理
- **速度快**：16 段口播合成总耗时约 13 秒（CPU）
- **可复现**：同一模型同一文本每次输出一致
- **格式兼容**：直接输出 WAV，可无缝对接 07 组装阶段

### 已知局限

- 中文自然度不如商业 TTS（豆包/Azure/OpenAI）
- 英文术语发音偏差（Remotion、SSR 等）无 SSML 精调能力
- 无逐字时间戳输出（后续 08 字幕阶段需额外 Whisper 对齐）

---

## 合成结果

| 段落 ID | 对应场景 | 字数 | 时长 | 文件 |
|---------|---------|------|------|------|
| S1_intro | 第一段·开头钩子 | 158 | 25.59s | `S1_intro.wav` |
| S2a_paradigm | 第二段A·范式与痛点 | 258 | 42.97s | `S2a_paradigm.wav` |
| S2b_frame_as_state | 第二段B·帧即状态 | 120 | 20.96s | `S2b_frame_as_state.wav` |
| S2c_six_routes | 第二段C·六条路线 | 314 | 44.33s | `S2c_six_routes.wav` |
| S3a_judgment_matrix | 第三段A·判断层矩阵 | 381 | 60.38s | `S3a_judgment_matrix.wav` |
| S3b_remotion_reasons | 第三段B·选型四理由 | 288 | 41.62s | `S3b_remotion_reasons.wav` |
| S3c_comparison | 第三段C·Remotion vs HyperFrames | 164 | 21.04s | `S3c_comparison.wav` |
| S3d_tradeoffs | 第三段D·选型代价 | 171 | 27.85s | `S3d_tradeoffs.wav` |
| S4a_pipeline | 第四段A·七阶段流水线 | 172 | 30.59s | `S4a_pipeline.wav` |
| S4b_three_piece | 第四段B·三件套 | 170 | 24.31s | `S4b_three_piece.wav` |
| S4c_orchestrator | 第四段C·编排器伪代码 | 199 | 24.14s | `S4c_orchestrator.wav` |
| S4d_ab_track | 第四段D·A/B轨机制 | 300 | 41.20s | `S4d_ab_track.wav` |
| S5a_data_driven | 第五段A·数据驱动 vs 手写 | 246 | 33.45s | `S5a_data_driven.wav` |
| S5b_ssr_guard | 第五段B·SSR守卫 | 336 | 43.05s | `S5b_ssr_guard.wav` |
| S5c_ai_render | 第五段C·AI出片 | 278 | 39.59s | `S5c_ai_render.wav` |
| S6_cta | 第六段·结尾CTA | 209 | 32.75s | `S6_cta.wav` |
| **合计** | **16 段** | **3764 字** | **553.82s（9分14秒）** | |

---

## 运行方式

```bash
# 前置
pip install piper-tts  # 包含 onnxruntime + espeak-ng

# 合成（自动下载模型到 models/ 目录）
cd content-library/ep02-video-render/06-tts
python synthesize.py
```

产出在 `assets/` 目录，含 16 个 WAV 文件 + `manifest.json`。

---

## 术语发音说明（Piper 无 SSML，记录备忘）

以下术语在 Piper TTS 中文模型下发音存在偏差，**升级到豆包/OpenAI 时需加 SSML 修正**：

| 术语 | Piper 实际表现 | 升级时 SSML 方案 |
|------|--------------|----------------|
| Remotion | 可辨识但音调偏 | `<phoneme ph="rɪˈmoʊʃən">` |
| SSR | 连读偏快 | `<say-as interpret-as="characters">` |
| Cursor | 基本正确 | - |
| MDC | 连读 | `<say-as interpret-as="characters">` |
| React | 基本正确 | - |
| ComparisonCard | 拆词不稳定 | 读作"Comparison Card" |
| npx remotion render | 整体偏快 | 按词拆读 |
| typeof window | 基本正确 | - |

---

## 落盘目录结构

```
content-library/ep02-video-render/06-tts/
├── README.md           # 本文件（执行记录）
├── synthesize.py       # 合成脚本（可复现）
├── models/
│   ├── zh_CN-huayan-medium.onnx       # Piper 中文模型（63MB）
│   └── zh_CN-huayan-medium.onnx.json  # 模型配置
└── assets/
    ├── manifest.json   # 合成清单（segment_id / duration / file_size）
    ├── S1_intro.wav
    ├── S2a_paradigm.wav
    ├── S2b_frame_as_state.wav
    ├── S2c_six_routes.wav
    ├── S3a_judgment_matrix.wav
    ├── S3b_remotion_reasons.wav
    ├── S3c_comparison.wav
    ├── S3d_tradeoffs.wav
    ├── S4a_pipeline.wav
    ├── S4b_three_piece.wav
    ├── S4c_orchestrator.wav
    ├── S4d_ab_track.wav
    ├── S5a_data_driven.wav
    ├── S5b_ssr_guard.wav
    ├── S5c_ai_render.wav
    └── S6_cta.wav
```

---

## 下一步

1. **试听审核**：人工试听各段 WAV，确认口播节奏和英文术语可接受度
2. **引擎升级**（可选）：若 Piper 质量不满足要求，切换豆包 TTS（需 `DOUBAO_SPEECH_API_KEY`）
3. **推进 07 组装**：将 `assets/*.wav` 作为口播音轨输入 07 视频组装阶段
4. **Whisper 对齐**（08 字幕阶段）：对 WAV 文件做 Whisper 时间戳提取，生成逐字字幕

```json
{
  "stage": "06-tts-synthesis",
  "platform": "bilibili",
  "engine": "piper-tts",
  "model": "zh_CN-huayan-medium",
  "sample_rate_hz": 22050,
  "total_segments": 16,
  "total_duration_seconds": 553.82,
  "total_text_chars": 3764,
  "synthesis_config": {
    "length_scale": 1.0,
    "noise_scale": 0.667,
    "noise_w_scale": 0.8
  },
  "quality_notes": [
    "本地引擎零成本跑通，验证流程可行性",
    "中文自然度可接受但不如商业TTS",
    "英文术语发音偏差待升级引擎后SSML修正",
    "无逐字时间戳，后续字幕需Whisper补充"
  ],
  "upgrade_path": "doubao_tts / openai_tts（需API Key）"
}
```
