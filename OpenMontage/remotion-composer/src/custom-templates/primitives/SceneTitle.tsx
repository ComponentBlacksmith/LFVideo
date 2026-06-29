import React from 'react';
import {interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../theme/ThemeContext';

interface Props {
	title: string;
	eyebrow?: string; // 上方小标注
	startFrame?: number;
	/** 标题最大宽度（px）。超出则平衡换成两行（上行稍宽）。 */
	maxWidth?: number;
}

// ---- 动画时长与强度常量 ----
const ENTER_FRAMES = 18; // 入场收敛时长
const EXIT_FRAMES = 14; // 出场坍缩时长
const ENTER_JITTER = 16; // 入场最大抖动幅度(px)
const EXIT_JITTER = 22; // 出场最大抖动幅度(px)

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t: number) => t * t * t;
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

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

	// ---- 入场 H01：噪声抖动收敛 ----
	const tIn = clamp01((frame - startFrame) / ENTER_FRAMES);
	const p = easeOutCubic(tIn);
	const enterOpacity = Math.min(1, p * 1.5);
	const enterBrightness = 1 + (1 - p) * 0.5;
	const enterAmp = (1 - p) * ENTER_JITTER;

	// ---- 出场 H10：量子坍缩 ----
	const tOut = clamp01((frame - (durationInFrames - EXIT_FRAMES)) / EXIT_FRAMES);
	const c = easeInCubic(tOut);
	const exitOpacity = 1 - c;
	const collapseScaleY = 1 - c * 0.98; // 坍缩成一条细线
	const exitBrightness = 1 + c * 1.6; // 坍缩瞬间亮度闪烁
	const exitAmp = c * EXIT_JITTER;

	// ---- 合成 ----
	const opacity = enterOpacity * exitOpacity;
	const brightness = enterBrightness * exitBrightness;
	const amp = Math.max(enterAmp, exitAmp);
	// 每帧确定性随机抖动（噪声感，导出可复现）。
	const jitterX = (random(`title-jx-${frame}`) * 2 - 1) * amp;
	const jitterY = (random(`title-jy-${frame}`) * 2 - 1) * amp;

	// 下划线随入场收敛展开；出场坍缩时一并收回。
	const lineWidth = interpolate(p, [0, 1], [0, 120]) * (1 - c);

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
				transform: `translate(${jitterX}px, ${jitterY}px) scaleY(${collapseScaleY})`,
				transformOrigin: 'right top',
				filter: `brightness(${brightness})`,
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
					textShadow: '0 2px 12px rgba(0,0,0,0.45)',
				}}
			>
				{lines.map((ln, i) => (
					<div key={i} style={{whiteSpace: 'nowrap'}}>
						{ln}
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
