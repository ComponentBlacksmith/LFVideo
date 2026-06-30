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
import {glowBlob} from '../../theme/surfaces';
import {withAlpha} from '../../theme/util';
import {textStyles} from '../../theme/textStyles';
import {HoloTitle} from '../../primitives/HoloTitle';

export const introSchema = z.object({
	title: z.string(),
	subtitle: z.string().optional(),
});
export type IntroProps = z.infer<typeof introSchema>;

export const IntroScene: React.FC<IntroProps> = ({title, subtitle}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const theme = useTheme();
	const {colors, fonts, FONT_SIZE, SPACING} = theme;
	const t = textStyles(theme);

	const enter = spring({fps, frame, config: {damping: 20, stiffness: 90}});
	const opacity = interpolate(enter, [0, 1], [0, 1]);
	const scale = interpolate(enter, [0, 1], [0.94, 1]);

	const fadeOut = interpolate(
		frame,
		[durationInFrames - 15, durationInFrames],
		[1, 0],
		{extrapolateLeft: 'clamp'}
	);

	// frame 驱动的副标题揭示（取代 CSS `subtitle-reveal`，延迟 0.4s、时长 1.2s）。
	const subT = interpolate(frame, [fps * 0.4, fps * 1.6], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const subEase = 1 - Math.pow(1 - subT, 3);
	const subOpacity = subEase * 0.85;
	const subTranslateY = (1 - subEase) * 20;

	// 全息扫描线波动（缓慢上移，强化「投影」质感）。
	const scanShift = (frame / fps / 6) % 1;

	return (
		<AbsoluteFill
			style={{
				fontFamily: fonts.family,
				justifyContent: 'center',
				alignItems: 'center',
				textAlign: 'center',
				opacity: opacity * fadeOut,
				transform: `scale(${scale})`,
			}}
		>
			{/* 全息背景：弥散光晕 + 扫描线 wash（叠在深色底上）。 */}
			<div style={glowBlob(colors.accent[0], {width: 760, height: 320, intensity: 0.18})} />
			<div
				style={{
					position: 'absolute',
					inset: 0,
					zIndex: 0,
					pointerEvents: 'none',
					backgroundImage: `repeating-linear-gradient(0deg, ${withAlpha(
						colors.accent[0],
						0.05
					)} 0px, ${withAlpha(colors.accent[0], 0.05)} 1px, transparent 1px, transparent 4px)`,
					backgroundPositionY: `${scanShift * 4}px`,
					maskImage:
						'radial-gradient(ellipse 70% 55% at 50% 45%, #000 0%, transparent 75%)',
					WebkitMaskImage:
						'radial-gradient(ellipse 70% 55% at 50% 45%, #000 0%, transparent 75%)',
				}}
			/>

			<div style={{zIndex: 1, padding: '0 80px', maxWidth: 1500}}>
				<HoloTitle
					title={title}
					align="center"
					size="display"
					maxWidth={1340}
					underlineWidth={220}
				/>
			</div>
			{subtitle && (
				<div
					style={{
						...t.bodyMuted,
						fontSize: FONT_SIZE.subtitle,
						fontWeight: 600,
						letterSpacing: 2,
						textTransform: 'uppercase',
						opacity: subOpacity,
						transform: `translateY(${subTranslateY}px)`,
						marginTop: SPACING.md,
						zIndex: 1,
					}}
				>
					{subtitle}
				</div>
			)}
		</AbsoluteFill>
	);
};
