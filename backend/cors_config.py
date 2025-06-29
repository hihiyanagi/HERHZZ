"""
CORS 配置模块

用于配置 FastAPI 应用的 CORS 策略
确保前端可以正确访问后端 API
"""

import os
from fastapi.middleware.cors import CORSMiddleware

def setup_cors(app):
    """
    设置 CORS 中间件
    
    Args:
        app: FastAPI 应用实例
    """
    # 获取前端 URL（从环境变量）
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    # 打印调试信息
    print(f"🔒 CORS 配置:")
    print(f"✅ 允许的前端域名: {frontend_url}")
    
    # 允许的源列表（包括本地开发和生产环境）
    allowed_origins = [
        frontend_url,                 # 生产环境前端
        "http://localhost:5173",      # Vite 默认开发端口
        "http://localhost:3000",      # 常见的开发端口
        "http://localhost:4173",      # Vite 预览端口
        "https://www.herhzzz.xyz",    # 生产环境域名
        "https://herhzzz.xyz",        # 生产环境域名 (无 www)
    ]
    
    # 添加 CORS 中间件
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,  # 允许的源列表
        allow_credentials=True,         # 允许携带凭证
        allow_methods=["*"],           # 允许所有方法
        allow_headers=["*"],           # 允许所有头部
    )
    
    print(f"✅ CORS 中间件已配置，允许的源: {allowed_origins}") 