# Vercel 前后端分离部署指南

## 🏗️ 架构说明

你的项目需要**两个独立的 Vercel 项目**：

1. **前端项目** (React/Vite) → 静态网站部署
2. **后端项目** (Python FastAPI) → Serverless 函数部署

## 🚀 部署步骤

### 1. 后端部署准备

确保你已经完成以下文件的创建：
- ✅ `backend/vercel.json` - 后端 Vercel 配置文件
- ✅ `backend/requirements.txt` - Python 依赖文件
- ✅ `backend/api/index.py` - Vercel 入口文件
- ✅ `src/config/api.ts` - 前端 API 配置文件

**重要**：`vercel.json` 必须放在 `backend/` 目录内，不是项目根目录！

### 2. 在 Vercel 中设置环境变量

登录 Vercel Dashboard，进入你的项目设置，在 **Environment Variables** 中添加以下变量：

#### 必需的环境变量：

```bash
# Supabase 配置
SUPABASE_URL=你的_supabase_项目_url
SUPABASE_ANON_KEY=你的_supabase_anon_key
SUPABASE_JWT_SECRET=你的_supabase_jwt_secret

# ZPay 支付配置
ZPAY_MERCHANT_ID=你的_zpay_商户id
ZPAY_KEY=你的_zpay_密钥
ZPAY_NOTIFY_URL=https://你的vercel域名.vercel.app/notify_url
ZPAY_RETURN_URL=https://你的前端域名/payment-result

# 应用配置
JWT_SECRET_KEY=你的_jwt_密钥
FRONTEND_URL=https://你的前端域名
```

#### 环境变量说明：

1. **SUPABASE_URL**: 你的 Supabase 项目 URL
   - 格式：`https://your-project-id.supabase.co`

2. **SUPABASE_ANON_KEY**: Supabase 匿名密钥
   - 在 Supabase Dashboard → Settings → API 中找到

3. **SUPABASE_JWT_SECRET**: Supabase JWT 密钥
   - 在 Supabase Dashboard → Settings → API 中找到

4. **ZPAY_MERCHANT_ID**: ZPay 商户 ID
   - 从 ZPay 后台获取

5. **ZPAY_KEY**: ZPay 密钥
   - 从 ZPay 后台获取

6. **ZPAY_NOTIFY_URL**: 支付回调地址
   - 必须是你的 Vercel 后端域名 + `/notify_url`
   - 例如：`https://your-backend.vercel.app/notify_url`

7. **ZPAY_RETURN_URL**: 支付完成后跳转地址
   - 通常是你的前端域名 + 支付结果页面路径

### 3. 后端部署

#### 方式 1：通过 Vercel CLI
```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录 Vercel
vercel login

# 部署后端
vercel --prod
```

#### 方式 2：通过 GitHub 集成
1. 在 GitHub 上创建一个**单独的仓库**用于后端
2. 将以下文件推送到后端仓库：
   - `backend/` 目录下的所有文件
   - `vercel.json`
   - `requirements.txt`
3. 在 Vercel Dashboard 中连接后端 GitHub 仓库
4. Vercel 会自动部署后端

### 4. 前端部署

#### 前端环境变量设置
在前端项目的 Vercel 设置中添加：

```bash
# 后端 API 地址（替换为你的后端 Vercel 域名）
VITE_API_BASE_URL=https://your-backend-project.vercel.app

# Supabase 配置
VITE_SUPABASE_URL=你的_supabase_项目_url
VITE_SUPABASE_ANON_KEY=你的_supabase_anon_key
```

#### 部署前端
1. 确保前端代码已推送到 GitHub
2. 在 Vercel 中创建新项目连接前端仓库
3. 设置环境变量
4. 部署

### 4. 验证部署

部署完成后，访问以下 URL 验证：

- **健康检查**: `https://your-backend.vercel.app/`
- **API 文档**: `https://your-backend.vercel.app/docs`
- **支付回调**: `https://your-backend.vercel.app/notify_url`

## 🔧 常见问题解决

### 问题 1: 模块导入错误
如果遇到模块导入错误，检查：
- `backend/api/index.py` 中的路径设置是否正确
- `vercel.json` 中的 `PYTHONPATH` 设置

### 问题 2: 环境变量未生效
- 确保在 Vercel Dashboard 中正确设置了所有环境变量
- 重新部署项目使环境变量生效

### 问题 3: 支付回调失败
- 检查 `ZPAY_NOTIFY_URL` 是否正确设置
- 确保 ZPay 后台配置的回调地址与 Vercel 地址一致

### 问题 4: CORS 错误
- 检查 `main.py` 中的 CORS 配置
- 确保前端域名在允许的源列表中

## 📝 注意事项

1. **冷启动**: Vercel 的 Serverless 函数可能有冷启动延迟
2. **超时限制**: 免费版本有 10 秒执行时间限制，Pro 版本有 60 秒
3. **内存限制**: 注意函数的内存使用
4. **数据库连接**: 每次请求都会创建新的数据库连接

## 🔄 更新部署

当你更新代码后：
1. 推送到 GitHub（如果使用 GitHub 集成）
2. 或者运行 `vercel --prod`（如果使用 CLI）

Vercel 会自动重新部署你的应用。 