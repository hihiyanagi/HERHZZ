# 💳 HERHZZZ 支付系统设置指南

## 📋 概览

我们为您的 HERHZZZ 项目实现了完整的支付订单系统，集成了 ZPay 支付接口。系统包含：

- ✅ **订单管理**：创建、查询、状态更新
- ✅ **支付集成**：ZPay 支付接口对接
- ✅ **安全验证**：MD5 签名验证、JWT 认证
- ✅ **数据库支持**：Supabase PostgreSQL 存储

---

## 🗄️ 1. 数据库设置

### 创建 Orders 表

在 Supabase SQL 编辑器中运行 `create-orders-table.sql`：

```sql
-- 该文件已包含完整的 orders 表结构
-- 包括 RLS 策略、索引、触发器等
```

**表结构说明：**
- `id`：主键 UUID
- `out_trade_no`：商户订单号（唯一）
- `user_id`：用户ID（关联 Supabase Auth）
- `name`：商品名称
- `amount`：金额（NUMERIC(10,2)）
- `payment_type`：支付方式（alipay/wechat/union）
- `status`：订单状态（pending/paid/failed/cancelled/refunded）
- `pay_url`：支付链接
- `qr_code`：二维码链接

---

## ⚙️ 2. 环境变量配置

### 后端环境变量

在 `backend/` 目录创建 `.env` 文件：

```bash
# Supabase 配置
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# ZPay 支付配置
ZPAY_MERCHANT_ID=your-zpay-merchant-id
ZPAY_MERCHANT_KEY=your-zpay-merchant-key
ZPAY_NOTIFY_URL=https://your-domain.com/api/payment/notify
```

### 获取配置信息

**Supabase 配置：**
1. 前往 [Supabase Dashboard](https://app.supabase.com)
2. 选择项目 → Settings → API
3. 复制 Project URL 和 service_role key
4. 复制 JWT Secret（在 Settings → API → JWT Settings）

**ZPay 配置：**
1. 联系 ZPay 获取商户ID和密钥
2. 设置支付通知回调地址

---

## 🚀 3. 启动服务

### 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 启动 FastAPI 服务

```bash
# 开发模式
python main.py

# 或使用 uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**服务地址：** `http://localhost:8000`
**API 文档：** `http://localhost:8000/docs`

---

## 🔗 4. API 接口说明

### 4.1 创建订单

**接口：** `POST /api/create_order`
**认证：** 需要 JWT Token

**请求体：**
```json
{
  "name": "HERHZZZ 高级会员",
  "amount": 29.99,
  "payment_type": "alipay",
  "user_id": "user-uuid-here"
}
```

**响应：**
```json
{
  "out_trade_no": "20250101-143022-ABC12345",
  "payurl": "https://zpayz.cn/pay/xxx",
  "qrcode": "https://zpayz.cn/qrcode/xxx",
  "status": "pending"
}
```

### 4.2 获取订单列表

**接口：** `GET /api/orders?page=1&limit=20`
**认证：** 需要 JWT Token

**响应：**
```json
{
  "orders": [
    {
      "id": "order-uuid",
      "out_trade_no": "20250101-143022-ABC12345",
      "name": "HERHZZZ 高级会员",
      "amount": 29.99,
      "status": "paid",
      "created_at": "2025-01-01T14:30:22Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 1
}
```

### 4.3 支付通知回调

**接口：** `POST /api/payment/notify`
**说明：** 由 ZPay 调用，无需前端处理

---

## 💻 5. 前端集成示例

### React/TypeScript 示例

```typescript
// 创建订单
const createOrder = async (orderData: {
  name: string;
  amount: number;
  payment_type: 'alipay' | 'wechat' | 'union';
}) => {
  const { user, getAccessToken } = useAuth();
  
  if (!user) {
    throw new Error('用户未登录');
  }
  
  const token = await getAccessToken();
  
  const response = await fetch('http://localhost:8000/api/create_order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      ...orderData,
      user_id: user.id
    })
  });
  
  if (!response.ok) {
    throw new Error('创建订单失败');
  }
  
  const result = await response.json();
  
  // 跳转到支付页面
  if (result.payurl) {
    window.open(result.payurl, '_blank');
  }
  
  return result;
};

// 使用示例
const handlePayment = async () => {
  try {
    const order = await createOrder({
      name: 'HERHZZZ 高级会员',
      amount: 29.99,
      payment_type: 'alipay'
    });
    
    console.log('订单创建成功:', order.out_trade_no);
  } catch (error) {
    console.error('支付失败:', error);
  }
};
```

---

## 🔒 6. 安全特性

### 6.1 用户权限验证
- 使用 Supabase JWT Token 验证用户身份
- RLS 策略确保用户只能访问自己的订单
- 防止用户为他人创建订单

### 6.2 支付安全
- MD5 签名验证所有 ZPay 交互
- 订单金额验证（最多两位小数）
- 支付通知签名验证

### 6.3 数据安全
- 敏感配置通过环境变量管理
- 数据库连接使用 Service Role Key
- 所有 API 都有错误处理和日志记录

---

## 🧪 7. 测试指南

### 7.1 API 测试

使用 FastAPI 自动生成的文档进行测试：
```
http://localhost:8000/docs
```

### 7.2 支付测试

1. **创建测试订单**：使用小金额（如 0.01 元）
2. **验证支付流程**：确保支付链接正常生成
3. **测试回调**：验证支付完成后状态更新

### 7.3 错误处理测试

- 无效金额测试
- 未授权访问测试
- 支付超时测试

---

## 📈 8. 部署建议

### 8.1 生产环境配置

```bash
# 生产环境 .env
SUPABASE_URL=https://prod-project.supabase.co
ZPAY_NOTIFY_URL=https://api.herhzzz.com/api/payment/notify
DEBUG=false
```

### 8.2 服务器部署

```dockerfile
# Dockerfile 示例
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 8.3 监控和日志

- 使用日志记录所有支付操作
- 监控订单状态和支付成功率
- 设置支付异常告警

---

## 🛠️ 9. 故障排除

### 常见问题

**1. "缺少 Supabase 环境变量配置"**
```bash
# 检查 .env 文件是否存在且配置正确
cat backend/.env
```

**2. "ZPay 签名验证失败"**
```bash
# 检查商户密钥是否正确
# 确保参数按 ASCII 码排序
```

**3. "订单创建失败"**
```bash
# 检查数据库表是否正确创建
# 确保用户有权限访问 orders 表
```

### 调试模式

```bash
# 启用调试日志
DEBUG=true python main.py
```

---

## 🎉 完成！

现在您的 HERHZZZ 项目已经具备完整的支付功能：

- ✅ 用户可以创建支付订单
- ✅ 支持支付宝、微信、银联支付
- ✅ 自动处理支付结果通知
- ✅ 订单状态实时更新
- ✅ 完整的用户权限控制

如有问题，请检查：
1. 环境变量配置
2. 数据库表结构
3. ZPay 商户配置
4. 网络连接状态

**支付系统已准备就绪！** 🎊 