"""Golden regression tests for tools/subtitle/segmentation.py.

Each case pins one of the caption failure modes we shipped fixes for; if a
future rule tweak reintroduces flashing fragments, dash run-ons, ASCII timing
drift, or sub-minimum pages, one of these fails before the video does.
"""

from __future__ import annotations

from tools.subtitle.segmentation import (
    CLAUSE_END,
    MIN_CHUNK_CHARS,
    PaginationOptions,
    chunk_text,
    merge_short_groups,
    paginate,
    speech_weight,
    split_words,
    strip_leading_punct,
    strip_trailing_punct,
    visible_len,
)


def _words(*items: tuple[str, float, float]) -> list[dict]:
    return [{"word": w, "start": s, "end": e} for w, s, e in items]


class TestChunkText:
    def test_no_fragment_below_minimum(self):
        # 顿号/冒号 used to strand 2-3 char fragments like "三步：" on screen.
        for text in [
            "三步：让 AI 找技术路径，对着路径搭引擎，最后跑一集出来验证。",
            "第一、第二、第三，都要覆盖。",
            "四条：全是 React 加 CSS。",
        ]:
            for chunk in chunk_text(text):
                assert visible_len(chunk) >= MIN_CHUNK_CHARS, (text, chunk)

    def test_trailing_fragment_merges_backwards(self):
        # A short sentence tail ("齐活。") must fold into the previous chunk.
        chunks = chunk_text("把参数配好之后重新跑一遍流水线，齐活。")
        assert len(chunks) == 1

    def test_dash_is_a_break_point(self):
        assert "—" in CLAUSE_END
        chunks = chunk_text("你看 Remotion 这行——每一帧都是一个 React 组件渲染出来的画面。")
        assert len(chunks) >= 2

    def test_reassembles_to_original(self):
        text = "原理通了，接着把引擎搭起来。引擎不用手写，跟 AI 把配置和模板对齐就行。"
        assert "".join(chunk_text(text)) == text


class TestStripTrailingPunct:
    def test_neutral_stops_dropped(self):
        # Broadcast convention: the page break itself marks the pause.
        assert strip_trailing_punct("接着把引擎搭起来。") == "接着把引擎搭起来"
        assert strip_trailing_punct("原理通了，") == "原理通了"
        assert strip_trailing_punct("三步：") == "三步"

    def test_expressive_marks_kept(self):
        assert strip_trailing_punct("真的吗？") == "真的吗？"
        assert strip_trailing_punct("齐活！") == "齐活！"
        assert strip_trailing_punct("等等…") == "等等…"

    def test_runs_of_stops_dropped(self):
        assert strip_trailing_punct("对齐就行。。") == "对齐就行"

    def test_stray_leading_dash_dropped(self):
        # A —— dash split across pages leaves its second half stranded.
        assert strip_leading_punct("—这就是自动化生产") == "这就是自动化生产"


class TestSpeechWeight:
    def test_ascii_run_counts_as_syllables_not_chars(self):
        # "Remotion" is 8 chars but ~3 syllables; raw len() drifted timing.
        assert speech_weight("Remotion") < len("Remotion")

    def test_cjk_glyph_is_one_syllable(self):
        assert speech_weight("渲染自动化") == 5.0

    def test_punctuation_carries_no_weight(self):
        assert speech_weight("三步：") == speech_weight("三步")


class TestPagination:
    def test_sentence_end_breaks_page(self):
        words = _words(("第一句话说完了。", 0.0, 2.0), ("第二句话开始了。", 2.0, 4.0))
        pages = split_words(words, PaginationOptions())
        assert len(pages) == 2

    def test_cjk_char_budget_respected(self):
        opts = PaginationOptions()
        words = _words(*((f"这是第{i}个很长的分句，", i * 2.0, i * 2.0 + 2.0) for i in range(6)))
        for page in paginate(words, opts):
            text = "".join(w["word"].strip() for w in page)
            assert len(text) <= opts.max_chars_cjk * opts.max_lines

    def test_flash_page_merges_into_previous(self):
        # A 0.5s tail page must merge back instead of blinking on screen.
        groups = [
            _words(("把流水线重新跑一遍，", 0.0, 3.0)),
            _words(("齐活。", 3.0, 3.5)),
        ]
        merged = merge_short_groups(groups, PaginationOptions())
        assert len(merged) == 1
        assert merged[0][-1]["word"] == "齐活。"

    def test_no_merge_across_real_pause(self):
        # The pause is exactly why the break exists — never undo it.
        groups = [
            _words(("上一句说完了。", 0.0, 3.0)),
            _words(("停顿后。", 4.0, 4.8)),
        ]
        merged = merge_short_groups(groups, PaginationOptions())
        assert len(merged) == 2

    def test_no_merge_past_char_budget(self):
        opts = PaginationOptions()
        long_page = _words(("这一页已经装满了整整四十个汉字的预算上限完全没有空间了" * 2, 0.0, 5.0))
        short_page = _words(("再来一点。", 5.0, 5.5))
        merged = merge_short_groups([long_page, short_page], opts)
        assert len(merged) == 2

    def test_paginated_pages_meet_min_duration(self):
        opts = PaginationOptions()
        words = _words(
            ("渲染要自动化，", 0.0, 1.5),
            ("先把视频变成代码。", 1.5, 3.2),
            ("三步走。", 3.2, 3.8),
        )
        for page in paginate(words, opts):
            assert page[-1]["end"] - page[0]["start"] >= opts.min_duration_s
