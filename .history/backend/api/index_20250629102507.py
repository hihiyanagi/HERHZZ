"""
Vercel 部署入口文件

这个文件是专门为 Vercel 部署创建的入口点
它导入并暴露 FastAPI 应用实例供 Vercel 使用
"""

import sys
import os

# 添加 backend 目录到 Python 路径
# 这样可以正确导入 backend 目录下的模块
backend_path = os.path.join(os.path.dirname(__file__), '..')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# 导入 FastAPI 应用实例
from main import app

# 这是 Vercel 需要的应用实例
# Vercel 会自动检测并使用这个 app 变量
app = app 