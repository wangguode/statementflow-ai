# StatementFlow AI — 海外自动化变现与冷启动作战手册 (Launch Playbook)

这份手册将帮您在 **不注册海外公司、不与客户一对一销售沟通** 的前提下，把已经完成的 **StatementFlow AI** 部署上线、接入全球美元收款，并通过 **Programmatic SEO + 英文技术社区冷启动** 获取首批海外付费订阅用户。

---

## 第一步：15 分钟开通全球美元收款（无需海外公司，个人直收）

海外独立开发者首选 **Lemon Squeezy**（现已被 Stripe 收购，作为 **Merchant of Record (MoR)** 全球官方代理商，自动替您向欧盟、英国、美国各州计算并代缴增值税/消费税，支持国内个人身份认证与银行卡/PayPal/Wise 提现）：

1. 注册并登录 [Lemon Squeezy](https://www.lemonsqueezy.com/)，创建一个 Store（例如 `StatementFlow Studio`）。
2. 在 **Products** 中创建两个按月订阅（Subscription）商品：
   - **StatementFlow Pro**：定价 **`$19.00 / month`**，复制其 **Variant ID**（填入 `LEMONSQUEEZY_PRO_VARIANT_ID`）。
   - **StatementFlow Accounting Firm**：定价 **`$49.00 / month`**，复制其 **Variant ID**（填入 `LEMONSQUEEZY_BUSINESS_VARIANT_ID`）。
3. 在 **Settings → API** 生成一把 API Key（填入 `LEMONSQUEEZY_API_KEY`），在 **Settings → Webhooks** 添加您的生产域名回调地址：
   - Webhook URL: `https://您的域名/api/webhook`
   - Events: 勾选 `order_created`、`subscription_created`
   - Signing Secret: 自定义一串随机密钥（填入 `LEMONSQUEEZY_WEBHOOK_SECRET`）。

> **备选方案（Stripe）**：如果您已有香港/美国公司或海外 Stripe 账户，直接填入 `STRIPE_SECRET_KEY`、`STRIPE_PRO_PRICE_ID`、`STRIPE_BUSINESS_PRICE_ID` 即可无缝切换至 Stripe Checkout。

---

## 第二步：一键部署上线与环境变量配置（Vercel）

1. 将当前仓库推送到您的 GitHub 私有仓库，并在 [Vercel](https://vercel.com/) 导入该项目。
2. 在 Vercel **Project Settings → Environment Variables** 中填入（可参考项目根目录的 [`.env.example`](file:///Users/wangguo/Projects/statementflow-ai/.env.example)）：
   ```ini
   NEXT_PUBLIC_APP_URL="https://您的域名"
   # 可选：配置 DeepSeek V3 或 GPT-4o-mini 作为默认服务端提取大模型（成本极低，1000 次解析仅约 $0.15）
   OPENAI_API_KEY="sk-..."
   OPENAI_BASE_URL="https://api.deepseek.com/v1"
   OPENAI_MODEL="deepseek-chat"
   # Lemon Squeezy 全球收款配置
   LEMONSQUEEZY_API_KEY="..."
   LEMONSQUEEZY_STORE_ID="..."
   LEMONSQUEEZY_PRO_VARIANT_ID="..."
   LEMONSQUEEZY_BUSINESS_VARIANT_ID="..."
   LEMONSQUEEZY_WEBHOOK_SECRET="..."
   ```
3. 点击 **Deploy**，约 45 秒即可完成全球边缘节点部署。

---

## 第三步：激活 Programmatic SEO 自动获客矩阵（被动自然流量）

我们已经为您在代码中预置并静态生成了 **12 个海外最高转化率的银行与发票专属落地页**（加上首页共 13 个静态 URL）：

- `/convert/chase-bank-statement-to-excel`（Chase 银行 PDF 转 Excel）
- `/convert/wells-fargo-statement-to-csv`（Wells Fargo 转 CSV）
- `/convert/bank-of-america-to-quickbooks`（Bank of America 转 QuickBooks）
- `/convert/citibank-statement-to-excel`（Citibank 转 Excel）
- `/convert/mercury-bank-statement-to-csv`（Mercury 初创企业银行转 CSV）
- `/convert/stripe-invoice-to-excel`（Stripe 税务发票转 Excel）
- `/convert/paypal-statement-to-csv`（PayPal 月结单转 CSV）
- `/convert/wise-statement-to-xero`（Wise 多币种账单转 Xero）
- `/convert/barclays-uk-statement-to-csv`（英国巴克莱银行转 CSV）
- `/convert/revolut-business-to-excel`（Revolut 商业账单转 Excel）
- `/convert/hsbc-commercial-statement-to-excel`（汇丰商业银行转 Excel）
- `/convert/amazon-uk-vat-invoice-to-excel`（亚马逊英国 VAT 税票转 Excel）

**上线当天必做操作（仅需 5 分钟）**：
1. 打开 [Google Search Console](https://search.google.com/search-console) 并验证您的域名。
2. 在左侧 **Sitemaps（站点地图）** 提交 `https://您的域名/sitemap.xml`。
3. 使用顶部 **URL Inspection（网址检查）** 对排名前 4 的页面（Chase、Wells Fargo、Bank of America、Stripe Invoice）点击 **Request Indexing（请求编入索引）**。这些页面均已内置 `SoftwareApplication` 与 `FAQPage` 结构化数据，收录后会在 Google 搜索结果展示富摘要折叠问答。

---

## 第四步：零沟通海外冷启动首发帖文案库（直接复制发布）

### 1. Hacker News (`Show HN`) 首发帖
- **Title**:
  `Show HN: StatementFlow – Bank statement PDF to Excel studio with deterministic balance math`
- **URL**: `https://您的域名`
- **First Comment (Text)**:
  > Hi HN,
  >
  > Bookkeepers and founders often have to convert multi-page bank statement PDFs (Chase, BofA, Barclays, Mercury) or Stripe/Amazon VAT invoices into Excel or QuickBooks CSVs.
  >
  > Pure OCR tools break when banks change column layouts, while raw LLM wrappers occasionally hallucinate numbers or silently drop rows.
  >
  > I built **StatementFlow** to combine schema-constrained LLM line-item parsing with a deterministic TypeScript reconciliation engine:
  > `Opening Balance + Total Credits - Total Debits = Calculated Closing`
  >
  > You can test it right in the browser without signing up or entering an API key (Keyless Demo Mode includes verified Chase USD, Stripe Tax Invoice, and Amazon UK GBP VAT presets, plus a local regex fallback parser and inline cell editing that recalculates the balance equation on every keystroke). You can also plug in your own OpenAI, DeepSeek, Qwen, or local Ollama endpoint.
  >
  > Would love your feedback on the live workbench and the multi-sheet SpreadsheetML (.xls) export!

---

### 2. Reddit `r/bookkeeping` & `r/smallbusiness` 实用帖
- **Title**:
  `I built a tool that converts PDF bank statements & VAT invoices to Excel/CSV and mathematically verifies the closing balance (no signup needed to test)`
- **Body**:
  > Every month I used to waste hours fixing broken columns from PDF-to-CSV converters where multi-line wire descriptions or page-break headers threw off the ending balance.
  >
  > I put together **StatementFlow** (`https://您的域名`), a web studio specifically for converting bank statements (Chase, Wells Fargo, BofA, Barclays, Wise, Revolut) and B2B tax invoices into multi-tab Excel (`.xls`) and QuickBooks/Xero CSVs.
  >
  > What makes it different:
  > 1. **Deterministic Balance Check**: It doesn't trust AI to do math. It explicitly computes `Opening + Credits - Debits = Closing` to the cent and flags any discrepancy immediately.
  > 2. **Inline Ledger Editor**: If an OCR scan has a typo, you can edit the amount or flip Debit/Credit directly in the browser table and watch the reconciliation banner turn green before exporting.
  > 3. **2-Sheet Excel Export**: Exports a native workbook with a `Transactions` tab and a `Reconciliation Summary` tab.
  >
  > There's a free studio right on the homepage with 3 free runs and preset samples so you can test the workflow without creating an account. Let me know if there's a specific bank PDF format you struggle with and I'll add a preset for it!

---

### 3. Product Hunt 首发文案
- **Tagline (60 chars max)**:
  `Bank statements & invoices to cent-verified Excel in 2s`
- **Description**:
  `Stop trusting AI with arithmetic. StatementFlow uses schema-validated language models to parse messy multi-page bank statements and tax invoices, then runs deterministic cent-level reconciliation math (Opening + Credits - Debits = Closing) before exporting to multi-sheet Excel, QuickBooks CSV, or JSON.`
- **Maker Comment**:
  `Hey Product Hunt! 👋 We built StatementFlow for founders, e-commerce operators, and bookkeepers tired of fixing broken PDF conversions. Try the Live Studio right on the homepage—switch between USD/GBP presets, edit any transaction row inline to watch the balance equation recalculate in real time, or connect your own OpenAI/DeepSeek/Ollama endpoint.`
