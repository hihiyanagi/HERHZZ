# 🚀 HERHZZZ Supabase 配置指南

## 📋 问题说明

你的应用目前没有连接到Supabase数据库，所以操作数据不会被保存。需要配置环境变量来连接你的Supabase项目。

## 🔧 解决步骤

### 1. 获取Supabase配置信息

1. **登录Supabase控制台**
   - 访问：https://supabase.com/dashboard
   - 使用你的账号登录

2. **选择或创建项目**
   - 如果还没有项目，点击"New project"创建一个
   - 选择你要使用的项目

3. **获取API配置**
   - 在项目页面，点击左侧菜单的 **Settings** ⚙️
   - 点击 **API** 选项卡
   - 你会看到两个重要信息：
     - **Project URL**: 类似 `https://abcdefghijk.supabase.co`
     - **anon public key**: 一长串以 `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9` 开头的字符串

### 2. 配置环境变量

1. **编辑.env文件**
   - 在项目根目录找到 `.env` 文件
   - 用文本编辑器打开

2. **替换配置值**
   ```env
   # 将下面的值替换为你从Supabase获取的真实值
   VITE_SUPABASE_URL=https://你的项目id.supabase.co
   VITE_SUPABASE_ANON_KEY=你的匿名密钥
   ```

   **示例：**
   ```env
   VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Mzg5ODY4MDAsImV4cCI6MTk1NDU2MjgwMH0.example-signature
   ```

### 3. 设置数据库表

1. **打开SQL编辑器**
   - 在Supabase控制台，点击左侧的 **SQL Editor**

2. **运行数据库脚本**
   - 复制 `database-schema-simple.sql` 文件的内容
   - 粘贴到SQL编辑器中
   - 点击 **Run** 执行

### 4. 重启应用

```bash
# 停止当前服务器 (Ctrl+C)
# 然后重新启动
npm run dev
```

## ✅ 验证配置

配置完成后，你应该能够：

1. **正常注册/登录** - 不再显示"演示模式"
2. **数据持久化** - 你的周期数据、设置等会保存到数据库
3. **在Supabase控制台查看数据** - 可以在Table Editor中看到用户数据

## 🆘 常见问题

### Q: 配置后仍然显示"演示模式"？
A: 确保：
- `.env` 文件在项目根目录（与 `package.json` 同级）
- 环境变量名正确：`VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`
- 重启了开发服务器

### Q: 登录时显示"Invalid login credentials"？
A: 这通常是因为：
- 用户还没有在这个Supabase项目中注册
- 需要先注册新账号，或者确认使用的是正确的邮箱密码

### Q: 如何查看保存的数据？
A: 在Supabase控制台：
- 点击左侧 **Table Editor**
- 查看 `user_settings`、`menstrual_cycles` 等表
- 可以看到你在应用中操作的数据

## 📞 需要帮助？

如果遇到问题，请提供：
1. 错误信息截图
2. 浏览器控制台的错误日志
3. 你的Supabase项目URL（不要分享密钥） 