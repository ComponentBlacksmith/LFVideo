/**
 * A 类：透明度 · 多项式与指数曲线（方法 1–10）
 *
 * 每个函数输入归一化进度 t ∈ [0,1]，返回该曲线在该进度下的值。
 * 大多数返回 opacity ∈ [0,1]；个别（高斯闪现 / 双指数过冲）会返回
 * 额外的亮度 / 缩放等附加量，便于在组件中驱动多个样式属性。
 *
 * 对应参考文档：docs/font-entrance-effects-100.md  →  A. 透明度类（1–10）
 */

export const clamp01 = (x: number): number => Math.max(0, Math.min(1, x));

/** 1. 线性淡入（Linear Fade）: opacity = t */
export const linearFade = (t: number): number => clamp01(t);

/** 2. 二次淡入（Quadratic Ease-In）: opacity = t^2 */
export const quadraticEaseIn = (t: number): number => {
  const x = clamp01(t);
  return x * x;
};

/** 3. 三次缓出淡入（Cubic Ease-Out）: opacity = 1 - (1 - t)^3 */
export const cubicEaseOut = (t: number): number => {
  const x = clamp01(t);
  return 1 - Math.pow(1 - x, 3);
};

/** 4. 指数冲入（Exponential Ease-Out）: opacity = 1 - 2^(-10t) */
export const exponentialEaseOut = (t: number): number => {
  const x = clamp01(t);
  return x >= 1 ? 1 : 1 - Math.pow(2, -10 * x);
};

/** 5. 对数渐显（Logarithmic Reveal）: opacity = ln(1 + (e-1)·t) */
export const logarithmicReveal = (t: number): number => {
  const x = clamp01(t);
  return clamp01(Math.log(1 + (Math.E - 1) * x));
};

/**
 * 6. Sigmoid 渐显（Logistic S-Curve）: 1 / (1 + e^(-k(t-0.5)))
 * 做端点归一化，保证 t=0→0、t=1→1。
 */
export const sigmoidReveal = (t: number, k = 12): number => {
  const x = clamp01(t);
  const logistic = (v: number) => 1 / (1 + Math.exp(-k * (v - 0.5)));
  const a = logistic(0);
  const b = logistic(1);
  return clamp01((logistic(x) - a) / (b - a));
};

/**
 * 7. 高斯脉冲闪现（Gaussian Flash-In）
 * 透明度走快速淡入；额外返回 brightness = 1 + A·e^(-((t-μ)^2)/(2σ^2))
 * 用于在出现瞬间过曝高亮一下再回落。
 */
export const gaussianFlashIn = (
  t: number,
  {amp = 1.6, mu = 0.3, sigma = 0.12}: {amp?: number; mu?: number; sigma?: number} = {}
): {opacity: number; brightness: number} => {
  const x = clamp01(t);
  const opacity = cubicEaseOut(Math.min(1, x / 0.4));
  const brightness = 1 + amp * Math.exp(-((x - mu) * (x - mu)) / (2 * sigma * sigma));
  return {opacity, brightness};
};

/** 8. 伽马校正淡入（Gamma Fade）: opacity = t^(1/2.2) */
export const gammaFade = (t: number, gamma = 2.2): number => {
  const x = clamp01(t);
  return Math.pow(x, 1 / gamma);
};

/**
 * 9. 双指数过冲（Bi-Exponential Overshoot）
 * v = (1 - e^(-a t)) · (1 + b·e^(-c t))，先冲过 1 再回稳。
 * 同一个 v 同时驱动 opacity（限幅）与 scale（保留过冲）。
 */
export const biExponentialOvershoot = (
  t: number,
  {a = 6, b = 0.5, c = 9}: {a?: number; b?: number; c?: number} = {}
): {opacity: number; scale: number} => {
  const x = clamp01(t);
  const v = (1 - Math.exp(-a * x)) * (1 + b * Math.exp(-c * x));
  return {opacity: clamp01(v), scale: v};
};

/**
 * 10. 幂律阶梯淡入（Power-Step Fade）
 * 把进度量化成 k 段，每段内再套 t^2 平滑，呈"分级点亮"。
 */
export const powerStepFade = (t: number, steps = 5): number => {
  const x = clamp01(t);
  const stepIndex = Math.min(steps, Math.floor(x * steps));
  const base = stepIndex / steps;
  const frac = clamp01(x * steps - stepIndex);
  const eased = base + (frac * frac) / steps;
  return clamp01(eased);
};

export type OpacityCurve = {
  /** 序号（对应文档编号 1–10） */
  id: number;
  /** 中文名 */
  name: string;
  /** 英文名 */
  enName: string;
  /** 数学表达（用于在预览中展示） */
  formula: string;
  /**
   * 给定归一化进度 t，返回该方法在该帧应用到文字上的样式片段。
   */
  apply: (t: number) => {
    opacity: number;
    transform?: string;
    filter?: string;
  };
};

export const OPACITY_CURVES_A: OpacityCurve[] = [
  {
    id: 1,
    name: '线性淡入',
    enName: 'Linear Fade',
    formula: 'opacity = t',
    apply: (t) => ({opacity: linearFade(t)}),
  },
  {
    id: 2,
    name: '二次淡入',
    enName: 'Quadratic Ease-In',
    formula: 'opacity = t²',
    apply: (t) => ({opacity: quadraticEaseIn(t)}),
  },
  {
    id: 3,
    name: '三次缓出',
    enName: 'Cubic Ease-Out',
    formula: 'opacity = 1 − (1 − t)³',
    apply: (t) => ({opacity: cubicEaseOut(t)}),
  },
  {
    id: 4,
    name: '指数冲入',
    enName: 'Exponential Ease-Out',
    formula: 'opacity = 1 − 2^(−10t)',
    apply: (t) => ({opacity: exponentialEaseOut(t)}),
  },
  {
    id: 5,
    name: '对数渐显',
    enName: 'Logarithmic Reveal',
    formula: 'opacity = ln(1 + (e−1)·t)',
    apply: (t) => ({opacity: logarithmicReveal(t)}),
  },
  {
    id: 6,
    name: 'Sigmoid 渐显',
    enName: 'Logistic S-Curve',
    formula: 'opacity = 1 / (1 + e^(−k(t−0.5)))',
    apply: (t) => ({opacity: sigmoidReveal(t)}),
  },
  {
    id: 7,
    name: '高斯闪现',
    enName: 'Gaussian Flash-In',
    formula: 'b = 1 + A·e^(−(t−μ)²/2σ²)',
    apply: (t) => {
      const {opacity, brightness} = gaussianFlashIn(t);
      return {opacity, filter: `brightness(${brightness})`};
    },
  },
  {
    id: 8,
    name: '伽马淡入',
    enName: 'Gamma Fade',
    formula: 'opacity = t^(1/2.2)',
    apply: (t) => ({opacity: gammaFade(t)}),
  },
  {
    id: 9,
    name: '双指数过冲',
    enName: 'Bi-Exponential Overshoot',
    formula: 'v = (1−e^(−at))(1+b·e^(−ct))',
    apply: (t) => {
      const {opacity, scale} = biExponentialOvershoot(t);
      return {opacity, transform: `scale(${scale})`};
    },
  },
  {
    id: 10,
    name: '幂律阶梯',
    enName: 'Power-Step Fade',
    formula: 'opacity = ⌊t·k⌋/k (段内 t²)',
    apply: (t) => ({opacity: powerStepFade(t)}),
  },
];
