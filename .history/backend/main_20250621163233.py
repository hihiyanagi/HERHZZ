from fastapi import FastAPI, HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
import jwt
import os
from typing import Optional
from datetime import datetime
import uvicorn

# 创建FastAPI应用实例
app = FastAPI(title="Supabase Auth API", version="1.0.0")

# 配置CORS中间件，允许前端跨域请求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite和其他前端端口
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# HTTP Bearer认证scheme，用于从请求头获取Token
security = HTTPBearer()

# 从环境变量获取Supabase JWT密钥
# 这个密钥用于验证Supabase生成的JWT Token的真实性
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

if not SUPABASE_JWT_SECRET:
    raise ValueError("SUPABASE_JWT_SECRET environment variable is required")

def verify_jwt_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    """
    验证JWT Token的有效性
    
    Args:
        credentials: HTTP Authorization头中的Bearer Token
        
    Returns:
        dict: 解码后的JWT payload，包含用户信息
        
    Raises:
        HTTPException: Token无效、过期或解析失败时抛出401错误
    """
    token = credentials.credentials
    
    try:
        # 使用Supabase JWT密钥验证和解码Token
        # jwt.decode会验证：
        # 1. Token签名是否正确
        # 2. Token是否过期
        # 3. Token格式是否正确
        payload = jwt.decode(
            token, 
            SUPABASE_JWT_SECRET, 
            algorithms=["HS256"]  # Supabase使用HS256算法
        )
        
        # 检查Token是否过期（双重验证）
        if payload.get('exp') and payload['exp'] < datetime.utcnow().timestamp():
            raise HTTPException(
                status_code=401, 
                detail="Token已过期"
            )
            
        return payload
        
    except jwt.ExpiredSignatureError:
        # Token过期
        raise HTTPException(
            status_code=401, 
            detail="Token已过期，请重新登录"
        )
    except jwt.InvalidTokenError:
        # Token无效（签名错误、格式错误等）
        raise HTTPException(
            status_code=401, 
            detail="Token无效，请重新登录"
        )
    except Exception as e:
        # 其他错误
        raise HTTPException(
            status_code=401, 
            detail=f"Token验证失败: {str(e)}"
        )

def get_current_user(token_payload: dict = Depends(verify_jwt_token)) -> dict:
    """
    从JWT Token中提取当前用户信息
    
    Args:
        token_payload: 验证后的JWT payload
        
    Returns:
        dict: 用户信息，包含user_id, email等
    """
    # Supabase JWT Token的标准字段：
    # - sub: 用户ID
    # - email: 用户邮箱
    # - aud: 受众 (audience)
    # - exp: 过期时间
    # - iat: 签发时间
    
    user_id = token_payload.get('sub')  # 'sub'字段包含用户ID
    email = token_payload.get('email')
    
    if not user_id:
        raise HTTPException(
            status_code=401, 
            detail="Token中缺少用户ID"
        )
    
    return {
        'user_id': user_id,
        'email': email,
        'token_payload': token_payload  # 完整的token数据，如果需要其他字段
    }

# ===== API路由 =====

@app.get("/")
async def root():
    """健康检查接口"""
    return {"message": "Supabase Auth API is running"}

@app.get("/api/protected")
async def protected_route(current_user: dict = Depends(get_current_user)):
    """
    受保护的API路由示例
    
    这个接口需要有效的JWT Token才能访问
    前端调用时必须在Authorization头中包含Token
    """
    return {
        "message": "这是受保护的数据",
        "user_id": current_user['user_id'],
        "email": current_user['email'],
        "access_time": datetime.utcnow().isoformat()
    }

@app.get("/api/user/profile")
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """
    获取用户个人资料
    
    实际项目中，你可以根据user_id从数据库查询用户详细信息
    """
    user_id = current_user['user_id']
    
    # 这里你可以添加数据库查询逻辑
    # 例如：user_data = await database.fetch_user_profile(user_id)
    
    return {
        "user_id": user_id,
        "email": current_user['email'],
        "profile": {
            "nickname": "用户昵称",
            "avatar": "头像URL",
            "created_at": "2024-01-01T00:00:00Z"
        }
    }

@app.post("/api/user/profile")
async def update_user_profile(
    profile_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """
    更新用户个人资料
    """
    user_id = current_user['user_id']
    
    # 这里你可以添加数据库更新逻辑
    # 例如：await database.update_user_profile(user_id, profile_data)
    
    return {
        "message": "个人资料更新成功",
        "user_id": user_id,
        "updated_data": profile_data
    }

if __name__ == "__main__":
    # 运行服务器
    uvicorn.run(app, host="0.0.0.0", port=8000) 