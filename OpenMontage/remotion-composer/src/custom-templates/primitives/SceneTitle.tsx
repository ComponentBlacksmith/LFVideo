import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../theme/ThemeContext';
import {
	clamp01,
	lerp,
	easeOutCubic,
	easeInCubic,
	Scramble,
} from './textfx-utils';

interface Props {
	title: string;
	eyebrow?: string; // 上方小标注
	startFrame?: number;
	/** 标题最大宽度（px）。超出则平衡换成两行（上行稍宽）。 */
	maxWidth?: number;
}

// ---- 动画时长常量（来自 theme-glitch timing: inF=20, outF=16）----
const ENTER_FRAMES = 20;
const EXIT_FRAMES = 16;

// 用 canvas 精确测量文字宽度，做「两行宽度尽量接近、上行稍宽」的平衡换行。
function computeBalancedLines(
	text: string,
	cssFont: string,
	maxWidth: number,
): string[] {
	if (typeof document === 'undefined') return [text];
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	if (!ctx) return [text];
	ctx.font = cssFont;
	const measure = (s: string) => ctx.measureText(s).width;

	if (measure(text) <= maxWidth) return [text];

	let best: {i: number; score: number} | null = null;
	for (let i = 1; i < text.length; i++) {
		const wTop = measure(text.slice(0, i));
		const wBottom = measure(text.slice(i));
		if (wTop > maxWidth || wBottom > maxWidth) continue;
		const diff = wTop - wBottom;
		// 上行稍宽(diff>=0)优先；下行更宽时重罚，避免「头轻脚重」。
		const score = diff >= 0 ? diff : -diff * 3;
		if (best === null || score < best.score) best = {i, score};
	}
	if (!best) {
		const mid = Math.ceil(text.length / 2);
		return [text.slice(0, mid), text.slice(mid)];
	}
	return [text.slice(0, best.i), text.slice(best.i)];
}

/**
 * 屏幕右上角的「章节标题」层。
 *  - 自动测量宽度 + 平衡换行（上行稍宽）。
 *  - 入场 H01：噪声抖动收敛（easeOutCubic 驱动，随机抖动渐收 + 提亮渐落）。
 *  - 出场 H10：量子坍缩（垂直坍缩成一条线 + 抖动加剧 + 亮度闪烁 + 淡出）。
 * 在最终效果里由 Explainer 放在透视矩阵之外，因此不随场景变换。
 */
export const SceneTitle: React.FC<Props> = ({
	title,
	eyebrow,
	startFrame = 0,
	maxWidth = 900,
}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const {colors, FONT_SIZE, SPACING, fonts} = useTheme();

	const cssFont = `900 ${FONT_SIZE.title}px ${fonts.family}`;
	const lines = React.useMemo(
		() => computeBalancedLines(title, cssFont, maxWidth),
		[title, cssFont, maxWidth],
	);

	// ---- 入场 #72：乱码解码 (Scramble / Decode) ----
	const tIn = clamp01((frame - startFrame) / ENTER_FRAMES);
	const decodeProgress = easeOutCubic(tIn);
	const enterOpacity = Math.min(1, tIn * 2);
	const isEntering = tIn > 0 && tIn < 1;

	// ---- 出场 #92：投影成形 (Long-Shadow Cast) ----
	const tOut = clamp01((frame - (durationInFrames - EXIT_FRAMES)) / EXIT_FRAMES);
	const exitPresence = 1 - easeOutCubic(tOut); // 1→0
	const exitOpacity = clamp01((1 - tOut) * 2);
	const shadowLen = Math.round(lerp(4, 28, tOut)); // shadow grows on exit
	const exitShadow = Array.from(
		{length: shadowLen},
		(_, k) => `${k + 1}px ${k + 1}px 0 rgba(0,0,0,0.35)`,
	).join(', ');

	// ---- 合成 ----
	const opacity = enterOpacity * exitOpacity;
	const lineWidth = interpolate(decodeProgress, [0, 1], [0, 120]) * exitPresence;

	return (
		<div
			style={{
				position: 'absolute',
				top: SPACING.lg,
				right: SPACING.xl,
				maxWidth,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'flex-end',
				textAlign: 'right',
				opacity,
				transform: 'none',
				textShadow: tOut > 0 ? exitShadow : '0 2px 12px rgba(0,0,0,0.45)',
				pointerEvents: 'none',
			}}
		>
			{eyebrow && (
				<div
					style={{
						fontSize: FONT_SIZE.caption,
						letterSpacing: 4,
						color: colors.text.muted,
						marginBottom: SPACING.xs,
						textTransform: 'uppercase',
						fontWeight: 600,
					}}
				>
					{eyebrow}
				</div>
			)}
			<div
				style={{
					fontSize: FONT_SIZE.title,
					fontWeight: 900,
					color: colors.text.primary,
					lineHeight: 1.15,
					marginBottom: SPACING.sm,
				}}
			>
				{lines.map((ln, i) => (
					<div key={i} style={{whiteSpace: 'nowrap'}}>
						{isEntering ? (
							<Scramble
								text={ln}
								progress={decodeProgress}
								frame={frame}
								seed={i * 100 + 42}
							/>
						) : (
							ln
						)}
					</div>
				))}
			</div>
			<div
				style={{
					width: lineWidth,
					height: 4,
					background: `linear-gradient(90deg, ${colors.accent[0]}, ${colors.accent[1]})`,
					borderRadius: 2,
				}}
			/>
		</div>
	);
};
