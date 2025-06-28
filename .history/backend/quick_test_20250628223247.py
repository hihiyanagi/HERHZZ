#!/usr/bin/env python3
"""
快速连接测试
"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

print("🔍 连接测试")
print("=" * 30)

# 测试 Supabase API 连接
url = os.getenv("SUPABASE_URL")
if url:
    try:
        response = requests.get(f"{url}/rest/v1/", timeout=10)
        print(f"✅ Supabase API: {response.status_code}")
    except Exception as e:
        print(f"❌ Supabase API: {e}")
else:
    print("❌ Supabase URL 未配置")

# 测试本地后端
try:
    response = requests.get("http://localhost:8000/", timeout=5)
    print(f"✅ 本地后端: {response.status_code}")
except Exception as e:
    print(f"❌ 本地后端: {e}")

print("=" * 30) 