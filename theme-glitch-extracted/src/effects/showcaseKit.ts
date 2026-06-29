/**
 * 全屏展示动画共享工具：时间编排、数学小工具、确定性随机/噪声。
 * 各类别（A–L）的展示合成共用这里的时序逻辑，但各自实现不同的入场/出场/堆栈。
 */

export const SEG = 48; // 每个方式占据"主角"的帧数
export const REVEAL_FRAC = 0.5; // 主角阶段中用于"出现"的比例
export const TAIL_SEG = 3; // 末尾留给最后一个方式沉淀为历史的额外段数

export const clamp01 = (x: number): number => Math.max(0, Math.min(1, x));
export const clamp = (x: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, x));
export const lerp = (a: number, b: number, p: number): number => a + (b - a) * p;
export const smoothstep = (edge0: number, edge1: number, x: number): number => {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

/** 总时长（帧）：方式数 + 收尾段 */
export const totalFrames = (count: number): number => (count + TAIL_SEG) * SEG;

export type ItemTiming = {
  /** 连续出场序数：d∈[0,1) 主角；d≥1 历史 */
  d: number;
  /** 离场/堆叠推进量 max(0, d-1) */
  m: number;
  /** 是否当前主角 */
  isFeatured: boolean;
  /** 主角阶段的出现进度（0→1，前 REVEAL_FRAC 完成） */
  revealT: number;
  /** 出场过渡 0→1（m 的前一段） */
  move: number;
};

export const itemTiming = (frame: number, index: number): ItemTiming => {
  const d = (frame - index * SEG) / SEG;
  const m = Math.max(0, d - 1);
  return {
    d,
    m,
    isFeatured: d >= 0 && d < 1,
    revealT: clamp01(d / REVEAL_FRAC),
    move: clamp01(m),
  };
};

/** 确定性伪随机 ∈ [0,1)，以整数 seed 为种子（每帧一致，避免闪烁） */
export const rand = (seed: number): number => {
  const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/** 二维种子随机 */
export const rand2 = (a: number, b: number): number => rand(a * 73.13 + b * 19.97);

/** 一维平滑噪声 ∈ [-1,1] */
export const noise1 = (x: number): number => {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  const a = rand(i) * 2 - 1;
  const b = rand(i + 1) * 2 - 1;
  return a + (b - a) * u;
};

/** easeOutBack：带过冲的缓出 */
export const easeOutBack = (t: number, s = 1.70158): number => {
  const x = t - 1;
  return 1 + (s + 1) * x * x * x + s * x * x;
};

/** easeInBack：带预备的缓入 */
export const easeInBack = (t: number, s = 1.70158): number =>
  (s + 1) * t * t * t - s * t * t;

/** easeOutCubic */
export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

/** easeOutElastic：到位后弹性振荡 */
export const easeOutElastic = (t: number): number => {
  if (t === 0) return 0;
  if (t === 1) return 1;
  const c4 = (2 * Math.PI) / 3;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

export type ShowItem = {
  id: number;
  name: string;
  enName: string;
  formula: string;
};
