"""
08-subtitle 字幕校对脚本：用 04 脚本原文替换 Whisper 误识别文本，保留时间轴。

策略：
1. 读取 Whisper 生成的 SRT（拿时间轴）
2. 读取 06-tts/synthesize.py 中的 NARRATION_SEGMENTS（拿原文）
3. 对每个段落，按 Whisper 给出的时间切分数量，将原文均匀分割为相同数量的字幕条
4. 保留 Whisper 时间轴，替换文本为原文片段

用法：python proofread_srt.py
"""

import json
import re
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
ASSETS_DIR = SCRIPT_DIR / "assets"
TTS_DIR = SCRIPT_DIR.parent / "06-tts"

# 从 synthesize.py 导入口播原文
sys.path.insert(0, str(TTS_DIR))
from synthesize import NARRATION_SEGMENTS

MAX_CHARS_PER_LINE = 20


def parse_srt(srt_path: Path) -> list[dict]:
    """解析 SRT 文件为结构化条目"""
    content = srt_path.read_text(encoding="utf-8")
    entries = []
    blocks = content.strip().split("\n\n")
    for block in blocks:
        lines = block.strip().split("\n")
        if len(lines) < 3:
            continue
        index = int(lines[0])
        time_line = lines[1]
        text = "\n".join(lines[2:])
        start_str, end_str = time_line.split(" --> ")
        entries.append({
            "index": index,
            "start": start_str.strip(),
            "end": end_str.strip(),
            "text": text,
        })
    return entries


def timestamp_to_seconds(ts: str) -> float:
    """SRT 时间戳转秒"""
    h, m, rest = ts.split(":")
    s, ms = rest.split(",")
    return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000


def seconds_to_timestamp(secs: float) -> str:
    """秒转 SRT 时间戳"""
    h = int(secs // 3600)
    m = int((secs % 3600) // 60)
    s = int(secs % 60)
    ms = int((secs % 1) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def split_text_for_subtitle(text: str, n_entries: int) -> list[str]:
    """
    将长文本拆分为 n_entries 条字幕。
    按标点符号（。！？，；、）优先断句，否则按字数均分。
    """
    if n_entries <= 0:
        return []
    if n_entries == 1:
        return [text]

    # 按中文标点断句
    sentences = re.split(r'([。！？；])', text)
    # 重新组合：将标点附到前一句
    merged = []
    for i in range(0, len(sentences) - 1, 2):
        merged.append(sentences[i] + (sentences[i + 1] if i + 1 < len(sentences) else ""))
    if len(sentences) % 2 == 1 and sentences[-1]:
        merged.append(sentences[-1])

    # 如果句子数量足够，按句子分配
    if len(merged) >= n_entries:
        # 均匀分配句子到 n_entries 组
        result = []
        per_group = len(merged) / n_entries
        for i in range(n_entries):
            start_idx = int(i * per_group)
            end_idx = int((i + 1) * per_group)
            group_text = "".join(merged[start_idx:end_idx]).strip()
            if group_text:
                result.append(group_text)
        # 补齐或截断
        while len(result) < n_entries:
            result.append("")
        return result[:n_entries]
    else:
        # 句子不够多，按字数均分
        chars_per_entry = max(1, len(text) // n_entries)
        result = []
        pos = 0
        for i in range(n_entries):
            if i == n_entries - 1:
                chunk = text[pos:]
            else:
                # 尝试在标点处断开
                target_end = pos + chars_per_entry
                # 在 target_end 附近找标点
                best_break = target_end
                for offset in range(min(10, chars_per_entry // 2)):
                    for check_pos in [target_end + offset, target_end - offset]:
                        if 0 < check_pos < len(text) and text[check_pos - 1] in "。！？，；、":
                            best_break = check_pos
                            break
                    else:
                        continue
                    break
                chunk = text[pos:best_break]
                pos = best_break
            result.append(chunk.strip())
        return result


def format_subtitle_text(text: str) -> str:
    """格式化字幕文本：每行不超过 MAX_CHARS_PER_LINE"""
    if len(text) <= MAX_CHARS_PER_LINE:
        return text
    # 最多两行
    line1 = text[:MAX_CHARS_PER_LINE]
    line2 = text[MAX_CHARS_PER_LINE:MAX_CHARS_PER_LINE * 2]
    if line2:
        return f"{line1}\n{line2}"
    return line1


def proofread():
    """主函数：校对字幕"""
    # 读取 Whisper SRT
    srt_path = ASSETS_DIR / "ep02-video-render.srt"
    entries = parse_srt(srt_path)
    print(f"Loaded {len(entries)} SRT entries")

    # 读取 manifest 获取段落顺序和时长
    manifest_path = TTS_DIR / "assets" / "manifest.json"
    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    # 读取 subtitle_manifest 获取每段字幕条数
    sub_manifest_path = ASSETS_DIR / "subtitle_manifest.json"
    with open(sub_manifest_path, "r", encoding="utf-8") as f:
        sub_manifest = json.load(f)

    entries_by_segment = sub_manifest["entries_by_segment"]

    # 按段落顺序处理
    proofread_entries = []
    entry_idx = 0
    cumulative_offset = 0.0

    for seg_info in manifest["segments"]:
        seg_id = seg_info["segment_id"]
        n_entries = entries_by_segment.get(seg_id, 0)
        original_text = NARRATION_SEGMENTS.get(seg_id, "")

        if n_entries == 0 or not original_text:
            cumulative_offset += seg_info["duration_seconds"]
            continue

        # 获取该段落的 Whisper 时间轴条目
        segment_entries = entries[entry_idx:entry_idx + n_entries]
        entry_idx += n_entries

        # 用原文拆分为相同数量的字幕条
        text_chunks = split_text_for_subtitle(original_text, n_entries)

        # 组合：Whisper 时间轴 + 原文
        for i, (whisper_entry, text_chunk) in enumerate(zip(segment_entries, text_chunks)):
            if not text_chunk:
                continue
            proofread_entries.append({
                "index": len(proofread_entries) + 1,
                "start": whisper_entry["start"],
                "end": whisper_entry["end"],
                "text": format_subtitle_text(text_chunk),
            })

        cumulative_offset += seg_info["duration_seconds"]

    # 写入校对后的 SRT
    output_srt = ASSETS_DIR / "ep02-video-render-proofread.srt"
    with open(output_srt, "w", encoding="utf-8") as f:
        for entry in proofread_entries:
            f.write(f"{entry['index']}\n")
            f.write(f"{entry['start']} --> {entry['end']}\n")
            f.write(f"{entry['text']}\n\n")

    # 写入校对后的 VTT
    output_vtt = ASSETS_DIR / "ep02-video-render-proofread.vtt"
    with open(output_vtt, "w", encoding="utf-8") as f:
        f.write("WEBVTT\n\n")
        for entry in proofread_entries:
            start_vtt = entry["start"].replace(",", ".")
            end_vtt = entry["end"].replace(",", ".")
            f.write(f"{start_vtt} --> {end_vtt}\n")
            f.write(f"{entry['text']}\n\n")

    print(f"\nDONE! {len(proofread_entries)} proofread entries generated.")
    print(f"SRT: {output_srt}")
    print(f"VTT: {output_vtt}")

    # 更新 manifest
    sub_manifest["proofread"] = True
    sub_manifest["proofread_entries"] = len(proofread_entries)
    sub_manifest["proofread_files"] = {
        "srt": "ep02-video-render-proofread.srt",
        "vtt": "ep02-video-render-proofread.vtt",
    }
    with open(sub_manifest_path, "w", encoding="utf-8") as f:
        json.dump(sub_manifest, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    proofread()
