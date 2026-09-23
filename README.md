# SellerMap 跨境导航

SellerMap 是一个面向跨境电商从业者的静态导航站，聚合平台开店、独立站、选品调研、广告营销、物流供应链、支付财税、运营 ERP、数据工具和合规学习资源。

## 本地运行

项目无需安装第三方依赖，Node.js 18 及以上版本可直接启动：

```bash
npm start
```

默认地址为 [http://127.0.0.1:4173](http://127.0.0.1:4173)。

也可以使用 Python 启动：

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

## 内容维护

所有分类和网站统一维护在 `data/sites.json`。每个网站包含中英文名称、网址、描述和标签，中英文页面会自动读取同一份数据。

```json
{
  "name": { "zh": "工具名称", "en": "Tool name" },
  "url": "https://example.com",
  "description": { "zh": "中文说明", "en": "English description" },
  "tags": { "zh": ["标签"], "en": ["Tag"] },
  "featured": true
}
```

## 首页 Banner 推广

首页轮播内容同样位于 `data/sites.json` 的 `banners` 数组。每个 Banner 支持中英文标题、说明、按钮文案、主题配色和推广链接，默认每 5.2 秒自动轮播，并支持箭头、圆点和键盘左右方向键切换。

```json
{
  "id": "campaign-id",
  "theme": "ocean",
  "icon": "H10",
  "label": { "zh": "推广 · 工具", "en": "Sponsored · Tool" },
  "title": { "zh": "中文标题", "en": "English title" },
  "description": { "zh": "中文说明", "en": "English description" },
  "cta": { "zh": "查看产品", "en": "Explore product" },
  "url": "https://example.com/product"
}
```

可用主题包括 `ocean`、`violet` 和 `forest`。正式上线前请将示例产品和链接替换为自己的推广内容。

## SEO 与域名

首页已经包含 title、description、robots、canonical、hreflang、Open Graph、Twitter Card 和结构化数据。由于正式域名尚未确定，当前没有提交包含占位域名的 `sitemap.xml`。

配置正式域名后运行：

```bash
SITE_URL=https://your-domain.com npm run seo
```

该命令会生成 `sitemap.xml`，并把 sitemap 地址写入 `robots.txt`。

## Google AdSense

AdSense 配置位于 `data/site-config.json`，当前已启用发布商 ID `ca-pub-2532162099328025`。网站根目录的 `ads.txt` 已按 Google 提供的授权记录配置。

如需临时关闭广告脚本，将 `adsense.enabled` 改为 `false` 即可。更换 AdSense 账号时，需要同步更新 `adsense.clientId` 和 `ads.txt`，并确保隐私政策准确反映实际使用的广告服务。

## Google Analytics

Google Analytics 4 配置位于 `data/site-config.json`，当前衡量 ID 为 `G-1KC28CWQ4F`。`assets/js/analytics.js` 会在启用后向所有中英文内容页面加载 Google 标签，并发送页面浏览数据。

如需临时关闭，将 `analytics.enabled` 改为 `false`。

## 联系方式

公开服务邮箱：`sellermap.service@gmail.com`。

- 中文联系页：`cn/contact.html`
- 英文联系页：`en/contact.html`
- 中文隐私政策：`cn/privacy.html`
- 英文隐私政策：`en/privacy.html`

## 项目结构

- `cn/index.html`、`en/index.html`：中英文首页
- `cn/contact.html`、`en/contact.html`：联系页面
- `cn/privacy.html`、`en/privacy.html`：隐私政策
- `data/sites.json`：分类、网站和 Banner 数据
- `data/site-config.json`：站点域名和 AdSense 配置
- `ads.txt`：Google AdSense 发布商授权记录
- `assets/css/seller.css`：页面样式
- `assets/js/seller.js`：分类、卡片、搜索和移动端交互
- `assets/js/theme.js`：黑白主题
- `assets/js/adsense.js`：按配置加载 AdSense
- `assets/js/analytics.js`：按配置加载 Google Analytics 4
- `scripts/generate-sitemap.mjs`：站点地图生成工具
- `server.mjs`：零依赖本地静态服务器

## License

本项目采用 MIT License，详见 `LICENSE`。
