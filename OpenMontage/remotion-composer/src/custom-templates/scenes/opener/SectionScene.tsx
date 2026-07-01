import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {z} from 'zod';
import {useTheme} from '../../theme/ThemeContext';
import {glowBlob, accentGradientText} from '../../theme/surfaces';
import {textStyles} from '../../theme/textStyles';

export const sectionSchema = z.object({
	title: z.string(),
	index: z.string().optional(),
	eyebrow: z.string().optional(),
});
export type SectionProps = z.infer<typeof sectionSchema>;

// 章节分隔过渡卡：大号序号 + 章节标题，用于把长片切成清晰的段落。
export const SectionScene: React.FC<SectionProps> = ({title, index, eyebrow}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const theme = useTheme();
	const {colors, fonts, FONT_SIZE, SPACING} = theme;
	const t = textStyles(theme);

	const color = colors.accent[0];
	const enter = spring({fps, frame, config: {damping: 20, stiffness: 90}});
	const opacity = interpolate(enter, [0, 1], [0, 1]);
	const indexScale = spring({fps, frame, config: {damping: 13, stiffness: 100}, from: 0.7, to: 1});
	const lineStart = Math.round(durationInFrames * 0.04);
	const lineW = interpolate(spring({frame: frame - lineStart, fps, config: {damping: 16, stiffness: 80}}), [0, 1], [0, 360]);
	const titleStart = Math.round(durationInFrames * 0.08);
	const titleProgress = spring({frame: frame - titleStart, fps, config: {damping: 20}});
	const fadeOut = interpolate(
		frame,
		[durationInFrames - 15, durationInFrames],
		[1, 0],
		{extrapolateLeft: 'clamp'},
	);

	return (
		<AbsoluteFill
			style={{
				fontFamily: fonts.family,
				justifyContent: 'center',
				alignItems: 'center',
				textAlign: 'center',
				padding: `0 ${SPACING.gutter}px`,
				opacity: opacity * fadeOut,
			}}
		>
			<div style={glowBlob(color, {width: 800, height: 400, intensity: 0.14, blur: 90})} />
			{eyebrow && (
				<div
					style={{
						fontSize: FONT_SIZE.subtitle,
						letterSpacing: 6,
						textTransform: 'uppercase',
						color: colors.text.muted,
						fontWeight: 700,
						marginBottom: SPACING.md,
						opacity: titleProgress,
						textShadow: `0 0 12px ${color}60, 0 1px 4px rgba(0,0,0,0.5)`,
						zIndex: 1,
					}}
				>
					{eyebrow}
				</div>
			)}
			{index && (
				<div
					style={{
						fontSize: 220,
						fontWeight: 900,
						lineHeight: 0.9,
						letterSpacing: -6,
						transform: `scale(${indexScale})`,
						...accentGradientText(theme),
						filter: `drop-shadow(0 0 24px ${color}50) drop-shadow(0 4px 12px rgba(0,0,0,0.5))`,
						zIndex: 1,
					}}
				>
					{index}
				</div>
			)}
			<div
				style={{
					width: lineW,
					height: 4,
					borderRadius: 2,
					background: `linear-gradient(90deg, ${colors.accent[0]}, ${colors.accent[1]})`,
					margin: `${SPACING.md}px 0`,
					zIndex: 1,
				}}
			/>
			<div
				style={{
					...t.displayTitle,
					maxWidth: 1500,
					opacity: titleProgress,
					transform: `translateY(${interpolate(titleProgress, [0, 1], [24, 0])}px)`,
					zIndex: 1,
				}}
			>
				{title}
			</div>
		</AbsoluteFill>
	);
};
