---
stage: 04-script
platform: bilibili
status: draft
source_workflow: /04-script-draft
---

# ep02 视频脚本：用 Vibe Coding 搭一套能自动出片的视频渲染引擎

> 画面（Remotion 模板场景映射 / Props / 镜头 shots / 录屏 zoom 指令）与口播一体；段 (section) 是叙事单位（一整段连续口播），镜头 (shot) 是画面单位。任何 >15s 的段都切成多个镜头，让画面随口播 ≤~15s 换一次。末尾 JSON 契约为下游 05/06/07 的唯一真相源（SSOT），07 组装按「一个 shot ↔ 一个模板场景」逐条映射。
>
> 本稿严格对齐人工定稿 `02-plan/tutorial.final.md`（六章）：在原脚本基础上**新增两段**——§4「Remotion 怎么工作 + 为什么 AI 能驱动」（对应 tutorial 四.1）、§8「场景适配：适合 / 搭配 / 不适合」（对应 tutorial 五）；原 SSR 避坑、配置分发、数字人段保留并顺延编号。所有镜头映射到当前 14 个统一科技风（深色底 + 白字）模板场景。

---

## 第一段：【intro_scene】开场（干货式钩子 + 三步路线图，30s → 3 镜头）

- **[口播]** 这期就一件事：用 Vibe Coding 搭一套渲染引擎，把视频写成代码、让 AI 按配置自动出片，改数据就改片。先记住一个关键认知：AI 最强的本事是啃文本和代码，所以想让渲染自动化，就得把视频变成代码和数据来驱动。我没有前后端基础，全程用大白话指挥 AI：我说要什么、判断对不对。这件事三步：让 AI 帮我找技术路径、对着约束选型、最后落地出片。
- **[镜头 1.1–1.3]** `intro_scene` × 3：点题主副标题 → 关键认知卡 → 三步路线图点亮。

---

## 第二段：【concept_scene】找技术路径·让 AI 把路都摆出来（50s → 4 镜头）

- **[口播]** 第一步找路，我没自己埋头啃文档，直接把选择题丢给 AI：想把视频写成代码自动出片，现在都有哪些现成路子？它一口气摆了六条——Remotion 走网页那套、Manim 画数学公式、MoviePy 和 FFmpeg 做简单拼接，还有 Motion Canvas、PixiJS 这些。名字听着五花八门，但你扒到底，全在干同一件事：拿代码描述画面，编译成一帧帧，再合成视频。这一步只摆路，先不评好坏。
- **[镜头 2.1–2.4]** `concept_scene` × 4：抛问 → 六条路卡片阵列 → 高亮共同内核 → 收束「只列不评」。

---

## 第三段：【table_scene → comparison_scene】技术选型·逼 AI 给"坑"，回到约束定 Remotion（90s → 6 镜头）

- **[口播]** 第二步选型，这步最容易翻车——你要是直接问 AI 哪个好，它会跟个老好人似的每个都夸一遍，你还是不会选。值钱的是看清每条路什么时候不好使。所以我反过来逼它：把每条路的适用场景和会咬人的坑全列出来。看这张表：Remotion 适合前端栈和复杂排版，但你在组件顶层直接读 window，打包阶段就当场崩，而且是 BUSL 商业授权；Manim 排版弱、渲染慢；MoviePy 写自适应排版能把人写吐；FFmpeg 命令跟天书一样。看清坑，我再对着自己的需求做减法：我要一期一个模板换数据批量出几十期、要 AI 改内容不容易错、要跨期好维护——这三条一卡，Remotion 赢了。跟复制粘贴 HTML 比，它改一处全系列生效，AI 也只能乖乖填数据、不乱跑结构。代价就一条：React 栈加 BUSL 授权，规模化商用要付费——但前端反正是 AI 写、我把方向，不算门槛。一句话：让 AI 铺信息，拍板的事留给你自己。
- **[镜头 3.1–3.6]** `table_scene`（判断层矩阵 stagger + 高亮坑列）接力 `comparison_scene`（需求做减法 / vs 复制粘贴 HTML + 代价 / 金句）。

---

## 第四段【新增】：【flow_scene → code_scene → bullet_scene → quote_scene】技术落地·Remotion 怎么工作，为什么 AI 能轻松驱动（53s → 4 镜头）

- **[口播]** 路线定了 Remotion，先花一分钟搞懂它大致怎么干活，你就明白为啥 AI 能轻松驱动它。一句话：用 React 把每一帧长什么样写出来，引擎再逐帧截图、合成视频。拆开看就三步——你用 React 组件描述这一帧画成什么样，渲染时它开一个无头浏览器，把组件从第一帧到最后一帧逐帧截成图片，再用 FFmpeg 把这些图和音轨合成 MP4，所以网页能画的它就能渲成视频。再说细一点：组件里用 useCurrentFrame 拿到现在是第几帧，按帧号算出这帧该画成什么样，位置、透明度、大小全是帧号到数值的插值，不用你一帧帧手摆；你按秒想、引擎按帧算，靠每秒三十帧换算，第三秒就是第九十帧。那为啥这套 AI 特别好驱动？四条：全是 React 加 CSS，正好是 AI 语料里最厚的一块；声明式，只描述长什么样、不写怎么一帧帧动；改数据就改片，正中它改文本的强项；字段格式用 TypeScript 定死，填错漏填编译当场报红。记住一句：把视频写成数据，AI 只填空、不乱跑。
- **[镜头 4.1]** `flow_scene`（15s）：三步管线 React 描述每帧 → 无头浏览器逐帧截图 → FFmpeg 合成 MP4。
- **[镜头 4.2]** `code_scene`（15s）：`useCurrentFrame` + `interpolate` 帧号→数值；注释「30fps：第 3 秒 = 第 90 帧」。
- **[镜头 4.3]** `bullet_scene`（15s）：为什么 AI 好驱动的四条（React/CSS 语料厚 · 声明式 · 文本数据驱动 · TS 类型兜底）。
- **[镜头 4.4]** `quote_scene`（8s）：金句「把视频写成数据，AI 只填空、不乱跑」。

---

## 第五段：【concept_scene → code_scene → comparison_scene】技术落地·配置分发 + 配置即内容（90s → 6 镜头）

- **[口播]** 选型定了，进落地。好消息是搭引擎也不用你手写，就是跟 AI 把配置和现成组件对上号。仓库这台引擎叫 remotion-composer，干活特别直白：你写一份配置说清这段画面长啥样，主程序 Explainer 就看配置里的 type 字段，自动去找对应组件来渲。type 写 comparison 就出对比卡，terminal 是合成终端、不用真录屏，还有图表、分屏。现在仓库里这样的模板场景有十四个——开场、概念、清单、流程、表格、对比、图表、数字、提示、金句、章节、终端都齐了，而且统一成深色科技底加白字，改一处全片生效。所以做内容这事，本质就是挑组件、填字段。最省心的一招是：我从不让 AI 去发明新组件，只让它照现成的填数据。比如要张对比卡，我说左边传统剪辑、右边代码即视频，它吐出来就是这么一段配置，齐活。为啥稳？因为每个字段都用 TypeScript 把格式焊死了，AI 填错漏填，编译当场报红。记住：让 AI 填空，别让它造轮子。想要更强辨识度，还能在现成组件上扩一套自有风格组件库——那是更大的话题，以后单开一期讲。
- **[镜头 5.1–5.6]** `concept_scene` 流向 → `concept_scene` 14 场景清单 → `code_scene` comparison 配置逐行打字 → `code_scene` TS 字段焊死 → `comparison_scene` 手写❌ vs 填数据✅ → `concept_scene` 自有风格组件库一句带过。

---

## 第六段：【code_scene + B 轨】技术落地·SSR 唯一的坑，把规则写死交给 AI（35s → 3 镜头）

- **[口播]** 落地过程里唯一反复栽我的，就是 SSR 这个坑。看左边：组件顶层直接读了 window，可 Remotion 打包那会儿跑在 Node 里、还没进浏览器，当场就报 ReferenceError、渲染红屏。好比人还没进门就伸手拉灯，灯都没装上，当然摸空。右边怎么修：加一句 typeof window 判断。但更聪明的是别每次盯着 AI，而是把这条规则一次写死——塞进 .cursor/rules 一个 mdc 文件，指到引擎源码目录，往后 AI 生成组件自动带上。这就是 Vibe Coding 的精髓：重复的规矩，固化成规则交给 AI。
- **[镜头 6.1–6.3]** B 轨双录屏（崩溃红屏 / 守卫后渲出）+ A 轨兜底 `code_scene`；末镜 `concept_scene` 浮出 `.cursor/rules/remotion-ssr.mdc` 规则。

---

## 第七段：【concept_scene + table_scene】技术落地·数字人选型与落地（60s → 4 镜头）

- **[口播]** 要不要个出镜形象做陪衬？这事也没拍脑袋，套的是跟选引擎一样的方法论：先把定位说死——它只是陪衬串场，不是主角。然后让 AI 把可选形象和各自的坑摆出来：真人最可信但要露脸、不能编程复用；写实对口型像真主播，可一不小心就掉进恐怖谷、可信度反而崩。对着我的约束——不想露脸、要可编程批量复用、还要避开恐怖谷——我选了 3D 风格化角色 VRMAvatar，并钉死一条死规矩：坚决不做对口型数字人、不做 AI 假界面，可信度只靠真实录屏换。落地也交给 AI：整体渲一次再按场景裁半身全身；之前它待机整条腿像钟摆一样甩，修法是在大腿上把髋部摆动反向抵消，脚就踩稳了。
- **[镜头 7.1–7.4]** `concept_scene` 定位陪衬 → `table_scene` 三行形象选型矩阵 → `table_scene` 高亮选定 VRM 行 → `concept_scene` 取景 + 脚踩稳。

---

## 第八段【新增】：【concept_scene → comparison_scene → callout_scene → quote_scene】场景适配·适合 / 搭配 / 不适合（53s → 4 镜头）

- **[口播]** 最后一步，比把引擎跑通更值钱的判断是：什么场景该用它、什么场景别硬上。最适合的是纯 A 轨自动出片——模板化的概念讲解、要点流程，数据图表、对比、核心指标，开场片头、章节分隔、片尾，还有用合成终端演示命令和报错，这些画面用文本和数据就能说清，换组数据就能批量出几十期。第二种是搭配着用：当主体是真人口播或真实录屏时，Remotion 不必独占整屏，而是渲成透明背景的悬浮叠层贴上去——口播上浮数据卡、角标、字幕，录屏上叠箭头、高亮框、局部放大，把观众视线引到关键处。也有别硬上的：实拍人物、产品、Vlog，该拍就拍，别拿引擎替代摄像机；写实对口型数字人，容易掉恐怖谷、可信度反崩，本项目直接排除；影视级特效和逐帧手绘动画交给专业工具；纯后台超长批处理用 FFmpeg 更划算。一句话记住：主体是真实画面，Remotion 退居叠层；主体是讲解和数据，Remotion 独占整屏。
- **[镜头 8.1]** `concept_scene`（15s）：适合纯 A 轨的四类（讲解 / 数据 / 包装 / 合成终端）。
- **[镜头 8.2]** `comparison_scene`（15s）：独占整屏（纯 A 轨）vs 退居叠层（搭配 B 轨透明悬浮）。
- **[镜头 8.3]** `callout_scene`（warning，15s）：不适合的四类（实拍 / 对口型 / 影视特效 / 后台批处理）。
- **[镜头 8.4]** `quote_scene`（8s）：口诀「主体真实 → 退居叠层；主体讲解 → 独占整屏」。

---

## 第九段：【outro_scene】结尾 CTA（20s → 2 镜头）

- **[口播]** 回头看就三步：找路径让 AI 把现成方案全摆出来、选型让 AI 列坑人对约束拍板、落地填配置套组件规则兜底让 AI 跑渲染。你要会的不是写代码，是讲清需求、看住坑、把规则固化给 AI——没基础也能复制。下期 EP03，用 Whisper 拿字级时间戳，让字幕踩着话音跳。关注别错过。
- **[镜头 9.1–9.2]** `outro_scene` × 2：三步法回扣 + 仓库地址/关注引导/EP03 预告。

---

```json
{
  "title": "用 Vibe Coding 搭一套能自动出片的视频渲染引擎",
  "platform": "bilibili",
  "estimated_duration_seconds": 481,
  "total_word_count": 2150,
  "anti_hype_forbidden": ["颠覆", "革命性", "效率提升百倍", "几行代码搞定一切", "震撼", "封神"],
  "video_spec": { "aspect_ratio": "16:9", "resolution": "1920x1080", "fps": 30 },
  "b_track_assets_required": ["b-ssr-crash", "b-ssr-fix"],
  "sections": [
    {
      "id": "1",
      "section_ref": "开场钩子",
      "track": "A",
      "voice": "这期就一件事：用 Vibe Coding 搭一套渲染引擎，把视频写成代码、让 AI 按配置自动出片，改数据就改片。先记住一个关键认知：AI 最强的本事是啃文本和代码，所以想让渲染自动化，就得把视频变成代码和数据来驱动。我没有前后端基础，全程用大白话指挥 AI：我说要什么、判断对不对。这件事三步：让 AI 帮我找技术路径、对着约束选型、最后落地出片。",
      "visual_instructions": "intro_scene 大字报 + 干货式钩子（首屏呈现配置→成片的真实成果，非演示表演）→ 关键认知卡 → 三步路线图点亮；按口播切为 3 个 intro_scene 镜头",
      "duration_hint_seconds": 30,
      "shots": [
        {
          "id": "1.1",
          "scene_template": "@IntroScene",
          "props": { "title": "用 Vibe Coding 搭一套自动出片的渲染引擎", "subtitle": "把视频写成代码，让 AI 按配置自动出片", "background": "holo" },
          "voice_slice": "这期就一件事：用 Vibe Coding 搭一套渲染引擎，把视频写成代码、让 AI 按配置自动出片，改数据就改片。",
          "duration_seconds": 10,
          "visual_beats": [
            {"at_seconds": 0, "action": "首屏呈现本期成果：一份配置 + 由它渲出的成片并排"},
            {"at_seconds": 4, "action": "一句话点题落到主标题"}
          ]
        },
        {
          "id": "1.2",
          "scene_template": "@IntroScene",
          "props": { "title": "AI 强在啃文本和代码 → 渲染就该数据驱动", "subtitle": "我没前后端基础，用大白话指挥 AI" },
          "voice_slice": "先记住一个关键认知：AI 最强的本事是啃文本和代码，所以想让渲染自动化，就得把视频变成代码和数据来驱动。我没有前后端基础，全程用大白话指挥 AI：我说要什么、判断对不对。",
          "duration_seconds": 12,
          "visual_beats": [
            {"at_seconds": 0, "action": "关键认知卡浮出：AI 强在文本/代码 → 渲染用数据驱动"},
            {"at_seconds": 6, "action": "人设小字：大白话指挥 AI、只做判断"}
          ]
        },
        {
          "id": "1.3",
          "scene_template": "@IntroScene",
          "props": { "title": "三步：找路径 · 选型 · 落地", "subtitle": "让 AI 找路 → 对约束选型 → 落地出片" },
          "voice_slice": "这件事三步：让 AI 帮我找技术路径、对着约束选型、最后落地出片。",
          "duration_seconds": 8,
          "visual_beats": [
            {"at_seconds": 0, "action": "三步路线图依次点亮"}
          ]
        }
      ]
    },
    {
      "id": "2",
      "section_ref": "找技术路径",
      "track": "A",
      "voice": "第一步找路，我没自己埋头啃文档，直接把选择题丢给 AI：想把视频写成代码自动出片，现在都有哪些现成路子？它一口气摆了六条——Remotion 走网页那套、Manim 画数学公式、MoviePy 和 FFmpeg 做简单拼接，还有 Motion Canvas、PixiJS 这些。名字听着五花八门，但你扒到底，全在干同一件事：拿代码描述画面，编译成一帧帧，再合成视频。这一步只摆路，先不评好坏。",
      "visual_instructions": "concept_scene 内核标题 + 三张路线卡 stagger，底部补一行 Motion Canvas/PixiJS·Cocos 补全六条路；按口播切为 4 个 concept_scene 镜头",
      "duration_hint_seconds": 50,
      "shots": [
        {
          "id": "2.1",
          "scene_template": "@ConceptScene",
          "props": { "eyebrow": "找技术路径", "title": "把选择题丢给 AI：有哪些现成路子？" },
          "voice_slice": "第一步找路，我没自己埋头啃文档，直接把选择题丢给 AI：想把视频写成代码自动出片，现在都有哪些现成路子？",
          "duration_seconds": 13,
          "visual_beats": [{"at_seconds": 0, "action": "内核标题入场"}]
        },
        {
          "id": "2.2",
          "scene_template": "@ConceptScene",
          "props": { "title": "AI 一口气摆了六条" },
          "voice_slice": "它一口气摆了六条——Remotion 走网页那套、Manim 画数学公式、MoviePy 和 FFmpeg 做简单拼接，还有 Motion Canvas、PixiJS 这些。",
          "duration_seconds": 14,
          "visual_beats": [
            {"at_seconds": 0, "action": "三张路线卡依次 stagger"},
            {"at_seconds": 8, "action": "底部追加 Motion Canvas/PixiJS·Cocos 小卡补全六条"}
          ]
        },
        {
          "id": "2.3",
          "scene_template": "@ConceptScene",
          "props": { "title": "同一个内核：代码/数据描述画面 → 编译成帧 → 合成视频" },
          "voice_slice": "名字听着五花八门，但你扒到底，全在干同一件事：拿代码描述画面，编译成一帧帧，再合成视频。",
          "duration_seconds": 15,
          "visual_beats": [{"at_seconds": 0, "action": "高亮共同内核那句话"}]
        },
        {
          "id": "2.4",
          "scene_template": "@ConceptScene",
          "props": { "title": "这一步只摆路，先不评好坏" },
          "voice_slice": "这一步只摆路，先不评好坏。",
          "duration_seconds": 8
        }
      ]
    },
    {
      "id": "3",
      "section_ref": "技术选型",
      "track": "A",
      "voice": "第二步选型，这步最容易翻车——你要是直接问 AI 哪个好，它会跟个老好人似的每个都夸一遍，你还是不会选。值钱的是看清每条路什么时候不好使。所以我反过来逼它：把每条路的适用场景和会咬人的坑全列出来。看这张表：Remotion 适合前端栈和复杂排版，但你在组件顶层直接读 window，打包阶段就当场崩，而且是 BUSL 商业授权；Manim 排版弱、渲染慢；MoviePy 写自适应排版能把人写吐；FFmpeg 命令跟天书一样。看清坑，我再对着自己的需求做减法：我要一期一个模板换数据批量出几十期、要 AI 改内容不容易错、要跨期好维护——这三条一卡，Remotion 赢了。跟复制粘贴 HTML 比，它改一处全系列生效，AI 也只能乖乖填数据、不乱跑结构。代价就一条：React 栈加 BUSL 授权，规模化商用要付费——但前端反正是 AI 写、我把方向，不算门槛。一句话：让 AI 铺信息，拍板的事留给你自己。",
      "visual_instructions": "table_scene 判断层矩阵（方案/适用场景/已知坑，stagger + 高亮坑列/当前行）→ 切 comparison_scene 做需求减法、Remotion vs 复制粘贴 HTML 对照 + 代价；多组件接力，按口播切为 6 个镜头（3×table_scene + 3×comparison_scene）",
      "duration_hint_seconds": 90,
      "shots": [
        {
          "id": "3.1",
          "scene_template": "@TableScene",
          "props": { "eyebrow": "判断层 = 边界，非中立百科", "title": "选型最容易翻车：看清每条路何时不好使", "headers": ["方案", "适用场景", "已知坑"] },
          "voice_slice": "第二步选型，这步最容易翻车——你要是直接问 AI 哪个好，它会跟个老好人似的每个都夸一遍，你还是不会选。值钱的是看清每条路什么时候不好使。",
          "duration_seconds": 15,
          "visual_beats": [{"at_seconds": 0, "action": "表头淡入"}]
        },
        {
          "id": "3.2",
          "scene_template": "@TableScene",
          "props": { "highlightCell": "1-3" },
          "voice_slice": "所以我反过来逼它：把每条路的适用场景和会咬人的坑全列出来。看这张表：Remotion 适合前端栈和复杂排版，但你在组件顶层直接读 window，打包阶段就当场崩，而且是 BUSL 商业授权；",
          "duration_seconds": 18,
          "visual_beats": [
            {"at_seconds": 0, "action": "各行依次 stagger 入场"},
            {"at_seconds": 8, "action": "高亮 Remotion 行的坑列"}
          ]
        },
        {
          "id": "3.3",
          "scene_template": "@TableScene",
          "props": { "highlightCell": "3-3" },
          "voice_slice": "Manim 排版弱、渲染慢；MoviePy 写自适应排版能把人写吐；FFmpeg 命令跟天书一样。",
          "duration_seconds": 15,
          "visual_beats": [{"at_seconds": 0, "action": "Zoom 聚焦其余几条的坑列"}]
        },
        {
          "id": "3.4",
          "scene_template": "@SplitLayout",
          "props": { "title": "对着需求做减法", "leftLabel": "我的三条需求", "leftValue": "批量换数据 · AI 改不易错 · 跨期好维护", "rightLabel": "✅ Remotion 命中", "rightValue": "三条全中，Remotion 赢" },
          "voice_slice": "看清坑，我再对着自己的需求做减法：我要一期一个模板换数据批量出几十期、要 AI 改内容不容易错、要跨期好维护——这三条一卡，Remotion 赢了。",
          "duration_seconds": 18,
          "visual_beats": [{"at_seconds": 0, "action": "左右对照入场，右侧 Remotion 命中"}]
        },
        {
          "id": "3.5",
          "scene_template": "@SplitLayout",
          "props": { "title": "Remotion ✅ vs 复制粘贴 HTML ❌", "leftLabel": "Remotion", "leftValue": "改一处全系列生效 · 只填数据 · 代价：React + BUSL 付费", "rightLabel": "复制粘贴 HTML", "rightValue": "每期复制越改越乱 · 结构易跑偏" },
          "voice_slice": "跟复制粘贴 HTML 比，它改一处全系列生效，AI 也只能乖乖填数据、不乱跑结构。代价就一条：React 栈加 BUSL 授权，规模化商用要付费——但前端反正是 AI 写、我把方向，不算门槛。",
          "duration_seconds": 16,
          "visual_beats": [
            {"at_seconds": 0, "action": "左右对照 Remotion vs 复制粘贴 HTML"},
            {"at_seconds": 10, "action": "代价并入 Remotion 卡：React 栈 + BUSL 授权"}
          ]
        },
        {
          "id": "3.6",
          "scene_template": "@SplitLayout",
          "props": { "title": "一句话", "leftLabel": "AI", "leftValue": "铺信息：把方案和坑摆全", "rightLabel": "你", "rightValue": "拍板：做减法、定取舍" },
          "voice_slice": "一句话：让 AI 铺信息，拍板的事留给你自己。",
          "duration_seconds": 8
        }
      ]
    },
    {
      "id": "4",
      "section_ref": "技术落地·Remotion 怎么工作，为什么 AI 能驱动",
      "track": "A",
      "voice": "路线定了 Remotion，先花一分钟搞懂它大致怎么干活，你就明白为啥 AI 能轻松驱动它。一句话：用 React 把每一帧长什么样写出来，引擎再逐帧截图、合成视频。拆开看就三步——你用 React 组件描述这一帧画成什么样，渲染时它开一个无头浏览器，把组件从第一帧到最后一帧逐帧截成图片，再用 FFmpeg 把这些图和音轨合成 MP4，所以网页能画的它就能渲成视频。再说细一点：组件里用 useCurrentFrame 拿到现在是第几帧，按帧号算出这帧该画成什么样，位置、透明度、大小全是帧号到数值的插值，不用你一帧帧手摆；你按秒想、引擎按帧算，靠每秒三十帧换算，第三秒就是第九十帧。那为啥这套 AI 特别好驱动？四条：全是 React 加 CSS，正好是 AI 语料里最厚的一块；声明式，只描述长什么样、不写怎么一帧帧动；改数据就改片，正中它改文本的强项；字段格式用 TypeScript 定死，填错漏填编译当场报红。记住一句：把视频写成数据，AI 只填空、不乱跑。",
      "visual_instructions": "flow_scene 三步管线（React 描述每帧 → 无头浏览器逐帧截图 → FFmpeg 合成 MP4）→ code_scene 展示 useCurrentFrame + interpolate + 30fps 秒帧换算 → bullet_scene 列「为什么 AI 好驱动」四条 → quote_scene 金句；按口播切为 4 个镜头",
      "duration_hint_seconds": 53,
      "shots": [
        {
          "id": "4.1",
          "scene_template": "@FlowScene",
          "props": { "eyebrow": "Remotion 怎么工作", "title": "用 React 写每帧 → 逐帧截图 → 合成视频" },
          "voice_slice": "路线定了 Remotion，先花一分钟搞懂它大致怎么干活，你就明白为啥 AI 能轻松驱动它。一句话：用 React 把每一帧长什么样写出来，引擎再逐帧截图、合成视频。拆开看就三步——你用 React 组件描述这一帧画成什么样，渲染时它开一个无头浏览器，把组件从第一帧到最后一帧逐帧截成图片，再用 FFmpeg 把这些图和音轨合成 MP4，所以网页能画的它就能渲成视频。",
          "duration_seconds": 15,
          "visual_beats": [
            {"at_seconds": 0, "action": "三步管线卡依次入场，箭头连通"},
            {"at_seconds": 9, "action": "末卡高亮「网页能画的就能渲成视频」"}
          ]
        },
        {
          "id": "4.2",
          "scene_template": "@TerminalScene",
          "props": { "terminalTitle": "帧为单位：useCurrentFrame + interpolate" },
          "voice_slice": "再说细一点：组件里用 useCurrentFrame 拿到现在是第几帧，按帧号算出这帧该画成什么样，位置、透明度、大小全是帧号到数值的插值，不用你一帧帧手摆；你按秒想、引擎按帧算，靠每秒三十帧换算，第三秒就是第九十帧。",
          "duration_seconds": 15,
          "visual_beats": [
            {"at_seconds": 0, "action": "代码逐行打字：useCurrentFrame → interpolate"},
            {"at_seconds": 9, "action": "高亮注释「30fps：第 3 秒 = 第 90 帧」"}
          ]
        },
        {
          "id": "4.3",
          "scene_template": "@BulletScene",
          "props": { "eyebrow": "为什么 AI 能轻松驱动", "title": "四条对 AI 友好的底层原因", "ordered": true },
          "voice_slice": "那为啥这套 AI 特别好驱动？四条：全是 React 加 CSS，正好是 AI 语料里最厚的一块；声明式，只描述长什么样、不写怎么一帧帧动；改数据就改片，正中它改文本的强项；字段格式用 TypeScript 定死，填错漏填编译当场报红。",
          "duration_seconds": 15,
          "visual_beats": [{"at_seconds": 0, "action": "四条要点逐行错峰入场"}]
        },
        {
          "id": "4.4",
          "scene_template": "@QuoteScene",
          "props": { "text": "把视频写成数据，AI 只填空、不乱跑", "attribution": "Remotion × Vibe Coding" },
          "voice_slice": "记住一句：把视频写成数据，AI 只填空、不乱跑。",
          "duration_seconds": 8
        }
      ]
    },
    {
      "id": "5",
      "section_ref": "技术落地·配置分发与配置即内容",
      "track": "A",
      "voice": "选型定了，进落地。好消息是搭引擎也不用你手写，就是跟 AI 把配置和现成组件对上号。仓库这台引擎叫 remotion-composer，干活特别直白：你写一份配置说清这段画面长啥样，主程序 Explainer 就看配置里的 type 字段，自动去找对应组件来渲。type 写 comparison 就出对比卡，terminal 是合成终端、不用真录屏，还有图表、分屏。现在仓库里这样的模板场景有十四个——开场、概念、清单、流程、表格、对比、图表、数字、提示、金句、章节、终端都齐了，而且统一成深色科技底加白字，改一处全片生效。所以做内容这事，本质就是挑组件、填字段。最省心的一招是：我从不让 AI 去发明新组件，只让它照现成的填数据。比如要张对比卡，我说左边传统剪辑、右边代码即视频，它吐出来就是这么一段配置，齐活。为啥稳？因为每个字段都用 TypeScript 把格式焊死了，AI 填错漏填，编译当场报红。记住：让 AI 填空，别让它造轮子。想要更强辨识度，还能在现成组件上扩一套自有风格组件库——那是更大的话题，以后单开一期讲。",
      "visual_instructions": "concept_scene 配置→Explainer→组件流向 → concept_scene 14 场景清单（统一皮肤）→ code_scene 展示 comparison 配置逐行打字 → code_scene TS 字段焊死 → comparison_scene 左从零手写❌ 右只填数据✅ → concept_scene 自有风格组件库一句带过；多组件接力，按口播切为 6 个镜头",
      "duration_hint_seconds": 90,
      "shots": [
        {
          "id": "5.1",
          "scene_template": "@ConceptScene",
          "props": { "eyebrow": "引擎怎么干活", "title": "一份配置 → Explainer 按 type 分发 → 现成组件" },
          "voice_slice": "选型定了，进落地。好消息是搭引擎也不用你手写，就是跟 AI 把配置和现成组件对上号。",
          "duration_seconds": 13,
          "visual_beats": [{"at_seconds": 0, "action": "流向图入场"}]
        },
        {
          "id": "5.2",
          "scene_template": "@ConceptScene",
          "props": { "eyebrow": "remotion-composer", "title": "14 个模板场景，统一皮肤" },
          "voice_slice": "仓库这台引擎叫 remotion-composer，干活特别直白：你写一份配置说清这段画面长啥样，主程序 Explainer 就看配置里的 type 字段，自动去找对应组件来渲。type 写 comparison 就出对比卡，terminal 是合成终端、不用真录屏，还有图表、分屏。现在仓库里这样的模板场景有十四个——开场、概念、清单、流程、表格、对比、图表、数字、提示、金句、章节、终端都齐了，而且统一成深色科技底加白字，改一处全片生效。",
          "duration_seconds": 17,
          "visual_beats": [{"at_seconds": 0, "action": "组件清单网格点亮，强调统一皮肤"}]
        },
        {
          "id": "5.3",
          "scene_template": "@TerminalScene",
          "props": { "terminalTitle": "comparison 配置：照现成组件填数据", "prompt": "$" },
          "voice_slice": "所以做内容这事，本质就是挑组件、填字段。最省心的一招是：我从不让 AI 去发明新组件，只让它照现成的填数据。",
          "duration_seconds": 15,
          "visual_beats": [{"at_seconds": 0, "action": "config 逐行打字"}]
        },
        {
          "id": "5.4",
          "scene_template": "@TerminalScene",
          "props": { "terminalTitle": "TS 把字段格式焊死，填错即编译报红", "prompt": "$" },
          "voice_slice": "比如要张对比卡，我说左边传统剪辑、右边代码即视频，它吐出来就是这么一段配置，齐活。为啥稳？因为每个字段都用 TypeScript 把格式焊死了，AI 填错漏填，编译当场报红。",
          "duration_seconds": 15,
          "visual_beats": [{"at_seconds": 0, "action": "类型定义打字 + 漏填报错提示"}]
        },
        {
          "id": "5.5",
          "scene_template": "@SplitLayout",
          "props": { "title": "让 AI 填空，别让它造轮子", "leftLabel": "❌ 从零手写", "leftValue": "让 AI 手写 ComparisonScene.tsx，易错难维护", "rightLabel": "✅ 只填数据", "rightValue": "复用现成 @ComparisonCard，TS 兜底" },
          "voice_slice": "记住：让 AI 填空，别让它造轮子。",
          "duration_seconds": 18,
          "visual_beats": [
            {"at_seconds": 0, "action": "切分屏左右对照"},
            {"at_seconds": 8, "action": "右侧注释浮出 TS 字段定死格式"}
          ]
        },
        {
          "id": "5.6",
          "scene_template": "@ConceptScene",
          "props": { "eyebrow": "延伸", "title": "还能扩一套自有风格组件库" },
          "voice_slice": "想要更强辨识度，还能在现成组件上扩一套自有风格组件库——那是更大的话题，以后单开一期讲。",
          "duration_seconds": 12
        }
      ]
    },
    {
      "id": "6",
      "section_ref": "技术落地·SSR 避坑",
      "track": "A/B",
      "voice": "落地过程里唯一反复栽我的，就是 SSR 这个坑。看左边：组件顶层直接读了 window，可 Remotion 打包那会儿跑在 Node 里、还没进浏览器，当场就报 ReferenceError、渲染红屏。好比人还没进门就伸手拉灯，灯都没装上，当然摸空。右边怎么修：加一句 typeof window 判断。但更聪明的是别每次盯着 AI，而是把这条规则一次写死——塞进 .cursor/rules 一个 mdc 文件，指到引擎源码目录，往后 AI 生成组件自动带上。这就是 Vibe Coding 的精髓：重复的规矩，固化成规则交给 AI。",
      "visual_instructions": "B 轨双录屏（左崩溃红屏/右守卫+规则一次渲出）；A 轨兜底 code_scene 对照 + 浮出 .cursor/rules/remotion-ssr.mdc；按口播切为 3 个镜头",
      "duration_hint_seconds": 35,
      "shots": [
        {
          "id": "6.1",
          "scene_template": "@TerminalScene",
          "track": "A/B",
          "props": { "b_track_clip": "b-ssr-crash", "b_track_note": "[B 轨占位：IDE 顶层读 window 触发 ReferenceError 红屏]", "terminalTitle": "💥 SSR 坑：组件顶层读 window，渲染红屏（A 轨兜底）", "prompt": "$" },
          "voice_slice": "落地过程里唯一反复栽我的，就是 SSR 这个坑。看左边：组件顶层直接读了 window，可 Remotion 打包那会儿跑在 Node 里、还没进浏览器，当场就报 ReferenceError、渲染红屏。好比人还没进门就伸手拉灯，灯都没装上，当然摸空。",
          "duration_seconds": 14,
          "visual_beats": [
            {"at_seconds": 0, "action": "崩溃代码/录屏淡入"},
            {"at_seconds": 8, "action": "震动强调 ReferenceError"}
          ]
        },
        {
          "id": "6.2",
          "scene_template": "@TerminalScene",
          "track": "A/B",
          "props": { "b_track_clip": "b-ssr-fix", "b_track_note": "[B 轨占位：加 typeof window 守卫后一次性渲出]", "terminalTitle": "✅ typeof window 守卫 + MDC 规则（A 轨兜底）", "prompt": "$" },
          "voice_slice": "右边怎么修：加一句 typeof window 判断。",
          "duration_seconds": 12,
          "visual_beats": [{"at_seconds": 0, "action": "守卫代码/录屏淡入"}]
        },
        {
          "id": "6.3",
          "scene_template": "@ConceptScene",
          "props": { "eyebrow": "Vibe Coding 精髓", "title": "重复的规矩，固化成规则交给 AI" },
          "voice_slice": "但更聪明的是别每次盯着 AI，而是把这条规则一次写死——塞进 .cursor/rules 一个 mdc 文件，指到引擎源码目录，往后 AI 生成组件自动带上。这就是 Vibe Coding 的精髓：重复的规矩，固化成规则交给 AI。",
          "duration_seconds": 9,
          "visual_beats": [{"at_seconds": 0, "action": "浮出 .cursor/rules/remotion-ssr.mdc"}]
        }
      ]
    },
    {
      "id": "7",
      "section_ref": "技术落地·数字人选型与落地",
      "track": "A",
      "voice": "要不要个出镜形象做陪衬？这事也没拍脑袋，套的是跟选引擎一样的方法论：先把定位说死——它只是陪衬串场，不是主角。然后让 AI 把可选形象和各自的坑摆出来：真人最可信但要露脸、不能编程复用；写实对口型像真主播，可一不小心就掉进恐怖谷、可信度反而崩。对着我的约束——不想露脸、要可编程批量复用、还要避开恐怖谷——我选了 3D 风格化角色 VRMAvatar，并钉死一条死规矩：坚决不做对口型数字人、不做 AI 假界面，可信度只靠真实录屏换。落地也交给 AI：整体渲一次再按场景裁半身全身；之前它待机整条腿像钟摆一样甩，修法是在大腿上把髋部摆动反向抵消，脚就踩稳了。",
      "visual_instructions": "concept_scene 定位陪衬 → table_scene 三行形象选型矩阵（stagger + 高亮选定 VRM 行）→ 切主持人取景预设示意 + 脚踩稳；按口播切为 4 个镜头",
      "duration_hint_seconds": 60,
      "shots": [
        {
          "id": "7.1",
          "scene_template": "@ConceptScene",
          "props": { "eyebrow": "数字人选型", "title": "出镜形象只是陪衬串场，不是主角" },
          "voice_slice": "要不要个出镜形象做陪衬？这事也没拍脑袋，套的是跟选引擎一样的方法论：先把定位说死——它只是陪衬串场，不是主角。",
          "duration_seconds": 15,
          "visual_beats": [{"at_seconds": 0, "action": "定位卡入场"}]
        },
        {
          "id": "7.2",
          "scene_template": "@TableScene",
          "props": { "eyebrow": "三种形象方案", "title": "可选形象 + 各自的坑", "headers": ["形象方案", "适用场景", "坑 / 代价"] },
          "voice_slice": "然后让 AI 把可选形象和各自的坑摆出来：真人最可信但要露脸、不能编程复用；写实对口型像真主播，可一不小心就掉进恐怖谷、可信度反而崩。",
          "duration_seconds": 17,
          "visual_beats": [{"at_seconds": 0, "action": "三行 stagger 入场"}]
        },
        {
          "id": "7.3",
          "scene_template": "@TableScene",
          "props": { "highlightCell": "3-1" },
          "voice_slice": "对着我的约束——不想露脸、要可编程批量复用、还要避开恐怖谷——我选了 3D 风格化角色 VRMAvatar，并钉死一条死规矩：坚决不做对口型数字人、不做 AI 假界面，可信度只靠真实录屏换。",
          "duration_seconds": 15,
          "visual_beats": [{"at_seconds": 0, "action": "高亮选定的 VRM 行"}]
        },
        {
          "id": "7.4",
          "scene_template": "@ConceptScene",
          "props": { "eyebrow": "落地交给 AI", "title": "整体渲一次按场景裁，脚踩稳" },
          "voice_slice": "落地也交给 AI：整体渲一次再按场景裁半身全身；之前它待机整条腿像钟摆一样甩，修法是在大腿上把髋部摆动反向抵消，脚就踩稳了。",
          "duration_seconds": 13,
          "visual_beats": [
            {"at_seconds": 0, "action": "主持人取景预设示意（角落/半身/全身）"},
            {"at_seconds": 6, "action": "脚踩稳：大腿反向抵消髋部摆动"}
          ]
        }
      ]
    },
    {
      "id": "8",
      "section_ref": "场景适配·适合 / 搭配 / 不适合",
      "track": "A",
      "voice": "最后一步，比把引擎跑通更值钱的判断是：什么场景该用它、什么场景别硬上。最适合的是纯 A 轨自动出片——模板化的概念讲解、要点流程，数据图表、对比、核心指标，开场片头、章节分隔、片尾，还有用合成终端演示命令和报错，这些画面用文本和数据就能说清，换组数据就能批量出几十期。第二种是搭配着用：当主体是真人口播或真实录屏时，Remotion 不必独占整屏，而是渲成透明背景的悬浮叠层贴上去——口播上浮数据卡、角标、字幕，录屏上叠箭头、高亮框、局部放大，把观众视线引到关键处。也有别硬上的：实拍人物、产品、Vlog，该拍就拍，别拿引擎替代摄像机；写实对口型数字人，容易掉恐怖谷、可信度反崩，本项目直接排除；影视级特效和逐帧手绘动画交给专业工具；纯后台超长批处理用 FFmpeg 更划算。一句话记住：主体是真实画面，Remotion 退居叠层；主体是讲解和数据，Remotion 独占整屏。",
      "visual_instructions": "concept_scene 适合纯 A 轨的四类 → comparison_scene 独占整屏 vs 退居叠层 → callout_scene(warning) 不适合的四类 → quote_scene 口诀；按口播切为 4 个镜头",
      "duration_hint_seconds": 53,
      "shots": [
        {
          "id": "8.1",
          "scene_template": "@ConceptScene",
          "props": { "eyebrow": "用在哪 ①", "title": "最适合：纯 A 轨自动出片" },
          "voice_slice": "最后一步，比把引擎跑通更值钱的判断是：什么场景该用它、什么场景别硬上。最适合的是纯 A 轨自动出片——模板化的概念讲解、要点流程，数据图表、对比、核心指标，开场片头、章节分隔、片尾，还有用合成终端演示命令和报错，这些画面用文本和数据就能说清，换组数据就能批量出几十期。",
          "duration_seconds": 15,
          "visual_beats": [{"at_seconds": 0, "action": "四类适用卡 stagger 入场"}]
        },
        {
          "id": "8.2",
          "scene_template": "@SplitLayout",
          "props": { "title": "Remotion 的两种用法", "leftLabel": "独占整屏（纯 A 轨）", "leftValue": "主体是讲解/数据时，整屏交给 Remotion", "rightLabel": "退居叠层（搭配 B 轨）", "rightValue": "主体是真人/录屏时，渲透明叠层：数据卡/字幕/箭头/Zoom" },
          "voice_slice": "第二种是搭配着用：当主体是真人口播或真实录屏时，Remotion 不必独占整屏，而是渲成透明背景的悬浮叠层贴上去——口播上浮数据卡、角标、字幕，录屏上叠箭头、高亮框、局部放大，把观众视线引到关键处。",
          "duration_seconds": 15,
          "visual_beats": [{"at_seconds": 0, "action": "左右两种用法对照入场"}]
        },
        {
          "id": "8.3",
          "scene_template": "@CalloutScene",
          "props": { "callout_type": "warning", "title": "这些别硬上", "text": "主体不是文本/数据、或要写实物理世界时，Remotion 不是对的工具" },
          "voice_slice": "也有别硬上的：实拍人物、产品、Vlog，该拍就拍，别拿引擎替代摄像机；写实对口型数字人，容易掉恐怖谷、可信度反崩，本项目直接排除；影视级特效和逐帧手绘动画交给专业工具；纯后台超长批处理用 FFmpeg 更划算。",
          "duration_seconds": 15,
          "visual_beats": [{"at_seconds": 0, "action": "warning 卡 + 四条不适用要点入场"}]
        },
        {
          "id": "8.4",
          "scene_template": "@QuoteScene",
          "props": { "text": "主体真实 → 退居叠层；主体讲解 → 独占整屏", "attribution": "场景适配口诀" },
          "voice_slice": "一句话记住：主体是真实画面，Remotion 退居叠层；主体是讲解和数据，Remotion 独占整屏。",
          "duration_seconds": 8
        }
      ]
    },
    {
      "id": "9",
      "section_ref": "结尾 CTA",
      "track": "A",
      "voice": "回头看就三步：找路径让 AI 把现成方案全摆出来、选型让 AI 列坑人对约束拍板、落地填配置套组件规则兜底让 AI 跑渲染。你要会的不是写代码，是讲清需求、看住坑、把规则固化给 AI——没基础也能复制。下期 EP03，用 Whisper 拿字级时间戳，让字幕踩着话音跳。关注别错过。",
      "visual_instructions": "outro_scene 三步法回扣点亮 + 开源仓库地址 + 关注引导 + EP03 预告卡；按口播切为 2 个 outro_scene 镜头",
      "duration_hint_seconds": 20,
      "shots": [
        {
          "id": "9.1",
          "scene_template": "@OutroScene",
          "props": { "headline": "三步搭好你的自动出片引擎，没基础也能复制", "cta": "找路径 · 选型 · 落地" },
          "voice_slice": "回头看就三步：找路径让 AI 把现成方案全摆出来、选型让 AI 列坑人对约束拍板、落地填配置套组件规则兜底让 AI 跑渲染。你要会的不是写代码，是讲清需求、看住坑、把规则固化给 AI——没基础也能复制。",
          "duration_seconds": 12,
          "visual_beats": [{"at_seconds": 0, "action": "三步法依次点亮"}]
        },
        {
          "id": "9.2",
          "scene_template": "@OutroScene",
          "props": { "headline": "下期 EP03：用 Whisper 让字幕踩着话音跳", "cta": "关注 · 别错过" },
          "voice_slice": "下期 EP03，用 Whisper 拿字级时间戳，让字幕踩着话音跳。关注别错过。",
          "duration_seconds": 8,
          "visual_beats": [{"at_seconds": 0, "action": "开源仓库地址 + 关注引导 + EP03 预告卡"}]
        }
      ]
    }
  ],
  "zoom_crop_directives": [
    { "clip_id": "b-ssr-crash", "timestamp_start": "00:00", "timestamp_end": "00:08", "zoom_level": 1.6, "focal_point": { "x": 0.4, "y": 0.45 } },
    { "clip_id": "b-ssr-fix", "timestamp_start": "00:00", "timestamp_end": "00:10", "zoom_level": 1.6, "focal_point": { "x": 0.5, "y": 0.5 } }
  ],
  "coverage_checklist": {
    "开场": "S1：点题+AI 强在文本代码→数据驱动+人设+三步路线图",
    "找技术路径": "S2：AI 罗列六条路线+共同内核只列不评",
    "技术选型": "S3：逼 AI 给不适用+坑+回到约束选 Remotion+vs 复制粘贴 HTML+代价如实说",
    "技术落地·Remotion 原理": "S4：Remotion 工作原理（useCurrentFrame/插值→无头浏览器逐帧截图→FFmpeg 合成、30fps 秒帧换算）+ 为什么 AI 好驱动（React/CSS·声明式·数据驱动·TS 兜底）",
    "技术落地·配置分发": "S5：配置→Explainer 按 type 分发+14 个统一皮肤模板场景+配置即内容 TS 兜底+自有风格组件库一句带过",
    "技术落地·SSR": "S6：SSR window 崩溃坑+typeof 守卫+规则固化进 .cursor/rules",
    "技术落地·数字人": "S7：数字人定位陪衬+三种形象选型+选定 VRM 不做对口型+取景/脚站稳落地",
    "场景适配": "S8：适合纯 A 轨/可搭配透明叠层/不适合（实拍·对口型·影视特效·后台批处理）",
    "总结CTA": "S9：三步法回顾+没基础也能复制+EP03 预告"
  },
  "judgment_layer_coverage": {
    "highlights_pitfall": true,
    "explains_boundary": true,
    "acceptance_standard": true
  }
}
```
