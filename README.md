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

## 项目结构

- `cn/index.html`：中文页面
- `en/index.html`：英文页面
- `data/sites.json`：导航数据
- `assets/css/seller.css`：页面样式
- `assets/js/seller.js`：分类、卡片、搜索和移动端交互
- `server.mjs`：零依赖本地静态服务器

## License

本项目采用 MIT License，详见 `LICENSE`。
