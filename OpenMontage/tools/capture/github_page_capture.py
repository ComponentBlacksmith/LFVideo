"""GitHub / web page B-roll capture via headless Playwright.

Captures REAL rendered pages (GitHub repos, PRs, commits, docs sites) as
still screenshots or smooth scroll-through videos for B-roll. F-06 safe:
nothing is fabricated — the browser renders the live page and we record it.
Every artifact gets a `.provenance.json` sidecar with the source URL.
"""

from __future__ import annotations

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


class GithubPageCapture(BaseTool):
    name = "github_page_capture"
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

    agent_skills = ["playwright-recording"]

    capabilities = [
        "page_screenshot",
        "element_screenshot",
        "scroll_record",
    ]

    best_for = [
        "GitHub repo / PR / commit page stills for screenshot_scene B-roll",
        "Scroll-through footage of real documentation or code pages",
        "Automated, reproducible page captures inside the 05 B-roll stage",
    ]

    not_good_for = [
        "Pages behind login (no auth/session handling)",
        "Desktop app capture (use screen_recorder / cap_recorder)",
        "Fabricated UI content (forbidden by F-06 — this tool only renders real URLs)",
    ]

    input_schema = {
        "type": "object",
        "required": ["operation", "url", "output_path"],
        "properties": {
            "operation": {
                "type": "string",
                "enum": ["screenshot", "scroll_record"],
                "description": (
                    "'screenshot' — capture a PNG still of the page or an element, "
                    "'scroll_record' — record an MP4 scrolling through the page"
                ),
            },
            "url": {
                "type": "string",
                "description": "Real page URL to capture (e.g. a GitHub repo/PR/commit page)",
            },
            "output_path": {
                "type": "string",
                "description": "Output file path (.png for screenshot, .mp4 for scroll_record)",
            },
            "selector": {
                "type": "string",
                "description": "Optional CSS selector — screenshot only that element",
            },
            "full_page": {
                "type": "boolean",
                "default": False,
                "description": "Screenshot the full scrollable page instead of the viewport",
            },
            "dark_mode": {
                "type": "boolean",
                "default": True,
                "description": "Emulate prefers-color-scheme: dark (matches the channel's dark theme)",
            },
            "viewport": {
                "type": "object",
                "description": "Viewport size (default 1920x1080)",
                "properties": {
                    "width": {"type": "integer"},
                    "height": {"type": "integer"},
                },
            },
            "settle_seconds": {
                "type": "number",
                "default": 2.0,
                "description": "Wait after page load before capturing",
            },
            "scroll_step_px": {
                "type": "integer",
                "default": 300,
                "description": "Pixels per scroll step (scroll_record only)",
            },
            "scroll_interval_seconds": {
                "type": "number",
                "default": 0.6,
                "description": "Pause between scroll steps (scroll_record only)",
            },
            "max_duration_seconds": {
                "type": "integer",
                "default": 45,
                "description": "Hard cap on scroll recording length",
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
            "url": {"type": "string"},
            "duration_seconds": {"type": "number"},
        },
    }

    resource_profile = ResourceProfile(
        cpu_cores=2, ram_mb=1024, vram_mb=0, disk_mb=200, network_required=True,
    )

    side_effects = ["creates_file", "network_request"]

    def execute(self, inputs: dict[str, Any]) -> ToolResult:
        operation = inputs["operation"]
        if operation == "screenshot":
            return self._screenshot(inputs)
        if operation == "scroll_record":
            return self._scroll_record(inputs)
        return ToolResult(
            success=False,
            error=f"Unknown operation: {operation}. Valid: screenshot, scroll_record",
        )

    def _new_context_kwargs(self, inputs: dict[str, Any]) -> dict[str, Any]:
        viewport = inputs.get("viewport") or dict(DEFAULT_VIEWPORT)
        kwargs: dict[str, Any] = {"viewport": viewport}
        if inputs.get("dark_mode", True):
            kwargs["color_scheme"] = "dark"
        return kwargs

    def _screenshot(self, inputs: dict[str, Any]) -> ToolResult:
        from playwright.sync_api import sync_playwright

        url = inputs["url"]
        output_path = Path(inputs["output_path"])
        output_path.parent.mkdir(parents=True, exist_ok=True)
        settle = float(inputs.get("settle_seconds", 2.0))
        start = time.time()

        try:
            with sync_playwright() as p:
                browser = p.chromium.launch()
                context = browser.new_context(**self._new_context_kwargs(inputs))
                page = context.new_page()
                page.goto(url, wait_until="networkidle", timeout=60000)
                page.wait_for_timeout(int(settle * 1000))

                selector = inputs.get("selector")
                if selector:
                    element = page.locator(selector).first
                    element.screenshot(path=str(output_path))
                else:
                    page.screenshot(
                        path=str(output_path),
                        full_page=bool(inputs.get("full_page", False)),
                    )
                context.close()
                browser.close()
        except Exception as exc:
            return ToolResult(success=False, error=f"Screenshot failed: {exc}")

        provenance = write_provenance(output_path, {
            "tool": self.name,
            "capture_kind": "real_page_screenshot",
            "url": url,
            "selector": inputs.get("selector"),
            "full_page": bool(inputs.get("full_page", False)),
            "dark_mode": bool(inputs.get("dark_mode", True)),
        })

        return ToolResult(
            success=True,
            data={
                "output_path": str(output_path),
                "provenance_path": str(provenance),
                "url": url,
            },
            artifacts=[str(output_path)],
            duration_seconds=round(time.time() - start, 1),
        )

    def _scroll_record(self, inputs: dict[str, Any]) -> ToolResult:
        url = inputs["url"]
        output_path = Path(inputs["output_path"])
        settle = float(inputs.get("settle_seconds", 2.0))
        step_px = int(inputs.get("scroll_step_px", 300))
        interval = float(inputs.get("scroll_interval_seconds", 0.6))
        max_duration = int(inputs.get("max_duration_seconds", 45))
        fps = int(inputs.get("fps", 30))
        dark_mode = bool(inputs.get("dark_mode", True))
        viewport = inputs.get("viewport") or dict(DEFAULT_VIEWPORT)
        start = time.time()

        def action(page: Any) -> None:
            if dark_mode:
                page.emulate_media(color_scheme="dark")
            page.goto(url, wait_until="networkidle", timeout=60000)
            page.wait_for_timeout(int(settle * 1000))
            deadline = time.time() + max_duration
            while time.time() < deadline:
                at_bottom = page.evaluate(
                    "() => window.innerHeight + window.scrollY >= document.body.scrollHeight - 4"
                )
                if at_bottom:
                    break
                page.evaluate(
                    "(px) => window.scrollBy({ top: px, behavior: 'smooth' })",
                    step_px,
                )
                page.wait_for_timeout(int(interval * 1000))
            page.wait_for_timeout(1500)

        try:
            final_path = record_page_video(action, output_path, viewport, fps)
        except Exception as exc:
            return ToolResult(success=False, error=f"Scroll recording failed: {exc}")

        provenance = write_provenance(final_path, {
            "tool": self.name,
            "capture_kind": "real_page_scroll_record",
            "url": url,
            "dark_mode": dark_mode,
            "scroll_step_px": step_px,
            "scroll_interval_seconds": interval,
        })

        return ToolResult(
            success=True,
            data={
                "output_path": str(final_path),
                "provenance_path": str(provenance),
                "url": url,
                "duration_seconds": probe_duration_seconds(final_path),
            },
            artifacts=[str(final_path)],
            duration_seconds=round(time.time() - start, 1),
        )
