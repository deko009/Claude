# HarmonyOS Sans SC · ELECTRO X 中文字体

ELECTRO X 中文版网站使用的字体。ELECTROX 和 Stolzl 都没有中文字形，中文内容统一用这套字体。

| 文件 | 字重 | font-weight |
|---|---|---|
| HarmonyOS_Sans_SC_Light.ttf | Light | 300 |
| HarmonyOS_Sans_SC_Regular.ttf | Regular | 400 |
| HarmonyOS_Sans_SC_Medium.ttf | Medium | 500 |
| HarmonyOS_Sans_SC_Bold.ttf | Bold | 700 |
| HarmonyOS_Sans_SC_Black.ttf | Black | 900 |

## 使用说明

- Figma 中的字体名：`HarmonyOS Sans SC`，样式名同上表。
- Figma 服务器端没有这套字体。通过插件或 Claude 新建、修改的中文文字，需要在本机 Figma 里运行一次 Refresh Text Layout 插件，才能按真实字形显示。
- 网页使用：转成 woff2 放进 Shopify assets，用 `@font-face` 引入，加 `font-display: swap`。首屏只预加载用到的字重。每个文件约 8 MB，建议按页面常用字做子集。
- CSS 字体栈示例：`font-family: "Stolzl", "HarmonyOS Sans SC", "PingFang SC", sans-serif;`
