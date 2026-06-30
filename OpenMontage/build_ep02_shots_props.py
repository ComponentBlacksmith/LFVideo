#!/usr/bin/env python3
"""Build ep02 Remotion ``Explainer`` props from the **shot-level** 04 SSOT.

This is the 07-video-assembly mapping for the refactored ep02 04-script: the
SSOT now decomposes each section into ``shots[]`` (see
shared/schemas/04-script.schema.json), and stage 07 maps **one shot -> one
Explainer cut**. Structure (shot order, per-shot duration, the section voice a
shot covers) comes straight from the SSOT JSON contract; only the on-screen
renderable detail of each shot (the motion-engineer's authoring) lives here in
``SHOT_CONTENT``.

Scene-template -> Explainer ``cut.type`` mapping. Every type is a first-class
template-library scene (see remotion-composer/src/custom-templates/registry.ts):

    @IntroScene    -> intro_scene     @ConceptScene  -> concept_scene
    @TableScene    -> table_scene     @TerminalScene -> code_scene
    @OutroScene    -> outro_scene     @SplitLayout   -> comparison_scene
    @FlowScene     -> flow_scene      @BulletScene   -> bullet_scene
    @QuoteScene    -> quote_scene     @CalloutScene  -> callout_scene

Cut timing is driven by each shot's ``duration_seconds`` (06-tts narration is
not yet produced for this cut; once it is, swap in real segment durations from
``06-tts/assets/manifest.json``).

Usage:
    python build_ep02_shots_props.py        # writes public/demo-props/ep02-shots.json
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parent.parent
SCRIPT_MD = REPO_ROOT / "content-library" / "ep02-video-render" / "04-script" / "README.md"
TTS_MANIFEST = REPO_ROOT / "content-library" / "ep02-video-render" / "06-tts" / "assets" / "manifest.json"
COMPOSER_DIR = Path(__file__).resolve().parent / "remotion-composer"
PUBLIC_DIR = COMPOSER_DIR / "public"
OUTPUT_JSON = PUBLIC_DIR / "demo-props" / "ep02-shots.json"

# Unity room render as the bottom layer; the UI page is perspective-warped into
# the in-scene display. Drop the shot into public/UnityBG.png and this turns on
# automatically. The host + captions are flat overlays (not warped).
UNITY_BG_IMAGE = "UnityBG.png"
# Screen quad corners (1920x1080 px) the UI page is warped into. Exact edge of
# the in-scene display (no expansion — the real render has no chroma fringe).
UNITY_BG_QUAD = {
    "tl": [13, 142],
    "tr": [1194, 275],
    "br": [1194, 791],
    "bl": [13, 919],
}

FPS = 30
THEME = "flat-motion-graphics"

# Digital host as a full-frame background layer (Mixamo clip drives the body);
# the Remotion UI floats on top with transparent scene backgrounds. The clip
# plays at 0.6x and the host is parked on the right, vertically centred.
AVATAR = {
    "enabled": True,
    "layer": "background",
    "clip": "avatars/Sitting.fbx",
    "clipSpeed": 0.6,
    "bgModelX": 2.10,
    "bgModelY": -1.35,
    "bgCameraZ": 5.90,
    "bgModelYawDeg": 50,
    # 2D placement (CSS, pixel-exact): 1.43x size, nudged down 50px.
    "bgScale": 1.43,
    "bgOffsetYpx": 50,
}

TEMPLATE_TO_TYPE = {
    "@IntroScene": "intro_scene",
    "@ConceptScene": "concept_scene",
    "@TableScene": "table_scene",
    "@TerminalScene": "code_scene",
    "@OutroScene": "outro_scene",
    "@SplitLayout": "comparison_scene",
    "@FlowScene": "flow_scene",
    "@BulletScene": "bullet_scene",
    "@QuoteScene": "quote_scene",
    "@CalloutScene": "callout_scene",
}


def _term(code: str) -> list[dict[str, str]]:
    return [{"kind": "out", "text": line} for line in code.split("\n")]


# 04 table rows -> TableScene 的通用 cells[]：每行与 headers 一一对齐
# (方案 / 适用场景 / 已知坑)。高亮交给 cut.highlightCell（"行-列"）显式标注，
# 不再依赖上一期遗留的领域字段。
_ROUTE_ROWS = [
    ["Remotion", "前端栈、复杂排版、跨期复用", "顶层读 window 崩；BUSL 授权"],
    ["Motion Canvas", "代码演示、精确时序", "生态小、模板自建"],
    ["Manim", "数学/公式可视化", "排版弱、渲染慢"],
    ["MoviePy", "简单拼接、音轨闪避", "自适应排版繁琐、吃内存"],
    ["FFmpeg", "批量转码、字幕烧录", "命令晦涩难调试"],
]
_AVATAR_ROWS = [
    ["真人出镜", "最可信、有温度", "要露脸、不可编程复用、隐私成本"],
    ["写实/对口型数字人", "像真主播", "易掉恐怖谷、可信度反崩；口型重活"],
    ["3D 风格化 VRM", "风格统一、可编程、渲一次到处用", "要建模与动作绑定，可交给 AI"],
]

# Renderable on-screen content per shot id. Type-specific fields satisfy the
# Explainer SceneRenderer guards (intro:title, concept:title+items,
# table:title+headers+rows, terminal:steps, outro:headline, comparison:
# left/right Label/Value).
SHOT_CONTENT: dict[str, dict[str, Any]] = {
    "1.1": {"title": "用 Vibe Coding 搭一套自动出片的渲染引擎", "subtitle": "把视频写成代码，让 AI 按配置自动出片", "background": "holo"},
    "1.2": {"title": "AI 强在啃文本和代码 → 渲染就该数据驱动", "subtitle": "没前后端基础，全程用大白话指挥 AI", "background": "holo"},
    "1.3": {"title": "三步：找路径 · 选型 · 落地", "subtitle": "让 AI 找路 → 对约束选型 → 落地出片", "background": "holo"},

    "2.1": {"eyebrow": "找技术路径", "title": "把选择题丢给 AI：有哪些现成路子？", "background": "holo", "items": [
        {"label": "NOT", "title": "不埋头啃文档", "desc": "不自己从零调研，直接把选择题交给 AI", "icon": "🙅"},
        {"label": "ASK", "title": "一句话需求", "desc": "想把视频写成代码自动出片，有哪些现成路子？", "icon": "💬"},
    ]},
    "2.2": {"eyebrow": "六条路线", "title": "AI 一口气摆了六条", "background": "holo", "items": [
        {"label": "WEB", "title": "Remotion", "desc": "网页那套：React + CSS 渲染", "icon": "🌐"},
        {"label": "MATH", "title": "Manim", "desc": "画数学公式 / 几何", "icon": "📐"},
        {"label": "MORE", "title": "MoviePy · FFmpeg · Motion Canvas · PixiJS", "desc": "拼接转码 + 时序/粒子动画，补全六条", "icon": "➕"},
    ]},
    "2.3": {"eyebrow": "同一个内核", "title": "代码描述画面 → 编译成帧 → 合成视频", "background": "holo", "items": [
        {"label": "DESC", "title": "代码描述画面", "desc": "拿代码/数据把画面声明出来", "icon": "📄"},
        {"label": "COMPILE", "title": "编译成一帧帧", "desc": "渲染器算出每个时刻的画面", "icon": "⚙️"},
        {"label": "COMPOSE", "title": "合成视频", "desc": "帧序列合成成片", "icon": "🎬"},
    ]},
    "2.4": {"eyebrow": "本步小结", "title": "这一步只摆路，先不评好坏", "background": "holo", "items": [
        {"label": "LIST", "title": "只罗列", "desc": "先把候选方案摆全", "icon": "📋"},
        {"label": "LATER", "title": "不评判", "desc": "好坏留到下一步选型再说", "icon": "⏭️"},
    ]},

    "3.1": {"eyebrow": "判断层 = 边界，非中立百科", "title": "选型最容易翻车：看清每条路何时不好使", "background": "grid", "headers": ["方案", "适用场景", "已知坑"], "rows": _ROUTE_ROWS},
    "3.2": {"eyebrow": "适用场景 + 会咬人的坑", "title": "六条路全列出来（先看 Remotion）", "background": "grid", "headers": ["方案", "适用场景", "已知坑"], "rows": _ROUTE_ROWS, "highlightCell": "1-3"},
    "3.3": {"eyebrow": "其余几条的硬伤", "title": "Manim 慢 / MoviePy 繁琐 / FFmpeg 晦涩", "background": "grid", "headers": ["方案", "适用场景", "已知坑"], "rows": _ROUTE_ROWS, "highlightCell": "3-3"},
    "3.4": {"title": "对着需求做减法", "leftLabel": "我的三条需求", "leftValue": "批量换数据 · AI 改不易错 · 跨期好维护", "rightLabel": "✅ Remotion 命中", "rightValue": "三条全中，Remotion 赢"},
    "3.5": {"title": "Remotion ✅ vs 复制粘贴 HTML ❌", "leftLabel": "Remotion", "leftValue": "改一处全系列生效 · 只填数据 · 代价：React + BUSL 付费", "rightLabel": "复制粘贴 HTML", "rightValue": "每期复制越改越乱 · 结构易跑偏"},
    "3.6": {"title": "一句话", "leftLabel": "AI", "leftValue": "铺信息：把方案和坑摆全", "rightLabel": "你", "rightValue": "拍板：做减法、定取舍"},

    # S4（新）Remotion 怎么工作 + 为什么 AI 能驱动
    "4.1": {"eyebrow": "Remotion 怎么工作", "title": "用 React 写每帧 → 逐帧截图 → 合成视频", "orientation": "horizontal", "steps": [
        {"label": "WRITE", "desc": "用 React 组件描述这一帧画成什么样", "icon": "⚛️"},
        {"label": "SHOT", "desc": "无头浏览器从头到尾逐帧把组件截成图片", "icon": "📸"},
        {"label": "COMPOSE", "desc": "FFmpeg 把帧序列 + 音轨合成 MP4", "icon": "🎬"},
    ]},
    "4.2": {"terminalTitle": "帧为单位：useCurrentFrame + interpolate", "prompt": "$", "steps": _term(
        "const frame = useCurrentFrame();   // 现在第几帧\n"
        "// 按帧号算这帧该画成什么样：位置/透明度/大小\n"
        "const opacity = interpolate(frame, [0, 30], [0, 1]);\n"
        "// 30fps：你按秒想，引擎按帧算\n"
        "// 第 3 秒 = 第 90 帧，不用一帧帧手摆"
    )},
    "4.3": {"eyebrow": "为什么 AI 能轻松驱动", "title": "四条对 AI 友好的底层原因", "ordered": True, "items": [
        {"text": "全是 React + CSS：AI 语料里最厚的一块", "icon": "⚛️"},
        {"text": "声明式：只描述长什么样，不写怎么一帧帧动", "icon": "📐"},
        {"text": "改数据就改片：正中 AI 改文本的强项", "icon": "🔤"},
        {"text": "TypeScript 字段焊死：填错漏填编译当场报红", "icon": "🛡️"},
    ]},
    "4.4": {"text": "把视频写成数据，AI 只填空、不乱跑", "attribution": "Remotion × Vibe Coding"},

    # S5 技术落地·配置分发 + 配置即内容（原 S4 内容顺延）
    "5.1": {"eyebrow": "引擎怎么干活", "title": "一份配置 → Explainer 按 type 分发 → 现成组件", "background": "holo", "items": [
        {"label": "WRITE", "title": "你写配置", "desc": "说清这段画面长啥样", "icon": "📝"},
        {"label": "DISPATCH", "title": "Explainer 分发", "desc": "看 type 字段自动找组件", "icon": "🔀"},
        {"label": "RENDER", "title": "现成组件渲染", "desc": "comparison/terminal/charts… 照填就渲", "icon": "🧩"},
    ]},
    "5.2": {"eyebrow": "remotion-composer", "title": "做内容 = 挑组件 + 填字段", "background": "holo", "items": [
        {"label": "comparison", "title": "对比卡", "desc": "type=comparison 出对比卡", "icon": "🆚"},
        {"label": "terminal", "title": "合成终端", "desc": "不用真录屏", "icon": "🖥️"},
        {"label": "charts", "title": "十四个模板场景", "desc": "统一深色科技底 + 白字，改一处全片生效", "icon": "📊"},
    ]},
    "5.3": {"terminalTitle": "comparison 配置：照现成组件填数据", "prompt": "$", "steps": _term(
        "{\n"
        "  \"type\": \"comparison\",\n"
        "  \"title\": \"传统剪辑 vs 代码即视频\",\n"
        "  \"leftLabel\": \"传统剪辑\",\n"
        "  \"leftValue\": \"拖时间轴，改一处全手工重排\",\n"
        "  \"rightLabel\": \"代码即视频\",\n"
        "  \"rightValue\": \"改一行配置，重新编译出片\"\n"
        "}"
    )},
    "5.4": {"terminalTitle": "TS 把字段格式焊死，填错即编译报红", "prompt": "$", "steps": _term(
        "type Comparison = {\n"
        "  type: 'comparison';\n"
        "  leftLabel: string; leftValue: string;\n"
        "  rightLabel: string; rightValue: string;\n"
        "};\n"
        "// 漏填 / 写错字段 → tsc 当场报错，AI 跑不偏"
    )},
    "5.5": {"title": "让 AI 填空，别让它造轮子", "leftLabel": "❌ 从零手写", "leftValue": "让 AI 手写 ComparisonScene.tsx，易错难维护", "rightLabel": "✅ 只填数据", "rightValue": "复用现成 @ComparisonCard，TS 兜底"},
    "5.6": {"eyebrow": "延伸", "title": "还能扩一套自有风格组件库", "background": "holo", "items": [
        {"label": "BRAND", "title": "自有风格组件", "desc": "在现成组件上扩一套，辨识度更强", "icon": "🎨"},
        {"label": "LATER", "title": "以后单开一期", "desc": "那是更大的话题", "icon": "📅"},
    ]},

    # S6 SSR 避坑（原 S5 内容顺延）
    "6.1": {"terminalTitle": "💥 SSR 坑：组件顶层读 window，渲染红屏（A 轨兜底）", "prompt": "$", "steps": _term(
        "// ❌ 组件顶层直接读 window\n"
        "const w = window.innerWidth;\n"
        "// 打包跑在 Node 里、还没进浏览器：\n"
        "// 💥 ReferenceError: window is not defined"
    )},
    "6.2": {"terminalTitle": "✅ typeof window 守卫 + MDC 规则（A 轨兜底）", "prompt": "$", "steps": _term(
        "// ✅ SSR 时用默认值兜底\n"
        "const w = typeof window !== 'undefined'\n"
        "  ? window.innerWidth\n"
        "  : 1920;\n"
        "// .cursor/rules/remotion-ssr.mdc:\n"
        "// 组件顶层禁止直接读 window/document"
    )},
    "6.3": {"eyebrow": "Vibe Coding 精髓", "title": "重复的规矩，固化成规则交给 AI", "background": "holo", "items": [
        {"label": "RULE", "title": ".cursor/rules/remotion-ssr.mdc", "desc": "组件顶层禁止直接读 window/document", "icon": "🛡️"},
        {"label": "AUTO", "title": "AI 自动带上", "desc": "往后生成组件自动遵守，不用每次盯着", "icon": "🤖"},
    ]},

    # S7 数字人选型（原 S6 内容顺延）
    "7.1": {"eyebrow": "数字人选型", "title": "出镜形象只是陪衬串场，不是主角", "background": "holo", "items": [
        {"label": "METHOD", "title": "套选引擎的方法论", "desc": "先把定位说死，再摆选项和坑", "icon": "🧭"},
        {"label": "ROLE", "title": "陪衬定位", "desc": "串场，不抢内容主角", "icon": "🎭"},
    ]},
    "7.2": {"eyebrow": "三种形象方案", "title": "可选形象 + 各自的坑", "background": "grid", "headers": ["形象方案", "适用场景", "坑 / 代价"], "rows": _AVATAR_ROWS},
    "7.3": {"eyebrow": "回到约束", "title": "选定 3D 风格化 VRMAvatar", "background": "grid", "headers": ["形象方案", "适用场景", "坑 / 代价"], "rows": _AVATAR_ROWS, "highlightCell": "3-1"},
    "7.4": {"eyebrow": "落地交给 AI", "title": "整体渲一次按场景裁，脚踩稳", "background": "holo", "items": [
        {"label": "CROP", "title": "按场景裁切", "desc": "整体渲一次，再裁半身/全身", "icon": "✂️"},
        {"label": "FIX", "title": "脚踩稳", "desc": "大腿反向抵消髋部摆动，修掉钟摆甩腿", "icon": "🦵"},
    ]},

    # S8（新）场景适配：适合 / 搭配 / 不适合
    "8.1": {"eyebrow": "用在哪 ①", "title": "最适合：纯 A 轨自动出片", "background": "holo", "items": [
        {"label": "TALK", "title": "概念讲解 / 要点流程", "desc": "模板化讲解，文本就能说清", "icon": "🗣️"},
        {"label": "DATA", "title": "数据图表 / 对比 / 指标", "desc": "图表、对比卡、核心数字", "icon": "📊"},
        {"label": "PACK", "title": "片头 / 章节 / 片尾 / 合成终端", "desc": "包装 + 演示命令报错，换数据批量出片", "icon": "🎬"},
    ]},
    "8.2": {"title": "Remotion 的两种用法", "leftLabel": "独占整屏（纯 A 轨）", "leftValue": "主体是讲解/数据时，整屏交给 Remotion", "rightLabel": "退居叠层（搭配 B 轨）", "rightValue": "主体是真人/录屏时，渲透明叠层：数据卡/字幕/箭头/Zoom"},
    "8.3": {"callout_type": "warning", "title": "这些别硬上", "text": "主体不是文本/数据、或要写实物理世界时，Remotion 不是对的工具", "items": [
        "实拍人物 / 产品 / Vlog：该拍就拍，别拿引擎替代摄像机",
        "写实对口型数字人：易掉恐怖谷、可信度反崩，本项目排除",
        "影视级特效 / 逐帧手绘动画：交给专业工具",
        "纯后台超长批处理：FFmpeg 更划算",
    ]},
    "8.4": {"text": "主体真实 → 退居叠层；主体讲解 → 独占整屏", "attribution": "场景适配口诀"},

    # S9 结尾 CTA（原 S7 内容顺延）
    "9.1": {"headline": "三步搭好你的自动出片引擎，没基础也能复制", "cta": "找路径 · 选型 · 落地", "background": "holo"},
    "9.2": {"headline": "下期 EP03：用 Whisper 让字幕踩着话音跳", "cta": "关注 · 别错过", "background": "holo"},
}


def load_ssot_sections() -> list[dict[str, Any]]:
    txt = SCRIPT_MD.read_text(encoding="utf-8")
    block = re.findall(r"```json\s*\n(.*?)\n```", txt, re.S)[-1]
    return json.loads(block)["sections"]


def load_tts_manifest() -> dict[str, Any] | None:
    """Per-shot real durations + lip-sync captions from 06-tts, if synthesised."""
    if not TTS_MANIFEST.exists():
        return None
    data = json.loads(TTS_MANIFEST.read_text(encoding="utf-8"))
    if data.get("provider_status") != "synthesized":
        return None
    return data


def build_cuts(
    sections: list[dict[str, Any]],
    tts: dict[str, Any] | None,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], float]:
    # When 06-tts has been synthesised it is the timing source of truth: each
    # shot's on-screen cut runs exactly as long as its narration segment, and
    # the captions (absolute ms) drive both the burned-in subtitles and the
    # host's lip-sync.
    tts_dur: dict[str, float] = {}
    tts_caps: dict[str, list[dict[str, Any]]] = {}
    if tts:
        for s in tts["shots"]:
            tts_dur[s["id"]] = float(s["duration_seconds"])
            tts_caps[s["id"]] = s.get("captions") or []

    cuts: list[dict[str, Any]] = []
    captions: list[dict[str, Any]] = []
    cursor = 0.0
    for sec in sections:
        shots = sec.get("shots") or []
        if not shots:
            raise SystemExit(f"section {sec.get('id')} has no shots[]; expected shot-level SSOT")
        for shot in shots:
            sid = shot["id"]
            template = shot["scene_template"]
            ctype = TEMPLATE_TO_TYPE.get(template)
            if ctype is None:
                raise SystemExit(f"shot {sid}: unknown scene_template {template}")
            content = SHOT_CONTENT.get(sid)
            if content is None:
                raise SystemExit(f"shot {sid}: no authored SHOT_CONTENT")
            seconds = tts_dur.get(sid, float(shot["duration_seconds"]))
            frames = int(round(seconds * FPS))
            dur = frames / FPS
            cut = {
                "id": f"shot-{sid}",
                "type": ctype,
                "source": "",
                "in_seconds": round(cursor, 3),
                "out_seconds": round(cursor + dur, 3),
                **content,
            }
            cuts.append(cut)
            for cap in tts_caps.get(sid, []):
                captions.append(cap)
            cursor += dur
    return cuts, captions, cursor


def main() -> int:
    sections = load_ssot_sections()
    tts = load_tts_manifest()
    cuts, captions, total = build_cuts(sections, tts)
    payload: dict[str, Any] = {
        "theme": THEME,
        "cuts": cuts,
        "overlays": [],
        "captions": captions,
        "avatar": AVATAR,
    }
    # Warp room is ep02's authored look. Keep it enabled regardless of whether
    # the (uncommitted) artist asset happens to be on disk at generation time,
    # so regenerating props never silently turns the warp off. Drop the room
    # shot into public/UnityBG.png before rendering.
    payload["unityBackground"] = {
        "enabled": True,
        "image": UNITY_BG_IMAGE,
        "screenQuad": UNITY_BG_QUAD,
        # Translucent + blue-tinted UI backdrop (holographic look).
        "screenOpacity": 0.4,
        "screenTint": "#0b2a52",
    }
    if tts and tts.get("narration_audio"):
        payload["audio"] = {"narration": {"src": tts["narration_audio"], "volume": 1}}
    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print("=" * 60)
    print(f"Wrote {OUTPUT_JSON.relative_to(REPO_ROOT)}")
    print(f"Cuts: {len(cuts)} | Duration: {total:.2f}s ({int(round(total * FPS))} frames @ {FPS}fps)")
    print(f"Captions: {len(captions)} | TTS: {'on' if tts else 'off (storyboard timing)'}")
    by_type: dict[str, int] = {}
    for c in cuts:
        by_type[c["type"]] = by_type.get(c["type"], 0) + 1
    print("By type:", ", ".join(f"{k}={v}" for k, v in sorted(by_type.items())))
    print("=" * 60)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
