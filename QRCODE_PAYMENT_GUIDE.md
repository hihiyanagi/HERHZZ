# 📱 二维码支付功能使用说明

## 🌟 功能概览

本项目已集成完整的二维码支付功能，支持支付宝、微信、银联等多种支付方式。用户可以通过扫描二维码完成支付，系统会自动轮询订单状态并在支付成功后跳转到结果页面。

## 🎯 核心特性

✅ **多种支付方式**：支持支付宝、微信支付、银联支付  
✅ **自动订单创建**：调用后端接口自动生成订单和二维码  
✅ **实时状态轮询**：每5秒自动查询订单状态  
✅ **支付超时处理**：默认10分钟支付时限，可自定义  
✅ **用户体验优化**：加载动画、倒计时、一键复制订单号  
✅ **安全性保障**：JWT认证、用户权限验证  

## 🚀 快速开始

### 1. 访问支付页面

用户可以通过以下方式访问支付功能：

```bash
# 直接访问结账页面
http://localhost:5173/checkout

# 或在代码中导航到支付页面
navigate('/checkout')
```

### 2. 支付流程

1. **选择商品** - 在商品列表中选择要购买的套餐
2. **选择支付方式** - 支持支付宝、微信、银联三种方式
3. **扫码支付** - 使用对应的App扫描二维码
4. **等待确认** - 系统自动轮询支付状态
5. **支付成功** - 自动跳转到结果页面

## 🔧 技术实现

### 后端接口

#### 1. 创建订单接口
```http
POST /api/create_order
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "name": "商品名称",
  "amount": 29.99,
  "payment_type": "alipay",
  "user_id": "用户ID"
}
```

**响应示例：**
```json
{
  "out_trade_no": "20250101-143022-ABC12345",
  "payurl": "https://zpayz.cn/pay/xxx",
  "qrcode": "https://zpayz.cn/qrcode/xxx",
  "status": "pending"
}
```

#### 2. 查询订单状态接口
```http
GET /api/get_order_status/{out_trade_no}
Authorization: Bearer <JWT_TOKEN>
```

**响应示例：**
```json
{
  "out_trade_no": "20250101-143022-ABC12345",
  "status": "paid",
  "name": "商品名称",
  "amount": 29.99,
  "payment_type": "alipay",
  "created_at": "2025-01-01T14:30:22Z",
  "paid_at": "2025-01-01T14:32:15Z",
  "qr_code": "https://zpayz.cn/qrcode/xxx"
}
```

#### 3. 支付回调接口
```http
POST /api/payment/notify
```

此接口由ZPay自动调用，用于更新订单状态。

### 前端组件

#### QRCodePayment 组件

**基本用法：**
```tsx
import QRCodePayment from '@/components/QRCodePayment'

function PaymentPage() {
  const handlePaymentSuccess = (orderInfo) => {
    console.log('支付成功:', orderInfo)
    // 处理支付成功逻辑
  }

  const handlePaymentError = (error) => {
    console.error('支付失败:', error)
    // 处理支付失败逻辑
  }

  return (
    <QRCodePayment
      productName="高级会员"
      amount={29.99}
      paymentType="alipay"
      onPaymentSuccess={handlePaymentSuccess}
      onPaymentError={handlePaymentError}
      autoCreateOrder={true}
      pollInterval={5000}
      maxPollTime={600000}
    />
  )
}
```

**组件属性说明：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `productName` | string | - | 商品名称（必填） |
| `amount` | number | - | 支付金额（必填） |
| `paymentType` | 'alipay' \| 'wechat' \| 'union' | 'alipay' | 支付方式 |
| `onPaymentSuccess` | (orderInfo) => void | - | 支付成功回调 |
| `onPaymentError` | (error) => void | - | 支付失败回调 |
| `onCancel` | () => void | - | 取消支付回调 |
| `autoCreateOrder` | boolean | true | 是否自动创建订单 |
| `pollInterval` | number | 5000 | 轮询间隔（毫秒） |
| `maxPollTime` | number | 600000 | 最大轮询时间（毫秒） |

## 🎨 界面展示

### 商品选择页面
- 显示多个套餐选项
- 价格对比和优惠信息
- 功能特性列表

### 支付确认页面
- 订单摘要信息
- 支付方式选择
- 二维码展示区域

### 二维码支付界面
- 清晰的二维码显示
- 实时支付状态提示
- 倒计时显示
- 订单信息展示
- 操作按钮（刷新、取消）

### 支付成功弹窗
- 成功图标动画
- 订单详细信息
- 确认按钮

## ⚙️ 配置说明

### 环境变量

需要在组件中配置后端API地址：

```tsx
// 在 QRCodePayment.tsx 中
const API_BASE_URL = 'http://localhost:8000'  // 修改为你的后端地址
```

### 后端配置

确保后端已正确配置：

1. **ZPay配置**：
   ```bash
   ZPAY_MERCHANT_ID=your-zpay-merchant-id
   ZPAY_MERCHANT_KEY=your-zpay-merchant-key
   ZPAY_NOTIFY_URL=https://your-domain.com/api/payment/notify
   ```

2. **Supabase配置**：
   ```bash
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

## 🔍 测试流程

### 1. 启动后端服务
```bash
cd backend
python main.py
```

### 2. 启动前端服务
```bash
npm run dev
```

### 3. 访问支付页面
```bash
http://localhost:5173/checkout
```

### 4. 测试支付流程
1. 选择商品套餐
2. 选择支付方式
3. 查看生成的二维码
4. 观察轮询状态更新
5. 测试支付成功/失败场景

## 🛠️ 自定义开发

### 扩展支付方式

要添加新的支付方式，需要：

1. **更新类型定义**：
```tsx
type PaymentType = 'alipay' | 'wechat' | 'union' | 'newpay'
```

2. **添加UI选项**：
```tsx
const paymentMethods = [
  // ... 现有选项
  {
    value: 'newpay',
    label: '新支付',
    icon: <NewPayIcon />,
    description: '使用新支付方式'
  }
]
```

3. **后端支持**：确保后端API支持新的支付类型

### 自定义轮询逻辑

```tsx
// 自定义轮询间隔和超时时间
<QRCodePayment
  pollInterval={3000}        // 3秒轮询一次
  maxPollTime={1200000}      // 20分钟超时
  // ... 其他属性
/>
```

### 自定义样式

组件使用了Tailwind CSS，你可以通过以下方式自定义样式：

1. **修改组件内部样式**
2. **使用CSS变量覆盖**
3. **创建主题定制**

## 🚨 注意事项

1. **安全性**：
   - 所有API调用都需要JWT认证
   - 用户只能查看自己的订单
   - 支付回调需要签名验证

2. **性能优化**：
   - 组件卸载时自动清理定时器
   - 避免内存泄漏
   - 合理设置轮询间隔

3. **错误处理**：
   - 网络请求失败重试机制
   - 用户友好的错误提示
   - 支付超时处理

4. **用户体验**：
   - 清晰的状态提示
   - 倒计时显示
   - 一键复制功能

## 📞 技术支持

如果在使用过程中遇到问题，请检查：

1. **后端服务是否正常运行**
2. **ZPay配置是否正确**
3. **网络连接是否正常**
4. **JWT Token是否有效**
5. **用户是否已登录**

---

## 🎉 完成！

现在你已经拥有了一个完整的二维码支付系统！用户可以轻松地选择商品、扫码支付并获得实时的支付状态反馈。

**访问地址：** `http://localhost:5173/checkout`

祝你使用愉快！ 🚀 