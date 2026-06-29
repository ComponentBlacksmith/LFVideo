import {Phase} from '../types';

/**
 * 顺序场景的时间编排：每条内容占一个 slot = 入场 + 停留 + 出场。
 * 用于"一次只有一条在台上"的场景（Hero / Caption / Lower-third）。
 */
export type SeqTiming = {inF: number; holdF: number; outF: number};

export const slotLen = (s: SeqTiming): number => s.inF + s.holdF + s.outF;

export const seqAt = (
  frame: number,
  s: SeqTiming
): {active: number; phase: Phase; t: number; local: number} => {
  const slot = slotLen(s);
  const active = Math.floor(frame / slot);
  const local = frame - active * slot;
  if (local < s.inF) return {active, phase: 'in', t: local / s.inF, local};
  if (local < s.inF + s.holdF) return {active, phase: 'in', t: 1, local};
  return {active, phase: 'out', t: (local - s.inF - s.holdF) / s.outF, local};
};

export const seqTotalFrames = (count: number, s: SeqTiming): number => count * slotLen(s);
