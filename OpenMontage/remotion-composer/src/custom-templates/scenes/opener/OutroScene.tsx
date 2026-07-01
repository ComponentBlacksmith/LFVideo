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

export const outroSchema = z.object({
	headline: z.string(),
	cta: z.string().optional(),
});
export type OutroProps = z.infer<typeof outroSchema>;

export const OutroScene: React.FC<OutroProps> = ({
	headline,
	cta = '关注 · 一起验证 AI IDE 的真实能力',
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const theme = useTheme();
	const {colors, fonts, FONT_SIZE, SPACING, RADIUS} = theme;
	const t = textStyles(theme);
	const enter = spring({fps, frame, config: {damping: 20, stiffness: 90}});
	const opacity = interpolate(enter, [0, 1], [0, 1]);
	const translateY = interpolate(enter, [0, 1], [30, 0]);

	// frame 驱动的按钮脉冲（取代 CSS `button-pulse ... infinite`，3.5s 一循环）。
	const pulse = (1 - Math.cos((frame / fps / 3.5) * Math.PI * 2)) / 2; // 0→1→0
	const btnScale = 1 + 0.03 * pulse;
	const btnBlur = 30 + 5 * pulse;
	const btnSpread = -4 + 8 * pulse;
	const btnShadow = `0 8px ${btnBlur}px ${btnSpread}px ${withAlpha(colors.accent[0], 0.4 * (1 - pulse))}, 0 8px ${btnBlur}px ${btnSpread}px ${withAlpha(colors.accent[1], 0.6 * pulse)}`;

	return (
		<AbsoluteFill
			style={{
				fontFamily: fonts.family,
				justifyContent: 'center',
				alignItems: 'center',
				textAlign: 'center',
				opacity,
				transform: `translateY(${translateY}px)`,
			}}
		>
			<div
				style={glowBlob(colors.accent[3] ?? colors.accent[1], {
					width: 500,
					height: 200,
					intensity: 0.08,
					blur: 70,
				})}
			/>

			<div
				style={{
					...t.sceneTitle,
					fontSize: FONT_SIZE.title + 4,
					marginBottom: SPACING.xl,
					maxWidth: 1400,
					lineHeight: 1.25,
					letterSpacing: -0.5,
					zIndex: 1,
				}}
			>
				{headline}
			</div>
			<div
				style={{
					fontSize: FONT_SIZE.subtitle,
					fontWeight: 700,
					color: colors.text.primary,
					padding: `${SPACING.sm + 4}px ${SPACING.xl}px`,
					borderRadius: RADIUS.pill,
					background: `linear-gradient(135deg, ${colors.accent[0]} 0%, ${colors.accent[1]} 100%)`,
					transform: `scale(${btnScale})`,
					boxShadow: btnShadow,
					letterSpacing: 1.5,
					textShadow: `0 1px 4px rgba(0,0,0,0.4)`,
					zIndex: 1,
					border: '1px solid rgba(255,255,255,0.1)',
				}}
			>
				{cta}
			</div>
		</AbsoluteFill>
	);
};
