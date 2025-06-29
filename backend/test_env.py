#!/usr/bin/env python3
"""
环境变量测试脚本 - 验证ZPay配置是否正确加载
"""
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

print("🔍 环境变量检查报告")
print("=" * 50)

# 检查ZPay配置
zpay_merchant_id = os.getenv("ZPAY_MERCHANT_ID")
zpay_merchant_key = os.getenv("ZPAY_MERCHANT_KEY") 
zpay_notify_url = os.getenv("ZPAY_NOTIFY_URL")

print(f"✅ ZPAY_MERCHANT_ID: {zpay_merchant_id[:10]}..." if zpay_merchant_id else "❌ ZPAY_MERCHANT_ID: 未设置")
print(f"✅ ZPAY_MERCHANT_KEY: {zpay_merchant_key[:10]}..." if zpay_merchant_key else "❌ ZPAY_MERCHANT_KEY: 未设置")
print(f"✅ ZPAY_NOTIFY_URL: {zpay_notify_url}" if zpay_notify_url else "❌ ZPAY_NOTIFY_URL: 未设置")

# 检查Supabase配置
supabase_url = os.getenv("SUPABASE_URL")
supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase_jwt_secret = os.getenv("SUPABASE_JWT_SECRET")

print(f"✅ SUPABASE_URL: {supabase_url}" if supabase_url else "❌ SUPABASE_URL: 未设置")
print(f"✅ SUPABASE_SERVICE_ROLE_KEY: {supabase_service_key[:20]}..." if supabase_service_key else "❌ SUPABASE_SERVICE_ROLE_KEY: 未设置")
print(f"✅ SUPABASE_JWT_SECRET: {supabase_jwt_secret[:20]}..." if supabase_jwt_secret else "❌ SUPABASE_JWT_SECRET: 未设置")

print("=" * 50)

# 验证PaymentService初始化
try:
    from payment_service import PaymentService
    payment_service = PaymentService()
    print("✅ PaymentService 初始化成功")
    print(f"   - merchant_id: {payment_service.merchant_id}")
    print(f"   - notify_url: {payment_service.notify_url}")
    print(f"   - merchant_key: {'已设置' if payment_service.merchant_key else '未设置'}")
except Exception as e:
    print(f"❌ PaymentService 初始化失败: {e}")

print("=" * 50)
print("🎯 如果所有项都显示✅，说明配置正确")
print("�� 如果有❌，请检查你的.env文件") 