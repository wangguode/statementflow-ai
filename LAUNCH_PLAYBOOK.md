# StatementFlow AI — 海外自动化变现与冷启动作战手册 (Launch Playbook)

这份手册将帮您在 **不注册海外公司、不与客户一对一销售沟通** 的前提下，把已经完成的 **StatementFlow AI** 部署上线、接入全球美元收款，并通过 **Programmatic SEO + 英文技术社区冷启动** 获取首批海外付费订阅用户。

---

## 第一步：15 分钟开通全球美元收款（只有中国内地银行卡即可收款！）

> **核心解答：我只有中国的银行卡，可以收海外用户的美金吗？**
> **完全可以！** 海外独立开发者普遍采用 **Lemon Squeezy（官方全球税务代理商 MoR）+ 国内银行卡直连 / Payoneer（派安盈）** 的组合。您的海外客户在网页上用 Visa / MasterCard / Apple Pay 付美元，平台自动替您处理欧美增值税，最终资金直接结汇成人民币打入您的**中国内地储蓄卡（招行、中行、工行、建行等一类卡均可）**，全程**不需要**注册海外公司，也**不需要**办理海外银行卡。

### A. 绑定中国内地银行卡提现的两种方式（任选其一）

1. **方式一：Lemon Squeezy 直接电汇至中国内地储蓄卡（最简路径）**
   - 在 [Lemon Squeezy](https://www.lemonsqueezy.com/) 后台进入 **Settings → Payouts**。
   - 国家选择 **China**，打款方式选择 **Bank Transfer (SWIFT)**。
   - 填入您的姓名拼音（如 `GUO WANG`）、中国内地储蓄卡号（推荐**招商银行**或**中国银行**借记卡）以及该行的 **SWIFT Code**（如招商银行总行为 `CMBCCNBS`，中国银行可查具体分行 SWIFT）。
   - 每月达到提现门槛后，美金将直接汇入您的国内银行卡，在手机银行 App 内点击“结汇”即可转为人民币。
2. **方式二：Lemon Squeezy + Payoneer 派安盈 → 国内储蓄卡/支付宝（手续费最低、入账最快，强烈推荐）**
   - 用中国大陆身份证 + 国内储蓄卡免费注册 [Payoneer（派安盈）](https://www.payoneer.com/zh/)（全中文界面，10 分钟审核通过）。
   - 在 Payoneer 后台点击「收款 → Global Payment Service」，即可免费获得一个专属的**美国银行美元收款账号（Routing Number + Account Number）**。
   - 将这个美国账号填入 Lemon Squeezy 的 **Payouts** 中（享受美国本土 ACH 0 手续费入账）；收到美金后，在 Payoneer 后台一键点击「提现至国内银行卡」，1 个工作日内直接以人民币入账您的中国内地银行卡！

### B. 在 Lemon Squeezy 创建订阅商品并获取密钥

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
