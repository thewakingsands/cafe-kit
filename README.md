# cafe-kit

FFCafe 前端工具工作区。

- `pkgs/kit-common`：通用展示组件。
- `pkgs/kit-tooltip`：物品与技能浮层。
- `pkgs/xivapi-v2`：XIVAPI v2 客户端。
- [`pkgs/eorzea-map`](./pkgs/eorzea-map/README.md)：艾欧泽亚交互地图及数据生成脚本。

```sh
pnpm install
pnpm build
```

## GitHub Pages 示例

[Pages 工作流](./.github/workflows/pages.yml) 在推送到 `master` 或手动触发时，构建三个包的
example，并通过 XIVAPI v2 生成地图数据，一起部署到 GitHub Pages。站点首页提供以下入口：

- `kit-common/example/`：通用组件。
- `kit-tooltip/example/`：物品与技能详情，另含 `auto.html` 自动悬浮窗示例。
- `eorzea-map/example/`：交互地图，数据随站点部署，无需访问者自行生成。

首次部署前，在仓库 **Settings → Pages → Build and deployment → Source** 选择
**GitHub Actions**，详见 [GitHub Pages 配置说明](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

在本地构建同样的站点：

```sh
pnpm build:pages
```

输出位于 `dist/pages/`，可用静态 HTTP 服务器预览。构建需要联网读取地图数据；页面运行时
仍从 XIVAPI 加载地图图片、图标和悬浮窗详情。站点使用相对路径，支持仓库子路径部署。
