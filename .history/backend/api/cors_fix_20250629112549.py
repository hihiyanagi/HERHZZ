"""
CORS 修复模块 - 专门用于 Vercel 部署

这个模块提供了一个包装器函数，用于在 Vercel 环境中
正确处理 CORS 预检请求和跨域响应
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os

def add_cors_headers(app: FastAPI):
    """
    为 FastAPI 应用添加 CORS 支持
    
    Args:
        app: FastAPI 应用实例
    """
    # 获取前端 URL，默认允许所有源（用于开发）
    frontend_url = os.getenv("FRONTEND_URL", "*")
    
    # 配置 CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # 允许所有源
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )
    
    # 添加中间件来处理 OPTIONS 请求
    @app.middleware("http")
    async def cors_middleware(request: Request, call_next):
        # 处理预检请求
        if request.method == "OPTIONS":
            return JSONResponse(
                content={},
                status_code=200,
                headers={
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept",
                    "Access-Control-Allow-Credentials": "true",
                },
            )
            
        # 处理正常请求
        response = await call_next(request)
        
        # 添加 CORS 头
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        
        return response
    
    print("✅ CORS 修复已应用 - 允许所有源") 