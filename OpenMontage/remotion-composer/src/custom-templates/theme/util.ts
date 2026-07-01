// 把 #RRGGBB / #RGB 转成带 alpha 的 rgba()。用于从主题底色派生玻璃卡面，
// 避免在组件里硬编码具体 rgba。
export function withAlpha(hex: string, alpha: number): string {
	const clean = hex.replace('#', '');
	const full =
		clean.length === 3
			? clean
					.split('')
					.map((c) => c + c)
					.join('')
			: clean;
	const bigint = parseInt(full, 16);
	const r = (bigint >> 16) & 255;
	const g = (bigint >> 8) & 255;
	const b = bigint & 255;
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// 把 #RRGGBB 朝白色混合 t（0..1）。t=0 原色，t=1 纯白。
// 用于让描边核心更趋近白色，呈现「霓虹发光」的亮芯感。
export function lighten(hex: string, t: number): string {
	const clean = hex.replace('#', '');
	const full =
		clean.length === 3
			? clean
					.split('')
					.map((c) => c + c)
					.join('')
			: clean;
	const bigint = parseInt(full, 16);
	const r = (bigint >> 16) & 255;
	const g = (bigint >> 8) & 255;
	const b = bigint & 255;
	const mix = (c: number) => Math.round(c + (255 - c) * t);
	const toHex = (c: number) => mix(c).toString(16).padStart(2, '0');
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
