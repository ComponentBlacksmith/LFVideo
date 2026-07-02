---
title: 规则真相源说明
slug: rules-readme
---

# shared/rules — 项目规则单一真相源 (Single Source of Truth)

本目录是项目常驻规则（项目上下文、角色调用规则等）的**唯一真相源**，IDE 无关。
指令层级与冲突裁决见根目录 `AGENTS.md`：`forbidden-actions.md` 为 L1 最高优先级，本目录其余规则属 L2，
与 `shared/roles/`（角色）、`shared/workflows/`（工作流）并列。各 AI IDE 实际加载的规则文件
由脚本从这里**生成**，不要手改生成副本。

## 目录约定

| 位置 | 角色 | 是否手改 |
|------|------|----------|
| `shared/rules/<slug>.md` | **真相源**（IDE 无关，中性 frontmatter + 正文） | ✅ 只改这里 |
| `.cursor/rules/<slug>.mdc` | Cursor 规则生成副本（`alwaysApply` / `globs`） | ❌ 自动生成 |
| `.windsurf/rules/<slug>.md` | Windsurf 规则生成副本（`trigger: always_on` / `glob`） | ❌ 自动生成 |

**Devin** 通过 `AGENT_GUIDE.md`（Rule Zero）加载项目上下文与角色体系，因此没有 `.devin/rules/` 目标——
旧的 `.devin/rules/` 用的是 Windsurf 的 `trigger:` 语法，位置错配，已由 `shared/rules/` + `AGENT_GUIDE.md` 取代。

## 真相源 frontmatter

```yaml
title: 项目上下文        # 中文名
slug: project-context   # 纯 ASCII 文件名
activation: always      # always（常驻）| glob（按文件匹配）
globs:                  # 仅 activation: glob 时填，逗号分隔
description: 一句话说明  # Cursor 的 description 字段
```

各 IDE 的 frontmatter 由脚本按上表转换：Cursor → `description/globs/alwaysApply`；Windsurf → `trigger`(+`globs`)。

## 改完后必须同步

```bash
python scripts/sync_rules.py          # 重新生成所有 IDE 副本
python scripts/sync_rules.py --check  # 只校验有无漂移（CI / pre-commit 用，漂移则退出码 1）
```

`.pre-commit-config.yaml` 已配置 `sync-rules-check` 钩子，提交时自动拦截漂移。
启用：`pip install pre-commit && pre-commit install`。
