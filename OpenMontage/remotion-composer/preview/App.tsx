import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Player, type PlayerRef} from '@remotion/player';
import {PALETTES} from '../src/custom-templates/theme/palettes';
import {type BackgroundVariant} from '../src/custom-templates/background';
import {SceneComposition} from './SceneComposition';
import {FinalComposition} from './FinalComposition';
import {SCENE_BY_FILE, type SceneMeta} from './registry';
import {SCENE_FILES} from './tree';

const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;

const THEME_NAMES = Object.keys(PALETTES);
const BACKGROUND_VARIANTS: BackgroundVariant[] = [
	'gradient',
	'grid',
	'particles',
	'video',
	'transparent',
];

const pretty = (v: unknown) => JSON.stringify(v, null, 2);

type EditorState = {
	file: string;
	text: string;
	parsed: Record<string, unknown>;
	error: string | null;
};

export const App: React.FC = () => {
	const [selectedFile, setSelectedFile] = useState<string>(
		SCENE_FILES.find((f) => SCENE_BY_FILE[f.file])?.file ?? SCENE_FILES[0]?.file,
	);
	const [themeName, setThemeName] = useState<string>(THEME_NAMES[0]);
	const [background, setBackground] = useState<BackgroundVariant>('gradient');
	// 勾选后从「裸场景」切换到 ep02-shots 的「最终效果」（矩阵变换 + 叠加层）。
	const [finalEffect, setFinalEffect] = useState<boolean>(false);

	const playerRef = useRef<PlayerRef>(null);

	// 切换场景 / 主题 / 背景 / 最终效果时自动从头重播。
	useEffect(() => {
		const p = playerRef.current;
		if (!p) return;
		p.seekTo(0);
		p.play();
	}, [selectedFile, themeName, background, finalEffect]);

	const meta: SceneMeta | undefined = SCENE_BY_FILE[selectedFile];

	const makeEditorState = (file: string): EditorState => {
		const m = SCENE_BY_FILE[file];
		return {
			file,
			text: m ? pretty(m.sampleProps) : '{}',
			parsed: m?.sampleProps ?? {},
			error: null,
		};
	};

	const [editor, setEditor] = useState<EditorState>(() =>
		makeEditorState(selectedFile),
	);

	// 切换场景时在渲染期同步重置 props 编辑器，确保场景组件与其 props 始终一致，
	// 避免新场景用上一个场景的 props 渲染一帧而崩溃（如 CodeScene 缺少 steps）。
	if (editor.file !== selectedFile) {
		setEditor(makeEditorState(selectedFile));
	}

	const propsText = editor.text;
	const parsedProps = editor.parsed;
	const jsonError = editor.error;

	const onPropsChange = (text: string) => {
		try {
			const next = JSON.parse(text) as Record<string, unknown>;
			setEditor((prev) => ({...prev, text, parsed: next, error: null}));
		} catch (e) {
			setEditor((prev) => ({...prev, text, error: (e as Error).message}));
		}
	};

	const bareInputProps = useMemo(
		() =>
			meta
				? {
						SceneComponent: meta.component,
						sceneType: meta.type,
						sceneProps: parsedProps,
						themeName,
						background,
					}
				: null,
		[meta, parsedProps, themeName, background],
	);

	const finalInputProps = useMemo(
		() =>
			meta
				? {
						sceneType: meta.type,
						sceneProps: parsedProps,
						themeName,
						background,
						durationInFrames: meta.durationInFrames,
						fps: FPS,
					}
				: null,
		[meta, parsedProps, themeName, background],
	);

	return (
		<div className="app">
			<aside className="sidebar">
				<div className="sidebar-title">组件库 · scenes</div>
				<div className="tree">
					<div className="tree-root">📁 src/custom-templates/scenes</div>
					<ul className="tree-list">
						{SCENE_FILES.map((node) => {
							const m = SCENE_BY_FILE[node.file];
							const active = node.file === selectedFile;
							return (
								<li key={node.file}>
									<button
										type="button"
										className={`tree-item${active ? ' active' : ''}`}
										onClick={() => setSelectedFile(node.file)}
										disabled={!m}
										title={node.path}
									>
										<span className="tree-file">{node.file}.tsx</span>
										{m ? (
											<span className="tree-label">{m.label}</span>
										) : (
											<span className="tree-label muted">无示例</span>
										)}
									</button>
								</li>
							);
						})}
					</ul>
				</div>
				<div className="sidebar-foot">
					共 {SCENE_FILES.length} 个场景 · 与文件 1:1 对应
				</div>
			</aside>

			<main className="main">
				<header className="toolbar">
					<div className="toolbar-left">
						<span className="scene-name">{meta?.label ?? selectedFile}</span>
						<span className="scene-type">{meta?.type}</span>
					</div>
					<div className="toolbar-right">
						<label className="field">
							<span>主题</span>
							<select
								value={themeName}
								onChange={(e) => setThemeName(e.target.value)}
							>
								{THEME_NAMES.map((t) => (
									<option key={t} value={t}>
										{t}
									</option>
								))}
							</select>
						</label>
						<label className="field">
							<span>背景</span>
							<select
								value={background}
								onChange={(e) =>
									setBackground(e.target.value as BackgroundVariant)
								}
							>
								{BACKGROUND_VARIANTS.map((b) => (
									<option key={b} value={b}>
										{b}
									</option>
								))}
							</select>
						</label>
						<label
							className="field check"
							title="勾选后叠加 ep02-shots 成片效果：透视矩阵 + 数字人 + 调色"
						>
							<input
								type="checkbox"
								checked={finalEffect}
								onChange={(e) => setFinalEffect(e.target.checked)}
							/>
							<span>最终效果</span>
						</label>
					</div>
				</header>

				<section className="stage">
					{meta && finalEffect && finalInputProps ? (
						<div className="player-wrap">
							<Player
								ref={playerRef}
								key={`final-${selectedFile}-${meta.durationInFrames}-${themeName}-${background}`}
								component={FinalComposition}
								inputProps={finalInputProps}
								durationInFrames={meta.durationInFrames}
								fps={FPS}
								compositionWidth={WIDTH}
								compositionHeight={HEIGHT}
								style={{width: '100%', height: '100%'}}
								controls
								loop
								autoPlay
								acknowledgeRemotionLicense
							/>
						</div>
					) : meta && bareInputProps ? (
						<div className="player-wrap">
							<Player
								ref={playerRef}
								key={`${selectedFile}-${meta.durationInFrames}-${themeName}-${background}`}
								component={SceneComposition}
								inputProps={bareInputProps}
								durationInFrames={meta.durationInFrames}
								fps={FPS}
								compositionWidth={WIDTH}
								compositionHeight={HEIGHT}
								style={{width: '100%', height: '100%'}}
								controls
								loop
								autoPlay
								acknowledgeRemotionLicense
							/>
						</div>
					) : (
						<div className="empty">该文件暂无示例 props</div>
					)}
				</section>

				<section className="editor">
					<div className="editor-head">
						<span>Props（JSON，实时生效）</span>
						{jsonError ? (
							<span className="json-error">JSON 错误：{jsonError}</span>
						) : (
							<span className="json-ok">✓ 已应用</span>
						)}
					</div>
					<textarea
						className="editor-area"
						spellCheck={false}
						value={propsText}
						onChange={(e) => onPropsChange(e.target.value)}
					/>
				</section>
			</main>
		</div>
	);
};
