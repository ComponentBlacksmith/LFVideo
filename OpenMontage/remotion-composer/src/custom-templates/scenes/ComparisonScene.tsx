import React from 'react';
import {AbsoluteFill} from 'remotion';
import {z} from 'zod';
import {SplitLayout} from '../primitives';
import {useTheme} from '../theme/ThemeContext';
import {withAlpha} from '../theme/util';
import {Animated} from '../animation';
import {TRANSITION_IDS, type TransitionId} from '../animation/types';

// 模板库版对比场景：基于 SplitLayout，主题驱动配色，左右两张玻璃卡。
// 与旧 components/ComparisonCard 不同，value 走正文字号并自适应长句，
// 适合「整句对比」而非「单个大数字」。取代回落到浅色 ComparisonCard。
export const comparisonSchema = z.object({
	title: z.string().optional(),
	leftLabel: z.string(),
	leftValue: z.string(),
	rightLabel: z.string(),
	rightValue: z.string(),
	enter: z.enum(TRANSITION_IDS).optional(),
});
export type ComparisonProps = z.infer<typeof comparisonSchema>;

const Card: React.FC<{
	label: string;
	value: string;
	color: string;
	delay: number;
	enter: TransitionId;
}> = ({label, value, color, delay, enter}) => {
	const {colors, FONT_SIZE, SPACING, RADIUS} = useTheme();

	// 长句用正文字号、短句用副标题字号，避免长句溢出。
	const valueFontSize = value.length > 36 ? FONT_SIZE.bodyLg : FONT_SIZE.subtitle;
	const cardBg = withAlpha(colors.bg.to, 0.5);

	return (
		<Animated enter={enter} delay={delay} distance={50} style={{height: '100%'}}>
		<div
			style={{
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				gap: SPACING.lg,
				background: cardBg,
				border: `1.5px solid ${color}44`,
				borderRadius: RADIUS.lg,
				padding: `${SPACING.xl}px ${SPACING.lg}px`,
				backdropFilter: 'blur(16px)',
				boxShadow: `0 20px 50px -15px rgba(0,0,0,0.6), 0 0 30px -10px ${color}22`,
				position: 'relative',
				overflow: 'hidden',
			}}
		>
			<div
				style={{
					position: 'absolute',
					top: -60,
					left: -60,
					width: 220,
					height: 220,
					borderRadius: '50%',
					background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
					pointerEvents: 'none',
				}}
			/>
			<div
				style={{
					display: 'inline-flex',
					alignSelf: 'flex-start',
					fontSize: FONT_SIZE.caption,
					fontWeight: 800,
					letterSpacing: 2,
					color,
					background: `${color}1A`,
					border: `1.5px solid ${color}55`,
					borderRadius: RADIUS.pill,
					padding: `6px ${SPACING.md}px`,
					zIndex: 1,
				}}
			>
				{label}
			</div>
			<div
				style={{
					fontSize: valueFontSize,
					fontWeight: 700,
					color: colors.text.primary,
					lineHeight: 1.5,
					zIndex: 1,
				}}
			>
				{value}
			</div>
		</div>
		</Animated>
	);
};

export const ComparisonScene: React.FC<ComparisonProps> = ({
	leftLabel,
	leftValue,
	rightLabel,
	rightValue,
	enter = 'rise-pop',
}) => {
	const {colors, fonts} = useTheme();

	return (
		<AbsoluteFill
			style={{
				fontFamily: fonts.family,
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
			}}
		>
			<div style={{flex: 1, position: 'relative'}}>
				<SplitLayout
					left={<Card label={leftLabel} value={leftValue} color={colors.accent[0]} delay={15} enter={enter} />}
					right={<Card label={rightLabel} value={rightValue} color={colors.accent[2] ?? colors.accent[1]} delay={25} enter={enter} />}
				/>
			</div>
		</AbsoluteFill>
	);
};
