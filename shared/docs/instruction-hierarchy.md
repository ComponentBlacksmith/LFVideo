# 指令层级体系使用说明（instruction-hierarchy）

> 面向人类维护者与 AI 工具的简明手册。规范本体在根目录 `AGENTS.md`（层级声明）与 `shared/rules/forbidden-actions.md`（L1 禁止清单），本文只讲"怎么用"。

## 一、五层模型速览

| 层 | 是什么 | 在哪 | 谁能改 |
|----|--------|------|--------|
| L1 | Forbidden Actions 禁止清单 | `shared/rules/forbidden-actions.md` | 人类确认后才能改 |
| L2 | 项目级约束（核心契约/频道配置/角色调用/口播规范） | `AGENT_GUIDE.md` + `shared/rules/` | 人类或 AI 提案 + 人类审核 |
| L3 | 经审核的工作流与角色 | `shared/workflows/` + `shared/roles/` | 同上 |
| L4 | 机器化校验 | `scripts/pipeline_lint.py`、`sync_*.py --check`、pre-commit、schemas、CI（`.github/workflows/lint.yml`） | 代码评审 |
| L5 | AI 自身判断 | —（仅 L1-L4 无覆盖时，须说明依据） | — |

冲突时下层服从上层；同层以更具体、更贴近当前产物的规则为准；子目录 `AGENTS.md` 就近优先（L1 除外，全局生效）。

## 二、各工具如何接入

- **Claude Code / Codex / Copilot 等 AGENTS.md 系工具**：自动读根 `AGENTS.md`（Claude Code 经 `CLAUDE.md` 跳板）；进入 `OpenMontage/` 子树时就近读该目录的 `AGENTS.md`。
- **Cursor / Windsurf**：加载 `.cursor/rules/` / `.windsurf/rules/` 生成副本（含 forbidden-actions），由 `scripts/sync_rules.py` 从 `shared/rules/` 生成，勿手改。
- **Devin**：经 `AGENT_GUIDE.md` Rule Zero 对齐（其顶部已指回 `AGENTS.md` 与 L1 清单）。

## 三、新增/修改规则放哪层（决策树）

1. 是"绝不可发生"的硬红线（提交密钥、AI 替人 approve、改冻结契约…）？→ **L1**：在来源文件写细则，再到 `forbidden-actions.md` 登记 F-xx 并标注来源，**须人类确认**。
2. 是全频道口径/偏好（人设、口播风格、平台默认值）？→ **L2**：`shared/rules/` 对应文件（口播进 `voice-style.md`，频道配置进 `project-context.md`）。
3. 是某阶段的做法/步骤，或某角色的职责边界？→ **L3**：对应 `shared/workflows/<stage>.md` 或 `shared/roles/` 角色文件。
4. 能写成脚本自动校验？→ 优先落 **L4**（pipeline_lint / schema / pre-commit），文档规则只留一句引用。
5. 都不属于 → 不要立规则，留给 L5 现场判断。

## 四、改完规则后的固定动作

```bash
python scripts/sync_rules.py        # shared/rules 有改动时
python scripts/sync_workflows.py    # shared/workflows 有改动时
pre-commit run --all-files          # 提交前自查
```

CI（`.github/workflows/lint.yml`）会在 push/PR 时复跑同样校验，本地绕过 `--no-verify` 也会被拦住。

## 五、来源标注

- 五层模型与"Forbidden-first"：参考 PDS-Layered-AI-Instruct 与 aicodingrules.org 优先级规范。
- 统一入口与就近优先：AGENTS.md 开放标准（agents.md）。
- 单源多发分发：项目自研 `sync_rules.py` / `sync_workflows.py`（等价于 ruler / block-ai-rules 思路，无外部依赖）。
- L1 清单条目 100% 收编自项目既有规则，逐条标注来源，未发明新规。
