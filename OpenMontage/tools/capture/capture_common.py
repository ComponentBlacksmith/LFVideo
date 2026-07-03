"""Shared helpers for Playwright-based B-roll capture tools.

Used by github_page_capture, scripted_terminal_recorder, and
chat_replay_recorder. Handles headless recording, WebM -> MP4 conversion,
and provenance sidecar files (TAD-01 / F-06 audit trail: every synthetic
or automated capture records where its content came from).
"""

from __future__ import annotations

import json
import shutil
import subprocess
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable


DEFAULT_VIEWPORT = {"width": 1920, "height": 1080}


def record_page_video(
    action: Callable[[Any], None],
    output_path: Path,
    viewport: dict[str, int] | None = None,
    fps: int = 30,
) -> Path:
    """Record a headless Chromium page while `action(page)` runs.

    Returns the final video path (MP4 if ffmpeg is available, else WebM).
    """
    from playwright.sync_api import sync_playwright

    viewport = viewport or dict(DEFAULT_VIEWPORT)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="broll-rec-") as tmp:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            context = browser.new_context(
                viewport=viewport,
                record_video_dir=tmp,
                record_video_size=viewport,
            )
            page = context.new_page()
            action(page)
            video = page.video
            context.close()
            webm_path = Path(video.path()) if video else None
            browser.close()

        if webm_path is None or not webm_path.exists():
            raise RuntimeError("Playwright produced no video file")

        return _finalize_video(webm_path, output_path, fps)


def _finalize_video(webm_path: Path, output_path: Path, fps: int) -> Path:
    """Convert WebM to MP4 via ffmpeg, or fall back to copying the WebM."""
    if shutil.which("ffmpeg") and output_path.suffix.lower() == ".mp4":
        result = subprocess.run(
            [
                "ffmpeg", "-y", "-i", str(webm_path),
                "-c:v", "libx264", "-crf", "20", "-preset", "medium",
                "-r", str(fps), "-pix_fmt", "yuv420p",
                "-movflags", "faststart",
                str(output_path),
            ],
            capture_output=True, text=True, timeout=600,
        )
        if result.returncode == 0 and output_path.exists():
            return output_path
    fallback = output_path.with_suffix(".webm")
    shutil.copy2(webm_path, fallback)
    return fallback


def write_provenance(artifact_path: Path, data: dict[str, Any]) -> Path:
    """Write a `<artifact>.provenance.json` sidecar next to an artifact."""
    sidecar = artifact_path.with_suffix(artifact_path.suffix + ".provenance.json")
    payload = {
        "captured_at": datetime.now(timezone.utc).isoformat(),
        **data,
    }
    sidecar.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8",
    )
    return sidecar


def probe_duration_seconds(path: Path) -> float | None:
    """Get media duration via ffprobe, or None if unavailable."""
    if not shutil.which("ffprobe"):
        return None
    try:
        result = subprocess.run(
            [
                "ffprobe", "-v", "error",
                "-show_entries", "format=duration",
                "-of", "csv=p=0", str(path),
            ],
            capture_output=True, text=True, timeout=30,
        )
        return round(float(result.stdout.strip()), 2)
    except (ValueError, subprocess.SubprocessError):
        return None


def now_stamp() -> str:
    return time.strftime("%Y%m%d-%H%M%S")
