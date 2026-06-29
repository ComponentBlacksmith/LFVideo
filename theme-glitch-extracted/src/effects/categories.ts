import {ShowItem} from './showcaseKit';

/**
 * B–L 各类别的方式清单（名称 / 英文名 / 公式），用于全屏展示中的主角文字与说明。
 * 对应 docs/font-entrance-effects-100.md 的编号 11–100。
 */

export const CATEGORY_B: ShowItem[] = [
  {id: 11, name: '上移淡入', enName: 'Slide-Up Fade', formula: 'y=lerp(50,0,easeOut)'},
  {id: 12, name: '回退超调滑入', enName: 'Back Ease', formula: 'easeOutBack(t)'},
  {id: 13, name: '弹性滑入', enName: 'Elastic Slide', formula: '2^(-10t)·sin(...)'},
  {id: 14, name: '重力下坠', enName: 'Gravity Drop', formula: 'y=½·g·t²'},
  {id: 15, name: '抛物线抛入', enName: 'Projectile Toss', formula: 'y=h·4t(1-t)'},
  {id: 16, name: '阻尼回正', enName: 'Damped Settle', formula: 'A·e^(-ζt)·cos(ωt)'},
  {id: 17, name: '速度模糊滑入', enName: 'Motion-Blur Slide', formula: 'blur=k·|v|'},
  {id: 18, name: '惯性甩入', enName: 'Inertia Whip', formula: 'easeOutExpo + skew'},
  {id: 19, name: '磁吸归位', enName: 'Magnetic Snap', formula: 'pos+=(t-pos)·k'},
  {id: 20, name: '折线入场', enName: 'Polyline Path-In', formula: '分段折线插值'},
];

export const CATEGORY_C: ShowItem[] = [
  {id: 21, name: '弹簧弹出', enName: 'Spring Pop', formula: 'spring(scale 0→1)'},
  {id: 22, name: '挤压拉伸', enName: 'Squash & Stretch', formula: 'sX·sY=const'},
  {id: 23, name: '旋转缩放螺入', enName: 'Rotate-Zoom Spiral', formula: 'rot:180°→0°'},
  {id: 24, name: '透视纵深推入', enName: 'Z-Push Perspective', formula: 'translateZ:-800→0'},
  {id: 25, name: '焦点拉近', enName: 'Dolly Zoom', formula: 'scale↑·persp↓'},
  {id: 26, name: '翻牌立体', enName: '3D Card Flip', formula: 'rotateY:90°→0°'},
  {id: 27, name: '折纸展开', enName: 'Origami Unfold', formula: 'rotateX 分段'},
  {id: 28, name: '镜像对开', enName: 'Mirror Split Open', formula: '上下半分'},
  {id: 29, name: '厚度生长', enName: 'Extrude Grow', formula: 'K=round(maxK·t)'},
  {id: 30, name: '弹性拉伸归位', enName: 'Elastic Stretch', formula: 'sY=1+(S-1)·elastic'},
];

export const CATEGORY_D: ShowItem[] = [
  {id: 31, name: '模糊聚焦', enName: 'Blur-to-Focus', formula: 'blur:16→0'},
  {id: 32, name: '失焦呼吸', enName: 'Focus Breathing', formula: 'blur=|sin(πtn)|A(1-t)'},
  {id: 33, name: '墨水晕染', enName: 'Ink Bleed', formula: 'blur=20(1-t)²'},
  {id: 34, name: '辉光绽放', enName: 'Glow Bloom', formula: 'shadowBlur=A·e^(-kt)'},
  {id: 35, name: '色差散焦', enName: 'Chromatic Aberration', formula: 'Δ=D(1-t)'},
  {id: 36, name: '半调网点', enName: 'Halftone Develop', formula: 'r=R(1-t)'},
  {id: 37, name: '像素化解析', enName: 'Pixelate Resolve', formula: 'b=round(B(1-t))+1'},
  {id: 38, name: '热浪扭曲', enName: 'Heat-Haze Reveal', formula: 'd=noise(xf+t)A(1-t)'},
];

export const CATEGORY_E: ShowItem[] = [
  {id: 39, name: '正弦行波', enName: 'Traveling Sine', formula: 'y=A·sin(2πfu-ωt)'},
  {id: 40, name: '余弦摆入', enName: 'Cosine Pendulum', formula: 'θ₀·cos(ωt)·e^(-kt)'},
  {id: 41, name: '驻波涟漪', enName: 'Standing Wave', formula: 'A·sin(ku)cos(ωt)'},
  {id: 42, name: '心跳脉动', enName: 'Heartbeat Pulse', formula: '1+A(sinωt+½sin2ωt)'},
  {id: 43, name: '正切骤变', enName: 'Tangent Snap', formula: 'y=A·tan((t-.5)θ)'},
  {id: 44, name: '李萨如聚合', enName: 'Lissajous Gather', formula: 'sin(aφ+δ),sin(bφ)'},
  {id: 45, name: '阻尼正弦定格', enName: 'Damped Sine', formula: 'A·e^(-ζt)·sin(ωt+φ)'},
  {id: 46, name: '拍频闪烁', enName: 'Beat Flicker', formula: 'cos(2πf₁t)cos(2πf₂t)'},
  {id: 47, name: '螺旋极坐标', enName: 'Polar Spiral-In', formula: 'r=R(1-t),θ=θ₀+kt'},
  {id: 48, name: '波纹扩散', enName: 'Ripple Expand', formula: 'delay=dist·c'},
  {id: 49, name: '旗帜飘动', enName: 'Flag Wave', formula: 'A·sin(ku-ωt)(1-t)'},
  {id: 50, name: '摆线滚入', enName: 'Cycloid Roll-In', formula: 'x=R(φ-sinφ)'},
];

export const CATEGORY_F: ShowItem[] = [
  {id: 51, name: '打字机', enName: 'Typewriter', formula: 'n=floor(t·N)'},
  {id: 52, name: '线性交错', enName: 'Linear Stagger', formula: 'delay(i)=i·d'},
  {id: 53, name: '居中开花', enName: 'Center-Out Bloom', formula: 'delay=|i-N/2|·d'},
  {id: 54, name: '随机浮现', enName: 'Random Stagger', formula: 'delay=rand(i)·D'},
  {id: 55, name: '高斯交错', enName: 'Gaussian Stagger', formula: '∝1-e^(-(u-.5)²/2σ²)'},
  {id: 56, name: '逐字波浪', enName: 'Per-Char Wave', formula: 'y=A·sin(ωt-iΔφ)'},
  {id: 57, name: '多米诺翻倒', enName: 'Domino Topple', formula: 'rot=90°(1-τ)'},
  {id: 58, name: '字距收拢', enName: 'Spacing Collapse', formula: 'spacing=lerp(W,0,t)'},
  {id: 59, name: '逐行上推', enName: 'Line Mask Up', formula: 'y:100%→0'},
  {id: 60, name: '词级弹入', enName: 'Word Pop', formula: 'delay(w)=w·d'},
  {id: 61, name: '卷帘百叶', enName: 'Vertical Blinds', formula: 'scaleX:0→1'},
  {id: 62, name: '蛇形进场', enName: 'Boustrophedon', formula: '蛇形重排 delay'},
];

export const CATEGORY_G: ShowItem[] = [
  {id: 63, name: '横向擦除', enName: 'Horizontal Wipe', formula: 'inset(0 (100(1-p))% 0 0)'},
  {id: 64, name: '对角揭示', enName: 'Diagonal Reveal', formula: 'polygon(...) 推进'},
  {id: 65, name: '圆形光圈', enName: 'Circular Iris', formula: 'circle(p·150%)'},
  {id: 66, name: '马赛克揭示', enName: 'Mosaic Reveal', formula: 'delay=rand(r,c)·D'},
  {id: 67, name: '扫描线显影', enName: 'Scanline Develop', formula: 'y<lerp(0,H,t)'},
  {id: 68, name: '形状蒙版', enName: 'SVG Mask Grow', formula: 'mask scale=p'},
  {id: 69, name: '笔画手写', enName: 'Handwriting', formula: 'dashoffset=L(1-p)'},
  {id: 70, name: '液面上涨', enName: 'Liquid Fill Up', formula: 'h=lerp(0,H,p)'},
];

export const CATEGORY_H: ShowItem[] = [
  {id: 71, name: '噪声抖动收敛', enName: 'Noise Jitter Settle', formula: 'noise(i,tf)·A(1-t)'},
  {id: 72, name: '乱码解码', enName: 'Scramble / Decode', formula: 'lock(i)=i·d'},
  {id: 73, name: '沙化重组', enName: 'Sand Reform', formula: 'lerp(rand,target,t)'},
  {id: 74, name: '概率点亮', enName: 'Stochastic Light-Up', formula: 'rand(i)<t'},
  {id: 75, name: '布朗漂入', enName: 'Brownian Drift-In', formula: 'pos+=randn·σ(1-t)'},
  {id: 76, name: '泊松雨滴', enName: 'Poisson Rain', formula: '间隔~Exp(λ)'},
  {id: 77, name: '噪声场流入', enName: 'Curl-Noise Flow', formula: 'v=curl(noise)(1-t)'},
  {id: 78, name: '信噪比上升', enName: 'SNR Rise', formula: 'lerp(noise,glyph,t)'},
  {id: 79, name: '抖动溶解', enName: 'Dither Dissolve', formula: 'bayer(x,y)<t'},
  {id: 80, name: '量子坍缩', enName: 'Quantum Collapse', formula: 'softmax→target'},
];

export const CATEGORY_I: ShowItem[] = [
  {id: 81, name: '粒子聚合', enName: 'Particle Assemble', formula: 'lerp(spawn,glyph,t)'},
  {id: 82, name: '破碎逆放', enName: 'Reverse Shatter', formula: 'lerp(scatter,0,p)'},
  {id: 83, name: '冲击波成形', enName: 'Shockwave Form', formula: 'dist<R(t)'},
  {id: 84, name: '烟雾凝结', enName: 'Smoke Condense', formula: '扩散半径∝(1-t)'},
  {id: 85, name: '磁粉吸附', enName: 'Ferrofluid Pull', formula: '沿法线·noise·p'},
  {id: 86, name: '体素堆叠', enName: 'Voxel Stack-Up', formula: 'delay=(y+rand)·d'},
  {id: 87, name: '拉链合拢', enName: 'Zipper Merge', formula: 'x=±X(1-easeInOut)'},
  {id: 88, name: '细胞增殖', enName: 'Mitosis Spawn', formula: 'N=2^(floor(tk))'},
];

export const CATEGORY_J: ShowItem[] = [
  {id: 89, name: '色相旋转', enName: 'Hue-Rotate In', formula: 'hue=lerp(360n,0,t)'},
  {id: 90, name: '流光扫光', enName: 'Gradient Sweep', formula: 'bgPos:-100%→200%'},
  {id: 91, name: '冷暖渐变', enName: 'Blackbody Warm-Up', formula: '色温 T(t)'},
  {id: 92, name: '投影成形', enName: 'Long-Shadow Cast', formula: 'L=lerp(Lmax,L0,p)'},
  {id: 93, name: '光照浮雕', enName: 'Lighting Emboss', formula: 'max(0,N·L(t))'},
  {id: 94, name: '霓虹点亮', enName: 'Neon Sequential', formula: 'seg delay=k·d'},
];

export const CATEGORY_K: ShowItem[] = [
  {id: 95, name: 'RGB撕裂故障', enName: 'Glitch Tear', formula: 'step(rand(y,t)-θ)·D'},
  {id: 96, name: '数据流下落', enName: 'Datamosh Cascade', formula: 'y=lerp(-H,0,easeOut)'},
  {id: 97, name: '方波频闪', enName: 'Square-Wave Strobe', formula: 'sin(ωt)>0?1:0'},
];

export const CATEGORY_L: ShowItem[] = [
  {id: 98, name: '分形递归展开', enName: 'Fractal Unfold', formula: 'L 层∈[L/Lmax,...]'},
  {id: 99, name: '混沌吸引子归位', enName: 'Attractor Settle', formula: '洛伦兹·(1-t)'},
  {id: 100, name: '逻辑斯蒂分岔', enName: 'Logistic Bifurcation', formula: 'x_{n+1}=r·x_n(1-x_n)'},
];
