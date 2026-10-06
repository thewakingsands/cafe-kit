# Eorzea Interactive Map

基于 Leaflet 的《最终幻想 XIV》交互式地图，支持区域切换、游戏内标记、坐标换算和网格显示。
提供 ES 模块、UMD 构建和 TypeScript 类型声明，可嵌入普通网页或前端应用。

地图和图标由 XIVAPI v2 提供；地图名称、区域列表和标记数据默认从
`https://map-v2.ffcafe.cn/data/` 读取，无需自行生成或部署数据。

[在线体验](https://thewakingsands.github.io/cafe-kit/eorzea-map/)

## 安装

在应用项目中安装：

```sh
npm install @thewakingsands/eorzea-interactive-map
```

在 SSR 框架中，请仅在客户端导入和初始化地图。

## 快速开始

默认数据为简体中文，页面需能访问数据 CDN 和 XIVAPI v2。

为地图提供有明确宽高的容器：

```html
<div id="map" style="width: 100%; height: 600px; background: #111"></div>
```

在支持 CSS 导入的前端构建工具中使用以下代码，并在容器挂载后执行：

```js
import { create } from "@thewakingsands/eorzea-interactive-map";
import "@thewakingsands/eorzea-interactive-map/style.css";

async function main() {
  const container = document.getElementById("map");
  if (!container) throw new Error("找不到地图容器");

  const map = await create(container);
  await map.loadMapId("world/00");
  return map;
}

main().catch(console.error);
```

CSS 已包含 Leaflet 样式。`create()` 会清空容器并创建地图控件，随后需调用
`loadMapId()` 或 `loadMapKey()` 加载首张地图。组件卸载时调用 `map.remove()` 释放地图；容器尺寸变化后可调用
`map.invalidateSize()` 更新布局。

### 不使用构建工具

将包内的 `dist/map.umd.cjs` 和 `dist/map.css` 复制到站点静态目录，以普通 `<script>`
加载。UMD 导出为 `window.YZWF.eorzeaMap`，使用方式见[完整 HTML 示例](./example/index.html)。
示例相对引用构建产物，并通过 `setApiUrl()` 使用本地生成数据。
使用默认 CDN 时可删除该调用，部署时需相应调整脚本和样式路径。

通过 HTTP 服务访问页面，并确保 `.cjs` 文件使用 JavaScript MIME 类型。

## 常用 API

`create()` 返回的 `EoMap` 继承 Leaflet `Map`，可使用其 `setView()`、`panTo()`、`on()`
等方法。下列地图实例方法应在首次加载地图后使用，加载方法本身除外。

| API                                    | 用途                                                                                |
| -------------------------------------- | ----------------------------------------------------------------------------------- |
| `create(element)`                      | 接收 `HTMLElement`，返回 `Promise<EoMap>`。                                         |
| `setApiUrl(url)`                       | 设置 JSON 目录，默认 `https://map-v2.ffcafe.cn/data/`；自定义时应在创建地图前调用。 |
| `getRegion()`                          | 返回区域列表的 Promise，每个区域包含 `placeNameRegion` 和 `maps`。                  |
| `map.loadMapKey(key)`                  | 按 Map 表的数字行 ID 加载，例如 `92`；返回 `Promise<EoMap>`。                       |
| `map.loadMapId(id)`                    | 按 Map 表的资源 ID 加载，例如 `'world/00'`；返回 `Promise<EoMap>`。                 |
| `map.mapInfo`                          | 当前地图的 `IMapInfo`，包括资源 ID、名称、缩放比例等。                              |
| `map.addMarker(marker)`                | 添加 Leaflet Marker 并返回它；切换地图时会清除此标记。                              |
| `map.onUpdateInfo(handler)`            | 地图切换完成时以当前 `IMapInfo` 调用回调。                                          |
| `map.offUpdateInfo(handler)`           | 移除同一个回调函数。                                                                |
| `simpleMarker(x, y, iconUrl, mapInfo)` | 按游戏内地图坐标创建 Marker，需再调用 `addMarker()`。                               |
| `loader.getMapUrl(id)`                 | 获取 WebP 格式的地图图片 URL。                                                      |
| `loader.getIconUrl(icon)`              | 将数字图标 ID 或游戏图标纹理路径转换为 URL；无效值返回 `null`。                     |

### 添加自定义标记

以下函数接收已加载区域地图的 `map`，在游戏内地图坐标 `(10, 10)` 添加标记并移动视图：

```js
import { loader, simpleMarker } from "@thewakingsands/eorzea-interactive-map";

function markLocation(map) {
  const iconUrl = loader.getIconUrl(60561);
  if (!iconUrl) return;

  const marker = simpleMarker(10, 10, iconUrl, map.mapInfo);
  marker.bindPopup("目标位置");
  map.addMarker(marker);
  map.setView(map.mapToLatLng2D(10, 10), 0);
  return marker;
}
```

### 坐标换算

| 方法                      | 转换方向                                                    |
| ------------------------- | ----------------------------------------------------------- |
| `map.fromMapXY2D(x, y)`   | 游戏内地图坐标 → 图片坐标 `[x, y]`。                        |
| `map.toMapXY2D(x, y)`     | 图片坐标 → 游戏内地图坐标 `[x, y]`。                        |
| `map.mapToLatLng2D(x, y)` | 游戏内地图坐标 → Leaflet `[lat, lng]`，可传给 `setView()`。 |
| `map.toMapXY3D(x, z)`     | 游戏世界坐标的 X/Z → 游戏内地图坐标 `[x, y]`。              |
| `map.from3D(x, z)`        | 游戏世界坐标的 X/Z → 图片坐标 `[x, y]`。                    |
| `xy(x, y)`                | 图片坐标 → Leaflet `[2048 - y, x]`，从包入口导入。          |

## 自行生成数据

使用默认 CDN 时无需生成数据。仅在需要其他语言、更新数据或自行托管时使用，需 Node.js 24+ 和网络连接：

```sh
node node_modules/@thewakingsands/eorzea-interactive-map/scripts/generate-data.js --output public/data
```

默认生成简体中文数据；可追加 `--language en` 等参数选择其他受支持的语言。

| 参数                 | 默认值                       | 说明                                                         |
| -------------------- | ---------------------------- | ------------------------------------------------------------ |
| `--output DIR`       | 包目录下的 `generated/data/` | 输出目录。可使用绝对路径；相对路径以执行命令时所在目录为准。 |
| `--language LANG`    | `chs`                        | 数据语言，例如 `en`；须受服务端支持。                        |
| `--schema SPECIFIER` | 服务端默认值                 | 指定表结构版本，通常无需设置；不用于固定游戏数据版本。       |
| `--help`、`-h`       | —                            | 显示命令帮助。                                               |

生成时会覆盖输出目录中的同名数据文件。

将生成的文件部署到站点的数据目录，并在创建地图前设置地址：

```js
import { setApiUrl } from "@thewakingsands/eorzea-interactive-map";

setApiUrl("/data/");
```

上述示例假设 `public/` 是站点静态资源目录。跨域托管数据时，服务器需允许页面的跨域请求。

## 升级

更新依赖：

```sh
npm install @thewakingsands/eorzea-interactive-map@latest
```

- 使用默认 CDN 时，无需自行生成数据。
- 自行托管数据时，使用更新后的脚本重新生成数据，并与新的脚本、样式一起部署；旧格式数据不能直接复用。
- 通过普通 `<script>` 接入时，同步替换 `dist/map.umd.cjs` 和 `dist/map.css`。
- 如果读取了 `map.mapInfo` 或使用自定义区域选择器，请按当前类型声明调整字段访问。

## 许可证

[BSD-3-Clause](./LICENSE)。
