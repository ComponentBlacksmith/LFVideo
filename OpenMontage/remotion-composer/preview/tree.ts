// 用 import.meta.glob 自动发现 scenes/ 下的全部场景文件，保证左侧树与
// 组件库文件「一一对应」：新增 / 删除 .tsx 文件后，树会随之自动同步。
const sceneModules = import.meta.glob('../src/custom-templates/scenes/*.tsx');

export interface SceneFileNode {
	// 文件名去扩展名，如 IntroScene。
	file: string;
	// 相对仓库的展示路径。
	path: string;
}

const IGNORED = new Set(['index']);

export const SCENE_FILES: SceneFileNode[] = Object.keys(sceneModules)
	.map((full) => {
		const file = full.split('/').pop()!.replace(/\.tsx$/, '');
		return {
			file,
			path: full.replace(/^\.\.\//, ''),
		};
	})
	.filter((n) => !IGNORED.has(n.file))
	.sort((a, b) => a.file.localeCompare(b.file));
