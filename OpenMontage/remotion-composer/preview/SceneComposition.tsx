import React from 'react';
import {AbsoluteFill} from 'remotion';
import {
	TemplateThemeProvider,
	buildTemplateTheme,
} from '../src/custom-templates/theme/ThemeContext';
import {resolvePalette} from '../src/custom-templates/theme/palettes';
import {
	Background,
	type BackgroundVariant,
} from '../src/custom-templates/background';
import {SceneTitle} from '../src/custom-templates/primitives';

// 与 Explainer 一致：这些「章节内容」场景的标题已拆出，改由右上角的 SceneTitle 渲染。
const TITLE_OVERLAY_TYPES = new Set([
	'concept_scene',
	'timeline_scene',
	'table_scene',
	'comparison',
	'comparison_scene',
]);

export interface SceneCompositionProps {
	// 由 registry 提供的场景组件与其 props（在内存中传递，不经过序列化）。
	SceneComponent: React.ComponentType<Record<string, unknown>>;
	sceneType?: string;
	sceneProps: Record<string, unknown>;
	themeName: string;
	background: BackgroundVariant;
}

// 与 Explainer 完全一致的外层包裹：主题 Provider → 主题渐变底 + 动效背景 → 场景组件。
// 因此 useCurrentFrame/spring/interpolate 的动效会被 <Player> 逐帧完整播放。
export const SceneComposition: React.FC<SceneCompositionProps> = ({
	SceneComponent,
	sceneType,
	sceneProps,
	themeName,
	background,
}) => {
	const theme = buildTemplateTheme(themeName);
	const palette = resolvePalette(themeName);
	const title = sceneProps.title as string | undefined;
	const eyebrow = sceneProps.eyebrow as string | undefined;
	const showTitle = !!title && !!sceneType && TITLE_OVERLAY_TYPES.has(sceneType);
	return (
		<TemplateThemeProvider theme={theme}>
			<AbsoluteFill
				style={{
					background: `linear-gradient(160deg, ${palette.bg.from}, ${palette.bg.to})`,
					fontFamily: theme.fonts.family,
				}}
			>
				<Background variant={background} />
				<SceneComponent {...sceneProps} />
				{showTitle && (
					<AbsoluteFill style={{pointerEvents: 'none', zIndex: 60}}>
						<SceneTitle title={title!} eyebrow={eyebrow} />
					</AbsoluteFill>
				)}
			</AbsoluteFill>
		</TemplateThemeProvider>
	);
};
