import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Word-level caption for TikTok-style highlight display
export interface WordCaption {
  word: string;
  startMs: number;
  endMs: number;
}

// Pre-paged caption: one on-screen page with its word-level timings. Produced
// by the 07 props generator via tools/subtitle/segmentation.py — the single
// source of truth for segmentation — so the renderer never re-segments.
export interface CaptionPageInput {
  startMs: number;
  endMs: number;
  words: WordCaption[];
}

export type CaptionsInput = WordCaption[] | CaptionPageInput[];

export function isPagedCaptions(items: CaptionsInput): items is CaptionPageInput[] {
  return items.length > 0 && Array.isArray((items[0] as CaptionPageInput).words);
}

interface CaptionOverlayProps {
  words: CaptionsInput;
  // Hard cap on words per page (Latin scripts); CJK is governed by chars.
  wordsPerPage?: number;
  // Max characters per page before forcing a break (Latin / CJK).
  maxCharsLatin?: number;
  maxCharsCjk?: number;
  // Silence gap (ms) between words that triggers a natural break.
  pauseThresholdMs?: number;
  // Max on-screen duration (ms) for a single page.
  maxDurationMs?: number;
  // Min on-screen duration (ms); shorter pages merge into a neighbour.
  minDurationMs?: number;
  fontSize?: number;
  color?: string;
  highlightColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
}

interface CaptionPage {
  words: WordCaption[];
  startMs: number;
  endMs: number;
}

// Punctuation that ends a sentence (strong break) / clause (soft break).
// Legacy fallback only: pre-paged captions are segmented upstream by
// tools/subtitle/segmentation.py (the single source of truth). Keep these
// sets in sync with that module for compositions still passing flat words.
const SENTENCE_END = new Set([".", "!", "?", "…", "。", "！", "？"]);
const CLAUSE_END = new Set([",", ";", ":", "，", "、", "；", "：", "—", "―"]);

function isCJKText(text: string): boolean {
  const glyphs = [...text].filter((c) => !/\s/.test(c));
  if (glyphs.length === 0) return false;
  const cjk = glyphs.filter((c) => /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7a3]/.test(c)).length;
  return cjk / glyphs.length >= 0.3;
}

interface PageBreakOptions {
  wordsPerPage: number;
  maxCharsLatin: number;
  maxCharsCjk: number;
  pauseThresholdMs: number;
  maxDurationMs: number;
  minDurationMs: number;
  maxLines: number;
}

function buildPages(words: WordCaption[], opts: PageBreakOptions): CaptionPage[] {
  if (words.length === 0) return [];
  const cjk = isCJKText(words.map((w) => w.word).join(""));
  const join = (items: WordCaption[]) =>
    cjk
      ? items.map((w) => w.word.trim()).join("")
      : items.map((w) => w.word.trim()).join(" ");
  const charLimit = (cjk ? opts.maxCharsCjk : opts.maxCharsLatin) * Math.max(opts.maxLines, 1);

  const pages: CaptionPage[] = [];
  let buf: WordCaption[] = [];
  const flush = () => {
    if (buf.length === 0) return;
    pages.push({
      words: buf,
      startMs: buf[0].startMs,
      endMs: buf[buf.length - 1].endMs,
    });
    buf = [];
  };

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const wtext = w.word.trim();

    if (buf.length > 0) {
      const overWords = !cjk && buf.length >= opts.wordsPerPage;
      const overChars = join([...buf, w]).length > charLimit;
      const overTime = w.endMs - buf[0].startMs > opts.maxDurationMs;
      if (overWords || overChars || overTime) flush();
    }

    buf.push(w);
    if (i === words.length - 1) break;

    const trailing = wtext.slice(-1);
    const gap = words[i + 1].startMs - w.endMs;
    if (SENTENCE_END.has(trailing)) {
      flush();
    } else if (gap >= opts.pauseThresholdMs && buf.length >= 2) {
      flush();
    } else if (CLAUSE_END.has(trailing) && join(buf).length >= charLimit * 0.6) {
      flush();
    }
  }
  flush();

  // Merge pages that would flash by into the previous page when the combined
  // page still fits the char/time budget and no real speech pause separates
  // them — a lone "齐活。" blinking for half a second reads as a glitch.
  const merged: CaptionPage[] = [];
  for (const page of pages) {
    const prev = merged[merged.length - 1];
    const dur = page.endMs - page.startMs;
    if (prev && dur < opts.minDurationMs) {
      const gap = page.startMs - prev.endMs;
      const fitsChars = join([...prev.words, ...page.words]).length <= charLimit;
      const fitsTime = page.endMs - prev.startMs <= opts.maxDurationMs;
      if (gap < opts.pauseThresholdMs && fitsChars && fitsTime) {
        prev.words = [...prev.words, ...page.words];
        prev.endMs = page.endMs;
        continue;
      }
    }
    merged.push(page);
  }
  return merged;
}

const PageRenderer: React.FC<{
  page: CaptionPage;
  fontSize: number;
  color: string;
  highlightColor: string;
  backgroundColor: string;
  fontFamily: string;
}> = ({ page, fontSize, color, highlightColor, backgroundColor, fontFamily }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentMs = page.startMs + (frame / fps) * 1000;
  // CJK scripts are written without spaces between glyphs.
  const cjk = isCJKText(page.words.map((w) => w.word).join(""));
  const wordSep = cjk ? "" : " ";

  // Spring entrance
  const entrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 120 },
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 80,
      }}
    >
      <div
        style={{
          opacity: entrance,
          transform: `translateY(${interpolate(entrance, [0, 1], [20, 0])}px)`,
          backgroundColor,
          borderRadius: 12,
          padding: "14px 28px",
          maxWidth: "80%",
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize,
            fontWeight: 700,
            fontFamily,
            lineHeight: 1.4,
            whiteSpace: "pre-wrap",
          }}
        >
          {page.words.map((w, i) => {
            const isActive = w.startMs <= currentMs && w.endMs > currentMs;
            const isPast = w.endMs <= currentMs;
            return (
              <span
                key={`${w.startMs}-${i}`}
                style={{
                  color: isActive ? highlightColor : isPast ? color : `${color}99`,
                  transition: "none", // CSS transitions forbidden in Remotion
                  textShadow: isActive
                    ? `0 0 20px ${highlightColor}66, 0 2px 4px rgba(0,0,0,0.5)`
                    : "0 2px 4px rgba(0,0,0,0.5)",
                }}
              >
                {w.word}{i < page.words.length - 1 ? wordSep : ""}
              </span>
            );
          })}
        </span>
      </div>
    </AbsoluteFill>
  );
};

export const CaptionOverlay: React.FC<CaptionOverlayProps> = ({
  words,
  wordsPerPage = 6,
  maxCharsLatin = 42,
  maxCharsCjk = 20,
  pauseThresholdMs = 500,
  maxDurationMs = 6000,
  minDurationMs = 1200,
  fontSize = 42,
  color = "#F8FAFC",
  highlightColor = "#22D3EE",
  backgroundColor = "rgba(15, 23, 42, 0.75)",
  fontFamily = "Space Grotesk, Inter, system-ui, sans-serif",
}) => {
  const { fps } = useVideoConfig();
  // Pre-paged captions (from the 07 props generator) render as-is; the legacy
  // flat WordCaption[] shape falls back to client-side pagination.
  const pages: CaptionPage[] = isPagedCaptions(words)
    ? words.map((p) => ({ words: p.words, startMs: p.startMs, endMs: p.endMs }))
    : buildPages(words, {
        wordsPerPage,
        maxCharsLatin,
        maxCharsCjk,
        pauseThresholdMs,
        maxDurationMs,
        minDurationMs,
        maxLines: 2,
      });

  return (
    <AbsoluteFill style={{zIndex: 100}}>
      {pages.map((page, i) => {
        const fromFrame = Math.round((page.startMs / 1000) * fps);
        const nextStart = pages[i + 1]?.startMs ?? page.endMs + 500;
        const duration = Math.max(
          1,
          Math.round(((nextStart - page.startMs) / 1000) * fps)
        );

        return (
          <Sequence key={i} from={fromFrame} durationInFrames={duration}>
            <PageRenderer
              page={page}
              fontSize={fontSize}
              color={color}
              highlightColor={highlightColor}
              backgroundColor={backgroundColor}
              fontFamily={fontFamily}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
