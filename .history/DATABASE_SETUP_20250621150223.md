# HerHzzz 数据库连接设置指南

## 📋 **设置概览**

您的前端现在已经准备好连接 Supabase 数据库！以下是完成设置的步骤：

## 🔧 **1. 配置环境变量**

在项目根目录的 `.env` 文件中添加以下内容（请替换为您的真实 Supabase 项目信息）：

```bash
# Supabase 项目配置
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key-here

# 服务端密钥（可选，用于服务端操作）
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_JWT_SECRET=your-jwt-secret-here
```

### 📍 **如何获取这些信息**：
1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择您的项目
3. 点击左侧菜单 **Settings** > **API**
4. 复制 `Project URL` 和 `anon public` key

## 🗄️ **2. 创建数据库表**

1. 在 Supabase Dashboard 中，点击左侧菜单 **SQL Editor**
2. 复制 `database-schema.sql` 文件中的所有内容
3. 粘贴到 SQL Editor 中
4. 点击 **Run** 执行

这将创建以下表：
- `users` - 用户资料
- `user_settings` - 用户设置
- `menstrual_cycles` - 月经周期记录
- `audio_sessions` - 音频播放会话
- `sleep_records` - 睡眠记录

## 🚀 **3. 启动应用**

```bash
npm run dev
```

现在您的应用将显示登录页面，您可以：
- 注册新账户
- 登录现有账户
- 数据将自动同步到 Supabase 数据库

## ✅ **已实现的功能**

### **认证系统**
- ✅ 用户注册/登录
- ✅ 用户资料管理
- ✅ 自动会话管理

### **数据库服务**
- ✅ 用户数据 CRUD 操作
- ✅ 月经周期数据管理
- ✅ 音频会话记录
- ✅ 睡眠数据追踪
- ✅ 用户设置持久化

### **React Hooks**
- ✅ `useAuth` - 认证状态管理
- ✅ `useCycle` - 周期数据管理
- ✅ 自动数据同步

### **安全特性**
- ✅ 行级安全策略 (RLS)
- ✅ 用户数据隔离
- ✅ 安全的数据库函数

## 🔍 **测试数据库连接**

1. 启动应用后，您将看到登录页面
2. 注册一个新账户
3. 登录成功后，应用会自动：
   - 在数据库中创建用户记录
   - 加载用户设置
   - 显示您的现有功能

## 📊 **数据流**

```
用户操作 → React组件 → Hooks → Database服务 → Supabase → PostgreSQL
```

## 🛠️ **故障排除**

### **常见问题**：

1. **"缺少 Supabase 环境变量"错误**
   - 检查 `.env` 文件是否正确配置
   - 确保变量名使用 `VITE_` 前缀

2. **认证失败**
   - 检查 Supabase URL 和 API Key 是否正确
   - 确保网络连接正常

3. **数据库操作失败**
   - 检查是否正确执行了 `database-schema.sql`
   - 检查 RLS 策略是否正确设置

## 🎯 **下一步**

数据库连接完成后，您可以：
1. 在现有组件中使用 `useCycle` hook 来持久化周期数据
2. 使用 `useAuthContext` 来访问用户信息
3. 添加更多数据分析和统计功能
4. 实现数据导出功能

现在您的 HerHzzz 应用已经完全支持数据库存储和用户认证！🎉 