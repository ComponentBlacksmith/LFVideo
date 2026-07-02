"""Scripted terminal session recorder — real execution, automated capture.

Runs the given shell commands FOR REAL via subprocess, captures their real
stdout/stderr and exit codes, then replays the session (typed command +
real output) in a terminal-styled page recorded headlessly with Playwright.

F-06 / TAD-01 boundary: the operations and their outputs are genuine — only
the *executor* changes from a human at a keyboard to a script. The full
execution transcript (commands, outputs, exit codes, timestamps) is saved
as a `.provenance.json` sidecar so every frame is auditable. This tool must
NOT be fed hand-written fake outputs; for purely synthetic terminal frames
use the Remotion `@TerminalScene` A-track component instead.
"""

from __future__ import annotations

import html
import json
import subprocess
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
    font-family: 'Cascadia Code', 'JetBrains Mono', Consolas, monospace;
  }
  .window {
    width: 88%; height: 84%;
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 14px;
    box-shadow: 0 24px 80px rgba(0,0,0,.55);
    display: flex; flex-direction: column; overflow: hidden;
  }
  .titlebar {
    height: 44px; flex: none;
    display: flex; align-items: center; gap: 8px;
    padding: 0 18px;
    background: #111c33;
    border-bottom: 1px solid #1e293b;
  }
  .dot { width: 13px; height: 13px; border-radius: 50%; }
  .dot.r { background: #f87171; } .dot.y { background: #fbbf24; } .dot.g { background: #34d399; }
  .title { margin-left: 10px; color: #94a3b8; font-size: 15px; }
  .screen {
    flex: 1; padding: 22px 26px; overflow: hidden;
    color: #e2e8f0; font-size: 19px; line-height: 1.55;
    white-space: pre-wrap; word-break: break-all;
  }
  .prompt { color: __ACCENT__; font-weight: 600; }
  .out { color: #94a3b8; }
  .err { color: #fca5a5; }
  .cursor {
    display: inline-block; width: 10px; height: 21px;
    background: __ACCENT__; vertical-align: text-bottom;
    animation: blink 1s steps(1) infinite;
  }
  @keyframes blink { 50% { opacity: 0; } }
</style>
</head>
<body>
<div class="window">
  <div class="titlebar">
    <div class="dot r"></div><div class="dot y"></div><div class="dot g"></div>
    <div class="title">__TITLE__</div>
  </div>
  <div class="screen" id="screen"></div>
</div>
<script>
const STEPS = __STEPS__;
const TYPE_MS = __TYPE_MS__;
const OUT_MS = __OUT_MS__;
const HOLD_MS = __HOLD_MS__;
const PROMPT = __PROMPT__;
const MAX_LINES = 22;
const screen = document.getElementById("screen");
const lines = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function render(activeLine, withCursor) {
  const visible = lines.slice(-MAX_LINES);
  screen.innerHTML = visible.join("\\n") +
    (activeLine !== null ? (visible.length ? "\\n" : "") + activeLine : "") +
    (withCursor ? '<span class="cursor"></span>' : "");
}

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function run() {
  render('<span class="prompt">' + esc(PROMPT) + " </span>", true);
  await sleep(2000);
  for (const step of STEPS) {
    const promptHtml = '<span class="prompt">' + esc(PROMPT) + " </span>";
    let typed = "";
    for (const ch of step.cmd) {
      typed += ch;
      render(promptHtml + esc(typed), true);
      await sleep(TYPE_MS);
    }
    render(promptHtml + esc(typed), false);
    await sleep(HOLD_MS);
    lines.push(promptHtml + esc(typed));
    for (const outLine of step.output_lines) {
      const cls = step.failed ? "err" : "out";
      lines.push('<span class="' + cls + '">' + esc(outLine) + "</span>");
      render(null, false);
      await sleep(OUT_MS);
    }
    render(null, false);
    await sleep(HOLD_MS);
  }
  render('<span class="prompt">' + esc(PROMPT) + " </span>", true);
  await sleep(2500);
  window.__replayDone = true;
}
run();
</script>
</body>
</html>
"""


class ScriptedTerminalRecorder(BaseTool):
    name = "scripted_terminal_recorder"
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
        "real_command_execution",
        "terminal_session_replay_video",
    ]

    best_for = [
        "B-roll of real CLI operations (builds, renders, reproducible errors) without a human at the keyboard",
        "Reproducing a real bug on camera (e.g. an SSR ReferenceError) with an auditable transcript",
        "Deterministic 1080p terminal footage paced for narration",
    ]

    not_good_for = [
        "Hand-written fake outputs (F-06 — outputs must come from real execution)",
        "Interactive TUI programs (vim, top) — output is captured line-based",
        "Purely synthetic terminal frames (use Remotion @TerminalScene instead)",
    ]

    input_schema = {
        "type": "object",
        "required": ["commands", "output_path"],
        "properties": {
            "commands": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Shell commands executed for real, in order",
            },
            "output_path": {
                "type": "string",
                "description": "Output MP4 path",
            },
            "cwd": {
                "type": "string",
                "description": "Working directory for command execution",
            },
            "terminal_title": {
                "type": "string",
                "default": "terminal",
                "description": "Window title bar text",
            },
            "prompt": {
                "type": "string",
                "default": "$",
                "description": "Prompt string shown before each command",
            },
            "accent_color": {
                "type": "string",
                "default": "#22D3EE",
                "description": "Prompt/cursor accent color",
            },
            "type_speed_ms": {
                "type": "integer",
                "default": 35,
                "description": "Milliseconds per typed character",
            },
            "output_line_ms": {
                "type": "integer",
                "default": 120,
                "description": "Milliseconds between revealed output lines",
            },
            "hold_ms": {
                "type": "integer",
                "default": 700,
                "description": "Hold after each command and output block",
            },
            "max_output_lines": {
                "type": "integer",
                "default": 18,
                "description": "Cap on displayed output lines per command (tail-truncated with an ellipsis line)",
            },
            "command_timeout_seconds": {
                "type": "integer",
                "default": 300,
                "description": "Timeout per command execution",
            },
            "allow_nonzero_exit": {
                "type": "boolean",
                "default": True,
                "description": "Keep going when a command fails (needed to film real error reproductions)",
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
            "transcript": {"type": "array"},
            "duration_seconds": {"type": "number"},
        },
    }

    resource_profile = ResourceProfile(
        cpu_cores=2, ram_mb=1024, vram_mb=0, disk_mb=300, network_required=False,
    )

    side_effects = ["creates_file", "executes_commands"]

    def execute(self, inputs: dict[str, Any]) -> ToolResult:
        commands: list[str] = list(inputs["commands"])
        if not commands:
            return ToolResult(success=False, error="No commands given")

        output_path = Path(inputs["output_path"])
        cwd = inputs.get("cwd")
        timeout = int(inputs.get("command_timeout_seconds", 300))
        allow_nonzero = bool(inputs.get("allow_nonzero_exit", True))
        max_lines = int(inputs.get("max_output_lines", 18))
        start = time.time()

        transcript: list[dict[str, Any]] = []
        for cmd in commands:
            entry = self._run_real_command(cmd, cwd, timeout)
            transcript.append(entry)
            if entry["exit_code"] != 0 and not allow_nonzero:
                return ToolResult(
                    success=False,
                    error=f"Command failed (exit {entry['exit_code']}): {cmd}",
                    data={"transcript": transcript},
                )

        steps = []
        for entry in transcript:
            display_lines = entry["output_lines"]
            if len(display_lines) > max_lines:
                display_lines = (
                    [f"... ({len(display_lines) - max_lines + 1} earlier lines)"]
                    + display_lines[-(max_lines - 1):]
                )
            steps.append({
                "cmd": entry["command"],
                "output_lines": display_lines,
                "failed": entry["exit_code"] != 0,
            })

        html_doc = (
            _REPLAY_TEMPLATE
            .replace("__ACCENT__", str(inputs.get("accent_color", "#22D3EE")))
            .replace("__TITLE__", html.escape(str(inputs.get("terminal_title", "terminal"))))
            .replace("__STEPS__", json.dumps(steps, ensure_ascii=False))
            .replace("__TYPE_MS__", str(int(inputs.get("type_speed_ms", 35))))
            .replace("__OUT_MS__", str(int(inputs.get("output_line_ms", 120))))
            .replace("__HOLD_MS__", str(int(inputs.get("hold_ms", 700))))
            .replace("__PROMPT__", json.dumps(str(inputs.get("prompt", "$"))))
        )

        try:
            final_path = self._record_replay(html_doc, output_path, int(inputs.get("fps", 30)))
        except Exception as exc:
            return ToolResult(success=False, error=f"Replay recording failed: {exc}")

        provenance = write_provenance(final_path, {
            "tool": self.name,
            "capture_kind": "real_execution_terminal_replay",
            "cwd": cwd,
            "transcript": transcript,
        })

        return ToolResult(
            success=True,
            data={
                "output_path": str(final_path),
                "provenance_path": str(provenance),
                "transcript": transcript,
                "duration_seconds": probe_duration_seconds(final_path),
            },
            artifacts=[str(final_path)],
            duration_seconds=round(time.time() - start, 1),
        )

    def _run_real_command(
        self, cmd: str, cwd: str | None, timeout: int,
    ) -> dict[str, Any]:
        executed_at = time.strftime("%Y-%m-%dT%H:%M:%S%z")
        try:
            proc = subprocess.run(
                cmd, shell=True, cwd=cwd,
                capture_output=True, text=True, timeout=timeout,
                encoding="utf-8", errors="replace",
            )
            combined = (proc.stdout or "") + (proc.stderr or "")
            exit_code = proc.returncode
        except subprocess.TimeoutExpired as exc:
            combined = f"(timed out after {timeout}s)\n" + (
                exc.stdout.decode(errors="replace") if isinstance(exc.stdout, bytes)
                else (exc.stdout or "")
            )
            exit_code = -1
        output_lines = [line.rstrip() for line in combined.splitlines()]
        return {
            "command": cmd,
            "executed_at": executed_at,
            "exit_code": exit_code,
            "output_lines": output_lines,
        }

    def _record_replay(self, html_doc: str, output_path: Path, fps: int) -> Path:
        with tempfile.TemporaryDirectory(prefix="term-replay-") as tmp:
            html_path = Path(tmp) / "replay.html"
            html_path.write_text(html_doc, encoding="utf-8")

            def action(page: Any) -> None:
                page.goto(html_path.as_uri())
                page.wait_for_function(
                    "() => window.__replayDone === true", timeout=600000,
                )

            return record_page_video(action, output_path, dict(DEFAULT_VIEWPORT), fps)
