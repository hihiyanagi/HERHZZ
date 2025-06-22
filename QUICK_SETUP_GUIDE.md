# 🚀 快速修复指南 - 解决月经周期数据保存问题

## 📋 问题诊断

你的应用目前无法保存月经周期数据，这是因为：
1. **缺少环境变量配置** - Supabase数据库连接信息未配置
2. **缺少数据库表** - 数据库中没有创建必要的表
3. **缺少RLS安全策略** - 行级安全策略未设置

## 🔧 解决方案

### 第一步：配置环境变量

1. **编辑 `.env` 文件**（已为你创建）
   - 找到项目根目录的 `.env` 文件
   - 替换其中的占位符为你的真实Supabase信息

2. **获取Supabase配置信息**
   - 登录：https://supabase.com/dashboard
   - 选择你的项目（如果没有则创建一个新项目）
   - 点击左侧 **Settings** → **API**
   - 复制 **Project URL** 和 **anon public key**

3. **更新 `.env` 文件**
   ```env
   VITE_SUPABASE_URL=https://你的项目id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.你的完整密钥
   ```

### 第二步：创建数据库表

1. **在Supabase控制台**
   - 点击左侧 **SQL Editor**
   - 复制 `database-schema-simple.sql` 文件的内容
   - 粘贴到SQL编辑器中
   - 点击 **Run** 执行

### 第三步：设置安全策略

1. **运行RLS策略**
   - 在SQL编辑器中
   - 复制 `setup-rls.sql` 文件的内容
   - 粘贴并执行

### 第四步：重启应用

```bash
# 停止当前服务 (Ctrl+C)
npm run dev
```

## ✅ 验证修复

修复后你应该能够：

1. **正常输入周期数据** - 不再显示"保存失败"错误
2. **数据持久化** - 刷新页面后数据仍然存在
3. **在Supabase控制台查看数据** - Table Editor中可以看到保存的记录

## 🆘 临时解决方案（如果暂时无法配置Supabase）

我已经为你添加了**本地存储功能**：

- **无需配置** - 即使没有配置Supabase，应用也能正常工作
- **数据保存在浏览器** - 使用localStorage暂存数据
- **友好提示** - 会显示黄色提示框说明当前状态
- **配置后自动切换** - 一旦配置好Supabase，会自动切换到云端存储

## 🔍 故障排除

### 问题1：配置后仍然显示"数据库未配置"
- 确保 `.env` 文件在项目根目录
- 确保环境变量名正确：`VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`
- 重启开发服务器

### 问题2：显示"权限错误"
- 运行 `setup-rls.sql` 设置安全策略
- 确保用户已登录

### 问题3：无法创建表
- 检查SQL语法是否正确
- 确认是否有数据库管理权限

## 📞 需要帮助？

如果仍有问题，请提供：
1. 错误信息截图
2. 浏览器开发者工具的Console输出
3. 你的Supabase项目URL（不要分享密钥）

现在试试输入你的月经周期数据，应该可以正常保存了！ 🎉 