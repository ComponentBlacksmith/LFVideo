import React from 'react';
import {
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {z} from 'zod';
import {AutoFit} from '../primitives';
import {useTheme} from '../theme/ThemeContext';
import {withAlpha} from '../theme/util';
import {Animated} from '../animation';
import {osc01} from '../animation/presence';
import {TRANSITION_IDS} from '../animation/types';

// 通用表格：列由 headers 决定，每行是与 headers 对齐的 cells[]（纯字符串）。
// 不再绑定任何业务字段名。highlightCell 用 "行-列"（均 1 起，行只数数据行）
// 标注需要强调的单元格，到点闪烁高亮。
export const tableSchema = z.object({
	eyebrow: z.string().optional(),
	title: z.string(),
	headers: z.array(z.string()),
	rows: z.array(z.array(z.string())),
	highlightCell: z.string().optional(),
	enter: z.enum(TRANSITION_IDS).optional(),
});
export type TableProps = z.infer<typeof tableSchema>;

const TableCell: React.FC<{
	content: string;
	isHeader?: boolean;
	highlighted?: boolean;
	highlightColor: string;
	align?: 'left' | 'center';
	colIndex: number;
	rowIndex: number;
	dense?: boolean;
}> = ({
	content,
	isHeader = false,
	highlighted = false,
	highlightColor,
	align = 'left',
	colIndex,
	rowIndex,
	dense = false,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {colors, FONT_SIZE, SPACING, RADIUS} = useTheme();
	const headerBg = withAlpha(colors.bg.to, 0.7);

	// frame 驱动的高亮闪烁（取代 CSS `cell-blink ... infinite`，2s 一循环）。
	const blink = highlighted ? osc01(frame, fps, 2) : 0;
	const hlBorder = withAlpha(highlightColor, 0.33 + blink * (1 - 0.33));
	const hlShadow = `0 0 ${5 + 15 * blink}px ${withAlpha(highlightColor, 0.08 + blink * (0.27 - 0.08))}`;

	return (
		<div
			style={{
				flex: colIndex === 0 ? 1.2 : 1.5,
				padding: `${dense ? SPACING.sm : SPACING.md}px ${SPACING.lg}px`,
				fontSize: isHeader
					? FONT_SIZE.body + (dense ? 0 : 2)
					: FONT_SIZE.body - (dense ? 2 : 1),
				fontWeight: isHeader ? 900 : colIndex === 0 ? 800 : 500,
				color:
					isHeader || colIndex === 0
						? colors.text.primary
						: colors.text.secondary,
				display: 'flex',
				alignItems: 'center',
				justifyContent: align === 'center' ? 'center' : 'flex-start',
				background: isHeader
					? headerBg
					: highlighted
						? `${highlightColor}10`
						: 'transparent',
				border: highlighted
					? `2px solid ${hlBorder}`
					: `1.5px solid ${colors.line}`,
				borderRadius: highlighted ? RADIUS.md : 0,
				position: 'relative',
				overflow: 'hidden',
				boxShadow: highlighted ? hlShadow : 'none',
			}}
		>
			<span style={{zIndex: 1}}>{content}</span>
		</div>
	);
};

function parseHighlight(spec?: string): {row: number; col: number} | null {
	if (!spec) return null;
	const m = /^(\d+)-(\d+)$/.exec(spec.trim());
	if (!m) return null;
	return {row: parseInt(m[1], 10), col: parseInt(m[2], 10)};
}

export const TableScene: React.FC<
	TableProps & {startFrame?: number; rowStagger?: number}
> = ({headers, rows, highlightCell, startFrame = 25, rowStagger = 15, enter = 'rise'}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {colors, fonts, SPACING, RADIUS, SPRING} = useTheme();

	const dense = rows.length > 4;
	const hl = parseHighlight(highlightCell);
	const highlightActive = frame > 110;

	const headerProgress = spring({fps, frame: frame - startFrame, config: SPRING.snappy});
	const headerOpacity = interpolate(headerProgress, [0, 1], [0, 1]);
	const headerScaleY = interpolate(headerProgress, [0, 1], [0.8, 1]);

	const wrapperBg = withAlpha(colors.bg.to, 0.3);
	const headerRowBg = withAlpha(colors.bg.to, 0.8);

	return (
		<AutoFit paddingX={SPACING.gutter} paddingY={SPACING.xl}>
			<div
				style={{
					fontFamily: fonts.family,
					display: 'flex',
					flexDirection: 'column',
					background: wrapperBg,
					borderRadius: RADIUS.lg,
					border: `1.5px solid ${colors.line}`,
					backdropFilter: 'blur(16px)',
					boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.7)',
					overflow: 'hidden',
					marginTop: dense ? SPACING.lg : SPACING.xl,
				}}
			>
				<div
					style={{
						display: 'flex',
						background: headerRowBg,
						borderBottom: `2px solid ${colors.line}`,
						opacity: headerOpacity,
						transform: `scaleY(${headerScaleY})`,
						transformOrigin: 'top',
					}}
				>
					{headers.map((header, colIndex) => (
						<TableCell
							key={header}
							content={header}
							isHeader
							colIndex={colIndex}
							rowIndex={0}
							align={colIndex === 0 ? 'left' : 'center'}
							highlightColor={colors.accent[1]}
							dense={dense}
						/>
					))}
				</div>

				{rows.map((row, rowIndex) => {
					const rowStart = startFrame + (rowIndex + 1) * rowStagger;

					return (
						<Animated
							key={`${rowIndex}-${row[0] ?? ''}`}
							enter={enter}
							delay={rowStart}
							distance={30}
							style={{
								display: 'flex',
								borderBottom:
									rowIndex === rows.length - 1
										? 'none'
										: `1.5px solid ${colors.line}`,
								background:
									rowIndex % 2 === 1 ? withAlpha(colors.text.primary, 0.015) : 'transparent',
							}}
						>
							{headers.map((_, colIndex) => {
								const cellHighlighted =
									highlightActive &&
									hl !== null &&
									hl.row === rowIndex + 1 &&
									hl.col === colIndex + 1;
								return (
									<TableCell
										key={colIndex}
										content={row[colIndex] ?? ''}
										colIndex={colIndex}
										rowIndex={rowIndex + 1}
										align={colIndex === 0 ? 'left' : 'center'}
										highlighted={cellHighlighted}
										highlightColor={colors.accent[colIndex % colors.accent.length]}
										dense={dense}
									/>
								);
							})}
						</Animated>
					);
				})}
			</div>
		</AutoFit>
	);
};
