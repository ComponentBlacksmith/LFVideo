import React from 'react';
import {EffectVisual, EffectVisualArgs, TextEffect} from './types';
import {
  clamp01,
  lerp,
  easeOutCubic,
  easeOutBack,
  easeOutElastic,
  noise1,
  rand2,
  randn,
  presence,
  PerChar,
  Scramble,
} from './shared';
import {OPACITY_CURVES_A} from '../effects/opacityCurves';
import {
  CATEGORY_B,
  CATEGORY_C,
  CATEGORY_D,
  CATEGORY_E,
  CATEGORY_F,
  CATEGORY_G,
  CATEGORY_H,
  CATEGORY_I,
  CATEGORY_J,
  CATEGORY_K,
  CATEGORY_L,
} from '../effects/categories';

/** 线性在场进度：in→t, out→1-t（用于逐字交错/解码等） */
const appear = (a: EffectVisualArgs): number =>
  a.phase === 'in' ? clamp01(a.t) : clamp01(1 - a.t);

/** 逐字局部进度：全局 g∈[0,1]，第 i 个字符在 [start, start+spread] 内 0→1 */
const stagger = (g: number, i: number, N: number, spread = 0.45): number => {
  const start = (i / Math.max(N - 1, 1)) * (1 - spread);
  return clamp01((g - start) / spread);
};

type Builder = (a: EffectVisualArgs) => EffectVisual;

const B: Record<number, Builder> = {
  11: (a) => {
    const p = presence(a.phase, a.t);
    return {wrapper: {opacity: clamp01(p * 1.4), transform: `translateY(${(1 - p) * 64}px)`}};
  },
  12: (a) => {
    const p = presence(a.phase, a.t, easeOutBack);
    return {wrapper: {opacity: clamp01(a.phase === 'in' ? a.t * 1.6 : (1 - a.t) * 1.6), transform: `translateX(${(1 - p) * -180}px)`}};
  },
  13: (a) => {
    const p = presence(a.phase, a.t, easeOutElastic);
    return {wrapper: {opacity: clamp01(a.phase === 'in' ? a.t * 2 : (1 - a.t) * 2), transform: `translateX(${(1 - p) * 220}px)`}};
  },
  14: (a) => {
    const e = (x: number) => x * x;
    const p = presence(a.phase, a.t, e);
    return {wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 3), transform: `translateY(${(p - 1) * 520}px)`}};
  },
  15: (a) => {
    const p = presence(a.phase, a.t);
    return {wrapper: {opacity: p, transform: `translate(${(1 - p) * -320}px, ${-Math.sin(p * Math.PI) * 220}px)`}};
  },
  16: (a) => {
    const tt = a.phase === 'in' ? a.t : 1 - a.t;
    const y = Math.exp(-4 * tt) * Math.cos(9 * tt) * 70;
    return {wrapper: {opacity: clamp01(tt * 3), transform: `translateY(${y}px)`}};
  },
  17: (a) => {
    const p = presence(a.phase, a.t);
    return {wrapper: {opacity: p, transform: `translateX(${(1 - p) * -300}px)`, filter: `blur(${(1 - p) * 18}px)`}};
  },
  18: (a) => {
    const expo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
    const p = presence(a.phase, a.t, expo);
    return {wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 3), transform: `translateX(${(1 - p) * -340}px) skewX(${(1 - p) * 22}deg)`}};
  },
  19: (a) => {
    const p = presence(a.phase, a.t);
    const ang = rand2(a.seed, 5) * Math.PI * 2;
    const d = (1 - p) * 240;
    return {wrapper: {opacity: p, transform: `translate(${Math.cos(ang) * d}px, ${Math.sin(ang) * d}px)`}};
  },
  20: (a) => {
    const p = presence(a.phase, a.t);
    const y = p < 0.5 ? lerp(-180, 50, p / 0.5) : lerp(50, 0, (p - 0.5) / 0.5);
    return {wrapper: {opacity: p, transform: `translate(${(1 - p) * -280}px, ${y}px)`}};
  },
};

const C: Record<number, Builder> = {
  21: (a) => {
    const p = presence(a.phase, a.t, easeOutBack);
    return {wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 2.5), transform: `scale(${clamp01(p)})`}};
  },
  22: (a) => {
    const p = presence(a.phase, a.t);
    const sx = 1 + (1 - p) * 0.9;
    return {wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 3), transform: `scale(${sx}, ${1 / sx})`}};
  },
  23: (a) => {
    const p = presence(a.phase, a.t);
    return {wrapper: {opacity: p, transform: `rotate(${(1 - p) * 180}deg) scale(${p})`}};
  },
  24: (a) => {
    const p = presence(a.phase, a.t);
    return {wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 2), transform: `perspective(1000px) translateZ(${(p - 1) * 800}px)`}};
  },
  25: (a) => {
    const p = presence(a.phase, a.t);
    return {wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 2), transform: `scale(${lerp(1.9, 1, p)})`, filter: `blur(${(1 - p) * 6}px)`}};
  },
  26: (a) => {
    const p = presence(a.phase, a.t);
    return {wrapper: {opacity: clamp01((p - 0.1) / 0.3), transform: `perspective(1000px) rotateY(${(1 - p) * 90}deg)`}};
  },
  27: (a) => {
    const p = presence(a.phase, a.t);
    return {wrapper: {opacity: clamp01((p - 0.1) / 0.3), transform: `perspective(1000px) rotateX(${(1 - p) * -90}deg)`, transformOrigin: 'top center'}};
  },
  28: (a) => {
    const p = presence(a.phase, a.t);
    return {wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 3), transform: `scaleY(${p})`}};
  },
  29: (a) => {
    const p = presence(a.phase, a.t);
    const depth = Math.round(p * 9);
    const shadow = Array.from({length: depth}, (_, k) => `${k + 1}px ${k + 1}px 0 rgba(90,60,170,0.5)`).join(', ');
    return {wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 3), textShadow: shadow || 'none'}};
  },
  30: (a) => {
    const p = presence(a.phase, a.t, easeOutElastic);
    return {wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 2.5), transform: `scaleY(${clamp01(p)})`}};
  },
};

const D: Record<number, Builder> = {
  31: (a) => {
    const p = presence(a.phase, a.t);
    return {wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 2), filter: `blur(${(1 - p) * 16}px)`}};
  },
  32: (a) => {
    const p = presence(a.phase, a.t);
    const blur = Math.abs(Math.sin(a.frame * 0.25)) * (1 - p) * 10 + (1 - p) * 3;
    return {wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 2), filter: `blur(${blur}px)`}};
  },
  33: (a) => {
    const p = presence(a.phase, a.t);
    const b = 20 * (1 - p) * (1 - p);
    return {wrapper: {opacity: p, filter: `blur(${b}px)`, textShadow: `0 0 ${b}px rgba(40,90,140,0.6)`}};
  },
  34: (a) => {
    const p = presence(a.phase, a.t);
    const g = 14 + (1 - p) * 44;
    return {wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 2), textShadow: `0 0 ${g}px #8fd6ff, 0 0 ${g * 2}px #4aa3ff`}};
  },
  35: (a) => {
    const p = presence(a.phase, a.t);
    const o = (1 - p) * 16;
    return {wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 2), textShadow: `${o}px 0 #ff004c, ${-o}px 0 #00e5ff`}};
  },
  36: (a) => {
    const p = presence(a.phase, a.t);
    return {wrapper: {opacity: p, filter: `blur(${(1 - p) * 8}px) contrast(${lerp(2.4, 1, p)})`}};
  },
  37: (a) => {
    const p = presence(a.phase, a.t);
    return {wrapper: {opacity: p, filter: `blur(${(1 - p) * 7}px) contrast(${lerp(1.8, 1, p)})`, letterSpacing: `${(1 - p) * 6}px`}};
  },
  38: (a) => {
    const p = presence(a.phase, a.t);
    const sk = Math.sin(a.frame * 0.3) * (1 - p) * 8;
    return {wrapper: {opacity: p, transform: `skewX(${sk}deg)`, filter: `blur(${(1 - p) * 4}px)`}};
  },
};

const E: Record<number, Builder> = {
  39: (a) => {
    const p = presence(a.phase, a.t);
    return {
      wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 2)},
      content: (
        <PerChar
          text={a.text}
          charStyle={(i, N) => ({transform: `translateY(${Math.sin((i / N) * Math.PI * 4 - a.frame * 0.2) * 34 * (1 - p)}px)`})}
        />
      ),
    };
  },
  40: (a) => {
    const tt = a.phase === 'in' ? a.t : 1 - a.t;
    const rot = 32 * Math.cos(a.frame * 0.2) * Math.exp(-3 * tt);
    return {wrapper: {opacity: clamp01(tt * 3), transform: `rotate(${rot}deg)`, transformOrigin: 'top center'}};
  },
  41: (a) => {
    const p = presence(a.phase, a.t);
    return {
      wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 2)},
      content: (
        <PerChar
          text={a.text}
          charStyle={(i) => ({transform: `translateY(${Math.sin(i * 0.9) * Math.cos(a.frame * 0.18) * 30 * (1 - p)}px)`})}
        />
      ),
    };
  },
  42: (a) => {
    const p = presence(a.phase, a.t);
    const beat = 1 + Math.max(0, Math.sin(a.frame * 0.5)) * 0.08 * p;
    return {wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 3), transform: `scale(${p * beat})`}};
  },
  43: (a) => {
    const p = presence(a.phase, a.t);
    const y = -Math.tan((p - 0.5) * 1.1) * 110;
    return {wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 3), transform: `translateY(${y}px)`}};
  },
  44: (a) => {
    const p = presence(a.phase, a.t);
    return {
      wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 2)},
      content: (
        <PerChar
          text={a.text}
          charStyle={(i) => ({transform: `translate(${Math.sin(2 * i + a.frame * 0.1) * 40 * (1 - p)}px, ${Math.sin(3 * i) * 40 * (1 - p)}px)`})}
        />
      ),
    };
  },
  45: (a) => {
    const tt = a.phase === 'in' ? a.t : 1 - a.t;
    const y = Math.exp(-4 * tt) * Math.sin(12 * tt) * 55;
    return {wrapper: {opacity: clamp01(tt * 3), transform: `translateY(${y}px)`}};
  },
  46: (a) => {
    const p = presence(a.phase, a.t);
    const beat = 0.55 + 0.45 * Math.abs(Math.cos(a.frame * 0.5) * Math.cos(a.frame * 0.13));
    return {wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 2) * beat}};
  },
  47: (a) => {
    const p = presence(a.phase, a.t);
    const r = (1 - p) * 320;
    const ang = a.frame * 0.1 + (1 - p) * 6;
    return {wrapper: {opacity: p, transform: `translate(${Math.cos(ang) * r}px, ${Math.sin(ang) * r}px) rotate(${(1 - p) * 180}deg)`}};
  },
  48: (a) => {
    const g = appear(a);
    return {
      wrapper: {opacity: clamp01(g * 2)},
      content: (
        <PerChar
          text={a.text}
          charStyle={(i, N) => {
            const dist = Math.abs(i - (N - 1) / 2);
            const li = clamp01(g * (N + 2) - dist);
            return {transform: `scale(${li})`, opacity: li};
          }}
        />
      ),
    };
  },
  49: (a) => {
    const p = presence(a.phase, a.t);
    return {
      wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 2)},
      content: (
        <PerChar
          text={a.text}
          charStyle={(i) => ({transform: `translateY(${Math.sin(i * 0.7 - a.frame * 0.25) * (26 * (1 - p) + 6 * p)}px) rotate(${Math.sin(i * 0.7 - a.frame * 0.25) * 6}deg)`})}
        />
      ),
    };
  },
  50: (a) => {
    const p = presence(a.phase, a.t);
    return {wrapper: {opacity: p, transform: `translateX(${(1 - p) * -340}px) rotate(${(1 - p) * -360}deg)`}};
  },
};

const F: Record<number, Builder> = {
  51: (a) => {
    const g = appear(a);
    const N = Array.from(a.text).length;
    const n = Math.floor(g * N + 0.001);
    return {
      content: (
        <PerChar text={a.text} charStyle={(i) => ({opacity: i < n ? 1 : 0})} />
      ),
    };
  },
  52: (a) => withStagger(a, (li) => ({opacity: li, transform: `translateY(${(1 - li) * 30}px)`})),
  53: (a) => {
    const g = appear(a);
    return {
      content: (
        <PerChar
          text={a.text}
          charStyle={(i, N) => {
            const dist = Math.abs(i - (N - 1) / 2) / Math.max(N / 2, 1);
            const li = clamp01((g - dist * 0.6) / 0.4);
            return {opacity: li, transform: `scale(${li})`};
          }}
        />
      ),
    };
  },
  54: (a) => {
    const g = appear(a);
    return {
      content: (
        <PerChar
          text={a.text}
          charStyle={(i) => {
            const start = rand2(i, a.seed) * 0.6;
            const li = clamp01((g - start) / 0.4);
            return {opacity: li, transform: `translateY(${(1 - li) * 26}px)`};
          }}
        />
      ),
    };
  },
  55: (a) => {
    const g = appear(a);
    return {
      content: (
        <PerChar
          text={a.text}
          charStyle={(i, N) => {
            const u = i / Math.max(N - 1, 1);
            const delay = (1 - Math.exp(-((u - 0.5) * (u - 0.5)) / (2 * 0.16 * 0.16))) * 0.6;
            const li = clamp01((g - delay) / 0.4);
            return {opacity: li, transform: `translateY(${(1 - li) * 24}px)`};
          }}
        />
      ),
    };
  },
  56: (a) => {
    const g = appear(a);
    return {
      content: (
        <PerChar
          text={a.text}
          charStyle={(i) => {
            const li = stagger(g, i, Array.from(a.text).length);
            return {opacity: li, transform: `translateY(${Math.sin(i * 0.6 - a.frame * 0.2) * 22 * (1 - li) + (1 - li) * 20}px)`};
          }}
        />
      ),
    };
  },
  57: (a) => {
    const g = appear(a);
    return {
      content: (
        <PerChar
          text={a.text}
          charStyle={(i) => {
            const li = stagger(g, i, Array.from(a.text).length, 0.5);
            return {opacity: clamp01(li * 2), transform: `perspective(600px) rotateX(${(1 - li) * 90}deg)`, transformOrigin: 'bottom'};
          }}
        />
      ),
    };
  },
  58: (a) => {
    const p = presence(a.phase, a.t);
    return {wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 2), letterSpacing: `${(1 - p) * 44}px`}};
  },
  59: (a) => {
    const p = presence(a.phase, a.t);
    const clip = `inset(${(1 - p) * 100}% 0 0 0)`;
    return {wrapper: {opacity: 1, clipPath: clip, WebkitClipPath: clip, transform: `translateY(${(1 - p) * 18}px)`}};
  },
  60: (a) => {
    const g = appear(a);
    const words = a.text.split(/(\s+)/);
    let charBase = 0;
    return {
      content: (
        <>
          {words.map((w, wi) => {
            const li = stagger(g, wi, words.length, 0.5);
            charBase += w.length;
            return (
              <span key={wi} style={{display: 'inline-block', whiteSpace: 'pre', opacity: clamp01(li * 2), transform: `scale(${lerp(0.6, 1, easeOutBack(li))})`}}>
                {w}
              </span>
            );
          })}
        </>
      ),
    };
  },
  61: (a) => {
    const g = appear(a);
    return {
      content: (
        <PerChar
          text={a.text}
          charStyle={(i) => {
            const li = stagger(g, i, Array.from(a.text).length, 0.5);
            return {transform: `scaleX(${li})`, transformOrigin: 'left', opacity: clamp01(li * 3)};
          }}
        />
      ),
    };
  },
  62: (a) => {
    const g = appear(a);
    return {
      content: (
        <PerChar
          text={a.text}
          charStyle={(i, N) => {
            const li = stagger(g, i, N, 0.5);
            const dir = i % 2 === 0 ? 1 : -1;
            return {opacity: li, transform: `translateX(${dir * (1 - li) * 40}px)`};
          }}
        />
      ),
    };
  },
};

function withStagger(a: EffectVisualArgs, map: (li: number, i: number, N: number) => React.CSSProperties): EffectVisual {
  const g = appear(a);
  return {
    content: (
      <PerChar text={a.text} charStyle={(i, N) => map(stagger(g, i, N), i, N)} />
    ),
  };
}

const G: Record<number, Builder> = {
  63: (a) => {
    const p = presence(a.phase, a.t);
    const clip = `inset(0 ${(1 - p) * 100}% 0 0)`;
    return {wrapper: {clipPath: clip, WebkitClipPath: clip}};
  },
  64: (a) => {
    const p = presence(a.phase, a.t);
    const e = p * 160 - 30;
    const clip = `polygon(0 0, ${e}% 0, ${e - 60}% 100%, 0 100%)`;
    return {wrapper: {clipPath: clip, WebkitClipPath: clip}};
  },
  65: (a) => {
    const p = presence(a.phase, a.t);
    const clip = `circle(${p * 75}% at 50% 50%)`;
    return {wrapper: {clipPath: clip, WebkitClipPath: clip}};
  },
  66: (a) => {
    const g = appear(a);
    return {
      content: (
        <PerChar
          text={a.text}
          charStyle={(i) => ({opacity: rand2(i, a.seed) < g ? 1 : 0})}
        />
      ),
    };
  },
  67: (a) => {
    const p = presence(a.phase, a.t);
    const clip = `inset(0 0 ${(1 - p) * 100}% 0)`;
    return {wrapper: {clipPath: clip, WebkitClipPath: clip}};
  },
  68: (a) => {
    const p = presence(a.phase, a.t);
    const clip = `circle(${p * 95}% at 32% 36%)`;
    return {wrapper: {clipPath: clip, WebkitClipPath: clip}};
  },
  69: (a) => {
    const g = appear(a);
    return {
      content: (
        <PerChar
          text={a.text}
          charStyle={(i, N) => {
            const li = stagger(g, i, N, 0.35);
            const clip = `inset(0 ${(1 - li) * 100}% 0 0)`;
            return {clipPath: clip, WebkitClipPath: clip} as React.CSSProperties;
          }}
        />
      ),
    };
  },
  70: (a) => {
    const p = presence(a.phase, a.t);
    const clip = `inset(${(1 - p) * 100}% 0 0 0)`;
    return {wrapper: {clipPath: clip, WebkitClipPath: clip}};
  },
};

const H: Record<number, Builder> = {
  71: (a) => {
    const p = presence(a.phase, a.t);
    return {
      wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 2)},
      content: (
        <PerChar
          text={a.text}
          charStyle={(i) => ({transform: `translate(${noise1(a.frame * 0.4 + i * 7) * 26 * (1 - p)}px, ${noise1(a.frame * 0.4 + i * 7 + 99) * 26 * (1 - p)}px)`})}
        />
      ),
    };
  },
  72: (a) => {
    const g = appear(a);
    return {content: <Scramble text={a.text} a={g} frame={a.frame} seed={a.seed * 100} />};
  },
  73: (a) => {
    const g = appear(a);
    return {
      content: (
        <PerChar
          text={a.text}
          charStyle={(i) => {
            const li = clamp01((g - rand2(i, a.seed) * 0.4) / 0.6);
            return {opacity: li, transform: `translate(${(1 - li) * (rand2(i, 3) - 0.5) * 80}px, ${(1 - li) * (rand2(i, 4) - 0.5) * 80}px)`};
          }}
        />
      ),
    };
  },
  74: (a) => {
    const g = appear(a);
    return {
      content: (
        <PerChar text={a.text} charStyle={(i) => ({opacity: rand2(i, a.seed) < g ? 1 : 0.06})} />
      ),
    };
  },
  75: (a) => {
    const p = presence(a.phase, a.t);
    return {
      wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 2)},
      content: (
        <PerChar
          text={a.text}
          charStyle={(i) => ({transform: `translate(${randn(i + a.seed) * 40 * (1 - p)}px, ${randn(i + a.seed + 50) * 40 * (1 - p)}px)`})}
        />
      ),
    };
  },
  76: (a) => {
    const g = appear(a);
    return {
      content: (
        <PerChar
          text={a.text}
          charStyle={(i) => {
            const start = rand2(i, a.seed) * 0.6;
            const li = clamp01((g - start) / 0.35);
            return {opacity: li, transform: `translateY(${(li - 1) * 260}px)`};
          }}
        />
      ),
    };
  },
  77: (a) => {
    const p = presence(a.phase, a.t);
    return {
      wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 2)},
      content: (
        <PerChar
          text={a.text}
          charStyle={(i) => ({transform: `translate(${noise1(i * 0.5 + a.frame * 0.05) * 70 * (1 - p)}px, ${noise1(i * 0.5 + a.frame * 0.05 + 30) * 70 * (1 - p)}px)`})}
        />
      ),
    };
  },
  78: (a) => {
    const g = appear(a);
    return {content: <Scramble text={a.text} a={g} frame={a.frame} seed={a.seed * 50} scrambleColor="#7fd1c0" />};
  },
  79: (a) => {
    const g = appear(a);
    return {
      content: (
        <PerChar text={a.text} charStyle={(i) => ({opacity: rand2(i * 1.7, a.seed * 2.3) < g ? 1 : 0})} />
      ),
    };
  },
  80: (a) => {
    const g = appear(a);
    return {content: <Scramble text={a.text} a={g * g} frame={a.frame * 2} seed={a.seed * 13} scrambleColor="#c08bff" />};
  },
};

const I: Record<number, Builder> = {
  81: (a) => scatterChars(a, 220, true),
  82: (a) => {
    const g = appear(a);
    return {
      content: (
        <PerChar
          text={a.text}
          charStyle={(i) => {
            const li = clamp01(g);
            const ang = rand2(i, a.seed) * Math.PI * 2;
            const d = (1 - li) * 200;
            return {opacity: li, transform: `translate(${Math.cos(ang) * d}px, ${Math.sin(ang) * d}px) rotate(${(1 - li) * 220}deg)`};
          }}
        />
      ),
    };
  },
  83: (a) => {
    const g = appear(a);
    return {
      content: (
        <PerChar
          text={a.text}
          charStyle={(i, N) => {
            const dist = Math.abs(i - (N - 1) / 2);
            const li = clamp01(g * (N + 2) - dist * 1.2);
            return {opacity: li, transform: `scale(${li})`};
          }}
        />
      ),
    };
  },
  84: (a) => {
    const p = presence(a.phase, a.t);
    return {
      wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 2)},
      content: (
        <PerChar
          text={a.text}
          charStyle={(i) => ({filter: `blur(${(1 - p) * 12}px)`, transform: `translate(${randn(i + a.seed) * 50 * (1 - p)}px, ${-(1 - p) * 40}px)`})}
        />
      ),
    };
  },
  85: (a) => {
    const p = presence(a.phase, a.t);
    return {
      content: (
        <PerChar
          text={a.text}
          charStyle={(i) => {
            const n = noise1(i * 0.9 + a.seed);
            return {opacity: clamp01(p * 2), transform: `translateY(${n * 60 * (1 - p)}px)`};
          }}
        />
      ),
    };
  },
  86: (a) => {
    const g = appear(a);
    return {
      content: (
        <PerChar
          text={a.text}
          charStyle={(i) => {
            const start = (rand2(i, a.seed) * 0.4 + (i % 3) * 0.1);
            const li = clamp01((g - start) / 0.4);
            return {opacity: li, transform: `translateY(${(1 - li) * 80}px)`};
          }}
        />
      ),
    };
  },
  87: (a) => {
    const g = appear(a);
    return {
      content: (
        <PerChar
          text={a.text}
          charStyle={(i, N) => {
            const li = clamp01(g);
            const dir = i % 2 === 0 ? -1 : 1;
            const order = Math.abs(i - (N - 1) / 2) / Math.max(N / 2, 1);
            const lo = clamp01((li - order * 0.4) / 0.6);
            return {opacity: lo, transform: `translateX(${dir * (1 - lo) * 200}px)`};
          }}
        />
      ),
    };
  },
  88: (a) => {
    const p = presence(a.phase, a.t);
    const steps = Math.pow(2, Math.floor(p * 3)) / 8;
    return {wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 3), transform: `scale(${lerp(0.2, 1, clamp01(steps + p * 0.2))})`}};
  },
};

function scatterChars(a: EffectVisualArgs, dist: number, fade: boolean): EffectVisual {
  const g = appear(a);
  return {
    content: (
      <PerChar
        text={a.text}
        charStyle={(i) => {
          const li = clamp01(g);
          const ang = rand2(i, a.seed) * Math.PI * 2;
          const d = (1 - li) * dist;
          return {opacity: fade ? li : 1, transform: `translate(${Math.cos(ang) * d}px, ${Math.sin(ang) * d}px)`};
        }}
      />
    ),
  };
}

const J: Record<number, Builder> = {
  89: (a) => {
    const p = presence(a.phase, a.t);
    return {wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 2), filter: `hue-rotate(${(1 - p) * 360}deg) saturate(${lerp(2.5, 1, p)})`}};
  },
  90: (a) => {
    const p = presence(a.phase, a.t);
    const pos = lerp(-120, 220, p);
    return {
      wrapper: {
        opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 2),
        backgroundImage: 'linear-gradient(110deg, #6a7cff 0%, #ffffff 45%, #4ad9ff 55%, #6a7cff 100%)',
        backgroundSize: '250% 100%',
        backgroundPosition: `${pos}% 0`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
      },
    };
  },
  91: (a) => {
    const p = presence(a.phase, a.t);
    return {wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 2), filter: `sepia(${(1 - p) * 0.8}) hue-rotate(${(1 - p) * -30}deg) saturate(${lerp(2, 1, p)})`}};
  },
  92: (a) => {
    const p = presence(a.phase, a.t);
    const L = Math.round(lerp(28, 4, p));
    const shadow = Array.from({length: L}, (_, k) => `${k + 1}px ${k + 1}px 0 rgba(0,0,0,0.35)`).join(', ');
    return {wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 2), textShadow: shadow}};
  },
  93: (a) => {
    const p = presence(a.phase, a.t);
    const off = lerp(6, 1.5, p);
    return {wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 2), textShadow: `${off}px ${off}px 0 rgba(255,255,255,0.25), ${-off}px ${-off}px 0 rgba(0,0,0,0.5)`}};
  },
  94: (a) => {
    const g = appear(a);
    return {
      content: (
        <PerChar
          text={a.text}
          charStyle={(i, N) => {
            const li = stagger(g, i, N, 0.4);
            const on = li > 0.5;
            return {opacity: on ? 1 : 0.12, textShadow: on ? '0 0 10px #ff4df0, 0 0 22px #ff4df0' : 'none'};
          }}
        />
      ),
    };
  },
};

const K: Record<number, Builder> = {
  95: (a) => {
    const p = presence(a.phase, a.t);
    const o = (1 - p) * 18 + (rand2(Math.floor(a.frame / 2), a.seed) - 0.5) * (1 - p) * 30;
    const sx = (rand2(Math.floor(a.frame / 3), a.seed + 1) - 0.5) * (1 - p) * 30;
    return {wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 3), transform: `translateX(${sx}px)`, textShadow: `${o}px 0 #ff003c, ${-o}px 0 #00f0ff`}};
  },
  96: (a) => {
    const p = presence(a.phase, a.t);
    return {
      wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 2)},
      content: (
        <PerChar
          text={a.text}
          charStyle={(i) => {
            const start = rand2(i, a.seed) * 0.4;
            const li = clamp01((appear(a) - start) / 0.5);
            return {opacity: li, transform: `translateY(${(li - 1) * 300}px)`};
          }}
        />
      ),
    };
  },
  97: (a) => {
    const strobe = Math.sin(a.frame * 0.8) > 0 ? 1 : 0.18;
    return {wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 2) * strobe}};
  },
};

const L: Record<number, Builder> = {
  98: (a) => {
    const p = presence(a.phase, a.t);
    const lvl = Math.floor(p * 4) / 4;
    return {wrapper: {opacity: clamp01((a.phase === 'in' ? a.t : 1 - a.t) * 3), transform: `scale(${lerp(0.2, 1, clamp01(lvl + p * 0.25))}) rotate(${(1 - p) * 45}deg)`}};
  },
  99: (a) => {
    const p = presence(a.phase, a.t);
    return {
      content: (
        <PerChar
          text={a.text}
          charStyle={(i) => {
            const n = noise1(i * 1.3 + a.seed + a.frame * 0.02);
            const n2 = noise1(i * 1.3 + a.seed + 77 + a.frame * 0.02);
            return {opacity: clamp01(p * 2), transform: `translate(${n * 120 * (1 - p)}px, ${n2 * 120 * (1 - p)}px)`};
          }}
        />
      ),
    };
  },
  100: (a) => {
    const p = presence(a.phase, a.t);
    return {
      content: (
        <PerChar
          text={a.text}
          charStyle={(i) => {
            let x = 0.5 + (rand2(i, a.seed) - 0.5) * 0.3;
            const r = lerp(3.9, 2.6, p);
            for (let k = 0; k < 6; k++) x = r * x * (1 - x);
            return {transform: `translateY(${(x - 0.5) * 120 * (1 - p)}px)`, opacity: clamp01(p * 2)};
          }}
        />
      ),
    };
  },
};

const BUILDERS: Record<number, Builder> = {...B, ...C, ...D, ...E, ...F, ...G, ...H, ...I, ...J, ...K, ...L};

const catFx = (cat: string, items: {id: number; name: string; enName: string; formula: string}[]): TextEffect[] =>
  items.map((it) => ({
    id: it.id,
    category: cat,
    name: it.name,
    enName: it.enName,
    formula: it.formula,
    visual: BUILDERS[it.id],
  }));

const A_FX: TextEffect[] = OPACITY_CURVES_A.map((c) => ({
  id: c.id,
  category: 'A',
  name: c.name,
  enName: c.enName,
  formula: c.formula,
  visual: (a: EffectVisualArgs): EffectVisual => {
    const s = c.apply(a.phase === 'in' ? a.t : 1 - a.t);
    return {wrapper: {opacity: s.opacity, transform: s.transform, filter: s.filter}};
  },
}));

export const EFFECTS: TextEffect[] = [
  ...A_FX,
  ...catFx('B', CATEGORY_B),
  ...catFx('C', CATEGORY_C),
  ...catFx('D', CATEGORY_D),
  ...catFx('E', CATEGORY_E),
  ...catFx('F', CATEGORY_F),
  ...catFx('G', CATEGORY_G),
  ...catFx('H', CATEGORY_H),
  ...catFx('I', CATEGORY_I),
  ...catFx('J', CATEGORY_J),
  ...catFx('K', CATEGORY_K),
  ...catFx('L', CATEGORY_L),
];

export const EFFECT_BY_ID: Record<number, TextEffect> = Object.fromEntries(
  EFFECTS.map((e) => [e.id, e])
);

export const effectById = (id: number): TextEffect => EFFECT_BY_ID[id] ?? EFFECTS[0];
