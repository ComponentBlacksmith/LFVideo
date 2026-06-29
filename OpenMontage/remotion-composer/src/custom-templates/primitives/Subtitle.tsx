import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../theme/ThemeContext';
import {clamp01, easeOutCubic} from './textfx-utils';

interface Props {
	text: string;
	// 距底部距离
	bottom?: number;
	maxWidth?: number;
	startFrame?: number;
}

// 入场 #33：墨水晕染 (Ink Bleed) — blur:20(1-p)² → 0, opacity 0→1
// 出场 #40：余弦摆入 (Cosine Pendulum) — rotate 振荡加剧 + 淡出
const ENTER_FRAMES = 20;
const EXIT_FRAMES = 16;

export const Subtitle: React.FC<Props> = ({
	text,
	bottom = 80,
	maxWidth = 1400,
	startFrame = 0,
}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const {colors, FONT_SIZE, RADIUS} = useTheme();

	// ---- 入场 #33：墨水晕染 ----
	const tIn = clamp01((frame - startFrame) / ENTER_FRAMES);
	const p = easeOutCubic(tIn);
	const inkBlur = 20 * (1 - p) * (1 - p);
	const enterOpacity = p;

	// ---- 出场 #40：余弦摆入 ----
	const tOut = clamp01((frame - (durationInFrames - EXIT_FRAMES)) / EXIT_FRAMES);
	const tt = 1 - tOut; // 1→0 during exit
	const pendulumRot = 32 * Math.cos(frame * 0.2) * Math.exp(-3 * tt);
	const exitOpacity = clamp01(tt * 3);

	// ---- 合成 ----
	const opacity = enterOpacity * exitOpacity;
	const isExiting = tOut > 0 && tOut < 1;

	return (
		<div
			style={{
				position: 'absolute',
				bottom,
				left: '50%',
				transform: `translateX(-50%) rotate(${isExiting ? pendulumRot : 0}deg)`,
				transformOrigin: 'top center',
				maxWidth,
				padding: '16px 32px',
				background: 'rgba(0,0,0,0.55)',
				borderRadius: RADIUS.md,
				fontSize: FONT_SIZE.bodyLg,
				lineHeight: 1.5,
				color: colors.text.primary,
				textAlign: 'center',
				fontWeight: 600,
				letterSpacing: 0.5,
				opacity,
				filter: `blur(${inkBlur}px)`,
				textShadow: `0 0 ${inkBlur}px rgba(40,90,140,0.6)`,
			}}
		>
			{text}
		</div>
	);
};
