import React from 'react';
import {Explainer, type ExplainerProps} from '../src/Explainer';
import {type BackgroundVariant} from '../src/custom-templates/background';
import ep02 from '../public/demo-props/ep02-shots.json';

export interface FinalCompositionProps {
	// 当前选中场景在 registry.ts 中登记的类型（如 'intro_scene'）。
	sceneType: string;
	// 实时编辑的场景 props（与「裸场景」模式共用同一份）。
	sceneProps: Record<string, unknown>;
	themeName: string;
	background: BackgroundVariant;
	durationInFrames: number;
	fps: number;
}

// 「最终效果」模式：复用真实的 Explainer 渲染管线，把当前选中的单个场景作为
// 唯一一个 cut，再叠加 ep02-shots 里的成片图层 —— UnityBG 透视矩阵变换
// （把 UI 映射进屏幕四边形）、3D 数字人主持、全局暖色调色 + 暗角 + 全息蓝。
// 与「裸场景」相比，这就是该场景进入 ep02 成片后的实际样子。
export const FinalComposition: React.FC<FinalCompositionProps> = ({
	sceneType,
	sceneProps,
	themeName,
	background,
	durationInFrames,
	fps,
}) => {
	const cut = {
		id: 'preview',
		source: '',
		in_seconds: 0,
		out_seconds: durationInFrames / fps,
		type: sceneType,
		background,
		...sceneProps,
	};

	const explainerProps = {
		// 主题仍由顶部下拉框驱动，保证与「裸场景」模式一致。
		theme: themeName,
		cuts: [cut],
		overlays: [],
		// 预览不播放旁白/字幕，只呈现视觉「最终效果」。
		captions: [],
		// 直接复用 ep02-shots 的成片图层配置；额外打开「先平面停留、再飞入屏幕」
		// 的 warp-reveal 时序，方便在预览里看清这个动效（不改 ep02-shots.json）：
		// 前 ~1.2s 整块场景平面正对镜头让人看清内容，再用 ~1s 飞入屏幕梯形。
		avatar: ep02.avatar,
		unityBackground: {
			...ep02.unityBackground,
			warpHoldFrames: Math.round(fps * 1.2),
			warpRevealFrames: Math.round(fps * 1.0),
		},
	};

	return <Explainer {...(explainerProps as unknown as ExplainerProps)} />;
};
