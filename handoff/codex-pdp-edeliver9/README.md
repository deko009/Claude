# eDELIVER 9 PDP · Codex 实现说明

> 给 Codex：请在现有「MAXUS 全球站首页离线包」（2026-10-07 版）的代码基础上，新增一个产品详情页 **eDELIVER 9 PDP**，并实现交互效果。
> 设计稿以 Figma 为准，本文档列出结构、文案、交互和验收标准。

---

## 0. 资料清单

| 资料 | 位置 | 说明 |
|---|---|---|
| 首页离线包 | `MAXUS首页_双击打开此文件.html`、`styles.css`、`app.js`、`global-presence.css/js`、`assets/` | **必须复用**：头部、公告栏、页脚、字体、颜色、按钮、Tab、动效写法 |
| PDP 设计稿（定稿） | Figma 文件 `t04UkR2aPHLl8ItPu4te20`，页面「PDP 20261009」，主画板 **「eDELIVER 9｜PDP 设计稿｜2026-10-10」**（node `491:6`） | 以此为准 |
| 备选版式 | 同页：「PDP 上一版（胶囊控件版）」`526:30`、「第一版（初稿）」`512:7`、「备选｜04 尺寸 See how it fits」`506:7` | 仅参考，不实现 |
| 线框逻辑 | 同页左侧长图（node `407:1013`） | 页面模块顺序来源 |
| 产品图 | 本目录 `assets/pdp/*.jpg`（27 张，已按用途命名） | 原图 4K 在 Figma 内，需要更高清可从 Figma 导出 |
| 已有 HTML 原型（交互参考） | 仓库 `prototype/maxus-edeliver9-pdp.html` | 单文件原型，交互逻辑可参考，**视觉以 Figma 为准** |

---

## 1. 交付物

```
pdp-edeliver9.html      ← 新页面（与首页同级）
pdp.css                 ← 只写 PDP 新增样式；全局样式全部引用 styles.css
pdp.js                  ← PDP 交互
assets/pdp/             ← 本目录图片，原样拷入
```

- 引用顺序：`styles.css` → `pdp.css`；`app.js`（头部、公告栏、弹窗、Cookie、AI 助手沿用）→ `pdp.js`。
- 不要改 `styles.css` / `app.js`。如果必须改，单独列出改动并说明原因。
- 离线可用，不引用外部 CDN。Lenis、字体沿用首页 `assets/vendor`、`assets/fonts`。

---

## 2. 必须与首页一致（直接复用首页 DOM/class）

| 元素 | 首页实现 | PDP 用法 |
|---|---|---|
| 公告栏 | `.announcement-bar` | 原样复用 |
| 头部导航 | `.site-header` + `.main-nav`（MAXUS / Vehicles / Safety & Technology / Sustainability / Newsroom） | 原样复用，Vehicles 加选中态 |
| 首屏结构 | `.hero__headline` + `.hero__baseline` + `.hero__footline`（三栏） | PDP 首屏同结构，见 §4-01 |
| 文字链接 | `.text-link`（文字 + 箭头，hover 箭头位移） | 页面所有 CTA 都用它；**除订阅外不做实心按钮** |
| Tab | `.vehicle-tab`（选中加粗 + 2px 下划线，未选中 `--muted`） | 页面内所有切换都用此样式 |
| 数据 | `.stats` / `.stat`（大数字 + 计数动画 `data-count-to`） | 概览 4 个参数沿用计数逻辑 |
| 大图文案 | `.platform__copy`（图上标题 + 副标题 + 描述） | 充电、改装场景沿用 |
| 卡片圆角 | 卡片 6px、图片 4px（`.news-card__image` 10px 不用于 PDP） | 统一 6 / 4 |
| 页脚 | `.site-footer` | 原样复用 |
| 字体 | 标题 Michroma（`--display-font`），正文 Geist；数据用 Geist Light；小标签 Geist Mono 大写 | |
| 颜色 | `--ink #080a0d`、`--muted #6e7787`、`--line #d6d8dc`、品牌蓝 `--blue #1e5fc8`（**只用于 hover / 选中 / 进度**） | 深色区 Navy `#070A11` |
| 尺寸缩放 | `--viewport-fit-scale`、`--page-pad`、`--content-max` | PDP 新样式也用 `calc(var(--viewport-fit-scale,1) * Npx)` 写法，保证与首页同比例缩放 |
| 断点 | `max-width:900px`、`max-width:600px`、`prefers-reduced-motion` | 三档都要适配 |

---

## 3. 页面模块顺序（共 13 段）

| # | 模块 | 背景 |
|---|---|---|
| 01 | 首屏 Hero | 全屏图（深） |
| 02 | Explore eDELIVER 9（版本 Tab + 正面棚拍 + 参数） | 浅灰棚拍 |
| 03 | A closer look（360 / 热点 / 车门 / 颜色） | 浅灰 |
| 05 | 11 m³ of working space（左列表切右图） | 白 |
| 06 | 充电（全屏图 + 充电面板） | 深 |
| 06b | Details that do the work（卡片横滑） | 暖灰 `#F2F0ED` |
| 07 | A base for specialist work（标题） | 白 |
| 07b | 改装示例 Minibus（全屏图 + 座椅布局卡） | 深 |
| 07c | Deliveries ahead（全屏图 + 标题） | 深 |
| 08 | A connected place to work（驾驶舱热点） | 白 |
| 09 | Help for the road ahead（演示图 + 三项功能） | 白 |
| 10 | Inside and out（图库） | 浅灰 |
| 04 | eDELIVER 9 Specs（规格表 + 线稿） | 深 |
| 10b | Compare versions and equipment levels | 白 |
| 11 | FAQ | 白 |
| 12 | Find your eDELIVER 9 | 全屏图 |
| 13 | 页脚 | 首页页脚 |

> Specs 放在 Gallery 之后、Compare 之前（客户要求下移）。

---

## 4. 各模块说明（文案为英文原文，请逐字使用）

### 01 首屏 Hero
- 图：`hero-mountain-road.jpg`，全屏 cover。顶部、底部加深色渐变（Navy，底部到 ~92% 不透明，保证底栏可读），**不要整屏压暗**。
- 居中标题（Display，Michroma）：`eDELIVER 9`
- 底栏沿用首页 `.hero__footline` 三栏 + 上方细线：
  - 左：`ELECTRIC LARGE VAN`
  - 中：`The van that powers productivity.`
  - 右：两个 `.text-link`：`Find Your Local MAXUS →`、`Explore eDELIVER 9 ↓`（后者锚点滚到 02）
- 动效：图片 1.08 → 1 缓慢缩放；标题、底栏按首页的入场节奏淡入上移。
- 滚动后出现吸顶子导航（见 §5）。

### 02 Explore eDELIVER 9
- 标题 `Explore eDELIVER 9`（居中）
- Tab：`L2H2` / `L3H2`（默认）/ `L3H3`，首页 Tab 样式
- 主图：`studio-front.jpg`，浅灰棚拍背景（不是纯白）：中间一条柔和地平线 + 车底软阴影；图片用 `mix-blend-mode:multiply` 融进背景。
- 左下大字：`eDELIVER 9 L3H2`（随 Tab 变）
- 右侧一行参数，竖线分隔：
  - `88 kWh*` Battery capacity
  - `11 m³*` Loadspace
  - `150 kW*` Max motor power
  - `51 min**` DC 10–80%
  - `£XX,XXX†` Starting price
- 脚注：`*26.5MY eDELIVER 9 L3H2 FWD N1 Cargo Van, 88 kWh battery.  **DC 90 kW; time varies with charger, battery condition and temperature.  †Price placeholder, set per market.`
- 交互：切 Tab 时数字计数刷新、名称切换。目前只有 L3H2 的数据，其余版本先显示 `TBC`。

### 03 A closer look at eDELIVER 9.
- 舞台图：`studio-l45-doors-open.jpg`（默认），另有 `studio-front` / `studio-top-view` / `studio-rear`
- 顶部 Tab：`Exterior` / `Interior` / `Load floor`
- 热点（蓝点 + 呼吸光圈，hover 显示提示）：
  - Sliding side door
  - LED headlights
  - 16-inch steel wheels
  - Rear lamps
- 底部控制：
  - 左：`360 view`（文字 + 图标）
  - 中：Tab `Doors open` / `Doors closed`
  - 右：颜色色板 + 当前名称。颜色名为占位：Arctic White / Silver / Graphite。
- 交互：
  - 鼠标或手指左右拖拽，按 4 个角度切换（参考 Toyota Yaris Cross 360）。
  - 切换时交叉淡入 0.6s。
  - 没有车门关闭的图时，先用 `studio-front` 代替。
- 脚注：`Colour names shown as placeholders; available colours vary by market.`

### 05 11 m³ of working space.*
- 左列表（点击切右图，6s 自动轮播，当前项上方蓝色进度线）：
  1. **11 m³ loadspace*** — A 3,413 mm-long loadspace gives equipment and deliveries room on board, with a flat floor and cargo lighting. → `loadspace-interior.jpg`
  2. **Rear doors to 253°*** — Wide-opening rear doors fold back against the body for forklift and pallet access. → `rear-doors-open.jpg`
  3. **Sliding side door** — Load from the kerb and reach the cab without stepping out. → `studio-l45-doors-open.jpg`
- 只有当前项展开描述，其余收起。
- 脚注：`*Figures refer to the 26.5MY eDELIVER 9 L3H2 FWD N1 Cargo Van with an 88 kWh battery. Specifications vary by market and version.`

### 06 10–80% DC charging in 51 minutes.**
- 背景：`depot-side-charging-bg.jpg`。车放在右侧并完整露出，左侧深色渐变。**图片不能拉伸变形，等比 cover。**
- 标题注意：Michroma 的 `%` 会显示成 “0/o”，`%` 请单独用 Geist Light 渲染。
- 描述：`DC and AC charging support different charging routines. Liquid heating and cooling help manage the battery's temperature as conditions change.`
- 左下磨砂面板（深色 55% + blur 30 + 白 14% 描边，圆角 6）：
  - 小标签 `DC FAST CHARGE · 90 kW`，右上 `Replay ↻`
  - 大数字 `51 min`，右侧 `10% → 80%`
  - 40 格电量条，10% 和 80% 处有刻度
  - 下方三项：`88 kWh` Battery capacity* / `90 kW` DC charging power** / `AC` Depot & overnight
- 交互：进入视口后自动播放约 4 秒，电量从 10% 填到 80%，分钟数从 0 计到 51；点 Replay 重播。
- 脚注：`**10–80% DC charging: 51 minutes at 90 kW. Actual time varies with charger output, battery condition, temperature and other conditions.`

### 06b Details that do the work.
- 5 张白色卡片横滑，卡宽约 400：上方标题 + 一句描述，下方图片，右下角圆形 `+`（点击展开大图或说明）：

  | 标题 | 描述 | 图片 |
  |---|---|---|
  | Full LED headlights | Clear light for early starts and late drops. | `detail-headlight.jpg` |
  | Chrome-framed grille | The eDELIVER 9 face, built to take daily wear. | `detail-grille.jpg` |
  | 253° rear doors* | Fold back against the body for pallet loading. | `rear-doors-open.jpg` |
  | Steel wheels | Covers that shrug off kerbs and loading bays. | `detail-wheel.jpg` |
  | Tall rear lamps | Seen above the load, day and night. | `detail-taillight.jpg` |

- 控制条（**全站轮播统一用这一种**）：
  - 左：进度短线（当前项为黑色并自动走满）
  - 中：`01 / 05`
  - 右：两个圆形箭头按钮（上一张白底；下一张蓝底，hover 蓝）
- 支持拖拽和触控滑动。

### 07 A base for specialist work.
- 文案：`Available power take-off interfaces and bodybuilder connections support approved conversions. Match the vehicle and equipment to the work your business needs to do.`

### 07b 改装示例（全屏）
- 图：`minibus-conversion-street.jpg`，带视差滚动
- 左下小标签：`EXAMPLE CONVERSION · MINIBUS`
- 右下磨砂卡：
  - Tab：`Exterior` / `Seating layout`（默认）
  - 切换图片：`minibus-conversion-alt.jpg` / `minibus-seating-layout.jpg`（布局图用 contain，浅灰底）
  - 卡内文案：`Cargo van, minibus or a body of your own. Talk to your local MAXUS team about approved converters.`

### 07c Deliveries ahead.
- 图：`city-delivery-side-door.jpg`，带视差滚动；顶部深色渐变
- 标题（左上，白字）：`Deliveries ahead.` / `Electric power on board.`

### 08 A connected place to work.
- 文案：`A column-mounted drive selector, central touchscreen and smartphone connectivity keep driving controls and everyday tools within reach.`
- 大图：`cabin-cockpit.jpg`，上面放 4 个热点：白色圆点、“+”号、呼吸光圈。点击后热点变蓝、“+”转成“×”，旁边弹出磨砂说明卡（贴边时自动翻到另一侧）：

  | 编号 | 标题 | 描述 |
  |---|---|---|
  | 01 · Touchscreen | Central touchscreen | Navigation, media and vehicle settings, with smartphone connectivity. |
  | 02 · Display | Digital driver display | Speed, range and charge level in one clear view. |
  | 03 · Drive selector | Column-mounted drive selector | Frees up the space between the seats for a third passenger. |
  | 04 · Seats | Three seats across | Room for a crew of three, with storage under the passenger bench. |

- 左下提示：`TAP + TO EXPLORE THE CABIN`
- 热点位置（相对图片宽高 %）：(49.8, 35.3) (30.9, 43.6) (45.8, 47.8) (74.4, 69.9)
- 默认展开 01。

### 09 Help for the road ahead.
- 白底，左上：`SAFETY` + 标题。**图上不放文字。**
- 大图：`adas-winding-road.jpg`，圆角 6。车要完整露出，包括车头。
- 下方三列（顶部线 + 编号 + 标题 + 一句话），选中项全不透明，其余 45% 透明：
  - 01 **Adaptive cruise control** — Keeps a set distance to the vehicle ahead, slowing and resuming with traffic.
  - 02 **Lane-keeping support** — Helps keep the van centred when lane markings are visible.
  - 03 **Emergency braking** — Watches the road ahead and can brake automatically if a collision is likely.
- 交互：点击或自动轮播切换图上的 SVG 叠加动画：
  - ACC：车前蓝色扇形 + 距离波纹
  - 车道保持：两侧车道线高亮
  - AEB：车前同心圆脉冲
- 叠加层坐标：可参考原型 `prototype/maxus-edeliver9-pdp.html` 中的 `#adas svg.ov`（viewBox 1500×1000）。

### 10 Inside and out.
- Tab：`Exterior` / `Interior`
- 大图左右切换，下方 6 张缩略图条，当前项下方蓝线，左下磨砂标签（如 `01 · ON THE ROAD`）。
  - Exterior：`hero-mountain-road`、`detail-grille`、`gallery-headlight-2`、`detail-taillight`、`detail-wheel`、`gallery-front-corner`、`gallery-city-road`
  - Interior：`cabin-cockpit`、`cabin-touchscreen`、`cabin-dashboard`、`cabin-seating`、`gallery-cab`、`gallery-loadspace-2`

### 04 eDELIVER 9 Specs（深色，参考 Tesla Model Y / Cybertruck Specs）
- 左上标题 `eDELIVER 9 Specs`，右上 Tab：`L2H2 Cargo Van` / `L3H2 Cargo Van`（默认）/ `L3H3 Cargo Van`
- 分组（每组标题 + 多列「小灰标签 / 白色数值」，组间细线分隔）：
  - **Performance**
    - Battery capacity 88 kWh*
    - Maximum power 150 kW*
    - Maximum torque 330 Nm*
    - Drive Front-wheel drive
    - DC charging, 10–80% 51 min**
  - **Dimensions**
    - Loadspace 11 m³*
    - Loadspace length 3,413 mm*
    - Rear door opening 253°*
    - Overall length / height / width TBC mm
    - Seating 3 seats
    - Display Central touchscreen
    - Payload TBC kg
  - **Charging**
    - DC charging power 90 kW**
    - DC 10–80% 51 min**
    - AC charging TBC kW
    - Battery heating and cooling Liquid
- 右侧白色线稿侧视图：
  - 货厢范围用蓝色虚线框标出，标注 `3,413 mm loadspace*`
  - 车长、车高用虚线尺寸标注
  - 线稿 SVG 可直接取原型里 `#bpSide` 的路径
- 切换 Tab 时数值淡出淡入；没有数据的显示 `TBC`。

### 10b Compare versions and equipment levels.（参考 Volvo XC90）
- 3 张卡（L2H2 / L3H2 / L3H3），浅灰底，圆角 6。L3H2 是推荐款：顶部 2px 蓝线 + `MOST POPULAR` 标签；其余标 `26.5MY`。
- 每卡依次是：
  - 车图
  - `eDELIVER 9 L3H2`（版本名为灰色）
  - `Cargo Van · Long, high roof`
  - `Starting at £XX,XXX excl. VAT†`
  - `Included:` 或 `L2H2 features, plus:`
  - 4 条 ✓ 卖点 + `and more`
  - `Colours` 色点组
  - `Interiors` 色点组
  - `Learn more →`
- 卡片下方居中：`Compare levels →`（文字链接，**不做实心按钮**）
- 卖点文案请照抄 Figma 节点 `503:7`。
- hover：卡片上浮 4px + 阴影。

### 11 FAQ — More about eDELIVER 9
- 手风琴，第一项默认展开，“+”会旋转成“−”：
  1. **Where can I find local specifications?** — Visit your local MAXUS website for the versions, specifications and support available in your market.
  2. **Which manual should I use?** — Use the manual for your vehicle's model year and market. You'll find it under Manuals & Guides on your local MAXUS website.
  3. **How much loadspace does the eDELIVER 9 offer?** — The L3H2 FWD N1 Cargo Van offers 11 m³, with a loadspace length of 3,413 mm.* Other versions vary.
  4. **Can I use AC and DC charging?** — Yes. DC charging at up to 90 kW takes the battery from 10% to 80% in 51 minutes.** AC charging suits depot and overnight routines.
  5. **Can the eDELIVER 9 support specialist conversions?** — Yes. Available power take-off interfaces and bodybuilder connections support approved conversions. Your local MAXUS team can put you in touch with converters.

### 12 Find your eDELIVER 9.
- 图：`find-city-minibus.jpg`，车在右侧，等比、**不变形**；只在左侧加渐变，**不要整屏压暗**。
- 左对齐文案：
  - 标题（两行）`Find your` / `eDELIVER 9.`
  - 描述 `Explore the versions, availability and support offered in your market.`
  - 链接 `Choose Your Market →`
- 点击「Choose Your Market」弹出市场菜单（磨砂，列出 UK / ES / DE / NL / AU / All markets），可直接复用首页 `#countryDialog`。

---

## 5. 全局交互

1. **吸顶子导航**
   - 滚过首屏后，从顶部滑出白色磨砂条：左 `eDELIVER 9`（Michroma），中间锚点，右 `Find Your Local MAXUS →`。
   - 中间锚点：Overview / Design / Loadspace / Charging / Details / Conversions / Cabin / Safety / Gallery / Specs / Versions / FAQ
   - 向下滚时隐藏主导航、只留子导航；向上滚时两者都显示。
   - 按滚动位置高亮当前锚点（蓝色下划线）。
2. **入场动画**：模块标题和内容淡入、上移 32px，依次延迟 80ms，只播一次。
3. **数字计数**：沿用首页 `data-count-to` 的写法，1.4s，ease-out。
4. **视差**：全屏图（07b、07c、12）滚动时位移 ±8%。
5. **轮播**：全站统一 §4-06b 的控制条样式，6s 自动播放，支持拖拽和触控滑动；hover 时暂停。
6. **键盘与无障碍**
   - Tab 用 `role="tablist"`，支持左右方向键切换。
   - 热点、`+` 按钮都要有 `aria-label`。
   - 弹层按 Esc 关闭。
7. **减弱动效**（`prefers-reduced-motion: reduce`）：关闭视差、自动轮播、计数和充电动画，直接显示最终状态。
8. **性能**
   - 首屏图 preload，其余图片 `loading="lazy"`。
   - 图片转 webp，桌面最长边 2400，移动端 1200。

---

## 6. 视觉细节规则（客户反复提过的点）

- **图片不能变形**：一律 `object-fit:cover` 或 `contain`，不要用拉伸的背景尺寸。
- **车不能被遮挡**：文字、面板、Tab 都不能压在车身上，车要完整露出（首屏、充电、ADAS、Find）。
- **不要整屏压暗**：只在放文字的一侧或一边加渐变。
- **按钮弱化**：只有订阅是实心按钮，其余都用 `.text-link`（文字 + 箭头）。hover 统一品牌蓝 `#1E5FC8`。
- **圆角**：卡片和容器 6px，图片和内部按钮 4px，圆形按钮除外。
- **间距**：
  - 左右边距 120（用 `--page-pad`）
  - 模块上下约 100–140
  - 标题组到内容 56–80
  - 标签、标题、正文之间 24
  - 卡片间距 12
  - 文字和箭头之间 10
- **磨砂标签**：深色 42–55% + blur 30–40 + 白 14–20% 描边。
- 文案用英文、平实，不要改写；`*` / `**` / `†` 脚注必须保留。

---

## 7. 验收清单

- [ ] 在 1920 / 1440 / 1024 / 768 / 390 五个宽度下，没有横向滚动、文字不重叠、车不被遮挡。
- [ ] 所有交互可用：
  - [ ] 吸顶子导航
  - [ ] Explore Tab
  - [ ] 360 拖拽
  - [ ] Closer look 热点、车门、颜色
  - [ ] 货厢列表
  - [ ] 充电动画和 Replay
  - [ ] 细节卡片轮播
  - [ ] 改装 Tab
  - [ ] 驾驶舱热点
  - [ ] ADAS 三项切换
  - [ ] 图库
  - [ ] Specs Tab
  - [ ] 对比卡 hover
  - [ ] FAQ
  - [ ] 选择市场
- [ ] 头部、公告栏、页脚与首页像素级一致（直接复用 DOM 和 class）。
- [ ] 控制台没有报错；断网（file://）也能打开。
- [ ] 减弱动效模式下页面完整可读。
- [ ] Lighthouse 无障碍 ≥ 90。

## 8. 待客户补充（先用占位）

- **数据**：车身长宽高、AC 充电功率、载重，以及 L2H2 / L3H3 两个版本的全部数据（先显示 `TBC`）。
- **价格**：先显示 `£XX,XXX†`。
- **图片**：各市场颜色名和对应车身颜色图、车门关闭图、真实充电场景图。
- **视频**：产品视频（之前上传的压缩包是空的）。拿到后可替换首屏和充电背景。
