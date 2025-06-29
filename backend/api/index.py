"""
Vercel 部署入口文件

这个文件是专门为 Vercel 部署创建的入口点
它导入并暴露 FastAPI 应用实例供 Vercel 使用
"""

import sys
import os
import importlib.util

# 添加当前目录到 Python 路径
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)  # 获取父目录

# 确保父目录在 Python 路径中
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

# 直接导入模块，而不是使用相对导入
try:
    # 尝试直接导入 main 模块
    spec = importlib.util.spec_from_file_location("main", os.path.join(parent_dir, "main.py"))
    main = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(main)
    app = main.app
    print("✅ 成功导入 FastAPI 应用实例")
except Exception as e:
    print(f"❌ 导入 FastAPI 应用实例失败: {str(e)}")
    raise 