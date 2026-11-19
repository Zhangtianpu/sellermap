# SellerMap 跨境导航

SellerMap 是一个面向跨境电商从业者的静态导航站，聚合平台开店、独立站、选品调研、AI 图片翻译、AI 商品图生成、AI 内容运营、广告营销、物流供应链、支付财税、运营 ERP、数据工具和合规学习资源。

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
  "addedAt": "2026-11-19",
  "sourceUrl": "https://github.com/example/project",
  "featured": true
}
```

新收录工具可以填写 `addedAt` 和发现来源 `sourceUrl`。最近 30 天加入的工具会在中英文首页显示“新收录 / New”标记；来源只用于内部核验，不会展示给访客。

修改数据后运行校验，检查必填中英文内容、链接格式和重复 URL：

```bash
npm run validate:data
```

## 每日工具与实测文章规则

自动发现任务应优先搜索 GitHub、Product Hunt、官方产品页和可信行业来源，并遵守以下发布门槛：

- 每天最多收录 1 个与外贸、B2B 或跨境电商直接相关的工具。
- 打开并核验官网或仓库，确认产品仍可访问、用途明确且不是纯广告落地页。
- 与现有 URL 和产品名称去重；同一产品不因跟踪参数或不同入口重复收录。
- 写入准确的中英文名称、简短说明、标签、`addedAt` 和 `sourceUrl`，放入最匹配的现有分类。
- 必须实际操作该工具并发布一篇中英文实测文章。文章至少包含测试过程、使用步骤、适用场景、限制和核验来源。
- 每篇文章至少包含 2 张在本次实际操作过程中直接截取的界面截图。禁止使用 AI 生成图片、官网宣传图、仓库 README 图片、图库图片或仅展示登录页的截图冒充实测。
- 截图不得包含账号密码、邮箱、电话、API Key、付款信息或其他个人敏感数据；需要登录、付费、验证码或无法完成真实操作的工具当天不发布。
- 截图保存到 `assets/images/articles/<slug>/`，文章源数据写入 `data/articles.json`，工具条目用 `articleSlug` 关联文章。
- 修改完成后运行 `npm run articles` 生成中英文静态文章页面。
- 不自动设置 `featured` 或联盟字段，不发布无法核实的价格、用户数和效果承诺。
- 提交前必须运行 `npm run validate:data`，校验失败时不发布。

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
- `data/site-config.json`：站点域名、AdSense 和 Analytics 配置
- `data/affiliate-programs.csv`：已加入的联盟计划台账
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
