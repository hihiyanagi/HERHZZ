# 🚀 前端订阅系统设置指南

由于您的项目是**纯前端架构（React + Vite + Supabase）**，我们为您提供了一个无需FastAPI后端的完整订阅系统解决方案。

## 📋 架构概览

```
React Frontend (Vite)
    ↓ 直接调用
Supabase Database + Auth
    ↓ 支付回调
Supabase Edge Functions
    ↓ 处理支付通知
ZPay 支付网关
```

## 🎯 前端支付系统配置指南

## 📱 配置前端直接支付功能

现在您可以在**不启动后端**的情况下使用支付功能！系统已优化为多层回退机制：

### 🎯 配置优先级

1. **前端直接支付** ✨ (推荐) - 配置前端环境变量即可
2. **后端API支付** - 需要启动后端服务
3. **模拟支付** - 用于开发测试

## ⚙️ 步骤1：配置前端环境变量

在项目根目录创建 `.env` 文件：

```bash
# ZPay 前端配置（从您的ZPay商户后台获取）
VITE_ZPAY_PID=您的商户ID
VITE_ZPAY_MERCHANT_KEY=您的商户密钥
VITE_ZPAY_NOTIFY_URL=https://您的域名.com/notify_url
VITE_ZPAY_RETURN_URL=https://您的前端域名.com/payment-result

# 本地开发示例
# VITE_ZPAY_NOTIFY_URL=http://localhost:8000/notify_url
# VITE_ZPAY_RETURN_URL=http://localhost:5173/payment-result
```

## 🚀 步骤2：启动前端项目

```bash
npm run dev
# 或
pnpm dev
# 或
yarn dev
```

## ✅ 支付流程

### 🎯 完整配置模式 (推荐)
如果配置了所有前端环境变量：
- 用户选择套餐 → 确认订单 → **跳转到ZPay支付页面** → 完成支付 → 跳转回前端

### 🔄 部分配置模式
如果只配置了部分环境变量：
- 系统会尝试使用后端API (需要后端运行)
- 或降级到模拟支付模式

### 🎭 开发测试模式
如果没有配置环境变量：
- 使用模拟支付页面进行功能演示

## 📋 环境变量说明

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `VITE_ZPAY_PID` | ZPay商户ID | ✅ |
| `VITE_ZPAY_MERCHANT_KEY` | ZPay商户密钥 | ✅ |
| `VITE_ZPAY_NOTIFY_URL` | 支付通知回调地址 | ✅ |
| `VITE_ZPAY_RETURN_URL` | 支付完成跳转地址 | 可选 |

## 🔧 回调地址配置说明

### notify_url (异步通知)
- **作用**: ZPay支付完成后，异步通知您的服务器更新订单状态
- **要求**: 必须是公网可访问的地址
- **示例**: `https://your-api.com/notify_url`

### return_url (同步跳转)
- **作用**: 用户支付完成后，浏览器跳转的前端页面
- **要求**: 前端页面地址
- **示例**: `https://your-site.com/payment-result`

## 🎉 开始使用

1. **配置环境变量** → 在 `.env` 文件中添加您的ZPay配置
2. **启动前端项目** → `npm run dev`
3. **访问订阅页面** → `/subscription`
4. **选择套餐付费** → 系统会自动跳转到ZPay支付页面

## 🆘 故障排除

### Q: 点击购买后没有跳转？
A: 检查浏览器控制台错误，确认环境变量配置正确。

### Q: 支付完成后用户状态没有更新？
A: 确认 `notify_url` 配置正确且可以公网访问，用于接收ZPay的支付通知。

### Q: 我没有ZPay账户怎么办？
A: 可以使用模拟支付模式进行功能演示，不需要任何配置。

## 🎯 优势

- ✅ **无需后端** - 前端直接调用ZPay API
- ✅ **部署简单** - 只需配置环境变量
- ✅ **多重回退** - 自动降级到其他支付方式
- ✅ **开发友好** - 支持模拟支付测试
- ✅ **生产就绪** - 完整的错误处理和日志

现在您可以在 **Vercel 或任何静态托管平台** 上部署前端项目，无需后端即可使用完整的支付功能！ 🎊

## 🔧 环境变量配置

### 1. 前端环境变量 (`.env`)

```bash
# Supabase 配置
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# ZPay 支付配置
VITE_ZPAY_PID=your-zpay-merchant-id
VITE_ZPAY_MERCHANT_KEY=your-zpay-merchant-key
VITE_ZPAY_NOTIFY_URL=https://your-project-ref.supabase.co/functions/v1/payment-callback
VITE_ZPAY_RETURN_URL=https://your-domain.com/payment-result
```

### 2. Supabase Edge Function 环境变量

在 Supabase Dashboard → Project Settings → Edge Functions 中添加：

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ZPAY_MERCHANT_KEY=your-zpay-merchant-key
```

## 🗄️ 数据库设置

### 1. 执行数据库脚本

在 Supabase SQL Editor 中执行 `create-subscription-tables.sql`:

```sql
-- 这将创建：
-- ✅ orders 表（订单管理）
-- ✅ user_memberships 表（会员状态）
-- ✅ audio_access_control 表（音频权限控制）
-- ✅ 相关的RLS策略和函数
```

### 2. 验证表结构

确保以下表已创建：
- `orders` - 订单表
- `user_memberships` - 用户会员表
- `audio_access_control` - 音频访问控制表

## ⚡ Supabase Edge Functions 部署

### 1. 安装 Supabase CLI

```bash
npm install -g supabase
```

### 2. 登录并初始化

```bash
supabase login
supabase init
```

### 3. 部署 Edge Function

```bash
# 部署支付回调函数
supabase functions deploy payment-callback

# 设置环境变量
supabase secrets set SUPABASE_URL=your-url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-key
supabase secrets set ZPAY_MERCHANT_KEY=your-zpay-key
```

## 🎯 前端集成

### 1. 安装依赖

```bash
npm install crypto-js @types/crypto-js lucide-react
npm install @radix-ui/react-slider @radix-ui/react-alert-dialog
```

### 2. 路由配置

```typescript
// 在您的路由中添加
import SubscriptionPage from '@/components/SubscriptionPage'
import PaymentResultPage from '@/components/PaymentResultPage'

// 路由配置
const routes = [
  {
    path: '/subscription',
    element: <SubscriptionPage />
  },
  {
    path: '/payment-result',
    element: <PaymentResultPage />
  },
  {
    path: '/audio',
    element: <AudioPlayerWithAccess />
  }
]
```

### 3. 音频播放器

```typescript
// 替换现有的音频播放器
import AudioPlayerWithAccess from '@/components/AudioPlayerWithAccess'

// 使用方式
<AudioPlayerWithAccess currentCyclePhase="menstrual" />
```

### 3. 会员状态检查

```typescript
import { checkUserMembershipValid } from '@/lib/subscription'

// 在组件中使用
const [isVip, setIsVip] = useState(false)

useEffect(() => {
  checkUserMembershipValid().then(setIsVip)
}, [user])
```

## 💳 支付流程

### 1. 用户选择订阅套餐
```typescript
// 自动处理：创建订单 → 生成支付URL → 跳转支付页面
const handleSubscribe = async (planType) => {
  const paymentUrl = await createSubscriptionOrder(planType)
  window.location.href = paymentUrl // 跳转到ZPay支付页面
}
```

### 2. 支付成功后
```typescript
// ZPay 自动回调 Edge Function → 更新订单状态 → 激活会员权限
// 用户返回应用后，会员状态自动生效
```

## 🔒 音频访问控制

### 免费用户
- 只能听每个周期阶段的第1首音频
- 月经期：摇篮潮汐 (yaolan_chaoxi.mp3)
- 卵泡期：月光泡雨 (yueguang_paoyu.mp3)
- 排卵期：融融月声 (rongrong_yuesheng.mp3)
- 黄体期：夜空寺庙 (yekong_simiao.mp3)

### VIP会员
- 解锁全部12首音频
- 包含所有免费音频 + 8首专属音频
- 无限制播放

## 🛠️ 安装依赖

如果您的项目缺少某些依赖，请安装：

```bash
npm install lucide-react
# 或
npm install @radix-ui/react-slider @radix-ui/react-alert-dialog
```

## 🚀 部署选项

### 方案一：Vercel/Netlify（推荐）
```bash
# 前端部署到 Vercel/Netlify
# Edge Functions 已部署到 Supabase
# 完全 serverless
```

### 方案二：使用 Vercel API Routes
如果您更喜欢使用 Vercel，可以将 Edge Function 替换为 Vercel API Route：

```typescript
// pages/api/payment-callback.ts
export default async function handler(req, res) {
  // 相同的支付回调逻辑
  // 使用 Supabase 客户端更新数据
}
```

## 🧪 测试流程

### 1. 本地测试
```bash
npm run dev
# 访问 /subscription 页面
# 测试订阅流程（可以使用ZPay测试环境）
```

### 2. 会员状态测试
```typescript
// 手动在数据库中添加测试会员记录
INSERT INTO user_memberships (user_id, membership_type, is_lifetime_member, membership_expires_at)
VALUES ('your-user-id', 'yearly', false, '2024-12-31');
```

## 📱 UI 组件

### 订阅页面特性
- ✅ 3种订阅套餐展示
- ✅ 价格对比和推荐标签
- ✅ 当前会员状态显示
- ✅ 一键购买和支付跳转
- ✅ 响应式设计

### 音频播放器特性
- ✅ 会员权限实时检查
- ✅ 免费/付费音频标识
- ✅ 访问受限提示
- ✅ 升级会员引导
- ✅ 按周期阶段分组展示

## ❓ 常见问题

### Q: 支付回调失败怎么办？
A: 检查 Edge Function 日志，确保环境变量配置正确，ZPay 回调URL 可访问。

### Q: 会员状态没有更新？
A: 检查支付回调是否成功执行，数据库中的订单状态是否为 'paid'。

### Q: 音频无法播放？
A: 确保音频文件在 `public/audio/` 目录下，文件名与数据库中的 `audio_name` 匹配。

### Q: 如何添加新的音频？
A: 1) 添加音频文件到 `public/audio/`，2) 在 `audio_access_control` 表中添加记录。

## 🎉 完成！

现在您拥有一个完整的**无后端**订阅系统：
- ✅ 前端订阅页面和支付集成
- ✅ 音频访问权限控制
- ✅ 会员状态管理
- ✅ 支付回调处理
- ✅ 数据库自动化管理

一切都通过 **React + Supabase + Edge Functions** 实现，无需维护独立的后端服务器！ 