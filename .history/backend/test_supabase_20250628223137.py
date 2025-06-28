#!/usr/bin/env python3
"""
Supabase 连接测试脚本
"""
import os
import asyncio
from dotenv import load_dotenv
from supabase import create_client, Client

async def test_supabase_connection():
    """测试 Supabase 连接"""
    
    # 加载环境变量
    load_dotenv()
    
    print("🔍 Supabase 连接测试")
    print("=" * 50)
    
    # 检查环境变量
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    print(f"📍 SUPABASE_URL: {url}")
    print(f"🔑 SERVICE_KEY: {'已设置' if key else '❌ 未设置'}")
    
    if not url or not key:
        print("❌ 缺少 Supabase 配置！")
        return False
    
    try:
        # 创建客户端
        print("\n🔌 正在创建 Supabase 客户端...")
        supabase: Client = create_client(url, key)
        print("✅ 客户端创建成功")
        
        # 测试简单查询
        print("\n📋 测试数据库连接...")
        result = supabase.table("orders").select("count", count="exact").limit(1).execute()
        print(f"✅ 数据库连接成功！订单表记录数: {result.count}")
        
        # 测试 user_memberships 表
        print("\n👥 测试 user_memberships 表...")
        result2 = supabase.table("user_memberships").select("count", count="exact").limit(1).execute()
        print(f"✅ user_memberships 表连接成功！记录数: {result2.count}")
        
        return True
        
    except Exception as e:
        print(f"❌ 连接失败: {str(e)}")
        print(f"   错误类型: {type(e).__name__}")
        
        # 检查常见问题
        if "Server disconnected" in str(e):
            print("\n🔍 诊断建议:")
            print("1. 检查网络连接")
            print("2. 确认 Supabase 项目是否暂停")
            print("3. 验证 API 密钥是否有效")
            
        return False

if __name__ == "__main__":
    asyncio.run(test_supabase_connection()) 