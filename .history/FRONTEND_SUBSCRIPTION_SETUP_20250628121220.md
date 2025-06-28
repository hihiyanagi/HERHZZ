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
VITE_ZPAY_RETURN_URL=https://your-domain.com/payment-success
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

### 1. 订阅页面

```typescript
// 在您的路由中添加
import SubscriptionPage from '@/components/SubscriptionPage'

// 路由配置
{
  path: '/subscription',
  element: <SubscriptionPage />
}
```

### 2. 音频播放器

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