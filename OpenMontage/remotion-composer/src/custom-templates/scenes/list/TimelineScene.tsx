import React from 'react';
import {
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {z} from 'zod';
import {AutoFit} from '../../primitives';
import {useTheme} from '../../theme/ThemeContext';
import {TechPanel, techIconChip, techPill} from '../../theme/surfaces';
import {textStyles} from '../../theme/textStyles';
import {Animated} from '../../animation';
import {osc01} from '../../animation/presence';
import {TRANSITION_IDS, type TransitionId} from '../../animation/types';

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
	tier: 0 | 1 | 2;
}> = ({event, color, delay, index, enter, tier}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const theme = useTheme();
	const {FONT_SIZE, SPACING} = theme;
	const t = textStyles(theme);

	// fit-to-fill + 方案 B：事件少时卡片更高更大字填满竖向；事件多时逐档
	// 收紧字号/图标/内边距（仍不低于 FONT_SIZE.min=24），而不是被 AutoFit 一味缩小。
	const ICON = [72, 64, 56][tier];
	const ICON_FONT = [36, 32, 28][tier];
	const TITLE = [FONT_SIZE.subtitle, FONT_SIZE.subtitle - 2, FONT_SIZE.body][tier];
	const DESC = [FONT_SIZE.body, FONT_SIZE.body - 2, FONT_SIZE.min][tier];
	const PAD_Y = [SPACING.lg, SPACING.md + 4, SPACING.md][tier];
	const PAD_X = [SPACING.md + 4, SPACING.md, SPACING.sm + 4][tier];
	const MIN_H = [360, 312, 264][tier];

	// frame 驱动的常驻辉光（取代 CSS `timeline-glow ... infinite`）。
	const glow = osc01(frame, fps, 5, index * 0.4);

	return (
		<Animated enter={enter} delay={delay} distance={40} style={{flex: 1, display: 'flex'}}>
		<TechPanel
			accent={color}
			glow={glow}
			borderAlpha={0.2}
			fill={0.4}
			blur={12}
			style={{
				flex: 1,
				padding: `${PAD_Y}px ${PAD_X}px`,
				minHeight: MIN_H,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				textAlign: 'center',
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
					...techPill(theme, color),
					fontWeight: 900,
					marginBottom: SPACING.md,
				}}
			>
				{event.year}
			</div>

			<div
				style={{
					...techIconChip(theme, color, {size: ICON, shape: 'circle'}),
					fontSize: ICON_FONT,
					marginBottom: SPACING.md,
				}}
			>
				{event.icon}
			</div>

			<div
				style={{
					...t.cardTitle,
					fontSize: TITLE,
					marginBottom: SPACING.sm,
				}}
			>
				{event.title}
			</div>

			<div style={{...t.bodyMuted, fontSize: DESC}}>
				{event.desc}
			</div>
		</TechPanel>
		</Animated>
	);
};

export const TimelineScene: React.FC<
	TimelineProps & {startFrame?: number; stagger?: number}
> = ({events, startFrame = 20, stagger = 20, enter = 'rise-pop'}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {colors, fonts, SPACING} = useTheme();

	// 密度分档（fit-to-fill + 方案 B）：tier 0 (≤4)：大卡片大字；tier 1 (5–6)；
	// tier 2 (>6)：缩小间距与字号、紧凑排布，而不是交给 AutoFit 把整排等比缩小。
	const tier: 0 | 1 | 2 = events.length <= 4 ? 0 : events.length <= 6 ? 1 : 2;
	const cardGap = [SPACING.lg, SPACING.md, SPACING.sm][tier];

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
		<AutoFit paddingX={SPACING.gutter} paddingY={SPACING.xl}>
			<div
				style={{
					fontFamily: fonts.family,
					position: 'relative',
					display: 'flex',
					gap: cardGap,
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
						tier={tier}
					/>
				))}
			</div>
		</AutoFit>
	);
};
