from fastapi import FastAPI, HTTPException, Depends, Security, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
import jwt
import os
from typing import Optional
from datetime import datetime
import uvicorn
from dotenv import load_dotenv
import httpx

# 导入我们的模型和服务
from models import (
    CreateOrderRequest, CreateOrderResponse, PaymentNotification, 
    CreateSubscriptionOrderRequest,
    UserMembershipStatus, UserAudioAccessResponse
)
from database_service import DatabaseService
from payment_service import PaymentService
from utils import generate_order_number, get_client_ip, validate_amount, verify_md5_signature

# 加载环境变量
load_dotenv()

# 创建FastAPI应用实例
app = FastAPI(title="HERHZZZ Payment API", version="1.0.0")

# 配置CORS中间件，允许前端跨域请求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Vite和其他前端端口
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# HTTP Bearer认证scheme，用于从请求头获取Token
security = HTTPBearer()

# 从环境变量获取Supabase JWT密钥
# 这个密钥用于验证Supabase生成的JWT Token的真实性
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

if not SUPABASE_JWT_SECRET:
    raise ValueError("SUPABASE_JWT_SECRET environment variable is required")

# 初始化服务实例
database_service = DatabaseService()
payment_service = PaymentService()

def verify_jwt_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    """
    验证JWT Token的有效性
    
    Args:
        credentials: HTTP Authorization头中的Bearer Token
        
    Returns:
        dict: 解码后的JWT payload，包含用户信息
        
    Raises:
        HTTPException: Token无效、过期或解析失败时抛出401错误
    """
    token = credentials.credentials
    
    # 增加详细的调试日志
    print(f"🔍 开始验证JWT Token...")
    print(f"📏 Token长度: {len(token)}")
    print(f"🔑 JWT Secret长度: {len(SUPABASE_JWT_SECRET) if SUPABASE_JWT_SECRET else 0}")
    print(f"📝 Token前50个字符: {token[:50]}...")
    
    try:
        # 先尝试解码token而不验证签名，看看内容
        try:
            parts = token.split('.')
            if len(parts) == 3:
                import base64
                import json
                
                # 解码header和payload（不验证签名）
                header = json.loads(base64.b64decode(parts[0] + '=='))
                payload = json.loads(base64.b64decode(parts[1] + '=='))
                
                print(f"📋 Token Header: {header}")
                print(f"👤 Token Payload - 用户ID: {payload.get('sub')}")
                print(f"📧 Token Payload - 邮箱: {payload.get('email')}")
                print(f"⏰ Token Payload - 过期时间: {payload.get('exp')}")
                print(f"🏢 Token Payload - 受众: {payload.get('aud')}")
                print(f"🏷️ Token Payload - 角色: {payload.get('role')}")
                
                # 检查过期时间
                if payload.get('exp'):
                    import time
                    current_time = time.time()
                    exp_time = payload['exp']
                    print(f"⏰ 当前时间: {current_time}")
                    print(f"⏰ Token过期时间: {exp_time}")
                    print(f"⏰ Token状态: {'已过期' if current_time > exp_time else '未过期'}")
            else:
                print(f"❌ Token格式错误: 分段数量 = {len(parts)}")
        except Exception as decode_error:
            print(f"⚠️ 无法解码token内容: {decode_error}")
        
        # 使用Supabase JWT密钥验证和解码Token
        print(f"🔐 开始验证Token签名...")
        payload = jwt.decode(
            token, 
            SUPABASE_JWT_SECRET, 
            algorithms=["HS256"],  # Supabase使用HS256算法
            audience="authenticated",  # Supabase默认audience
            options={"verify_aud": True}  # 明确启用audience验证
        )
        
        print(f"✅ Token验证成功!")
        
        # 检查Token是否过期（双重验证）
        if payload.get('exp') and payload['exp'] < datetime.utcnow().timestamp():
            print(f"❌ Token已过期")
            raise HTTPException(
                status_code=401, 
                detail="Token已过期"
            )
            
        return payload
        
    except jwt.ExpiredSignatureError as e:
        # Token过期
        print(f"❌ JWT ExpiredSignatureError: {e}")
        raise HTTPException(
            status_code=401, 
            detail="Token已过期，请重新登录"
        )
    except jwt.InvalidTokenError as e:
        # Token无效（签名错误、格式错误等）
        print(f"❌ JWT InvalidTokenError: {e}")
        raise HTTPException(
            status_code=401, 
            detail="Token无效，请重新登录"
        )
    except Exception as e:
        # 其他错误
        print(f"❌ JWT验证异常: {type(e).__name__}: {e}")
        raise HTTPException(
            status_code=401, 
            detail=f"Token验证失败: {str(e)}"
        )

def get_current_user(token_payload: dict = Depends(verify_jwt_token)) -> dict:
    """
    从JWT Token中提取当前用户信息
    
    Args:
        token_payload: 验证后的JWT payload
        
    Returns:
        dict: 用户信息，包含user_id, email等
    """
    # Supabase JWT Token的标准字段：
    # - sub: 用户ID
    # - email: 用户邮箱
    # - aud: 受众 (audience)
    # - exp: 过期时间
    # - iat: 签发时间
    
    user_id = token_payload.get('sub')  # 'sub'字段包含用户ID
    email = token_payload.get('email')
    
    if not user_id:
        raise HTTPException(
            status_code=401, 
            detail="Token中缺少用户ID"
        )
    
    return {
        'user_id': user_id,
        'email': email,
        'token_payload': token_payload  # 完整的token数据，如果需要其他字段
    }

# ===== API路由 =====

@app.get("/")
async def root():
    """健康检查接口"""
    return {"message": "HERHZZZ Payment API is running"}

@app.get("/api/protected")
async def protected_route(current_user: dict = Depends(get_current_user)):
    """
    受保护的API路由示例
    
    这个接口需要有效的JWT Token才能访问
    前端调用时必须在Authorization头中包含Token
    """
    return {
        "message": "这是受保护的数据",
        "user_id": current_user['user_id'],
        "email": current_user['email'],
        "access_time": datetime.utcnow().isoformat()
    }

# ===== 会员订阅系统接口 =====

# 已删除旧的跳转支付订阅端点，使用下面的二维码支付端点

@app.post("/api/create_subscription_qr_order")
async def create_subscription_qr_order(
    request: Request,
    subscription_request: CreateSubscriptionOrderRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    创建订阅订单并返回二维码支付信息
    
    专门用于生成二维码支付，不同于页面跳转支付
    
    Args:
        request: FastAPI Request 对象
        subscription_request: 订阅请求数据
        current_user: 当前登录用户信息
        
    Returns:
        dict: 包含二维码链接和订单信息的响应
        
    Raises:
        HTTPException: 生成失败时抛出异常
    """
    try:
        # 1. 验证用户权限
        user_id = subscription_request.user_id or current_user['user_id']
        
        if user_id != current_user['user_id']:
            raise HTTPException(
                status_code=403,
                detail="用户只能为自己创建订阅"
            )
        
        # 2. 生成唯一的商户订单号
        out_trade_no = generate_order_number()
        
        # 3. 获取客户端IP和设备信息
        client_ip = get_client_ip(request)
        user_agent = request.headers.get("user-agent", "")
        device = "mobile" if any(keyword in user_agent.lower() for keyword in ["mobile", "android", "iphone"]) else "pc"
        
        # 4. 在数据库中创建订阅订单记录
        try:
            # 准备订阅订单数据字典
            subscription_order_data = {
                "out_trade_no": out_trade_no,
                "user_id": user_id,
                "subscription_type": subscription_request.subscription_type.value,
                "name": subscription_request.subscription_name,
                "amount": subscription_request.subscription_amount,
                "subscription_duration_days": subscription_request.subscription_duration_days,
                "payment_type": subscription_request.payment_type,
                "client_ip": client_ip,
                "device": device
            }
            
            # 调用数据库服务创建订阅订单
            created_order = await database_service.create_subscription_order(subscription_order_data)
            order_id = created_order.get("id")
            
            print(f"✅ 数据库订单创建成功 - 订单ID: {order_id}, 商户订单号: {out_trade_no}")
            
        except Exception as e:
            print(f"❌ 数据库订单创建失败: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"订单创建失败: {str(e)}"
            )
        
        # 5. 创建用于二维码的订单请求对象
        from models import CreateOrderRequest
        
        qr_order_request = CreateOrderRequest(
            name=subscription_request.subscription_name,
            amount=subscription_request.subscription_amount,
            payment_type="alipay",  # 二维码支付使用支付宝
            user_id=user_id
        )
        
        # 6. 调用支付服务生成二维码
        try:
            payment_result = await payment_service.create_payment(
                order_request=qr_order_request,
                out_trade_no=out_trade_no,
                client_ip=client_ip,
                device=device
            )
            
            print(f"✅ ZPay 二维码生成成功: {payment_result}")
            
        except Exception as e:
            print(f"❌ ZPay 二维码生成失败: {str(e)}")
            # 如果支付服务失败，删除已创建的订单记录（可选）
            raise HTTPException(
                status_code=500,
                detail=f"支付二维码生成失败: {str(e)}"
            )
        
        # 7. 更新订单记录，保存支付链接和二维码信息
        try:
            await database_service.update_order_payment_info(
                out_trade_no=out_trade_no,
                pay_url=payment_result.get("payurl"),
                qr_code=payment_result.get("qrcode"),
                zpay_trade_no=payment_result.get("zpay_trade_no")
            )
            
            print(f"✅ 订单支付信息更新成功")
            
        except Exception as e:
            print(f"⚠️ 订单支付信息更新失败: {str(e)}")
            # 这里不抛出异常，因为二维码已经生成成功
        
        # 8. 返回二维码支付响应
        return {
            "out_trade_no": out_trade_no,
            "subscription_type": subscription_request.subscription_type.value,
            "subscription_name": subscription_request.subscription_name,
            "amount": subscription_request.subscription_amount,
            "duration_days": subscription_request.subscription_duration_days,
            "qr_code": payment_result.get("qrcode"),
            "pay_url": payment_result.get("payurl"),
            "order_id": order_id,
            "status": "pending"
        }
        
    except HTTPException:
        # 重新抛出 HTTP 异常
        raise
    except Exception as e:
        print(f"❌ 创建订阅二维码订单时发生未知错误: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"服务器内部错误: {str(e)}"
        )

@app.get("/api/user/membership", response_model=UserMembershipStatus)
async def get_user_membership_status(current_user: dict = Depends(get_current_user)):
    """
    获取用户会员状态接口
    
    Args:
        current_user: 当前登录用户信息
        
    Returns:
        UserMembershipStatus: 用户会员状态信息
    """
    try:
        user_id = current_user['user_id']
        membership_status = await database_service.get_user_membership_status(user_id)
        
        if not membership_status:
            # 如果用户没有会员记录，返回默认免费状态
            return UserMembershipStatus(
                user_id=user_id,
                is_member=False,
                membership_type="free",
                membership_expires_at=None,
                days_remaining=0,
                is_lifetime_member=False
            )
        
        return UserMembershipStatus(
            user_id=user_id,
            is_member=membership_status.get("is_member", False),
            membership_type=membership_status.get("membership_type", "free"),
            membership_expires_at=membership_status.get("expires_at"),
            days_remaining=membership_status.get("days_remaining", 0),
            is_lifetime_member=membership_status.get("membership_type") == "lifetime"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"获取会员状态失败: {str(e)}"
        )

@app.get("/api/user/audio-access", response_model=UserAudioAccessResponse)
async def get_user_audio_access(current_user: dict = Depends(get_current_user)):
    """
    获取用户音频访问权限接口
    
    返回用户可以访问的音频列表，包括免费音频和付费音频
    
    Args:
        current_user: 当前登录用户信息
        
    Returns:
        UserAudioAccessResponse: 用户音频访问权限信息
    """
    try:
        user_id = current_user['user_id']
        audio_access_info = await database_service.get_user_audio_access(user_id)
        
        return UserAudioAccessResponse(**audio_access_info)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"获取音频访问权限失败: {str(e)}"
        )

@app.get("/api/audio/{audio_name}/check-access")
async def check_audio_access(
    audio_name: str,
    current_user: dict = Depends(get_current_user)
):
    """
    检查用户对特定音频的访问权限
    
    Args:
        audio_name: 音频文件名
        current_user: 当前登录用户信息
        
    Returns:
        dict: 访问权限信息
    """
    try:
        user_id = current_user['user_id']
        has_access = await database_service.check_audio_access_permission(user_id, audio_name)
        
        return {
            "audio_name": audio_name,
            "has_access": has_access,
            "user_id": user_id
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"检查音频访问权限失败: {str(e)}"
        )

@app.get("/api/subscription/pricing")
async def get_subscription_pricing():
    """
    获取订阅定价信息接口
    
    Returns:
        dict: 订阅定价信息
    """
    try:
        pricing_info = payment_service.get_subscription_pricing()
        return {
            "pricing": pricing_info,
            "currency": "CNY",
            "updated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"获取订阅定价失败: {str(e)}"
        )

# ===== 原有支付接口 =====

# 已删除跳转支付端点，只保留二维码支付功能

@app.post("/api/create_order", response_model=CreateOrderResponse)
async def create_order(
    request: Request,
    order_request: CreateOrderRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    创建支付订单接口
    
    功能流程：
    1. 验证用户身份和订单数据
    2. 生成唯一的商户订单号
    3. 在数据库中创建订单记录
    4. 调用 ZPay 创建支付订单
    5. 更新订单的支付信息
    6. 返回支付链接给前端
    
    Args:
        request: FastAPI Request 对象（用于获取客户端IP）
        order_request: 订单创建请求数据
        current_user: 当前登录用户信息
        
    Returns:
        CreateOrderResponse: 包含订单号和支付链接的响应
        
    Raises:
        HTTPException: 订单创建失败时抛出异常
    """
    try:
        # 1. 验证用户ID（确保用户只能为自己创建订单）
        if order_request.user_id != current_user['user_id']:
            raise HTTPException(
                status_code=403,
                detail="用户只能为自己创建订单"
            )
        
        # 2. 验证金额格式
        if not validate_amount(order_request.amount):
            raise HTTPException(
                status_code=400,
                detail="金额格式错误，必须大于0且最多两位小数"
            )
        
        # 3. 生成唯一的商户订单号
        out_trade_no = generate_order_number()
        
        # 4. 获取客户端IP地址
        client_ip = get_client_ip(request)
        
        # 5. 准备订单数据
        order_data = {
            "out_trade_no": out_trade_no,
            "user_id": order_request.user_id,
            "name": order_request.name,
            "amount": order_request.amount,
            "payment_type": order_request.payment_type,
            "status": "pending",
            "client_ip": client_ip,
            "device": "pc",  # 默认设备类型
            "params": {}  # 扩展参数
        }
        
        # 6. 在数据库中创建订单记录
        created_order = await database_service.create_order(order_data)
        
        # 7. 调用 ZPay 创建支付订单
        payment_result = await payment_service.create_payment(
            order_request=order_request,
            out_trade_no=out_trade_no,
            client_ip=client_ip,
            device="pc"
        )
        
        # 8. 更新订单的支付信息
        await database_service.update_order_payment_info(
            out_trade_no=out_trade_no,
            zpay_trade_no=payment_result.get("zpay_trade_no"),
            pay_url=payment_result.get("payurl"),
            qr_code=payment_result.get("qrcode"),
            status="pending"
        )
        
        # 9. 返回响应
        return CreateOrderResponse(
            out_trade_no=out_trade_no,
            payurl=payment_result.get("payurl"),
            qrcode=payment_result.get("qrcode"),
            status="pending"
        )
        
    except HTTPException:
        # 重新抛出 HTTP 异常
        raise
    except Exception as e:
        # 处理其他异常
        print(f"创建订单失败: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"订单创建失败: {str(e)}"
        )

@app.post("/api/payment/notify")
async def payment_notify(request: Request):
    """
    ZPay 支付通知回调接口
    
    这个接口用于接收 ZPay 的支付结果通知
    当用户完成支付后，ZPay 会调用这个接口
    支持普通支付和订阅支付的通知处理
    
    Args:
        request: FastAPI Request 对象
        
    Returns:
        str: 处理结果（"success" 表示成功）
    """
    try:
        # 获取通知数据
        if request.headers.get("content-type", "").startswith("application/json"):
            notification_data = await request.json()
        else:
            # ZPay 通常使用 form-data 格式
            form_data = await request.form()
            notification_data = dict(form_data)
        
        print(f"收到支付通知: {notification_data}")
        
        # 验证通知签名
        if not payment_service.verify_notification(notification_data):
            print("支付通知签名验证失败")
            raise HTTPException(status_code=400, detail="签名验证失败")
        
        # 获取订单号和交易状态
        out_trade_no = notification_data.get("out_trade_no")
        trade_status = notification_data.get("trade_status", "")
        
        if not out_trade_no:
            raise HTTPException(status_code=400, detail="缺少订单号")
        
        # 根据交易状态更新订单
        if trade_status.upper() in ["SUCCESS", "TRADE_SUCCESS", "PAID"]:
            # 支付成功
            await database_service.update_order_status(out_trade_no, "paid")
            print(f"订单 {out_trade_no} 支付成功")
            
            # 🎯 添加会员状态更新逻辑
            order = await database_service.get_order_by_trade_no(out_trade_no)
            if order and order.get('order_type') == 'subscription':
                await update_user_membership_status(order)
                print(f"✅ 用户会员状态已更新")
        elif trade_status.upper() in ["FAILED", "TRADE_FAILED"]:
            # 支付失败
            await database_service.update_order_status(out_trade_no, "failed")
            print(f"订单 {out_trade_no} 支付失败")
        
        # 返回成功响应给 ZPay
        return "success"
        
    except Exception as e:
        print(f"处理支付通知失败: {str(e)}")
        raise HTTPException(status_code=500, detail="处理支付通知失败")


@app.get("/notify_url")
async def zpay_notify_url(request: Request):
    """
    ZPay 异步通知接口（GET 请求）
    
    ZPay 支付完成后，会通过 GET 请求发送支付通知到这个接口
    这个接口负责验证签名、检查支付状态并更新订单状态
    
    ZPay 通知参数:
    - pid: 商户ID
    - name: 商品名称
    - money: 订单金额（单位：元）
    - out_trade_no: 我方生成的订单编号
    - trade_no: ZPay 内部订单号
    - param: 扩展字段（可忽略）
    - trade_status: 支付状态（仅 TRADE_SUCCESS 表示成功）
    - type: 支付方式（如 alipay）
    - sign: 签名字符串（必须校验）
    - sign_type: 签名算法（固定为 MD5）
    
    Returns:
        str: 处理结果（"success" 表示成功）
    """
    try:
        # 从环境变量获取商户密钥
        merchant_key = os.getenv("ZPAY_MERCHANT_KEY")
        if not merchant_key:
            print("❌ 缺少 ZPay 商户密钥配置")
            return "fail"
        
        # 获取所有 GET 参数
        query_params = dict(request.query_params)
        
        print(f"🔔 收到 ZPay 异步通知 (GET): {query_params}")
        
        # 检查必要参数
        required_params = ["pid", "out_trade_no", "trade_status", "money", "sign"]
        for param in required_params:
            if param not in query_params:
                print(f"❌ 缺少必要参数: {param}")
                return "fail"
        
        # 提取关键参数
        pid = query_params.get("pid")
        out_trade_no = query_params.get("out_trade_no")
        trade_status = query_params.get("trade_status")
        money = query_params.get("money")
        trade_no = query_params.get("trade_no")
        sign = query_params.get("sign")
        sign_type = query_params.get("sign_type", "MD5")
        name = query_params.get("name", "")
        payment_type = query_params.get("type", "alipay")
        
        print(f"📋 订单号: {out_trade_no}")
        print(f"💰 金额: {money}")
        print(f"📊 支付状态: {trade_status}")
        print(f"🔍 ZPay 交易号: {trade_no}")
        print(f"🔐 签名类型: {sign_type}")
        
        # 1. 验证签名
        if not verify_md5_signature(query_params, merchant_key, sign):
            print("❌ 签名验证失败")
            return "fail"
        
        print("✅ 签名验证通过")
        
        # 2. 检查支付状态
        if trade_status != "TRADE_SUCCESS":
            print(f"❌ 支付状态不是成功: {trade_status}")
            return "fail"
        
        print("✅ 支付状态检查通过")
        
        # 3. 查询数据库中的订单
        order = await database_service.get_order_by_trade_no(out_trade_no)
        if not order:
            print(f"❌ 订单不存在: {out_trade_no}")
            return "fail"
        
        print(f"✅ 找到订单: {order['status']}")
        
        # 4. 检查订单状态（幂等性处理）
        if order['status'] == 'paid':
            print(f"✅ 订单已支付，跳过处理（幂等）")
            return "success"
        
        # 5. 验证金额
        try:
            notification_amount = float(money)
            order_amount = float(order['amount'])
            
            # 允许小数点精度误差（0.01元）
            if abs(notification_amount - order_amount) > 0.01:
                print(f"❌ 金额不匹配 - 通知金额: {notification_amount}, 订单金额: {order_amount}")
                return "fail"
        except (ValueError, TypeError) as e:
            print(f"❌ 金额格式错误: {e}")
            return "fail"
        
        print("✅ 金额验证通过")
        
        # 6. 更新订单状态
        if order['status'] == 'pending':
            success = await database_service.update_order_status(out_trade_no, "paid")
            if success:
                print(f"✅ 订单 {out_trade_no} 状态更新为已支付")
                
                # 🎯 添加会员状态更新逻辑
                if order.get('order_type') == 'subscription':
                    await update_user_membership_status(order)
                    print(f"✅ 用户会员状态已更新")
            else:
                print(f"❌ 订单 {out_trade_no} 状态更新失败")
                return "fail"
        else:
            print(f"⚠️ 订单状态不是 pending，当前状态: {order['status']}")
            return "fail"
        
        # 7. 返回成功响应
        print(f"🎉 ZPay 异步通知处理成功 - 订单: {out_trade_no}")
        return "success"
        
    except Exception as e:
        print(f"❌ 处理 ZPay 异步通知异常: {str(e)}")
        return "fail"


@app.get("/return_url")
async def zpay_return_url(request: Request):
    """
    ZPay 支付完成跳转接口（GET 请求）
    
    用户支付完成后，ZPay 会自动跳转到这个页面
    这个接口仅用于展示支付结果，不进行业务逻辑处理
    真正的订单状态更新由 /notify_url 异步通知接口处理
    
    ZPay 跳转参数与异步通知参数相同，但这里主要用于展示
    
    Returns:
        dict: 支付结果页面数据
    """
    try:
        # 获取所有 GET 参数
        query_params = dict(request.query_params)
        
        print(f"🔄 用户支付完成跳转: {query_params}")
        
        # 提取关键参数
        out_trade_no = query_params.get("out_trade_no", "")
        trade_status = query_params.get("trade_status", "")
        money = query_params.get("money", "0")
        name = query_params.get("name", "商品")
        trade_no = query_params.get("trade_no", "")
        
        # 确定支付结果
        payment_success = trade_status == "TRADE_SUCCESS"
        
        # 构造响应数据（供前端展示使用）
        result = {
            "success": payment_success,
            "message": "支付成功" if payment_success else "支付失败",
            "order_info": {
                "out_trade_no": out_trade_no,
                "name": name,
                "amount": money,
                "zpay_trade_no": trade_no,
                "status": "已支付" if payment_success else "支付失败"
            },
            "redirect_info": {
                "show_success_page": payment_success,
                "auto_close_seconds": 5 if payment_success else 0,
                "continue_url": "/dashboard" if payment_success else "/payment"
            }
        }
        
        print(f"🎯 支付跳转结果: 订单 {out_trade_no} - {'成功' if payment_success else '失败'}")
        
        return result
        
    except Exception as e:
        print(f"❌ 处理支付跳转异常: {str(e)}")
        return {
            "success": False,
            "message": "处理支付结果时发生错误",
            "order_info": {},
            "redirect_info": {
                "show_success_page": False,
                "auto_close_seconds": 0,
                "continue_url": "/payment"
            }
        }

@app.get("/api/orders")
async def get_user_orders(
    page: int = 1,
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    """
    获取用户订单列表
    
    Args:
        page: 页码（从1开始）
        limit: 每页数量
        current_user: 当前用户信息
        
    Returns:
        dict: 包含订单列表和分页信息的响应
    """
    try:
        offset = (page - 1) * limit
        orders = await database_service.get_user_orders(
            user_id=current_user['user_id'],
            limit=limit,
            offset=offset
        )
        
        return {
            "orders": orders,
            "page": page,
            "limit": limit,
            "total": len(orders)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"获取订单列表失败: {str(e)}"
        )

@app.get("/api/get_order_status/{out_trade_no}")
async def get_order_status(
    out_trade_no: str,
    current_user: dict = Depends(get_current_user)
):
    """
    查询订单状态接口
    
    Args:
        out_trade_no: 商户订单号
        current_user: 当前用户信息
        
    Returns:
        dict: 订单状态信息
        
    Raises:
        HTTPException: 订单不存在或无权限查看时抛出异常
    """
    try:
        # 查询订单信息
        order = await database_service.get_order_by_trade_no(out_trade_no)
        
        if not order:
            raise HTTPException(
                status_code=404,
                detail="订单不存在"
            )
        
        # 验证用户权限（只能查看自己的订单）
        if order['user_id'] != current_user['user_id']:
            raise HTTPException(
                status_code=403,
                detail="无权限查看此订单"
            )
        
        # 返回订单状态信息
        return {
            "out_trade_no": order['out_trade_no'],
            "status": order['status'],
            "name": order['name'],
            "amount": float(order['amount']),
            "payment_type": order['payment_type'],
            "created_at": order['created_at'],
            "paid_at": order.get('paid_at'),
            "qr_code": order.get('qr_code'),
            "pay_url": order.get('pay_url')
        }
        
    except HTTPException:
        # 重新抛出 HTTP 异常
        raise
    except Exception as e:
        print(f"查询订单状态失败: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"查询订单状态失败: {str(e)}"
        )

@app.get("/api/user/profile")
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """
    获取用户个人资料
    
    实际项目中，你可以根据user_id从数据库查询用户详细信息
    """
    user_id = current_user['user_id']
    
    # 这里你可以添加数据库查询逻辑
    # 例如：user_data = await database.fetch_user_profile(user_id)
    
    return {
        "user_id": user_id,
        "email": current_user['email'],
        "profile": {
            "nickname": "用户昵称",
            "avatar": "头像URL",
            "created_at": "2024-01-01T00:00:00Z"
        }
    }

@app.post("/api/user/profile")
async def update_user_profile(
    profile_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """
    更新用户个人资料
    """
    user_id = current_user['user_id']
    
    # 这里你可以添加数据库更新逻辑
    # 例如：await database.update_user_profile(user_id, profile_data)
    
    return {
        "message": "个人资料更新成功",
        "user_id": user_id,
        "updated_data": profile_data
    }

# 🎯 会员状态更新函数
async def update_user_membership_status(order: dict):
    """
    更新用户会员状态
    
    Args:
        order: 订单信息字典
    """
    try:
        user_id = order.get('user_id')
        subscription_type = order.get('subscription_type')
        subscription_duration_days = order.get('subscription_duration_days')
        
        if not user_id or not subscription_type:
            print(f"❌ 会员状态更新失败: 缺少必要信息 user_id={user_id}, subscription_type={subscription_type}")
            return
        
        print(f"🔄 开始更新用户会员状态: user_id={user_id}, type={subscription_type}")
        
        # 获取Supabase客户端
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            print("❌ 缺少Supabase配置，无法更新会员状态")
            return
        
        # 使用httpx调用Supabase REST API
        headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}",
            "Content-Type": "application/json"
        }
        
        # 获取当前会员状态
        async with httpx.AsyncClient() as client:
            # 查询现有会员状态
            response = await client.get(
                f"{supabase_url}/rest/v1/user_memberships?user_id=eq.{user_id}&select=*",
                headers=headers
            )
            
            current_membership = None
            if response.status_code == 200:
                data = response.json()
                if data:
                    current_membership = data[0]
        
        from datetime import datetime, timedelta
        now = datetime.utcnow()
        
        # 准备会员数据
        membership_data = {
            "user_id": user_id,
            "membership_type": subscription_type,
            "last_subscription_order_id": order.get('id')
        }
        
        if subscription_type == 'lifetime':
            # 永久会员
            membership_data.update({
                "is_lifetime_member": True,
                "membership_expires_at": None,
                "membership_started_at": now.isoformat()
            })
        else:
            # 计算新的到期时间
            duration_days = subscription_duration_days or 30
            
            if current_membership and current_membership.get('membership_expires_at'):
                try:
                    current_expires = datetime.fromisoformat(current_membership['membership_expires_at'].replace('Z', '+00:00'))
                    if current_expires > now:
                        # 当前会员还未到期，延期
                        new_expires_at = current_expires + timedelta(days=duration_days)
                    else:
                        # 当前会员已到期，从现在开始
                        new_expires_at = now + timedelta(days=duration_days)
                except:
                    # 解析失败，从现在开始
                    new_expires_at = now + timedelta(days=duration_days)
            else:
                # 新会员，从现在开始
                new_expires_at = now + timedelta(days=duration_days)
            
            membership_data.update({
                "membership_expires_at": new_expires_at.isoformat(),
                "is_lifetime_member": False,
                "membership_started_at": current_membership.get('membership_started_at') if current_membership else now.isoformat()
            })
        
        # 使用upsert更新或插入会员信息
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{supabase_url}/rest/v1/user_memberships",
                headers={**headers, "Prefer": "resolution=merge-duplicates"},
                json=membership_data
            )
            
            if response.status_code in [200, 201]:
                print(f"✅ 用户 {user_id} 会员状态更新成功: {subscription_type}")
            else:
                print(f"❌ 更新会员状态失败: {response.status_code} - {response.text}")
                
    except Exception as e:
        print(f"❌ 处理会员状态更新失败: {str(e)}")

if __name__ == "__main__":
    # 运行服务器
    uvicorn.run(app, host="0.0.0.0", port=8000)


# ===== 调试接口 =====

@app.get("/debug/database-connection")
async def debug_database_connection():
    """
    测试数据库连接状态
    """
    try:
        # 测试 Supabase 连接
        result = database_service.supabase.table("orders").select("count", count="exact").execute()
        
        return {
            "status": "success",
            "message": "数据库连接正常",
            "orders_count": result.count,
            "supabase_url": database_service.supabase_url,
            "connection_status": "connected"
        }
    except Exception as e:
        return {
            "status": "error", 
            "message": f"数据库连接失败: {str(e)}",
            "error_type": type(e).__name__
        }


@app.get("/debug/all-orders")
async def debug_get_all_orders():
    """
    获取所有订单（调试用）
    """
    try:
        result = database_service.supabase.table("orders").select("*").order("created_at", desc=True).limit(50).execute()
        
        return {
            "status": "success",
            "total_orders": len(result.data),
            "orders": result.data
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"获取订单失败: {str(e)}"
        }


@app.post("/debug/create-test-order")
async def debug_create_test_order(current_user: dict = Depends(get_current_user)):
    """
    创建测试订单（调试用）
    """
    try:
        # 生成测试订单数据
        out_trade_no = generate_order_number()
        
        order_data = {
            "out_trade_no": out_trade_no,
            "user_id": current_user['user_id'],
            "name": "测试订单",
            "amount": 0.01,  # 1分钱测试
            "payment_type": "alipay",
            "status": "pending",
            "client_ip": "127.0.0.1",
            "device": "pc",
            "params": {"debug": True}
        }
        
        # 创建订单
        created_order = await database_service.create_order(order_data)
        
        return {
            "status": "success",
            "message": "测试订单创建成功",
            "order": created_order,
            "user_id": current_user['user_id']
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"创建测试订单失败: {str(e)}",
            "user_id": current_user.get('user_id', 'unknown')
        }


@app.get("/debug/user-orders/{user_id}")
async def debug_get_user_orders(user_id: str):
    """
    根据用户ID获取所有订单（调试用）
    """
    try:
        result = database_service.supabase.table("orders").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        
        return {
            "status": "success",
            "user_id": user_id,
            "orders_count": len(result.data),
            "orders": result.data
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"获取用户订单失败: {str(e)}"
        }


@app.get("/debug/current-user-info")
async def debug_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    获取当前用户信息（调试用）
    """
    return {
        "status": "success",
        "user_info": current_user,
        "user_id": current_user.get('user_id'),
        "email": current_user.get('email')
    }


@app.post("/debug/manual-create-paid-order")
async def debug_manual_create_paid_order(
    order_info: dict,
    current_user: dict = Depends(get_current_user)
):
    """
    手动创建已支付的订单（用于补救已支付但没有订单记录的情况）
    
    请求格式:
    {
        "name": "商品名称",
        "amount": 29.99,
        "payment_type": "alipay",
        "zpay_trade_no": "ZPay交易号"
    }
    """
    try:
        # 验证必要字段
        required_fields = ["name", "amount"]
        for field in required_fields:
            if field not in order_info:
                return {
                    "status": "error",
                    "message": f"缺少必要字段: {field}"
                }
        
        # 生成订单号
        out_trade_no = generate_order_number()
        
        # 准备订单数据
        order_data = {
            "out_trade_no": out_trade_no,
            "user_id": current_user['user_id'],
            "name": order_info["name"],
            "amount": float(order_info["amount"]),
            "payment_type": order_info.get("payment_type", "alipay"),
            "status": "paid",  # 直接设置为已支付
            "client_ip": "127.0.0.1",
            "device": "pc",
            "params": {"manual_create": True, "reason": "补救已支付订单"}
        }
        
        # 创建订单
        created_order = await database_service.create_order(order_data)
        
        # 如果有 ZPay 交易号，更新订单信息
        if order_info.get("zpay_trade_no"):
            await database_service.update_order_payment_info(
                out_trade_no=out_trade_no,
                zpay_trade_no=order_info["zpay_trade_no"],
                status="paid"
            )
        
        # 手动设置支付时间
        from datetime import datetime
        update_result = database_service.supabase.table("orders").update({
            "paid_at": datetime.now().isoformat()
        }).eq("out_trade_no", out_trade_no).execute()
        
        return {
            "status": "success",
            "message": "手动创建已支付订单成功",
            "order": created_order,
            "out_trade_no": out_trade_no,
            "note": "这是手动创建的补救订单"
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"手动创建订单失败: {str(e)}"
        } 