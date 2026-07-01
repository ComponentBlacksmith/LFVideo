// 薄动画层 —— 缓动 / 在场度 / 周期振荡（全部纯函数，frame 驱动，确定性）。
import type {Phase} from './types';

export const clamp01 = (x: number): number => Math.max(0, Math.min(1, x));

export const easeOutCubic = (x: number): number => 1 - Math.pow(1 - x, 3);
export const easeInCubic = (x: number): number => x * x * x;
export const easeInOutCubic = (x: number): number =>
	x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
export const easeOutBack = (x: number): number => {
	const c1 = 1.70158;
	const c3 = c1 + 1;
	return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

export type EaseFn = (x: number) => number;

/**
 * 在场度 presence ∈ [0,1]：1 = 完全到位（稳定态），0 = 完全缺席。
 * - phase='in'：presence = ease(t)
 * - phase='out'：presence = 1 - ease(t)
 */
export const presence = (
	phase: Phase,
	t: number,
	ease: EaseFn = easeOutCubic
): number => (phase === 'in' ? ease(clamp01(t)) : 1 - ease(clamp01(t)));

/**
 * 周期振荡，返回 [0,1] 的正弦波。用于替代 CSS `@keyframes ... infinite`
 * 这类时间驱动动画（在 Remotion 逐帧渲染下不可靠）。
 * @param frame   当前帧
 * @param fps     帧率
 * @param periodSec 一个完整周期的秒数
 * @param phaseSec  相位偏移（秒），用于让多个元素错峰
 */
/**
 * 根据场景总帧数计算比例化错峰参数，让入场节奏随场景时长自适应。
 * 首元素在 startRatio 处开始，全部元素在 totalRatio 处完成入场。
 * @param durationInFrames 场景总帧数（Sequence 内即镜头时长）
 * @param numItems 子元素数量
 * @param startRatio 首元素延迟占总时长比例（默认 0.05 = 5%）
 * @param totalRatio 末元素入场完成占总时长比例（默认 0.4 = 40%）
 * @returns {start, stagger} 首元素延迟帧数 + 相邻元素错峰帧数
 */
export function proportionalTiming(
	durationInFrames: number,
	numItems: number,
	startRatio = 0.05,
	totalRatio = 0.4,
): {start: number; stagger: number} {
	const start = Math.round(durationInFrames * startRatio);
	const total = Math.round(durationInFrames * totalRatio);
	const stagger =
		numItems > 1 ? Math.max(1, Math.round((total - start) / (numItems - 1))) : 0;
	return {start, stagger};
}

export const osc01 = (
	frame: number,
	fps: number,
	periodSec: number,
	phaseSec = 0
): number => {
	const tt = ((frame / fps + phaseSec) / periodSec) * Math.PI * 2;
	return (Math.sin(tt) + 1) / 2;
};
