import React from 'react';

// ---- Math helpers (ported from theme-glitch showcaseKit) ----
export const clamp01 = (x: number): number => Math.max(0, Math.min(1, x));
export const lerp = (a: number, b: number, p: number): number => a + (b - a) * p;
export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
export const easeInCubic = (t: number): number => t * t * t;

/** Deterministic PRNG ∈ [0,1) */
export const rand = (seed: number): number => {
	const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
	return s - Math.floor(s);
};

/** Two-dimensional seeded random */
export const rand2 = (a: number, b: number): number => rand(a * 73.13 + b * 19.97);

/** 1D smooth noise ∈ [-1,1] */
export const noise1 = (x: number): number => {
	const i = Math.floor(x);
	const f = x - i;
	const u = f * f * (3 - 2 * f);
	const a = rand(i) * 2 - 1;
	const b = rand(i + 1) * 2 - 1;
	return a + (b - a) * u;
};

// ---- Scramble/Decode component (effect #72) ----
const GLYPHS = 'アカサタナ01XΞΨ#%&@王金木水火土π∑∆◇▦';

export const randGlyph = (seed: number): string =>
	GLYPHS[Math.floor(rand2(Math.floor(seed), 7.3) * GLYPHS.length)] ?? '#';

export const Scramble: React.FC<{
	text: string;
	progress: number; // 0→1 decode progress
	frame: number;
	seed: number;
	scrambleColor?: string;
}> = ({text, progress, frame, seed, scrambleColor = '#ff4d6d'}) => {
	const chars = Array.from(text);
	const N = chars.length;
	return (
		<>
			{chars.map((ch, i) => {
				const lock = (i / Math.max(N, 1)) * 0.85;
				const locked = progress > lock + 0.12;
				return (
					<span key={i} style={{color: locked ? 'inherit' : scrambleColor}}>
						{locked ? ch : randGlyph(frame * 0.5 + i * 31 + seed)}
					</span>
				);
			})}
		</>
	);
};

// ---- PerChar component for per-character animation ----
export const PerChar: React.FC<{
	text: string;
	charStyle: (i: number, N: number) => React.CSSProperties;
}> = ({text, charStyle}) => {
	const chars = Array.from(text);
	const N = chars.length;
	return (
		<>
			{chars.map((ch, i) => (
				<span key={i} style={{display: 'inline-block', whiteSpace: 'pre'}}>
					<span style={{display: 'inline-block', ...charStyle(i, N)}}>
						{ch === ' ' ? '\u00A0' : ch}
					</span>
				</span>
			))}
		</>
	);
};
