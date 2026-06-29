import React from 'react';

/**
 * 文字特效解耦架构 —— 类型定义
 *
 * 核心思想：把"动效原子"（一段文字怎么进/怎么出）与"场景编排"（这段文字
 * 在镜头里扮演什么角色、怎么布局、停留多久、是否堆叠）彻底分离。
 *
 *  - TextEffect：纯入场/出场原子，只描述单段文字的视觉，不含任何布局/堆栈。
 *  - Scene（见 ./scenes）：上层模板，负责位置、字号、配色、时间编排与多段共存方式，
 *    可以接入任意一个 TextEffect。
 */

/** 动效阶段：入场 or 出场。hold（停留）= 用 phase='in', t=1 取稳定态。 */
export type Phase = 'in' | 'out';

export type EffectVisualArgs = {
  /** 要呈现的文字 */
  text: string;
  /** 当前阶段 */
  phase: Phase;
  /**
   * 阶段内归一化进度 t ∈ [0,1]
   *  - phase='in'：0 = 刚开始入场（屏外/不可见），1 = 完全到位
   *  - phase='out'：0 = 稳定态，1 = 完全离场（消失）
   */
  t: number;
  /** 全局帧号，用于持续性的噪声/抖动/振荡 */
  frame: number;
  /** 该段文字的确定性种子（同一段每帧一致，避免闪烁） */
  seed: number;
};

export type EffectVisual = {
  /** 作用在文字外层容器上的样式（transform / filter / opacity 等） */
  wrapper?: React.CSSProperties;
  /** 自定义内容渲染（逐字 / 粒子 / 乱码等）；省略则由场景渲染纯文字 */
  content?: React.ReactNode;
};

export type TextEffect = {
  /** 编号（对应文档 1–100） */
  id: number;
  /** 所属类别 A–L */
  category: string;
  /** 中文名 */
  name: string;
  /** 英文名 */
  enName: string;
  /** 数学表达 */
  formula: string;
  /** 给定阶段与进度，返回该段文字的视觉片段 */
  visual: (args: EffectVisualArgs) => EffectVisual;
};
