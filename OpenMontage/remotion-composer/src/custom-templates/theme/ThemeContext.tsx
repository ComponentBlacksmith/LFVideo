import React, {createContext, useContext} from 'react';
import {FONT_SIZE, SPACING, RADIUS, SPRING, GLOW} from './tokens';
import {
	resolvePalette,
	resolveFonts,
	type Palette,
	type Fonts,
} from './palettes';

// 统一令牌：颜色/字体随主题变，字号/间距/圆角/spring 为结构性常量。
// 所有模板组件通过 useTheme() 读取，杜绝任何硬编码颜色。
export interface TemplateTheme {
	name: string;
	colors: Palette;
	fonts: Fonts;
	FONT_SIZE: typeof FONT_SIZE;
	SPACING: typeof SPACING;
	RADIUS: typeof RADIUS;
	SPRING: typeof SPRING;
	GLOW: typeof GLOW;
}

export function buildTemplateTheme(themeName?: string): TemplateTheme {
	return {
		name: themeName || 'warm-glass',
		colors: resolvePalette(themeName),
		fonts: resolveFonts(themeName),
		FONT_SIZE,
		SPACING,
		RADIUS,
		SPRING,
		GLOW,
	};
}

const ThemeContext = createContext<TemplateTheme>(buildTemplateTheme());

export const TemplateThemeProvider: React.FC<{
	theme: TemplateTheme;
	children: React.ReactNode;
}> = ({theme, children}) => (
	<ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
);

export function useTheme(): TemplateTheme {
	return useContext(ThemeContext);
}
