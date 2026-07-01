import React, {type CSSProperties} from 'react';
import {withAlpha, lighten} from './util';
import {GLOW} from './tokens';
import {useTheme, type TemplateTheme} from './ThemeContext';

// ───────────────────────────────────────────────────────────────────────────
// 「组件视觉」SSOT：科技风元素框 / 图标片 / 标签胶囊 / 背景辉光 / 渐变文字。
// 所有场景的卡片与容器统一调用本文件，改一处即可让全部场景同步换风格；
// 以后加新效果（描边、扫描线、粒子……）也只在这里扩展。
// 纯函数 + 一个 React 包装组件，均不含 hooks 之外的副作用。
// ───────────────────────────────────────────────────────────────────────────

export interface TechPanelOpts {
	/** 主调色，用于描边与辉光。 */
	accent: string;
	/** frame 驱动的呼吸辉光强度 0..1，默认 0（静态）。 */
	glow?: number;
	/** 圆角，默认 RADIUS.lg。 */
	radius?: number;
	/** 玻璃底不透明度，默认 0.45。 */
	fill?: number;
	/** 描边基础不透明度，默认 0.32（再叠加 glow）。 */
	borderAlpha?: number;
	/** backdrop blur 像素，默认 14。 */
	blur?: number;
}

// 科技风元素框样式：玻璃底 + 霓虹描边 + 顶部高光 + 辉光投影。
export function techPanel(
	theme: TemplateTheme,
	opts: TechPanelOpts,
): CSSProperties {
	const {colors, RADIUS} = theme;
	const {
		accent,
		glow = 0,
		radius = RADIUS.lg,
		fill = 0.45,
		borderAlpha = 0.32,
		blur = 14,
	} = opts;
	// 描边核心提亮趋近白色（lighten 0.62）+ 加粗到 2.5px，呈现「霓虹发光」亮芯；
	// 外侧叠 accent 彩色辉光，内侧叠白色内辉光，强化「线条本身在发光」的观感。
	const coreColor = lighten(accent, 0.62);
	return {
		background: withAlpha(colors.bg.to, fill),
		border: `2.5px solid ${withAlpha(coreColor, Math.min(1, borderAlpha + 0.42 + glow * 0.25))}`,
		borderRadius: radius,
		backdropFilter: `blur(${blur}px)`,
		WebkitBackdropFilter: `blur(${blur}px)`,
		boxShadow: [
			`0 18px 48px -16px rgba(0,0,0,${0.5 + 0.15 * glow})`,
			`inset 0 1px 0 ${withAlpha('#FFFFFF', 0.1)}`,
			// 内侧白色辉光：让描边亮芯向内扩散，更像通电发光。
			`inset 0 0 10px ${withAlpha('#FFFFFF', 0.12 + 0.08 * glow)}`,
			// 常驻全息辉光基线（GLOW.border，提亮 alpha）+ 呼吸辉光（glow 入参）叠加。
			`0 0 ${GLOW.border.blur + 6}px ${withAlpha(accent, GLOW.border.alpha + 0.14)}`,
			`0 0 ${26 * glow}px ${withAlpha(accent, 0.18 * glow)}`,
		].join(', '),
		position: 'relative',
		overflow: 'hidden',
	};
}

// 科技风四角括号装饰，叠在元素框四角强化「科技/HUD」观感。
export const TechCorners: React.FC<{
	color: string;
	size?: number;
	inset?: number;
	alpha?: number;
}> = ({color, size = 18, inset = 10, alpha = 0.55}) => {
	const c = withAlpha(color, alpha);
	const base: CSSProperties = {
		position: 'absolute',
		width: size,
		height: size,
		borderColor: c,
		borderStyle: 'solid',
		pointerEvents: 'none',
		zIndex: 2,
	};
	return (
		<>
			<div style={{...base, top: inset, left: inset, borderWidth: '2px 0 0 2px'}} />
			<div style={{...base, top: inset, right: inset, borderWidth: '2px 2px 0 0'}} />
			<div style={{...base, bottom: inset, left: inset, borderWidth: '0 0 2px 2px'}} />
			<div style={{...base, bottom: inset, right: inset, borderWidth: '0 2px 2px 0'}} />
		</>
	);
};

// 元素框组件：统一的科技风外框 + 可选四角括号。布局相关样式由 style 传入。
export const TechPanel: React.FC<
	TechPanelOpts & {
		/** 是否渲染四角括号（折角装饰线），默认 false（已全局去除）。 */
		corners?: boolean;
		cornerInset?: number;
		style?: CSSProperties;
		children?: React.ReactNode;
	}
> = ({
	accent,
	glow,
	radius,
	fill,
	borderAlpha,
	blur,
	corners = false,
	cornerInset,
	style,
	children,
}) => {
	const theme = useTheme();
	return (
		<div
			style={{
				...techPanel(theme, {accent, glow, radius, fill, borderAlpha, blur}),
				...style,
			}}
		>
			{corners && <TechCorners color={accent} inset={cornerInset} />}
			{children}
		</div>
	);
};

// 图标 / 序号方片：与元素框同源的科技小方块。
export function techIconChip(
	theme: TemplateTheme,
	color: string,
	opts?: {size?: number; shape?: 'rounded' | 'circle'},
): CSSProperties {
	const {RADIUS} = theme;
	const {size, shape = 'rounded'} = opts ?? {};
	return {
		...(size ? {width: size, height: size} : {}),
		flexShrink: 0,
		borderRadius: shape === 'circle' ? '50%' : RADIUS.md,
		background: withAlpha(color, 0.12),
		border: `1.5px solid ${withAlpha(color, 0.34)}`,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		// 暗投影 + accent 全息辉光（GLOW.icon），让 Icon 片也有投影发光感。
		boxShadow: [
			`0 4px 18px -2px ${withAlpha(color, 0.16)}`,
			`0 0 ${GLOW.icon.blur}px ${withAlpha(color, GLOW.icon.alpha)}`,
		].join(', '),
	};
}

// 标签胶囊（label / 角标）。
export function techPill(theme: TemplateTheme, color: string): CSSProperties {
	const {RADIUS, FONT_SIZE, SPACING} = theme;
	return {
		display: 'inline-flex',
		alignItems: 'center',
		fontSize: FONT_SIZE.caption,
		fontWeight: 800,
		letterSpacing: 2,
		color,
		background: withAlpha(color, 0.1),
		border: `1.5px solid ${withAlpha(color, 0.34)}`,
		borderRadius: RADIUS.pill,
		padding: `6px ${SPACING.md}px`,
	};
}

// 背景辉光团：英雄场景（数字 / 金句 / 章节）身后的弥散光。
export function glowBlob(
	color: string,
	opts?: {width?: number; height?: number; intensity?: number; blur?: number},
): CSSProperties {
	const {width = 700, height = 320, intensity = 0.16, blur = 80} = opts ?? {};
	return {
		position: 'absolute',
		width,
		height,
		borderRadius: '50%',
		background: `radial-gradient(circle, ${withAlpha(color, intensity)} 0%, transparent 70%)`,
		filter: `blur(${blur}px)`,
		zIndex: 0,
		pointerEvents: 'none',
	};
}

// 全息标题文字辉光：accent 色弥散光晕 + 暗色描边（保证深底/浅底都可读）。
// 统一供 HoloTitle 与任何需要发光标题的场景使用。
export function holoTextShadow(
	accent: string,
	opts?: {blur?: number; alpha?: number},
): string {
	const {blur = GLOW.text.blur, alpha = GLOW.text.alpha} = opts ?? {};
	return [
		`0 0 ${blur}px ${withAlpha(accent, alpha)}`,
		`0 0 ${blur * 2}px ${withAlpha(accent, alpha * 0.5)}`,
		`0 2px 12px rgba(0,0,0,0.45)`,
	].join(', ');
}

// accent 渐变强调光条（标题下划线 / 分隔条），自带全息辉光。
export function accentUnderline(
	theme: TemplateTheme,
	opts?: {width?: number; height?: number; glow?: number},
): CSSProperties {
	const {colors} = theme;
	const {width = 120, height = 4, glow = 1} = opts ?? {};
	return {
		width,
		height,
		borderRadius: height / 2,
		background: `linear-gradient(90deg, ${colors.accent[0]}, ${colors.accent[1]})`,
		boxShadow: `0 0 ${GLOW.bar.blur}px ${withAlpha(colors.accent[0], GLOW.bar.alpha * glow)}`,
	};
}

// accent 渐变文字（大数字 / 序号 / 片头主标题）。
export function accentGradientText(
	theme: TemplateTheme,
	opts?: {angle?: number; from?: string; to?: string},
): CSSProperties {
	const {colors} = theme;
	const {angle = 135, from = colors.accent[0], to = colors.accent[1]} =
		opts ?? {};
	return {
		background: `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)`,
		WebkitBackgroundClip: 'text',
		backgroundClip: 'text',
		WebkitTextFillColor: 'transparent',
	};
}
