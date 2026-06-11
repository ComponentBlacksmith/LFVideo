/**
 * ep02-video-render 文案与组件配置数据
 * 数据来源：04-script/README.md + 06-tts/assets/manifest.json
 */

export const ep02Meta = {
  id: 'ep02-video-render',
  title: '代码即视频（Video-as-Code）',
  subtitle: '【AI 视频自动化生产线】第 2 期：渲染引擎篇',
  fps: 30,
  width: 1920,
  height: 1080,
} as const;

// 场景时长（秒），基于 TTS 合成时长
export const sceneDurations = {
  S1_intro: 26,
  S2a_paradigm: 43,
  S2b_frame_as_state: 21,
  S2c_six_routes: 44,
  S3a_judgment_matrix: 60,
  S3b_remotion_reasons: 42,
  S3c_comparison: 21,
  S3d_tradeoffs: 28,
  S4a_pipeline: 31,
  S4b_three_piece: 24,
  S4c_orchestrator: 24,
  S4d_ab_track: 41,
  S5a_data_driven: 33,
  S5b_ssr_guard: 43,
  S5c_ai_render: 40,
  S6_cta: 33,
} as const;

export const totalDurationSec = Object.values(sceneDurations).reduce(
  (sum, d) => sum + d,
  0,
);

// --- 各场景 Props ---

export const introProps = {
  title: '代码即视频（Video-as-Code）',
  subtitle: '【AI 视频自动化生产线】第 2 期：渲染引擎篇',
};

export const s2aProps = {
  heading: '传统剪辑 vs Video-as-Code',
  bullets: [
    '传统：轨道 + 绝对时间轴 → 低 ROI 体力活',
    'VaC 三特性：可版本控制 / 可参数化批量复用 / AI 友好',
    '状态函数思维：帧 = f(时间, 数据)',
  ],
};

export const s2bProps = {
  heading: '帧即状态（Frame as State）',
  bullets: [
    '声明式代码 + 数据 → 渲染器 → 逐帧合成 → MP4',
    '不再拖轨道，而是写函数',
  ],
};

export const s2cProps = {
  title: '六条技术路线',
  columns: ['路线', '描述层', '渲染层', '适用场景'],
  rows: [
    ['Remotion', 'React/TSX', 'Puppeteer截图', '复杂排版+模板复用'],
    ['Motion Canvas', 'TypeScript', '声明式动画', '代码演示+时序'],
    ['Manim', 'Python', '几何渲染', '数学可视化'],
    ['MoviePy', 'Python', 'NumPy+FFmpeg', '简单拼接'],
    ['PixiJS/Cocos', 'JS/TS', 'Canvas', '粒子/游戏效果'],
    ['FFmpeg', 'CLI', 'filtergraph', '批量转码/字幕'],
  ],
  highlightRow: 0,
};

export const s3aProps = {
  title: '判断层矩阵',
  columns: ['方案', '适用', '不适用/坑'],
  rows: [
    ['Remotion', '前端栈复杂排版、跨期模板', 'window顶层读取、BUSL'],
    ['Motion Canvas', '时序动画', '网页级Flex排版'],
    ['Manim', '数学可视化', '学习曲线陡、排版弱'],
    ['MoviePy', '简单拼接', '复杂文字动效'],
    ['PixiJS', '游戏级粒子', '文本对齐'],
    ['FFmpeg', '批量转码', 'filtergraph可读性'],
  ],
};

export const s3bProps = {
  heading: 'Remotion 胜出四理由',
  bullets: [
    '① 数据驱动模板 — 类型安全跨期复用',
    '② AI 友好 — 只填数据和微调CSS',
    '③ CLI 原生 — npx remotion render 一行出片',
    '④ 网页生态红利 — CSS/SVG/Flexbox 随手可用',
  ],
};

export const s3cProps = {
  left: {
    title: 'Remotion ✅',
    points: ['TypeScript约束', '跨期类型安全', 'AI只填数据'],
  },
  right: {
    title: 'HyperFrames ❌',
    points: ['HTML无类型', '结构漂移', '维护灾难'],
  },
};

export const s3dProps = {
  heading: '选型代价（如实交代）',
  bullets: [
    'React技术栈 → AI写组件，人把控架构',
    'BUSL商业授权 → 当前规模无影响',
    'SSR环境约束 → MDC规则一次封死',
  ],
};

export const s4aProps = {
  title: '七阶段生产流水线',
  stages: ['01 选题', '02 策划', '03 视听', '04 脚本', '05 组装', '06 分发', '07 归档'],
  activeStage: 4,
};

export const s4bProps = {
  heading: '三件套',
  bullets: [
    '角色 = system_prompt',
    '工作流 = user_prompt',
    'frontmatter = 状态机',
  ],
};

export const s4cProps = {
  title: '最小编排器伪代码',
  code: `import frontmatter
for doc in glob("content-library/**/README.md"):
  meta = frontmatter.load(doc)
  if meta["status"] == "approved":
    next_stage = get_next(meta["stage"])
    role = load_role(next_stage)
    workflow = load_workflow(next_stage)
    llm.run(system=role, user=workflow)`,
};

export const s4dProps = {
  left: {
    title: 'A轨（全自动）',
    description: 'AI生成数据 → Remotion渲染 → 零人工',
  },
  right: {
    title: 'B轨（真人录屏）',
    description: 'TAD-01 强制真录 → 挂起等待 → 素材到位后合成',
  },
};

export const s5aProps = {
  left: {
    title: '❌ 从零手写',
    points: ['新建ComparisonScene.tsx', '手写布局/样式/动画', '违反模板复用原则'],
  },
  right: {
    title: '✅ 数据驱动',
    points: ['产出data对象', '丢给ComparisonCard', '下期只换数据'],
  },
};

export const s5bProps = {
  left: {
    title: '❌ 顶层读 window',
    code: 'const w = window.innerWidth\n// Node.js 崩溃！',
  },
  right: {
    title: '✅ typeof 守卫',
    code: "const w = typeof window !== 'undefined'\n  ? window.innerWidth\n  : 1920",
  },
};

export const s5cProps = {
  heading: '交给 AI 做好',
  bullets: [
    '① 填数据 + 套现成组件',
    '② 规则替AI兜底（MDC自动守卫）',
    '③ 渲染命令代跑（npx remotion render）',
  ],
};

export const outroProps = {
  summary: '代码即视频 + 流程即代码 = 工程流水线',
  cta: '开源仓库在简介，自取',
  nextEpisode: 'Whisper 毫秒级字幕卡点',
};
