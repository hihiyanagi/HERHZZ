# Supabase 用户认证集成指南

本指南将帮你在项目中集成完整的 Supabase 用户认证功能，包括前端和后端。

## 📋 功能特性

- ✅ **前端认证**: 邮箱+密码的注册、登录、登出
- ✅ **JWT Token管理**: 自动获取、保存和刷新用户Token
- ✅ **API请求认证**: 自动在请求头中添加Authorization Bearer Token
- ✅ **后端Token验证**: FastAPI验证Supabase JWT Token的有效性和真实性
- ✅ **用户信息提取**: 从Token中安全提取用户ID和其他信息
- ✅ **错误处理**: 完善的错误处理和用户反馈

## 🚀 快速开始

### 1. 环境变量配置

创建 `.env` 文件并添加以下配置：

```env
# 前端 Supabase 配置
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=你的supabase匿名密钥

# 后端 FastAPI 配置
SUPABASE_JWT_SECRET=你的supabase_jwt_secret

# 可选：API基础URL
VITE_API_BASE_URL=http://localhost:8000
```

### 2. 安装依赖

**前端依赖** （已在 package.json 中）：
```bash
npm install @supabase/supabase-js
```

**后端依赖**：
```bash
cd backend
pip install -r requirements.txt
```

### 3. 启动服务

**启动后端**：
```bash
cd backend
python run.py
```

**启动前端**：
```bash
npm run dev
```

## 🏗️ 架构说明

### 前端架构

1. **Supabase客户端** (`src/lib/supabase.ts`)
   - 配置Supabase连接
   - 自动处理Token刷新和持久化

2. **认证Hook** (`src/hooks/useAuth.ts`)
   - 管理用户认证状态
   - 提供登录、注册、登出方法
   - 监听认证状态变化

3. **API工具** (`src/lib/api.ts`)
   - 自动在请求头中添加JWT Token
   - 统一的错误处理
   - 支持各种HTTP方法

4. **认证表单** (`src/components/AuthForm.tsx`)
   - 用户友好的登录/注册界面
   - 实时错误提示和状态反馈

### 后端架构

1. **JWT验证** (`backend/main.py`)
   - 使用Supabase JWT Secret验证Token
   - 检查Token有效期和签名
   - 提取用户信息

2. **依赖注入**
   - `verify_jwt_token()`: Token验证函数
   - `get_current_user()`: 获取当前用户信息

3. **受保护路由**
   - 自动验证用户身份
   - 提供用户上下文信息

## 🔧 核心代码解析

### 前端 - 自动添加Token到请求头

```typescript
// src/lib/api.ts 核心逻辑
const { data: { session } } = await supabase.auth.getSession()
requestHeaders['Authorization'] = `Bearer ${session.access_token}`
```

### 后端 - JWT Token验证

```python
# backend/main.py 核心逻辑
payload = jwt.decode(
    token, 
    SUPABASE_JWT_SECRET, 
    algorithms=["HS256"]
)
user_id = payload.get('sub')  # 用户ID在'sub'字段中
```

## 📝 使用示例

### 前端调用受保护的API

```typescript
import { api } from '@/lib/api'

// 自动添加认证头
const userData = await api.get('/api/user/profile')
const newData = await api.post('/api/data', { name: 'test' })
```

### 后端创建受保护路由

```python
@app.get("/api/protected")
async def protected_route(current_user: dict = Depends(get_current_user)):
    return {
        "message": "受保护的数据",
        "user_id": current_user['user_id']
    }
```

## 🔐 安全最佳实践

1. **环境变量**: 绝不在代码中硬编码密钥
2. **HTTPS**: 生产环境必须使用HTTPS
3. **Token刷新**: Supabase自动处理Token刷新
4. **CORS配置**: 正确配置允许的源域名
5. **错误处理**: 不暴露敏感错误信息

## 🐛 常见问题

### Q: Token验证失败
A: 检查以下几点：
- SUPABASE_JWT_SECRET是否正确
- Token是否过期
- 请求头格式是否为 `Authorization: Bearer <token>`

### Q: 前端无法获取Token
A: 检查：
- 用户是否已登录
- Supabase配置是否正确
- 网络连接是否正常

### Q: CORS错误
A: 在后端的CORS配置中添加前端域名：
```python
allow_origins=["http://localhost:5173", "https://your-domain.com"]
```

## 📚 进阶功能

### 添加用户角色和权限

```python
def get_user_permissions(current_user: dict = Depends(get_current_user)):
    # 根据用户ID查询用户角色和权限
    user_id = current_user['user_id']
    # 从数据库查询用户权限...
    return permissions
```

### 添加API限流

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.get("/api/limited")
@limiter.limit("5/minute")
async def limited_endpoint(request: Request):
    return {"message": "有限流的接口"}
```

## 🎯 总结

这个认证系统提供了：

1. **完整的用户认证流程**: 注册 → 登录 → 使用受保护功能 → 登出
2. **安全的Token传递**: 前端自动管理，后端安全验证
3. **良好的用户体验**: 自动Token刷新，状态持久化
4. **开发友好**: 清晰的代码结构，详细的注释
5. **生产就绪**: 完善的错误处理，安全最佳实践

现在你可以在此基础上构建更复杂的功能，如用户个人资料、权限管理、数据CRUD等。

## 📞 技术支持

如果遇到问题，请检查：
1. 控制台错误日志
2. 网络请求状态
3. 环境变量配置
4. Supabase项目设置 