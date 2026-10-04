# cafe-kit

FFCafe 的《最终幻想 XIV》网页工具包，提供通用展示组件、物品与技能悬浮窗、交互地图和 XIVAPI v2 客户端。

## 工具包

| 包 | 用途 |
| --- | --- |
| [`@thewakingsands/kit-common`](./pkgs/kit-common) | 展示物品名称、图标、属性和信息面板的通用组件。 |
| [`@thewakingsands/kit-tooltip`](./pkgs/kit-tooltip) | 物品与技能详情组件，以及根据链接、名称或 ID 显示的悬浮窗。 |
| [`@thewakingsands/eorzea-interactive-map`](./pkgs/eorzea-map/README.md) | 支持区域切换、地图标记、坐标换算和网格显示的交互地图。 |
| [`@thewakingsands/xivapi-v2`](./pkgs/xivapi-v2) | 查询游戏数据、搜索物品与技能，以及获取图标和地图资源的客户端。 |

## 在线示例

[查看全部示例](https://thewakingsands.github.io/cafe-kit/)

| 示例 | 地址 |
| --- | --- |
| 通用组件 | [kit-common/example/](https://thewakingsands.github.io/cafe-kit/kit-common/example/) |
| 物品与技能详情 | [kit-tooltip/example/](https://thewakingsands.github.io/cafe-kit/kit-tooltip/example/) |
| 自动悬浮窗与接入示例 | [kit-tooltip/example/auto.html](https://thewakingsands.github.io/cafe-kit/kit-tooltip/example/auto.html) |
| 艾欧泽亚交互地图 | [eorzea-map/example/](https://thewakingsands.github.io/cafe-kit/eorzea-map/example/) |

在线地图已配备地图数据，打开即可使用。地图图片、图标和悬浮窗详情需要联网加载。

## 接入应用

各包可按需安装，例如使用物品与技能悬浮窗：

```sh
npm install @thewakingsands/kit-tooltip
```

悬浮窗的初始化、HTML 标记和配置选项见[自动悬浮窗示例](https://thewakingsands.github.io/cafe-kit/kit-tooltip/example/auto.html)。
地图的安装、初始化、自定义标记和坐标换算见[地图使用文档](./pkgs/eorzea-map/README.md)。
