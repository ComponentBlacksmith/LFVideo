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
import {withAlpha} from '../../theme/util';
import {glowBlob} from '../../theme/surfaces';
import {textStyles} from '../../theme/textStyles';

export const quoteSchema = z.object({
	text: z.string(),
	attribution: z.string().optional(),
});
export type QuoteProps = z.infer<typeof quoteSchema>;

// 全屏金句 / 大字报陈述。与 IntroScene 区别：用于中段强调一句观点。
export const QuoteScene: React.FC<QuoteProps> = ({text, attribution}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const theme = useTheme();
	const {colors, fonts, FONT_SIZE, SPACING} = theme;
	const t = textStyles(theme);

	const color = colors.accent[0];
	const enter = spring({fps, frame, config: {damping: 20, stiffness: 90}});
	const opacity = interpolate(enter, [0, 1], [0, 1]);
	const translateY = interpolate(enter, [0, 1], [28, 0]);
	const markScale = spring({fps, frame, config: {damping: 11, stiffness: 110}, from: 0.6, to: 1});
	const attrStart = Math.round(durationInFrames * 0.08);
	const attrProgress = spring({frame: frame - attrStart, fps, config: {damping: 20}});
	const fadeOut = interpolate(
		frame,
		[durationInFrames - 15, durationInFrames],
		[1, 0],
		{extrapolateLeft: 'clamp'},
	);

	// 长句降一档字号，短句用 display 量级。
	const big = text.length <= 28;

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
			<div style={glowBlob(color, {width: 760, height: 360, blur: 90})} />
			<div
				style={{
					fontFamily: 'Georgia, serif',
					fontSize: 160,
					lineHeight: 0.6,
					fontWeight: 700,
					color: withAlpha(color, 0.65),
					marginBottom: SPACING.sm,
					transform: `scale(${markScale})`,
					textShadow: `0 0 30px ${withAlpha(color, 0.5)}, 0 0 60px ${withAlpha(color, 0.3)}`,
					zIndex: 1,
				}}
			>
				“
			</div>
			<div
				style={{
					...(big ? t.displayTitle : t.sceneTitle),
					fontWeight: 800,
					maxWidth: 1500,
					lineHeight: 1.3,
					color: '#ffffff',
					transform: `translateY(${translateY}px)`,
					textShadow: `0 0 24px ${withAlpha(color, 0.6)}, 0 0 48px ${withAlpha(color, 0.3)}, 0 0 80px ${withAlpha(color, 0.15)}, 0 4px 16px rgba(0,0,0,0.6)`,
					zIndex: 1,
				}}
			>
				{text}
			</div>
			{attribution && (
				<div
					style={{
						marginTop: SPACING.lg,
						display: 'flex',
						alignItems: 'center',
						gap: SPACING.sm,
						opacity: attrProgress,
						zIndex: 1,
					}}
				>
					<div style={{width: 48, height: 2, background: color}} />
					<div
						style={{
							...t.bodyMuted,
							fontSize: FONT_SIZE.subtitle,
							fontWeight: 600,
							letterSpacing: 1,
						}}
					>
						{attribution}
					</div>
				</div>
			)}
		</AbsoluteFill>
	);
};
