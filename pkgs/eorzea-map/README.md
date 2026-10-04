# Eorzea Interactive Map

基于 Leaflet 的《最终幻想 XIV》交互式地图，支持区域切换、游戏内标记、坐标换算和网格显示。
提供 ES 模块、UMD 构建和 TypeScript 类型声明，可嵌入普通网页或前端应用。

地图和图标由 XIVAPI v2 提供；地图名称、区域列表和标记数据由随包提供的 JavaScript
脚本生成，需单独部署为静态 JSON 文件。

## 安装

在应用项目中安装：

```sh
npm install @thewakingsands/eorzea-interactive-map
```

浏览器需支持 ES 模块和 Fetch API；数据生成和源码开发
使用 Node.js 24+。本包依赖浏览器 DOM，在 SSR 框架中应仅在客户端导入和初始化。

## 快速开始

### 1. 准备地图数据

地图数据需单独准备：当前构建流程不会自动生成数据，npm 包也不包含这些 JSON 文件。
如果已有可用的数据目录，可直接通过 `setApiUrl()` 指向该目录，无需再次生成。
否则，在安装了本包的应用项目根目录执行：

```sh
node node_modules/@thewakingsands/eorzea-interactive-map/scripts/generate-data.js --output public/data
```

生成过程需要联网，默认使用简体中文数据。这里假设应用将 `public/` 作为静态资源根目录，
部署后应能访问 `/data/map.json`、`/data/mapMarker.json` 和 `/data/region.json`。
其他目录结构可通过 `--output` 和 `setApiUrl()` 配置，详见[数据生成与部署](#数据生成与部署)。

### 2. 创建地图

为地图提供有明确宽高的容器：

```html
<div id="map" style="width: 100%; height: 600px; background: #111"></div>
```

在支持 CSS 导入的前端构建工具中使用以下代码，并在容器挂载后执行：

```js
import { create, setApiUrl } from '@thewakingsands/eorzea-interactive-map'
import '@thewakingsands/eorzea-interactive-map/style.css'

async function main() {
  const container = document.getElementById('map')
  if (!container) throw new Error('找不到地图容器')

  setApiUrl('/data/')
  const map = await create(container)
  await map.loadMapId('world/00')
  return map
}

main().catch(console.error)
```

CSS 已包含 Leaflet 样式。`create()` 会清空容器并创建地图控件，随后需调用
`loadMapId()` 或 `loadMapKey()` 加载首张地图。加载方法的 Promise 在元数据和标记初始化后完成，
图片仍由浏览器异步下载。组件卸载时调用 `map.remove()` 释放地图；容器尺寸变化后可调用
`map.invalidateSize()` 更新布局。

### 不使用构建工具

将包内的 `dist/map.umd.cjs` 和 `dist/map.css` 复制到站点静态目录，以普通 `<script>`
加载。UMD 导出为 `window.YZWF.eorzeaMap`，使用方式见[完整 HTML 示例](./example/index.html)。
示例默认相对引用包内的构建产物和生成数据，部署时需相应调整路径。

通过 HTTP 服务访问页面，并确保 `.cjs` 文件使用 JavaScript MIME 类型。

## 常用 API

`create()` 返回的 `EoMap` 继承 Leaflet `Map`，可使用其 `setView()`、`panTo()`、`on()`
等方法。下列地图实例方法应在首次加载地图后使用，加载方法本身除外。

| API | 用途 |
| --- | --- |
| `create(element)` | 接收 `HTMLElement`，返回 `Promise<EoMap>`。 |
| `setApiUrl(url)` | 设置 JSON 目录，默认 `/data/`；应在创建地图前调用。 |
| `getRegion()` | 返回区域列表的 Promise，每个区域包含 `regionName` 和 `maps`。 |
| `map.loadMapKey(key)` | 按 Map 表的数字行 ID 加载，例如 `92`；返回 `Promise<EoMap>`。 |
| `map.loadMapId(id)` | 按 Map 表的资源 ID 加载，例如 `'world/00'`；返回 `Promise<EoMap>`。 |
| `map.mapInfo` | 当前地图的 `IMapInfo`，包括资源 ID、名称、缩放比例等。 |
| `map.addMarker(marker)` | 添加 Leaflet Marker 并返回它；切换地图时会清除此标记。 |
| `map.onUpdateInfo(handler)` | 地图切换完成时以当前 `IMapInfo` 调用回调。 |
| `map.offUpdateInfo(handler)` | 移除同一个回调函数。 |
| `simpleMarker(x, y, iconUrl, mapInfo)` | 按游戏内地图坐标创建 Marker，需再调用 `addMarker()`。 |
| `loader.getMapUrl(id)` | 获取 WebP 格式的地图图片 URL。 |
| `loader.getIconUrl(path)` | 将游戏图标纹理路径转换为 URL；无效路径返回 `null`。 |

`setApiUrl()` 的配置由同一模块中的所有地图实例共享，调用时会清空 JSON 请求缓存，
但不会自动刷新已有地图。`getRegion()` 返回的 `maps` 项包含 `key`、`id`、`name`、
`subName` 和 `hierarchy`，可用于实现自己的地图选择器。

### 添加自定义标记

以下函数接收已加载区域地图的 `map`，在游戏内地图坐标 `(10, 10)` 添加标记并移动视图：

```js
import { loader, simpleMarker } from '@thewakingsands/eorzea-interactive-map'

function markLocation(map) {
  const iconUrl = loader.getIconUrl('ui/icon/060000/060561.tex')
  if (!iconUrl) return

  const marker = simpleMarker(10, 10, iconUrl, map.mapInfo)
  marker.bindPopup('目标位置')
  map.addMarker(marker)
  map.setView(map.mapToLatLng2D(10, 10), 0)
  return marker
}
```

### 坐标换算

游戏内显示的地图坐标、地图图片坐标和 Leaflet 坐标是三种不同的表示。
图片坐标以左上角为原点，使用 `2048 × 2048` 的逻辑范围；Leaflet 使用 `CRS.Simple`，
其 `[lat, lng]` 在这里表示平面坐标，并非地理经纬度。

| 方法 | 转换方向 |
| --- | --- |
| `map.fromMapXY2D(x, y)` | 游戏内地图坐标 → 图片坐标 `[x, y]`。 |
| `map.toMapXY2D(x, y)` | 图片坐标 → 游戏内地图坐标 `[x, y]`。 |
| `map.mapToLatLng2D(x, y)` | 游戏内地图坐标 → Leaflet `[lat, lng]`，可传给 `setView()`。 |
| `map.toMapXY3D(x, z)` | 游戏世界坐标的 X/Z → 游戏内地图坐标 `[x, y]`。 |
| `map.from3D(x, z)` | 游戏世界坐标的 X/Z → 图片坐标 `[x, y]`。 |
| `xy(x, y)` | 图片坐标 → Leaflet `[2048 - y, x]`，从包入口导入。 |

## 数据生成与部署

以下参数适用于安装后的数据生成脚本，也适用于仓库内的 `generate:data` 命令：

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `--output DIR` | 包目录下的 `generated/data/` | 输出目录；自定义相对路径相对于当前工作目录解析。 |
| `--language LANG` | `chs` | 数据语言，例如 `en`；须受服务端数据支持。 |
| `--schema SPECIFIER` | 服务端默认值 | 表结构版本。 |
| `--help`、`-h` | — | 显示参数帮助。 |

每次生成会写入以下文件，覆盖输出目录中的同名文件：

| 文件 | 内容 | 浏览器运行时需要 |
| --- | --- | --- |
| `map.json` | 地图名称、坐标参数和标记范围。 | 是 |
| `mapMarker.json` | 地图标记、跳转目标和地名文本。 | 是 |
| `region.json` | 区域和地图选择列表。 | 是 |
| `manifest.json` | 语言、schema 和数据数量。 | 否，供记录生成配置。 |

前三个文件的顶层必须是 JSON 数组。生成产物不包含在 npm 包或 `dist/` 中，需随站点单独部署。
`setApiUrl('/data/')` 指向这些文件所在的目录；跨域部署时，静态服务器需允许页面来源的 CORS 请求。
数据请求不携带 Cookie 等凭据。

生成器将首次响应解析出的 schema 用于后续表请求，并写入 `manifest.json`。
每次生成读取服务端当前提供的数据；指定 schema 仅选择表结构，不能固定游戏数据版本。

浏览器运行时从 `https://xivapi-v2.xivcdn.com` 加载地图和图标，地图以 WebP 格式读取，首次加载需下载整张地图图片。
页面需要能够访问该服务。
`setApiUrl()` 和 `setCdnUrl()` 仅设置 JSON 地址，不改变图片来源。

## 从旧版迁移

- 按[数据生成与部署](#数据生成与部署)重新生成地图数据，将 `setApiUrl()` 配置为 JSON 文件所在的静态目录。
  使用 `setCdnUrl(base)` 时，数据目录为 `${base}/data/`。
- 将传统 `<script>` 对 `dist/map.js` 的引用改为 `dist/map.umd.cjs`，样式使用 `dist/map.css`。
  模块项目继续从包入口导入 JavaScript，并导入 `style.css`。
- 如果使用了 `AdvancedTileLayer`、`getTileUrl`、`getBgUrl`、`setBaseUrl` 或 `setUrlFunction`，
  需调整相关调用：通过 `map.loadMapId()` 切换地图，或用 `loader.getMapUrl(id)`
  获取完整地图图片 URL。

## 源码开发

在 [cafe-kit](https://github.com/thewakingsands/cafe-kit) 仓库根目录执行，需 Node.js 24+ 和 pnpm 10：

```sh
pnpm install
pnpm --filter @thewakingsands/eorzea-interactive-map generate:data
pnpm --filter @thewakingsands/eorzea-interactive-map dev
```

开发页面为 `http://localhost:8005`。`generate:data` 会先构建仓库内的 `xivapi-v2` 包，
再将数据写入 `pkgs/eorzea-map/generated/data/`；开发服务器将其提供在 `/data/`。
可追加参数，例如：

```sh
pnpm --filter @thewakingsands/eorzea-interactive-map generate:data --language en
```

构建和检查：

```sh
pnpm --filter @thewakingsands/eorzea-interactive-map... build
pnpm --filter @thewakingsands/eorzea-interactive-map typecheck
pnpm --filter @thewakingsands/eorzea-interactive-map test
```

构建产物位于 `pkgs/eorzea-map/dist/`，不包含生成数据。构建与测试无需重新生成数据。

## 许可证

[BSD-3-Clause](./LICENSE)。
