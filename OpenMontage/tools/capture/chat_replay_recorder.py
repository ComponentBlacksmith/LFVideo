"""AI conversation replay recorder — real transcripts only.

Replays a REAL, previously-occurred AI conversation (exported from Cursor /
Devin / Claude Code etc.) in a chat-styled page with typing animation, and
records it headlessly with Playwright for B-roll.

F-06 / TAD-01 boundary (per user ruling 2026-07-02): the conversation
CONTENT must be a genuine transcript of a conversation that actually
happened — only the *presentation* (chat UI + typing animation) is
synthesized. Guardrails enforced here:
  1. `provenance.source` is REQUIRED — execution refuses without it.
  2. A visible "对话回放" badge is rendered in the frame so the footage is
     never passed off as a live screen recording.
  3. A `.provenance.json` sidecar stores the source, export date, and the
     full replayed transcript for audit.
Fabricated / invented dialogues are forbidden — do not hand-write messages
into the transcript file.
"""

from __future__ import annotations

import html
import json
import tempfile
import time
from pathlib import Path
from typing import Any

from tools.base_tool import (
    BaseTool,
    Determinism,
    ExecutionMode,
    ResourceProfile,
    ToolResult,
    ToolRuntime,
    ToolStability,
    ToolTier,
)
from tools.capture.capture_common import (
    DEFAULT_VIEWPORT,
    probe_duration_seconds,
    record_page_video,
    write_provenance,
)


_REPLAY_TEMPLATE = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 100vw; height: 100vh;
    background: #0b1120;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  }
  .window {
    width: 78%; height: 88%;
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 16px;
    box-shadow: 0 24px 80px rgba(0,0,0,.55);
    display: flex; flex-direction: column; overflow: hidden;
  }
  .header {
    height: 56px; flex: none;
    display: flex; align-items: center;
    padding: 0 22px; gap: 12px;
    background: #111c33;
    border-bottom: 1px solid #1e293b;
  }
  .header .title { color: #e2e8f0; font-size: 17px; font-weight: 600; }
  .badge {
    margin-left: auto;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 13px;
    color: #67e8f9;
    border: 1px solid rgba(103, 232, 249, .45);
    background: rgba(103, 232, 249, .08);
  }
  .feed {
    flex: 1; overflow: hidden;
    padding: 26px 30px;
    display: flex; flex-direction: column; gap: 18px;
    justify-content: flex-end;
  }
  .msg { display: flex; flex-direction: column; max-width: 74%; }
  .msg .who { font-size: 13px; color: #64748b; margin-bottom: 6px; }
  .msg .bubble {
    padding: 13px 17px;
    border-radius: 14px;
    font-size: 18px; line-height: 1.6;
    color: #e2e8f0;
    white-space: pre-wrap; word-break: break-word;
  }
  .msg.user { align-self: flex-end; align-items: flex-end; }
  .msg.user .bubble { background: #164e63; border: 1px solid #155e75; }
  .msg.assistant { align-self: flex-start; align-items: flex-start; }
  .msg.assistant .bubble { background: #16213c; border: 1px solid #1e293b; }
  .typing { display: inline-flex; gap: 5px; padding: 4px 2px; }
  .typing i {
    width: 8px; height: 8px; border-radius: 50%;
    background: #64748b; animation: bob 1.1s infinite;
  }
  .typing i:nth-child(2) { animation-delay: .18s; }
  .typing i:nth-child(3) { animation-delay: .36s; }
  @keyframes bob { 0%,60%,100% { transform: translateY(0); opacity:.5; } 30% { transform: translateY(-6px); opacity:1; } }
</style>
</head>
<body>
<div class="window">
  <div class="header">
    <div class="title">__TITLE__</div>
    <div class="badge">__BADGE__</div>
  </div>
  <div class="feed" id="feed"></div>
</div>
<script>
const MESSAGES = __MESSAGES__;
const TYPE_MS = __TYPE_MS__;
const REVEAL_MS = __REVEAL_MS__;
const HOLD_MS = __HOLD_MS__;
const feed = document.getElementById("feed");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function addMessage(role, who) {
  const msg = document.createElement("div");
  msg.className = "msg " + role;
  const whoEl = document.createElement("div");
  whoEl.className = "who";
  whoEl.textContent = who;
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  msg.appendChild(whoEl);
  msg.appendChild(bubble);
  feed.appendChild(msg);
  while (feed.children.length > 8) feed.removeChild(feed.firstChild);
  return bubble;
}

async function run() {
  await sleep(1800);
  for (const m of MESSAGES) {
    if (m.role === "user") {
      const bubble = addMessage("user", m.who);
      let typed = "";
      for (const ch of m.text) {
        typed += ch;
        bubble.textContent = typed;
        await sleep(TYPE_MS);
      }
    } else {
      const bubble = addMessage("assistant", m.who);
      bubble.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
      await sleep(1200);
      bubble.textContent = "";
      const chunks = m.text.split(/(?<=[。！？.!?\\n])/);
      for (const chunk of chunks) {
        bubble.textContent += chunk;
        await sleep(REVEAL_MS);
      }
    }
    await sleep(HOLD_MS);
  }
  await sleep(2500);
  window.__replayDone = true;
}
run();
</script>
</body>
</html>
"""


class ChatReplayRecorder(BaseTool):
    name = "chat_replay_recorder"
    version = "0.1.0"
    tier = ToolTier.SOURCE
    capability = "b_roll_capture"
    provider = "playwright"
    stability = ToolStability.BETA
    execution_mode = ExecutionMode.SYNC
    determinism = Determinism.DETERMINISTIC
    runtime = ToolRuntime.LOCAL

    dependencies = ["python:playwright"]
    install_instructions = (
        "pip install playwright && python -m playwright install chromium"
    )

    agent_skills = ["synthetic-screen-recording", "playwright-recording"]

    capabilities = [
        "chat_transcript_replay_video",
    ]

    best_for = [
        "B-roll of a real AI-assisted workflow conversation (prompt -> answer beats)",
        "Replaying an exported Cursor/Devin/Claude transcript with readable pacing",
        "Footage that must stay auditable (visible replay badge + provenance sidecar)",
    ]

    not_good_for = [
        "Invented / hand-written dialogues (F-06 — transcript must be a real record)",
        "Live LLM streaming capture (record the real session instead)",
        "Long transcripts verbatim — trim to the beats the narration needs first",
    ]

    input_schema = {
        "type": "object",
        "required": ["transcript_path", "output_path", "provenance"],
        "properties": {
            "transcript_path": {
                "type": "string",
                "description": (
                    "Path to a JSON transcript file: a list of "
                    '{"role": "user"|"assistant", "text": "...", "who": "optional display name"} '
                    "messages exported from a real conversation"
                ),
            },
            "output_path": {
                "type": "string",
                "description": "Output MP4 path",
            },
            "provenance": {
                "type": "object",
                "required": ["source"],
                "description": (
                    "REQUIRED assertion that the transcript is a real conversation record. "
                    "Execution refuses without it (F-06 guard)."
                ),
                "properties": {
                    "source": {
                        "type": "string",
                        "description": "Where the conversation happened (e.g. 'Cursor chat, ep02 SSR debugging, 2026-06-20')",
                    },
                    "exported_at": {
                        "type": "string",
                        "description": "When the transcript was exported",
                    },
                    "edited": {
                        "type": "string",
                        "description": "Note any trimming applied (trimming allowed; rewriting content is not)",
                    },
                },
            },
            "window_title": {
                "type": "string",
                "default": "AI 对话",
                "description": "Chat window header title",
            },
            "badge_text": {
                "type": "string",
                "default": "对话回放 · 真实记录",
                "description": "Always-visible authenticity badge text",
            },
            "user_label": {
                "type": "string",
                "default": "我",
                "description": "Default display name for user messages",
            },
            "assistant_label": {
                "type": "string",
                "default": "AI",
                "description": "Default display name for assistant messages",
            },
            "type_speed_ms": {
                "type": "integer",
                "default": 45,
                "description": "Milliseconds per typed character (user messages)",
            },
            "reveal_chunk_ms": {
                "type": "integer",
                "default": 350,
                "description": "Milliseconds per revealed sentence chunk (assistant messages)",
            },
            "hold_ms": {
                "type": "integer",
                "default": 1200,
                "description": "Hold after each message",
            },
            "fps": {
                "type": "integer",
                "default": 30,
                "description": "Output MP4 frame rate",
            },
        },
    }

    output_schema = {
        "type": "object",
        "properties": {
            "output_path": {"type": "string"},
            "provenance_path": {"type": "string"},
            "message_count": {"type": "integer"},
            "duration_seconds": {"type": "number"},
        },
    }

    resource_profile = ResourceProfile(
        cpu_cores=2, ram_mb=1024, vram_mb=0, disk_mb=300, network_required=False,
    )

    side_effects = ["creates_file"]

    def execute(self, inputs: dict[str, Any]) -> ToolResult:
        provenance_in = inputs.get("provenance") or {}
        if not str(provenance_in.get("source", "")).strip():
            return ToolResult(
                success=False,
                error=(
                    "F-06 guard: 'provenance.source' is required — this tool only replays "
                    "real conversation transcripts. State where/when the conversation "
                    "actually happened (e.g. 'Cursor chat, ep02 SSR debugging, 2026-06-20')."
                ),
            )

        transcript_path = Path(inputs["transcript_path"])
        if not transcript_path.is_file():
            return ToolResult(success=False, error=f"Transcript not found: {transcript_path}")

        try:
            messages = json.loads(transcript_path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError) as exc:
            return ToolResult(success=False, error=f"Invalid transcript JSON: {exc}")

        if not isinstance(messages, list) or not messages:
            return ToolResult(success=False, error="Transcript must be a non-empty JSON list of messages")

        user_label = str(inputs.get("user_label", "我"))
        assistant_label = str(inputs.get("assistant_label", "AI"))
        normalized = []
        for i, m in enumerate(messages):
            if not isinstance(m, dict) or m.get("role") not in ("user", "assistant") or not m.get("text"):
                return ToolResult(
                    success=False,
                    error=f"Message {i} invalid: need role ('user'|'assistant') and non-empty text",
                )
            normalized.append({
                "role": m["role"],
                "text": str(m["text"]),
                "who": str(m.get("who") or (user_label if m["role"] == "user" else assistant_label)),
            })

        output_path = Path(inputs["output_path"])
        start = time.time()

        html_doc = (
            _REPLAY_TEMPLATE
            .replace("__TITLE__", html.escape(str(inputs.get("window_title", "AI 对话"))))
            .replace("__BADGE__", html.escape(str(inputs.get("badge_text", "对话回放 · 真实记录"))))
            .replace("__MESSAGES__", json.dumps(normalized, ensure_ascii=False))
            .replace("__TYPE_MS__", str(int(inputs.get("type_speed_ms", 45))))
            .replace("__REVEAL_MS__", str(int(inputs.get("reveal_chunk_ms", 350))))
            .replace("__HOLD_MS__", str(int(inputs.get("hold_ms", 1200))))
        )

        try:
            final_path = self._record_replay(html_doc, output_path, int(inputs.get("fps", 30)))
        except Exception as exc:
            return ToolResult(success=False, error=f"Replay recording failed: {exc}")

        provenance = write_provenance(final_path, {
            "tool": self.name,
            "capture_kind": "real_transcript_chat_replay",
            "transcript_path": str(transcript_path),
            "source": provenance_in.get("source"),
            "exported_at": provenance_in.get("exported_at"),
            "edited": provenance_in.get("edited"),
            "messages": normalized,
        })

        return ToolResult(
            success=True,
            data={
                "output_path": str(final_path),
                "provenance_path": str(provenance),
                "message_count": len(normalized),
                "duration_seconds": probe_duration_seconds(final_path),
            },
            artifacts=[str(final_path)],
            duration_seconds=round(time.time() - start, 1),
        )

    def _record_replay(self, html_doc: str, output_path: Path, fps: int) -> Path:
        with tempfile.TemporaryDirectory(prefix="chat-replay-") as tmp:
            html_path = Path(tmp) / "replay.html"
            html_path.write_text(html_doc, encoding="utf-8")

            def action(page: Any) -> None:
                page.goto(html_path.as_uri())
                page.wait_for_function(
                    "() => window.__replayDone === true", timeout=600000,
                )

            return record_page_video(action, output_path, dict(DEFAULT_VIEWPORT), fps)
