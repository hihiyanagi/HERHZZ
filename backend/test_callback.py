# -*- coding: utf-8 -*-
"""
支付回调测试脚本
用于模拟 ZPay 支付回调，测试回调接口是否正常工作
"""
import requests
import json
from utils import generate_md5_signature
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

def test_payment_callback():
    """测试支付回调接口"""
    
    # 获取配置
    merchant_key = os.getenv("ZPAY_MERCHANT_KEY")
    backend_url = "https://herhzz-backend.vercel.app"
    
    if not merchant_key:
        print("❌ 环境变量 ZPAY_MERCHANT_KEY 未设置")
        return
    
    print("🔍 开始测试支付回调...")
    
    # 模拟支付回调数据（这些数据模拟ZPay发送给我们的通知）
    callback_data = {
        "pid": os.getenv("ZPAY_MERCHANT_ID", "test_merchant_id"),
        "out_trade_no": "20250101-143022-ABC123",  # 替换为实际的订单号
        "trade_no": "zpay_" + "20250101143022001",
        "trade_status": "TRADE_SUCCESS",
        "type": "alipay",
        "name": "HERHZZZ 季度会员",
        "money": "0.1",
        "buyerid": "test_buyer_001",
        "param": ""
    }
    
    # 生成签名
    try:
        sign = generate_md5_signature(callback_data, merchant_key)
        callback_data["sign"] = sign
        print(f"✅ 生成签名成功: {sign[:10]}...{sign[-10:]}")
    except Exception as e:
        print(f"❌ 生成签名失败: {e}")
        return
    
    print(f"📋 模拟回调数据:")
    for key, value in callback_data.items():
        if key == "sign":
            print(f"  {key}: {value[:10]}...{value[-10:]}")
        else:
            print(f"  {key}: {value}")
    
    # 测试新的回调接口
    print("\n🔗 测试 /notify_url 接口...")
    try:
        # 使用GET方式发送（模拟ZPay的GET回调）
        response = requests.get(
            f"{backend_url}/notify_url",
            params=callback_data,
            timeout=10
        )
        
        print(f"📤 GET 请求状态码: {response.status_code}")
        print(f"📤 GET 响应内容: {response.text}")
        
        if response.text.strip() == "success":
            print("✅ GET 回调测试成功！")
        else:
            print("❌ GET 回调测试失败")
            
    except Exception as e:
        print(f"❌ GET 请求失败: {e}")
    
    # 测试POST方式
    print("\n🔗 测试 POST 方式...")
    try:
        response = requests.post(
            f"{backend_url}/notify_url",
            data=callback_data,
            timeout=10
        )
        
        print(f"📤 POST 请求状态码: {response.status_code}")
        print(f"📤 POST 响应内容: {response.text}")
        
        if response.text.strip() == "success":
            print("✅ POST 回调测试成功！")
        else:
            print("❌ POST 回调测试失败")
            
    except Exception as e:
        print(f"❌ POST 请求失败: {e}")
    
    # 测试旧接口兼容性
    print("\n🔗 测试旧接口 /api/payment/notify ...")
    try:
        response = requests.post(
            f"{backend_url}/api/payment/notify",
            data=callback_data,
            timeout=10
        )
        
        print(f"📤 旧接口状态码: {response.status_code}")
        print(f"📤 旧接口响应: {response.text if response.status_code != 422 else '422 Unprocessable Entity'}")
        
    except Exception as e:
        print(f"❌ 旧接口请求失败: {e}")

def test_order_status():
    """测试订单状态查询"""
    print("\n🔍 测试订单状态查询...")
    
    backend_url = "http://localhost:8000"
    out_trade_no = "20250101-143022-ABC123"  # 替换为实际的订单号
    
    try:
        # 这里需要JWT token，实际使用时需要先登录获取token
        # response = requests.get(
        #     f"{backend_url}/api/get_order_status/{out_trade_no}",
        #     headers={"Authorization": "Bearer your_jwt_token"}
        # )
        
        print("⚠️  订单状态查询需要JWT token，请手动测试")
        print(f"   测试URL: {backend_url}/api/get_order_status/{out_trade_no}")
        
    except Exception as e:
        print(f"❌ 订单状态查询失败: {e}")

if __name__ == "__main__":
    print("🚀 支付回调测试工具")
    print("=" * 50)
    
    # 检查环境变量
    merchant_id = os.getenv("ZPAY_MERCHANT_ID")
    merchant_key = os.getenv("ZPAY_MERCHANT_KEY")
    
    print(f"🔍 环境变量检查:")
    print(f"   ZPAY_MERCHANT_ID: {'✅ 已设置' if merchant_id else '❌ 未设置'}")
    print(f"   ZPAY_MERCHANT_KEY: {'✅ 已设置' if merchant_key else '❌ 未设置'}")
    
    if not merchant_id or not merchant_key:
        print("\n❌ 请先配置环境变量:")
        print("   1. 复制 env_config_fixed.txt 到 .env")
        print("   2. 填入您的 ZPay 商户信息")
        exit(1)
    
    print("\n" + "=" * 50)
    
    # 运行测试
    test_payment_callback()
    test_order_status()
    
    print("\n" + "=" * 50)
    print("🎉 测试完成！")
    
    print("\n📝 使用说明:")
    print("1. 确保后端服务运行在 http://localhost:8000")
    print("2. 如果测试成功，ZPay回调应该能正常工作")
    print("3. 支付成功后检查数据库订单状态是否更新为 'paid'")
    print("4. 检查用户会员状态是否正确更新") 