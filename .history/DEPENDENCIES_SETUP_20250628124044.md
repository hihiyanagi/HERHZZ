# 📦 依赖安装指南

## 🔧 必要依赖安装

为了让订阅系统正常工作，您需要安装以下依赖：

### 1. 安装 crypto-js（MD5签名）

```bash
npm install crypto-js
npm install --save-dev @types/crypto-js
```

### 2. 安装其他可能缺少的UI依赖

```bash
npm install lucide-react
npm install @radix-ui/react-slider
npm install @radix-ui/react-alert-dialog
```

### 3. 更新 MD5 签名实现

安装 crypto-js 后，请更新 `src/lib/subscription.ts` 中的签名函数：

```typescript
import CryptoJS from 'crypto-js'

// 替换 simpleMD5 函数
async function simpleMD5(str: string): Promise<string> {
  return CryptoJS.MD5(str).toString().toLowerCase()
}
```

完整的更新代码：

```typescript
import CryptoJS from 'crypto-js'

// MD5签名生成（使用crypto-js）
async function generateMD5Signature(params: Record<string, any>, key: string): Promise<string> {
  // 过滤掉空值和特殊字段
  const filteredParams: Record<string, string> = {}
  for (const [k, v] of Object.entries(params)) {
    if (k !== 'sign' && k !== 'sign_type' && v !== null && v !== '' && v !== undefined) {
      filteredParams[k] = String(v)
    }
  }
  
  // 按照参数名ASCII码排序
  const sortedKeys = Object.keys(filteredParams).sort()
  
  // 拼接成 URL 键值对格式（不做URL编码）
  const paramString = sortedKeys.map(key => `${key}=${filteredParams[key]}`).join('&')
  
  // 拼接商户密钥
  const signString = paramString + key
  
  console.log('签名原始字符串:', signString)
  
  // 使用crypto-js生成MD5
  const md5Hash = CryptoJS.MD5(signString).toString().toLowerCase()
  
  console.log('生成签名:', md5Hash)
  
  return md5Hash
}
```

## 🚀 验证安装

运行以下命令确保一切正常：

```bash
npm run dev
```

如果出现类型错误，请确保安装了对应的类型定义：

```bash
npm install --save-dev @types/crypto-js
```

## 🔄 Edge Function 的 MD5 实现

对于 Supabase Edge Function，您需要使用 Deno 兼容的 MD5 库。更新 `supabase/functions/payment-callback/index.ts`：

```typescript
// 在文件顶部添加 MD5 库导入
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

// 如果上述不支持MD5，使用第三方库：
// import { Md5 } from "https://deno.land/std@0.168.0/hash/md5.ts"

// 更新签名验证函数
async function verifyMD5Signature(params: Record<string, any>, key: string, sign: string): Promise<boolean> {
  try {
    // ... 参数处理逻辑 ...
    
    // 使用 Deno 的 MD5 实现
    const encoder = new TextEncoder()
    const data = encoder.encode(signString)
    
    // 方案1：如果系统支持MD5
    const hashBuffer = await crypto.subtle.digest('MD5', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const expectedSign = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toLowerCase()
    
    // 方案2：使用第三方库（如果方案1不工作）
    // const md5 = new Md5()
    // md5.update(signString)
    // const expectedSign = md5.toString()
    
    return expectedSign === sign.toLowerCase()
  } catch (error) {
    console.error('签名验证失败:', error)
    return false
  }
}
```

## 📋 完整的 package.json 依赖

确保您的 `package.json` 包含以下依赖：

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-router-dom": "^6.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "lucide-react": "^0.263.1",
    "crypto-js": "^4.1.1",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.4"
  },
  "devDependencies": {
    "@types/crypto-js": "^4.1.1"
  }
}
```

## 🛠️ 故障排除

### 问题：crypto-js 导入错误
```bash
# 解决方案
npm install crypto-js @types/crypto-js
```

### 问题：Lucide React 图标不显示
```bash
# 解决方案
npm install lucide-react
```

### 问题：Slider 组件不工作
```bash
# 解决方案
npm install @radix-ui/react-slider
```

### 问题：Edge Function MD5 不支持
如果 Deno 不支持 MD5，使用替代方案：

```typescript
// 在 Edge Function 中使用外部 MD5 库
import { Md5 } from "https://deno.land/x/checksum@1.4.0/md5.ts"

async function verifyMD5Signature(params: Record<string, any>, key: string, sign: string): Promise<boolean> {
  // ... 参数处理逻辑 ...
  
  const md5 = new Md5()
  md5.update(signString)
  const expectedSign = md5.toString()
  
  return expectedSign === sign.toLowerCase()
}
```

安装完成后，您的订阅系统就可以正常工作了！🎉 