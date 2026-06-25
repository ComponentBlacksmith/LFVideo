import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {AutoFit} from '../primitives';
import {useTheme} from '../theme/ThemeContext';
import {withAlpha} from '../theme/util';
import {Animated} from '../animation';
import {osc01} from '../animation/presence';
import {TRANSITION_IDS, type TransitionId} from '../animation/types';

export const conceptItemSchema = z.object({
	label: z.string(),
	title: z.string(),
	desc: z.string(),
	icon: z.string(),
});
export type ConceptItem = z.infer<typeof conceptItemSchema>;

export const conceptSchema = z.object({
	eyebrow: z.string().optional(),
	title: z.string(),
	items: z.array(conceptItemSchema),
	enter: z.enum(TRANSITION_IDS).optional(),
});
export type ConceptProps = z.infer<typeof conceptSchema>;

const ItemCard: React.FC<{
	item: ConceptItem;
	color: string;
	delay: number;
	index: number;
	enter: TransitionId;
}> = ({item, color, delay, index, enter}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {colors, FONT_SIZE, SPACING, RADIUS} = useTheme();

	// frame 驱动的常驻辉光 / 图标浮动（取代 CSS `card-glow`/`icon-float ... infinite`）。
	const glow = osc01(frame, fps, 6, index * 0.5);
	const floatW = (1 - Math.cos(((frame / fps + index * 0.3) / 5) * Math.PI * 2)) / 2;
	const cardBg = withAlpha(colors.bg.to, 0.45);
	const cardBorder = withAlpha(color, 0.13 + glow * (0.47 - 0.13));
	const cardShadow = `0 10px 40px -10px rgba(0,0,0,${0.5 + 0.2 * glow}), inset 0 1px 1px rgba(255,255,255,0.05), 0 0 ${18 * glow}px ${withAlpha(color, 0.13 * glow)}`;
	const iconTransform = `translateY(${-6 * floatW}px) rotate(${4 * floatW}deg)`;

	return (
		<Animated enter={enter} delay={delay} distance={60} style={{marginBottom: SPACING.md}}>
		<div
			style={{
				display: 'flex',
				alignItems: 'flex-start',
				gap: SPACING.md,
				background: cardBg,
				border: `1.5px solid ${cardBorder}`,
				borderRadius: RADIUS.lg,
				padding: `${SPACING.md + 4}px ${SPACING.lg}px`,
				backdropFilter: 'blur(16px)',
				boxShadow: cardShadow,
				position: 'relative',
				overflow: 'hidden',
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: -50,
					top: -50,
					width: 150,
					height: 150,
					borderRadius: '50%',
					background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
					pointerEvents: 'none',
				}}
			/>

			<div
				style={{
					width: 80,
					height: 80,
					borderRadius: RADIUS.md,
					background: `${color}18`,
					border: `1.5px solid ${color}44`,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontSize: 40,
					flexShrink: 0,
					boxShadow: `0 4px 20px -2px ${color}18`,
					transform: iconTransform,
				}}
			>
				{item.icon}
			</div>

			<div style={{flex: 1, zIndex: 1}}>
				<div
					style={{
						fontSize: FONT_SIZE.caption,
						letterSpacing: 4,
						color,
						fontWeight: 800,
						marginBottom: SPACING.xs - 2,
						textTransform: 'uppercase',
						opacity: 0.9,
					}}
				>
					{item.label}
				</div>
				<div
					style={{
						fontSize: FONT_SIZE.subtitle,
						fontWeight: 800,
						color: colors.text.primary,
						marginBottom: SPACING.xs,
						lineHeight: 1.2,
						letterSpacing: -0.5,
					}}
				>
					{item.title}
				</div>
				<div
					style={{
						fontSize: FONT_SIZE.body,
						color: colors.text.secondary,
						lineHeight: 1.65,
					}}
				>
					{item.desc}
				</div>
			</div>
		</div>
		</Animated>
	);
};

export const ConceptScene: React.FC<
	ConceptProps & {cardStart?: number; cardStagger?: number}
> = ({items, cardStart = 20, cardStagger = 25, enter = 'rise-pop'}) => {
	const {colors, fonts, SPACING} = useTheme();
	return (
		<AutoFit paddingX={SPACING.gutter} paddingY={SPACING.xl}>
			<div
				style={{
					fontFamily: fonts.family,
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				{items.map((item, i) => (
					<ItemCard
						key={item.title}
						item={item}
						color={colors.accent[i % colors.accent.length]}
						delay={cardStart + i * cardStagger}
						index={i}
						enter={enter}
					/>
				))}
			</div>
		</AutoFit>
	);
};
