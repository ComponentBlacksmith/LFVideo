# 故障赛博 / Glitch
> 数字故障风：乱码解码登场、RGB 撕裂离场；等宽字体、青色高亮。

```bash
npx remotion render src/index.ts SceneTheme out.mp4 --props='{
  "theme": "glitch",
  "content": {
    "hero": {
      "entries": [
        {
          "text": "主题成套动效",
          "sub": "One theme · consistent motion"
        }
      ]
    },
    "list": {
      "items": [
        {
          "text": "标题、列表、字幕…自动协调"
        },
        {
          "text": "入场/出场可分别切换"
        },
        {
          "text": "配色/字体/节奏全主题统一"
        },
        {
          "text": "导出即一份配置 JSON"
        }
      ],
      "title": "一个主题搞定整片"
    },
    "lowerThird": {
      "entries": [
        {
          "name": "林述白",
          "role": "动态设计师"
        }
      ]
    },
    "caption": {
      "lines": [
        {
          "text": "选一个主题，整片风格一键成套。"
        },
        {
          "text": "再逐场景微调入场与出场。"
        }
      ]
    },
    "emphasis": {
      "lines": [
        {
          "pre": "只需 ",
          "token": "一个主题",
          "post": " 即可统一全片。"
        }
      ]
    }
  },
  "timing": {
    "inF": 20,
    "holdF": 40,
    "outF": 16
  },
  "style": {
    "textEffect": {
      "shadow": {
        "x": 3,
        "y": 3,
        "blur": 6,
        "color": "#0091ff"
      }
    }
  },
  "effects": {
    "hero": {
      "inEffectId": 72,
      "outEffectId": 92
    },
    "caption": {
      "inEffectId": 33,
      "outEffectId": 40
    }
  }
}'
```

Scenes: 主标题(Hero)→列表(List)→角标(Lower-third)→字幕(Caption)→强调(Emphasis)
Duration: 494f (16.5s)
Timing: in=20f hold=40f out=16f
Text Effects: 阴影