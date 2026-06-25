import React from 'react';
import {
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {useTheme} from '../theme/ThemeContext';

interface Props {
	title: string;
	eyebrow?: string; // 上方小标注
	startFrame?: number;
}

/**
 * 屏幕右上角的「章节标题」层，从场景内容中独立出来。
 * 自带样式 + 动画（从右滑入 + 淡入，结尾淡出），右对齐：
 * eyebrow 小字 → 大标题 → 渐变下划线。
 * 在最终效果里由 Explainer 放在透视矩阵之外，因此不随场景变换。
 */
export const SceneTitle: React.FC<Props> = ({title, eyebrow, startFrame = 0}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const {colors, FONT_SIZE, SPACING, SPRING} = useTheme();

	const progress = spring({
		fps,
		frame: frame - startFrame,
		config: SPRING.gentle,
	});
	const enterOpacity = interpolate(progress, [0, 1], [0, 1]);
	const translateX = interpolate(progress, [0, 1], [60, 0]);
	const lineWidth = interpolate(progress, [0, 1], [0, 120]);

	// 结尾淡出，避免标题在切场景时硬切。
	const fadeOut = interpolate(
		frame,
		[durationInFrames - 12, durationInFrames],
		[1, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);

	return (
		<div
			style={{
				position: 'absolute',
				top: SPACING.lg,
				right: SPACING.xl,
				maxWidth: 760,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'flex-end',
				textAlign: 'right',
				opacity: enterOpacity * fadeOut,
				transform: `translateX(${translateX}px)`,
				pointerEvents: 'none',
			}}
		>
			{eyebrow && (
				<div
					style={{
						fontSize: FONT_SIZE.caption,
						letterSpacing: 4,
						color: colors.text.muted,
						marginBottom: SPACING.xs,
						textTransform: 'uppercase',
						fontWeight: 600,
					}}
				>
					{eyebrow}
				</div>
			)}
			<div
				style={{
					fontSize: FONT_SIZE.title,
					fontWeight: 900,
					color: colors.text.primary,
					lineHeight: 1.15,
					marginBottom: SPACING.sm,
					textShadow: '0 2px 12px rgba(0,0,0,0.45)',
				}}
			>
				{title}
			</div>
			<div
				style={{
					width: lineWidth,
					height: 4,
					background: `linear-gradient(90deg, ${colors.accent[0]}, ${colors.accent[1]})`,
					borderRadius: 2,
				}}
			/>
		</div>
	);
};
