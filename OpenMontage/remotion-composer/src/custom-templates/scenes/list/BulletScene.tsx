import React from 'react';
import {z} from 'zod';
import {AutoFit} from '../../primitives';
import {useTheme} from '../../theme/ThemeContext';
import {TechPanel, techIconChip} from '../../theme/surfaces';
import {textStyles} from '../../theme/textStyles';
import {Animated} from '../../animation';
import {TRANSITION_IDS} from '../../animation/types';

export const bulletItemSchema = z.object({
	text: z.string(),
	icon: z.string().optional(),
});
export type BulletItem = z.infer<typeof bulletItemSchema>;

export const bulletSchema = z.object({
	eyebrow: z.string().optional(),
	title: z.string().optional(),
	items: z.array(z.union([z.string(), bulletItemSchema])),
	ordered: z.boolean().optional(),
	enter: z.enum(TRANSITION_IDS).optional(),
});
export type BulletProps = z.infer<typeof bulletSchema>;

// 轻量要点 / 步骤清单：比 ConceptScene 的卡片墙更朴素，逐行错峰入场。
// items 既可是纯字符串，也可是 {text, icon}；ordered=true 时用 1.2.3 序号。
export const BulletScene: React.FC<BulletProps> = ({
	eyebrow,
	title,
	items,
	ordered = false,
	enter = 'slide-right',
}) => {
	const theme = useTheme();
	const {colors, fonts, FONT_SIZE, SPACING, RADIUS} = theme;
	const t = textStyles(theme);

	// 条目多时收紧字号/间距，而非交给 AutoFit 一味等比缩小。
	const tier: 0 | 1 = items.length <= 5 ? 0 : 1;
	const ROW_FONT = [FONT_SIZE.bodyLg, FONT_SIZE.body][tier];
	const ROW_GAP = [SPACING.md, SPACING.sm][tier];
	const MARKER = [64, 56][tier];

	const startFrame = 16;
	const stagger = 10;

	return (
		<AutoFit paddingX={SPACING.gutter} paddingY={SPACING.xl} maxScale={1.3}>
			<div style={{fontFamily: fonts.family, width: 1300, display: 'flex', flexDirection: 'column'}}>
				{eyebrow && (
					<Animated enter="rise" delay={8} distance={24}>
						<div style={{...t.eyebrow, marginBottom: SPACING.xs}}>
							{eyebrow}
						</div>
					</Animated>
				)}
				{title && (
					<Animated enter="rise" delay={10} distance={28}>
						<div style={{...t.sceneTitle, marginBottom: SPACING.lg}}>
							{title}
						</div>
					</Animated>
				)}
				<div style={{display: 'flex', flexDirection: 'column', gap: ROW_GAP}}>
					{items.map((raw, i) => {
						const item: BulletItem = typeof raw === 'string' ? {text: raw} : raw;
						const color = colors.accent[i % colors.accent.length];
						return (
							<Animated key={item.text} enter={enter} delay={startFrame + i * stagger} distance={50}>
								<TechPanel
									accent={color}
									borderAlpha={0.2}
									fill={0.4}
									blur={10}
									radius={RADIUS.md}
									corners={false}
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: SPACING.md,
										padding: `${SPACING.sm + 2}px ${SPACING.md}px`,
									}}
								>
									<div
										style={{
											...techIconChip(theme, color, {
												size: MARKER,
												shape: ordered ? 'rounded' : 'circle',
											}),
											fontSize: item.icon ? 30 : FONT_SIZE.subtitle,
											fontWeight: 900,
											color,
										}}
									>
										{item.icon ?? (ordered ? i + 1 : '•')}
									</div>
									<div style={{...t.body, fontSize: ROW_FONT, fontWeight: 600, lineHeight: 1.5}}>
										{item.text}
									</div>
								</TechPanel>
							</Animated>
						);
					})}
				</div>
			</div>
		</AutoFit>
	);
};
