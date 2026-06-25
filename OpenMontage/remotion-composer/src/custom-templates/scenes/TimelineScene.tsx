import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {z} from 'zod';
import {useTheme} from '../theme/ThemeContext';
import {withAlpha} from '../theme/util';
import {Animated} from '../animation';
import {osc01} from '../animation/presence';
import {TRANSITION_IDS, type TransitionId} from '../animation/types';

export const timelineEventSchema = z.object({
	year: z.string(),
	title: z.string(),
	desc: z.string(),
	icon: z.string(),
});
export type TimelineEvent = z.infer<typeof timelineEventSchema>;

export const timelineSchema = z.object({
	eyebrow: z.string().optional(),
	title: z.string(),
	events: z.array(timelineEventSchema),
	enter: z.enum(TRANSITION_IDS).optional(),
});
export type TimelineProps = z.infer<typeof timelineSchema>;

const TimelineCard: React.FC<{
	event: TimelineEvent;
	color: string;
	delay: number;
	index: number;
	enter: TransitionId;
}> = ({event, color, delay, index, enter}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {colors, FONT_SIZE, SPACING, RADIUS} = useTheme();

	// frame 驱动的常驻辉光（取代 CSS `timeline-glow ... infinite`）。
	const glow = osc01(frame, fps, 5, index * 0.4);
	const cardBg = withAlpha(colors.bg.to, 0.4);
	const iconBg = withAlpha(colors.bg.to, 0.6);
	const cardBorder = withAlpha(color, 0.2 + glow * (0.53 - 0.2));
	const cardShadow = `0 10px 30px -15px rgba(0,0,0,0.6), 0 10px ${35 * glow}px -5px ${withAlpha(color, 0.08 * glow)}`;

	return (
		<Animated enter={enter} delay={delay} distance={40} style={{flex: 1, display: 'flex'}}>
		<div
			style={{
				flex: 1,
				background: cardBg,
				border: `1.5px solid ${cardBorder}`,
				borderRadius: RADIUS.lg,
				padding: `${SPACING.md + 4}px ${SPACING.md}px`,
				backdropFilter: 'blur(12px)',
				boxShadow: cardShadow,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				textAlign: 'center',
				position: 'relative',
				overflow: 'hidden',
			}}
		>

			<div
				style={{
					position: 'absolute',
					top: -40,
					width: 120,
					height: 120,
					borderRadius: '50%',
					background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
					pointerEvents: 'none',
				}}
			/>

			<div
				style={{
					background: `${color}18`,
					border: `1.5px solid ${color}55`,
					borderRadius: RADIUS.md,
					padding: '4px 14px',
					fontSize: FONT_SIZE.caption,
					fontWeight: 900,
					color,
					marginBottom: SPACING.md,
					letterSpacing: 2,
					boxShadow: `0 4px 15px -2px ${color}15`,
				}}
			>
				{event.year}
			</div>

			<div
				style={{
					width: 64,
					height: 64,
					borderRadius: '50%',
					background: iconBg,
					border: `1.5px solid ${color}44`,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontSize: 32,
					marginBottom: SPACING.md,
					boxShadow: `inset 0 0 10px ${color}11`,
				}}
			>
				{event.icon}
			</div>

			<div
				style={{
					fontSize: FONT_SIZE.subtitle - 2,
					fontWeight: 800,
					color: colors.text.primary,
					marginBottom: SPACING.sm,
					letterSpacing: -0.5,
				}}
			>
				{event.title}
			</div>

			<div
				style={{
					fontSize: FONT_SIZE.body - 2,
					color: colors.text.secondary,
					lineHeight: 1.6,
				}}
			>
				{event.desc}
			</div>
		</div>
		</Animated>
	);
};

export const TimelineScene: React.FC<
	TimelineProps & {startFrame?: number; stagger?: number}
> = ({events, startFrame = 20, stagger = 20, enter = 'rise-pop'}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {colors, fonts, SPACING} = useTheme();

	const lineProgress = spring({
		fps,
		frame: frame - startFrame,
		config: {
			damping: 14,
			mass: 0.8,
			stiffness: 70,
		},
	});

	const lineWidth = interpolate(lineProgress, [0, 1], [0, 100]);

	return (
		<AbsoluteFill
			style={{
				fontFamily: fonts.family,
				padding: `${SPACING.xl}px ${SPACING.gutter}px`,
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				position: 'relative',
			}}
		>
			<div
				style={{
					position: 'relative',
					display: 'flex',
					gap: SPACING.lg,
					justifyContent: 'space-between',
					alignItems: 'stretch',
					marginTop: SPACING.xl,
					padding: `0 ${SPACING.md}px`,
				}}
			>
				<div
					style={{
						position: 'absolute',
						top: 104,
						left: SPACING.gutter,
						right: SPACING.gutter,
						height: 3,
						background: colors.line,
						zIndex: 0,
					}}
				/>

				<div
					style={{
						position: 'absolute',
						top: 104,
						left: SPACING.gutter,
						width: `calc(${lineWidth}% - ${SPACING.gutter * 2}px)`,
						height: 3,
						background: `linear-gradient(90deg, ${colors.accent[0]}99, ${colors.accent[1]}ee, ${colors.accent[2] ?? colors.accent[0]}99)`,
						boxShadow: `0 0 12px ${colors.accent[1]}aa`,
						zIndex: 1,
					}}
				/>

				{events.map((event, i) => (
					<TimelineCard
						key={event.title}
						event={event}
						color={colors.accent[i % colors.accent.length]}
						delay={startFrame + i * stagger}
						index={i}
						enter={enter}
					/>
				))}
			</div>
		</AbsoluteFill>
	);
};
