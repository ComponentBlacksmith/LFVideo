import React from 'react';
import {
	IntroScene,
	OutroScene,
	ConceptScene,
	TimelineScene,
	TableScene,
	ComparisonScene,
	CodeScene,
} from '../src/custom-templates/scenes';

export interface SceneMeta {
	// 与 scenes/ 目录下的文件名（去扩展名）一一对应。
	file: string;
	// 在 registry.ts 中登记的场景类型。
	type: string;
	label: string;
	component: React.ComponentType<Record<string, unknown>>;
	durationInFrames: number;
	sampleProps: Record<string, unknown>;
}

const cast = (c: unknown) => c as React.ComponentType<Record<string, unknown>>;

// 每个场景的示例 props 取自真实 demo 数据（public/demo-props），
// 覆盖该场景的全部字段，方便直接看到完整动效。
export const SCENE_META: SceneMeta[] = [
	{
		file: 'IntroScene',
		type: 'intro_scene',
		label: '片头 · 标题入场',
		component: cast(IntroScene),
		durationInFrames: 150,
		sampleProps: {
			title: '用 Vibe Coding 搭一套自动出片的渲染引擎',
			subtitle: '把视频写成代码，让 AI 按配置自动出片',
		},
	},
	{
		file: 'OutroScene',
		type: 'outro_scene',
		label: '片尾 · 总结收束',
		component: cast(OutroScene),
		durationInFrames: 150,
		sampleProps: {
			headline: '三步搭好你的自动出片引擎，没基础也能复制',
			cta: '找路径 · 选型 · 落地',
		},
	},
	{
		file: 'ConceptScene',
		type: 'concept_scene',
		label: '概念 · 多卡片要点',
		component: cast(ConceptScene),
		durationInFrames: 240,
		sampleProps: {
			eyebrow: '找技术路径',
			title: '把选择题丢给 AI：有哪些现成路子？',
			items: [
				{
					label: 'NOT',
					title: '不埋头啃文档',
					desc: '不自己从零调研，直接把选择题交给 AI',
					icon: '🙅',
				},
				{
					label: 'ASK',
					title: '一句话需求',
					desc: '想把视频写成代码自动出片，有哪些现成路子？',
					icon: '💬',
				},
				{
					label: 'PICK',
					title: '按需求做减法',
					desc: '对照真实需求，筛掉不合适的方案',
					icon: '✅',
				},
			],
		},
	},
	{
		file: 'TimelineScene',
		type: 'timeline_scene',
		label: '时间线 · 阶段演进',
		component: cast(TimelineScene),
		durationInFrames: 240,
		sampleProps: {
			eyebrow: '演进路线',
			title: '渲染引擎的演进',
			events: [
				{year: '2018', title: '手工剪辑', desc: '拖时间轴，改一处全手工重排', icon: '🎬'},
				{year: '2021', title: '模板化', desc: '固定模板批量套数据', icon: '🧩'},
				{year: '2024', title: '代码即视频', desc: '用 Remotion 把视频写成代码', icon: '⚡'},
			],
		},
	},
	{
		file: 'TableScene',
		type: 'table_scene',
		label: '表格 · 多方案对比',
		component: cast(TableScene),
		durationInFrames: 260,
		sampleProps: {
			eyebrow: '判断层 = 边界，非中立百科',
			title: '选型最容易翻车：看清每条路何时不好使',
			headers: ['方案', '适用场景', '已知坑'],
			rows: [
				['Remotion', '前端栈、复杂排版、跨期复用', '顶层读 window 崩；BUSL 授权'],
				['Motion Canvas', '代码演示、精确时序', '生态小、模板自建'],
				['Manim', '数学 / 公式可视化', '排版弱、渲染慢'],
				['MoviePy', '简单拼接、音轨闪避', '自适应排版繁琐、吃内存'],
				['FFmpeg', '批量转码、字幕烧录', '命令晦涩、难调试'],
			],
			highlightCell: '1-1',
		},
	},
	{
		file: 'ComparisonScene',
		type: 'comparison_scene',
		label: '对比 · 左右两栏',
		component: cast(ComparisonScene),
		durationInFrames: 180,
		sampleProps: {
			title: '对着需求做减法',
			leftLabel: '我的三条需求',
			leftValue: '批量换数据 · AI 改不易错 · 跨期好维护',
			rightLabel: '✅ Remotion 命中',
			rightValue: '三条全中，Remotion 赢',
		},
	},
	{
		file: 'CodeScene',
		type: 'code_scene',
		label: '代码 · 终端打字',
		component: cast(CodeScene),
		durationInFrames: 360,
		sampleProps: {
			terminalTitle: 'comparison 配置：照现成组件填数据',
			prompt: '$',
			steps: [
				{kind: 'cmd', text: 'cat comparison.json'},
				{kind: 'out', text: '{'},
				{kind: 'out', text: '  "type": "comparison",'},
				{kind: 'out', text: '  "title": "传统剪辑 vs 代码即视频",'},
				{kind: 'out', text: '  "leftLabel": "传统剪辑",'},
				{kind: 'out', text: '  "leftValue": "拖时间轴，改一处全手工重排",'},
				{kind: 'out', text: '  "rightLabel": "代码即视频",'},
				{kind: 'out', text: '  "rightValue": "改一行配置，全片自动重排"'},
				{kind: 'out', text: '}'},
				{kind: 'pill', text: '✓ 配置完成'},
			],
		},
	},
];

export const SCENE_BY_FILE: Record<string, SceneMeta> = Object.fromEntries(
	SCENE_META.map((m) => [m.file, m]),
);
