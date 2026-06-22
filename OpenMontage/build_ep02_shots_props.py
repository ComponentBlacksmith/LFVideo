#!/usr/bin/env python3
"""Build ep02 Remotion ``Explainer`` props from the **shot-level** 04 SSOT.

This is the 07-video-assembly mapping for the refactored ep02 04-script: the
SSOT now decomposes each section into ``shots[]`` (see
shared/schemas/04-script.schema.json), and stage 07 maps **one shot -> one
Explainer cut**. Structure (shot order, per-shot duration, the section voice a
shot covers) comes straight from the SSOT JSON contract; only the on-screen
renderable detail of each shot (the motion-engineer's authoring) lives here in
``SHOT_CONTENT``.

Scene-template -> Explainer ``cut.type`` mapping (the engine has no
``@SplitLayout`` cut, so split/compare shots render as ``comparison``):

    @IntroScene    -> intro_scene     @ConceptScene  -> concept_scene
    @TableScene    -> table_scene     @TerminalScene -> terminal_scene
    @OutroScene    -> outro_scene     @SplitLayout   -> comparison

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
COMPOSER_DIR = Path(__file__).resolve().parent / "remotion-composer"
OUTPUT_JSON = COMPOSER_DIR / "public" / "demo-props" / "ep02-shots.json"

FPS = 30
THEME = "flat-motion-graphics"

TEMPLATE_TO_TYPE = {
    "@IntroScene": "intro_scene",
    "@ConceptScene": "concept_scene",
    "@TableScene": "table_scene",
    "@TerminalScene": "terminal_scene",
    "@OutroScene": "outro_scene",
    "@SplitLayout": "comparison",
}


def _term(code: str) -> list[dict[str, str]]:
    return [{"kind": "out", "text": line} for line in code.split("\n")]


# 04 table rows render through TableScene's fixed 3-column shape
# (feature / cursor / windsurf + win). The S3 route matrix collapses the 04
# section's 4 columns into "适用场景 / 已知坑".
_ROUTE_ROWS = [
    {"feature": "Remotion", "cursor": "前端栈、复杂排版、跨期复用", "windsurf": "顶层读 window 崩；BUSL 授权", "win": "neutral"},
    {"feature": "Motion Canvas", "cursor": "代码演示、精确时序", "windsurf": "生态小、模板自建", "win": "neutral"},
    {"feature": "Manim", "cursor": "数学/公式可视化", "windsurf": "排版弱、渲染慢", "win": "neutral"},
    {"feature": "MoviePy", "cursor": "简单拼接、音轨闪避", "windsurf": "自适应排版繁琐、吃内存", "win": "neutral"},
    {"feature": "FFmpeg", "cursor": "批量转码、字幕烧录", "windsurf": "命令晦涩难调试", "win": "neutral"},
]
_AVATAR_ROWS = [
    {"feature": "真人出镜", "cursor": "最可信、有温度", "windsurf": "要露脸、不可编程复用、隐私成本", "win": "neutral"},
    {"feature": "写实/对口型数字人", "cursor": "像真主播", "windsurf": "易掉恐怖谷、可信度反崩；口型重活", "win": "neutral"},
    {"feature": "3D 风格化 VRM", "cursor": "风格统一、可编程、渲一次到处用", "windsurf": "要建模与动作绑定，可交给 AI", "win": "cursor"},
]

# Renderable on-screen content per shot id. Type-specific fields satisfy the
# Explainer SceneRenderer guards (intro:title, concept:title+items,
# table:title+headers+rows, terminal:steps, outro:headline, comparison:
# left/right Label/Value).
SHOT_CONTENT: dict[str, dict[str, Any]] = {
    "1.1": {"title": "用 Vibe Coding 搭一套自动出片的渲染引擎", "subtitle": "把视频写成代码，让 AI 按配置自动出片", "background": "particles"},
    "1.2": {"title": "AI 强在啃文本和代码 → 渲染就该数据驱动", "subtitle": "没前后端基础，全程用大白话指挥 AI", "background": "grid"},
    "1.3": {"title": "三步：找路径 · 选型 · 落地", "subtitle": "让 AI 找路 → 对约束选型 → 落地出片", "background": "gradient"},

    "2.1": {"eyebrow": "找技术路径", "title": "把选择题丢给 AI：有哪些现成路子？", "background": "gradient", "items": [
        {"label": "NOT", "title": "不埋头啃文档", "desc": "不自己从零调研，直接把选择题交给 AI", "icon": "🙅"},
        {"label": "ASK", "title": "一句话需求", "desc": "想把视频写成代码自动出片，有哪些现成路子？", "icon": "💬"},
    ]},
    "2.2": {"eyebrow": "六条路线", "title": "AI 一口气摆了六条", "background": "gradient", "items": [
        {"label": "WEB", "title": "Remotion", "desc": "网页那套：React + CSS 渲染", "icon": "🌐"},
        {"label": "MATH", "title": "Manim", "desc": "画数学公式 / 几何", "icon": "📐"},
        {"label": "MORE", "title": "MoviePy · FFmpeg · Motion Canvas · PixiJS", "desc": "拼接转码 + 时序/粒子动画，补全六条", "icon": "➕"},
    ]},
    "2.3": {"eyebrow": "同一个内核", "title": "代码描述画面 → 编译成帧 → 合成视频", "background": "gradient", "items": [
        {"label": "DESC", "title": "代码描述画面", "desc": "拿代码/数据把画面声明出来", "icon": "📄"},
        {"label": "COMPILE", "title": "编译成一帧帧", "desc": "渲染器算出每个时刻的画面", "icon": "⚙️"},
        {"label": "COMPOSE", "title": "合成视频", "desc": "帧序列合成成片", "icon": "🎬"},
    ]},
    "2.4": {"eyebrow": "本步小结", "title": "这一步只摆路，先不评好坏", "background": "gradient", "items": [
        {"label": "LIST", "title": "只罗列", "desc": "先把候选方案摆全", "icon": "📋"},
        {"label": "LATER", "title": "不评判", "desc": "好坏留到下一步选型再说", "icon": "⏭️"},
    ]},

    "3.1": {"eyebrow": "判断层 = 边界，非中立百科", "title": "选型最容易翻车：看清每条路何时不好使", "background": "grid", "headers": ["方案", "适用场景", "已知坑"], "rows": _ROUTE_ROWS},
    "3.2": {"eyebrow": "适用场景 + 会咬人的坑", "title": "六条路全列出来（先看 Remotion）", "background": "grid", "headers": ["方案", "适用场景", "已知坑"], "rows": _ROUTE_ROWS, "highlightCell": "1-3"},
    "3.3": {"eyebrow": "其余几条的硬伤", "title": "Manim 慢 / MoviePy 繁琐 / FFmpeg 晦涩", "background": "grid", "headers": ["方案", "适用场景", "已知坑"], "rows": _ROUTE_ROWS, "highlightCell": "3-3"},
    "3.4": {"title": "对着需求做减法", "leftLabel": "我的三条需求", "leftValue": "批量换数据 · AI 改不易错 · 跨期好维护", "rightLabel": "✅ Remotion 命中", "rightValue": "三条全中，Remotion 赢"},
    "3.5": {"title": "Remotion ✅ vs 复制粘贴 HTML ❌", "leftLabel": "Remotion", "leftValue": "改一处全系列生效 · 只填数据 · 代价：React + BUSL 付费", "rightLabel": "复制粘贴 HTML", "rightValue": "每期复制越改越乱 · 结构易跑偏"},
    "3.6": {"title": "一句话", "leftLabel": "AI", "leftValue": "铺信息：把方案和坑摆全", "rightLabel": "你", "rightValue": "拍板：做减法、定取舍"},

    "4.1": {"eyebrow": "引擎怎么干活", "title": "一份配置 → Explainer 按 type 分发 → 现成组件", "background": "gradient", "items": [
        {"label": "WRITE", "title": "你写配置", "desc": "说清这段画面长啥样", "icon": "📝"},
        {"label": "DISPATCH", "title": "Explainer 分发", "desc": "看 type 字段自动找组件", "icon": "🔀"},
        {"label": "RENDER", "title": "现成组件渲染", "desc": "comparison/terminal/charts… 照填就渲", "icon": "🧩"},
    ]},
    "4.2": {"eyebrow": "remotion-composer", "title": "做内容 = 挑组件 + 填字段", "background": "gradient", "items": [
        {"label": "comparison", "title": "对比卡", "desc": "type=comparison 出对比卡", "icon": "🆚"},
        {"label": "terminal", "title": "合成终端", "desc": "不用真录屏", "icon": "🖥️"},
        {"label": "charts", "title": "图表 / 分屏", "desc": "按需挑用", "icon": "📊"},
    ]},
    "4.3": {"terminalTitle": "comparison 配置：照现成组件填数据", "prompt": "$", "steps": _term(
        "{\n"
        "  \"type\": \"comparison\",\n"
        "  \"title\": \"传统剪辑 vs 代码即视频\",\n"
        "  \"leftLabel\": \"传统剪辑\",\n"
        "  \"leftValue\": \"拖时间轴，改一处全手工重排\",\n"
        "  \"rightLabel\": \"代码即视频\",\n"
        "  \"rightValue\": \"改一行配置，重新编译出片\"\n"
        "}"
    )},
    "4.4": {"terminalTitle": "TS 把字段格式焊死，填错即编译报红", "prompt": "$", "steps": _term(
        "type Comparison = {\n"
        "  type: 'comparison';\n"
        "  leftLabel: string; leftValue: string;\n"
        "  rightLabel: string; rightValue: string;\n"
        "};\n"
        "// 漏填 / 写错字段 → tsc 当场报错，AI 跑不偏"
    )},
    "4.5": {"title": "让 AI 填空，别让它造轮子", "leftLabel": "❌ 从零手写", "leftValue": "让 AI 手写 ComparisonScene.tsx，易错难维护", "rightLabel": "✅ 只填数据", "rightValue": "复用现成 @ComparisonCard，TS 兜底"},
    "4.6": {"eyebrow": "延伸", "title": "还能扩一套自有风格组件库", "background": "gradient", "items": [
        {"label": "BRAND", "title": "自有风格组件", "desc": "在现成组件上扩一套，辨识度更强", "icon": "🎨"},
        {"label": "LATER", "title": "以后单开一期", "desc": "那是更大的话题", "icon": "📅"},
    ]},

    "5.1": {"terminalTitle": "💥 SSR 坑：组件顶层读 window，渲染红屏（A 轨兜底）", "prompt": "$", "steps": _term(
        "// ❌ 组件顶层直接读 window\n"
        "const w = window.innerWidth;\n"
        "// 打包跑在 Node 里、还没进浏览器：\n"
        "// 💥 ReferenceError: window is not defined"
    )},
    "5.2": {"terminalTitle": "✅ typeof window 守卫 + MDC 规则（A 轨兜底）", "prompt": "$", "steps": _term(
        "// ✅ SSR 时用默认值兜底\n"
        "const w = typeof window !== 'undefined'\n"
        "  ? window.innerWidth\n"
        "  : 1920;\n"
        "// .cursor/rules/remotion-ssr.mdc:\n"
        "// 组件顶层禁止直接读 window/document"
    )},
    "5.3": {"eyebrow": "Vibe Coding 精髓", "title": "重复的规矩，固化成规则交给 AI", "background": "gradient", "items": [
        {"label": "RULE", "title": ".cursor/rules/remotion-ssr.mdc", "desc": "组件顶层禁止直接读 window/document", "icon": "🛡️"},
        {"label": "AUTO", "title": "AI 自动带上", "desc": "往后生成组件自动遵守，不用每次盯着", "icon": "🤖"},
    ]},

    "6.1": {"eyebrow": "数字人选型", "title": "出镜形象只是陪衬串场，不是主角", "background": "gradient", "items": [
        {"label": "METHOD", "title": "套选引擎的方法论", "desc": "先把定位说死，再摆选项和坑", "icon": "🧭"},
        {"label": "ROLE", "title": "陪衬定位", "desc": "串场，不抢内容主角", "icon": "🎭"},
    ]},
    "6.2": {"eyebrow": "三种形象方案", "title": "可选形象 + 各自的坑", "background": "grid", "headers": ["形象方案", "适用场景", "坑 / 代价"], "rows": _AVATAR_ROWS},
    "6.3": {"eyebrow": "回到约束", "title": "选定 3D 风格化 VRMAvatar", "background": "grid", "headers": ["形象方案", "适用场景", "坑 / 代价"], "rows": _AVATAR_ROWS, "highlightCell": "3-1"},
    "6.4": {"eyebrow": "落地交给 AI", "title": "整体渲一次按场景裁，脚踩稳", "background": "gradient", "items": [
        {"label": "CROP", "title": "按场景裁切", "desc": "整体渲一次，再裁半身/全身", "icon": "✂️"},
        {"label": "FIX", "title": "脚踩稳", "desc": "大腿反向抵消髋部摆动，修掉钟摆甩腿", "icon": "🦵"},
    ]},

    "7.1": {"headline": "三步搭好你的自动出片引擎，没基础也能复制", "cta": "找路径 · 选型 · 落地", "background": "gradient"},
    "7.2": {"headline": "下期 EP03：用 Whisper 让字幕踩着话音跳", "cta": "关注 · 别错过", "background": "gradient"},
}


def load_ssot_sections() -> list[dict[str, Any]]:
    txt = SCRIPT_MD.read_text(encoding="utf-8")
    block = re.findall(r"```json\s*\n(.*?)\n```", txt, re.S)[-1]
    return json.loads(block)["sections"]


def build_cuts(sections: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], float]:
    cuts: list[dict[str, Any]] = []
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
            frames = int(round(float(shot["duration_seconds"]) * FPS))
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
            cursor += dur
    return cuts, cursor


def main() -> int:
    sections = load_ssot_sections()
    cuts, total = build_cuts(sections)
    payload: dict[str, Any] = {
        "theme": THEME,
        "cuts": cuts,
        "overlays": [],
        "captions": [],
    }
    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print("=" * 60)
    print(f"Wrote {OUTPUT_JSON.relative_to(REPO_ROOT)}")
    print(f"Cuts: {len(cuts)} | Duration: {total:.2f}s ({int(round(total * FPS))} frames @ {FPS}fps)")
    by_type: dict[str, int] = {}
    for c in cuts:
        by_type[c["type"]] = by_type.get(c["type"], 0) + 1
    print("By type:", ", ".join(f"{k}={v}" for k, v in sorted(by_type.items())))
    print("=" * 60)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
