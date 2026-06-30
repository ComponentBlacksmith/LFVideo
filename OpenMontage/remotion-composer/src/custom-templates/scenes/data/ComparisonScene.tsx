import React from 'react';
import {z} from 'zod';
import {AutoFit} from '../../primitives';
import {useTheme} from '../../theme/ThemeContext';
import {TechPanel, techPill} from '../../theme/surfaces';
import {textStyles} from '../../theme/textStyles';
import {Animated} from '../../animation';
import {TRANSITION_IDS, type TransitionId} from '../../animation/types';

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
	tier: 0 | 1;
}> = ({label, value, color, delay, enter, tier}) => {
	const theme = useTheme();
	const {FONT_SIZE, SPACING} = theme;
	const t = textStyles(theme);

	// 长句用正文字号、短句用副标题字号，避免长句溢出。
	// 方案 B：两栏都是长文（tier 1）时整体再降一档字号并收紧内边距/间距，
	// 让两段长文并排也读得清、塞得下，而不是交给 AutoFit 把整组等比缩小。
	const longText = value.length > 36;
	const valueFontSize =
		tier === 0
			? longText
				? FONT_SIZE.bodyLg
				: FONT_SIZE.subtitle
			: longText
				? FONT_SIZE.body
				: FONT_SIZE.bodyLg;
	const PAD_Y = tier === 0 ? SPACING.xl : SPACING.lg;
	const GAP = tier === 0 ? SPACING.lg : SPACING.md;

	return (
		<Animated enter={enter} delay={delay} distance={50} style={{flex: 1, display: 'flex'}}>
		<TechPanel
			accent={color}
			borderAlpha={0.27}
			fill={0.5}
			blur={16}
			style={{
				flex: 1,
				minHeight: 440,
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				gap: GAP,
				padding: `${PAD_Y}px ${SPACING.lg}px`,
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
			<div style={{...techPill(theme, color), alignSelf: 'flex-start', zIndex: 1}}>
				{label}
			</div>
			<div
				style={{
					...t.body,
					fontSize: valueFontSize,
					fontWeight: 700,
					lineHeight: 1.5,
					zIndex: 1,
				}}
			>
				{value}
			</div>
		</TechPanel>
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
	const {colors, fonts, SPACING} = useTheme();

	// 密度分档（方案 B）：两栏都是长文时切到 tier 1，整体降一档字号、收紧内边距，
	// 让两段长文并排仍读得清，而不是被 AutoFit 一味等比缩小。
	const tier: 0 | 1 = leftValue.length > 50 && rightValue.length > 50 ? 1 : 0;

	return (
		<AutoFit
			paddingX={SPACING.gutter}
			paddingY={SPACING.xl}
			maxScale={1.7}
			widthMode="content"
		>
			<div
				style={{
					fontFamily: fonts.family,
					display: 'flex',
					alignItems: 'stretch',
					gap: SPACING.lg,
					width: 1180,
				}}
			>
				<Card label={leftLabel} value={leftValue} color={colors.accent[0]} delay={15} enter={enter} tier={tier} />
				<Card label={rightLabel} value={rightValue} color={colors.accent[2] ?? colors.accent[1]} delay={25} enter={enter} tier={tier} />
			</div>
		</AutoFit>
	);
};
