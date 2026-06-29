import React from 'react';
import {Phase, TextEffect} from './types';
import {TextEffectStyle, textEffectToCSS, mergeTextShadow} from './textEffect';

/**
 * 把一个「动效原子」渲染成一段文字。场景只负责定位/字号/配色（baseStyle），
 * 效果只负责进/出的视觉（wrapper + content）。两者在此组合。
 * textEffect 提供静态字体效果（描边/阴影/发光/渐变），与动效的 textShadow 合并。
 */
export const TextFx: React.FC<{
  effect: TextEffect;
  text: string;
  phase: Phase;
  t: number;
  frame: number;
  seed?: number;
  baseStyle?: React.CSSProperties;
  textEffect?: TextEffectStyle;
}> = ({effect, text, phase, t, frame, seed = 1, baseStyle, textEffect}) => {
  const v = effect.visual({text, phase, t, frame, seed});
  const teCSS = textEffectToCSS(textEffect);
  const mergedShadow = mergeTextShadow(teCSS.textShadow as string | undefined, v.wrapper?.textShadow as string | undefined);
  const wrapperStyle: React.CSSProperties = {...v.wrapper};
  if (mergedShadow !== undefined) wrapperStyle.textShadow = mergedShadow;
  return (
    <span style={{display: 'inline-block', whiteSpace: 'nowrap', ...baseStyle, ...teCSS, ...wrapperStyle}}>
      {v.content ?? text}
    </span>
  );
};
