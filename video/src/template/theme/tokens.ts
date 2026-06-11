/**
 * 设计令牌：全局字号/颜色/间距/动画弹簧参数
 * 排版规范：任何可见文字不得小于 24px（1920×1080 基准）
 */

export const colors = {
  primary: '#6366F1',       // Indigo-500
  primaryDark: '#4F46E5',   // Indigo-600
  secondary: '#06B6D4',     // Cyan-500
  accent: '#F59E0B',        // Amber-500
  success: '#10B981',       // Emerald-500
  error: '#EF4444',         // Red-500
  bg: '#0F172A',            // Slate-900
  bgLight: '#1E293B',      // Slate-800
  surface: '#334155',       // Slate-700
  text: '#F8FAFC',          // Slate-50
  textMuted: '#94A3B8',     // Slate-400
  border: '#475569',        // Slate-600
} as const;

export const fontSizes = {
  title: 64,        // 主标题（推荐 64-80px）
  subtitle: 40,     // 副标题（推荐 34-44px）
  body: 28,         // 正文（推荐 26-32px）
  label: 24,        // 标注（最小值，不得更小）
} as const;

export const spacing = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 40,
  xl: 64,
  xxl: 96,
} as const;

export const springs = {
  gentle: { damping: 15, mass: 1, stiffness: 80 },
  snappy: { damping: 12, mass: 0.8, stiffness: 200 },
  bouncy: { damping: 8, mass: 1, stiffness: 150 },
} as const;

export const layout = {
  width: 1920,
  height: 1080,
  fps: 30,
  padding: 80,
} as const;
