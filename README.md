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

## 每日跨境内容规则

自动内容任务每天最多发布 1 篇中英文文章。选题不局限于工具，应在以下方向中选择当天最值得研究、且与近期文章不重复的主题：

- 工具实测：真实完成查询、分析、计算或转换任务，并说明适用场景和限制。
- 多来源研究：综合多篇可信文章、研究报告或官方资料，形成新的结构、判断和行动建议，不拼接、不洗稿。
- 供应链：供应商开发、询价、验厂、质量、交期、物流、库存、付款、合规和风险管理。
- 外贸 SOHO：获客、开发信、LinkedIn、报价、谈判、跟进、CRM、样品、合同、收款和复购。
- 书籍启发：介绍与外贸、B2B、经营、销售、供应链相关的书，并把核心思想转化为业务实践；不得大段摘录受版权保护的内容。
- 电动自行车 B2B：研究电动车贸易商普遍关心的市场、产品、零部件、电池安全、认证、渠道、经销商、售后和内容营销。
- 还可覆盖行业趋势、法规合规、市场进入、客户案例拆解、SEO/内容营销、展会策略、数据指标和实用模板。

所有文章必须遵守以下发布门槛：

- 先查看 `data/articles.json`，避免连续发布同类主题。选题阶段可以把 e-wildx 电动自行车 B2B 业务作为内部判断价值的背景，优先研究能增加知识、发现机会或改善方法的主题。
- 发布内容必须面向公众，以外贸从业者、电动自行车贸易商、出口商、制造商、供应链团队或经销商等行业受众为叙述对象。除非用户明确要求，标题、摘要、正文和小标题不得出现 e-wildx、站长本人、个人网站或“对你的启发”等私人顾问式表达。
- 把内部业务相关性转化为行业通用价值，例如使用“给电动车贸易商的行动清单”“出口商可以如何准备”或“B2B 团队需要检查什么”，不能暴露或假设用户的私人经营信息。
- 研究至少 2 个可靠来源，优先使用官方机构、法规原文、标准组织、研究报告、公司一手资料和有明确作者的行业文章。区分事实、来源观点和作者推断，保留链接及核验日期。
- 文章必须有原创的分析结构，并为目标行业受众给出可执行的步骤、检查清单、指标或改进方法；不得虚构案例、数据、经历、价格或效果。
- 每篇至少使用 2 张真实图片。允许本次实际操作产生的网页截图，以及许可再利用或公共领域的来源图片；禁止 AI 生成图片、图库占位图、伪造界面和无授权搬运。
- 图片保存到 `assets/images/articles/<slug>/`，不得热链。新文章使用 `section.image` 记录 `kind`（`screenshot`、`licensed` 或 `public-domain`）、原始 `sourceUrl`、中英文说明和必要的署名。截图应标明页面来源，来源图片必须确认许可。
- 图片不得包含账号密码、邮箱、电话、API Key、付款信息或其他个人敏感数据。不得绕过登录、付费墙、验证码或网站安全限制。
- 工具文章使用 `contentType: "tool"`、`toolName`、`toolUrl` 和 `testedAt`；其他文章使用对应 `contentType`、中英文 `category`、`verifiedAt`，并可用 `primaryUrl` 指向主要来源。
- 只有工具主题才修改 `data/sites.json` 并用 `articleSlug` 关联；非工具文章只更新 `data/articles.json` 和生成页面。
- 修改完成后运行 `npm run articles`、`npm run validate:data`、相关 `node --check` 和 `git diff --check`。任一研究、图片、版权、内容或校验条件不满足时，当天不发布。

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
