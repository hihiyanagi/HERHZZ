"""
CORS 修复模块

用于配置 FastAPI 应用的 CORS 策略
确保前端可以正确访问后端 API
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

def setup_cors(app: FastAPI):
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
        frontend_url,                 # 环境变量中的前端URL
        "http://localhost:5173",      # Vite 默认开发端口
        "http://localhost:3000",      # 常见的开发端口
        "http://localhost:4173",      # Vite 预览端口
        "https://www.herhzzz.xyz",    # 生产环境域名
        "https://herhzzz.xyz",        # 生产环境域名 (无 www)
        "*",                          # 允许所有源 (临时解决方案)
    ]
    
    # 移除现有的 CORS 中间件（如果有）
    if hasattr(app, 'middleware_stack'):
        new_middlewares = []
        for middleware in app.middleware_stack.middlewares:
            if not isinstance(middleware, CORSMiddleware):
                new_middlewares.append(middleware)
        app.middleware_stack.middlewares = new_middlewares
    
    # 添加 CORS 中间件
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,  # 允许的源列表
        allow_credentials=True,         # 允许携带凭证
        allow_methods=["*"],            # 允许所有方法
        allow_headers=["*"],            # 允许所有头部
        expose_headers=["*"],           # 暴露所有头部
        max_age=86400,                  # 预检请求缓存时间（24小时）
    )
    
    print(f"✅ CORS 中间件已配置，允许的源: {allowed_origins}") 