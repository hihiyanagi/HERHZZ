#!/usr/bin/env python3
"""
FastAPI 后端启动脚本
"""

import os
from dotenv import load_dotenv
import uvicorn

# 加载环境变量
load_dotenv()

if __name__ == "__main__":
    # 从环境变量获取配置，如果没有则使用默认值
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("DEBUG", "true").lower() == "true"
    
    print(f"🚀 Starting FastAPI server on {host}:{port}")
    print(f"📝 Debug mode: {debug}")
    print(f"🔗 API will be available at: http://{host}:{port}")
    print(f"📚 API docs will be available at: http://{host}:{port}/docs")
    
    # 启动服务器
    uvicorn.run(
        "main:app",  # 模块:应用实例
        host=host,
        port=port,
        reload=debug,  # 开发模式下启用热重载
        log_level="info" if debug else "warning"
    ) 