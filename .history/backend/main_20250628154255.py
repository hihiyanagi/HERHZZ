from fastapi import FastAPI, HTTPException, Depends, Security, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
import jwt
import os
from typing import Optional
from datetime import datetime
import uvicorn
from dotenv import load_dotenv

# 导入我们的模型和服务
from models import (
    CreateOrderRequest, CreateOrderResponse, PaymentNotification, 
    GetPaymentUrlRequest, GetPaymentUrlResponse,
    CreateSubscriptionOrderRequest, CreateSubscriptionOrderResponse,
    UserMembershipStatus, UserAudioAccessResponse
)
from database_service import DatabaseService
from payment_service import PaymentService
from utils import generate_order_number, get_client_ip, validate_amount

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
    
    try:
        # 使用Supabase JWT密钥验证和解码Token
        # jwt.decode会验证：
        # 1. Token签名是否正确
        # 2. Token是否过期
        # 3. Token格式是否正确
        payload = jwt.decode(
            token, 
            SUPABASE_JWT_SECRET, 
            algorithms=["HS256"]  # Supabase使用HS256算法
        )
        
        # 检查Token是否过期（双重验证）
        if payload.get('exp') and payload['exp'] < datetime.utcnow().timestamp():
            raise HTTPException(
                status_code=401, 
                detail="Token已过期"
            )
            
        return payload
        
    except jwt.ExpiredSignatureError:
        # Token过期
        raise HTTPException(
            status_code=401, 
            detail="Token已过期，请重新登录"
        )
    except jwt.InvalidTokenError:
        # Token无效（签名错误、格式错误等）
        raise HTTPException(
            status_code=401, 
            detail="Token无效，请重新登录"
        )
    except Exception as e:
        # 其他错误
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

@app.post("/api/create_subscription_order", response_model=CreateSubscriptionOrderResponse)
async def create_subscription_order(
    request: Request,
    subscription_request: CreateSubscriptionOrderRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    创建订阅订单接口
    
    功能流程：
    1. 验证用户身份和订阅数据
    2. 生成唯一的商户订单号
    3. 在数据库中创建订阅订单记录
    4. 生成 ZPay 页面跳转支付链接
    5. 更新订单的支付链接信息
    6. 返回跳转链接给前端
    
    Args:
        request: FastAPI Request 对象
        subscription_request: 订阅请求数据
        current_user: 当前登录用户信息
        
    Returns:
        CreateSubscriptionOrderResponse: 包含订单号和支付跳转链接的响应
        
    Raises:
        HTTPException: 生成失败时抛出异常
    """
    try:
        # 1. 从请求中获取用户ID，如果没有则使用当前登录用户ID
        user_id = subscription_request.user_id or current_user['user_id']
        
        # 2. 验证用户权限（用户只能为自己创建订阅）
        if user_id != current_user['user_id']:
            raise HTTPException(
                status_code=403,
                detail="用户只能为自己创建订阅"
            )
        
        # 3. 生成唯一的商户订单号
        out_trade_no = generate_order_number()
        
        # 4. 获取客户端IP地址
        client_ip = get_client_ip(request)
        
        # 5. 准备订阅订单数据
        subscription_order_data = {
            "out_trade_no": out_trade_no,
            "user_id": user_id,
            "name": subscription_request.subscription_name,
            "amount": subscription_request.subscription_amount,
            "payment_type": subscription_request.payment_type,
            "status": "pending",
            "order_type": "subscription",
            "subscription_type": subscription_request.subscription_type.value,
            "subscription_duration_days": subscription_request.subscription_duration_days,
            "client_ip": client_ip,
            "device": "pc",
            "params": {
                "return_url": subscription_request.return_url,
                "subscription_info": {
                    "type": subscription_request.subscription_type.value,
                    "name": subscription_request.subscription_name,
                    "duration_days": subscription_request.subscription_duration_days
                }
            }
        }
        
        # 6. 在数据库中创建订阅订单记录
        created_order = await database_service.create_subscription_order(subscription_order_data)
        
        # 7. 生成支付跳转链接
        jump_url = payment_service.generate_subscription_payment_jump_url(
            request=subscription_request,
            out_trade_no=out_trade_no,
            custom_return_url=subscription_request.return_url
        )
        
        # 8. 更新订单的支付链接信息
        await database_service.update_order_payment_info(
            out_trade_no=out_trade_no,
            pay_url=jump_url,
            status="pending"
        )
        
        # 9. 返回响应
        return CreateSubscriptionOrderResponse(
            out_trade_no=out_trade_no,
            pay_url=jump_url,
            subscription_type=subscription_request.subscription_type.value,
            subscription_name=subscription_request.subscription_name,
            amount=subscription_request.subscription_amount,
            duration_days=subscription_request.subscription_duration_days,
            status="pending"
        )
        
    except HTTPException:
        # 重新抛出 HTTP 异常
        raise
    except Exception as e:
        # 处理其他异常
        print(f"创建订阅订单失败: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"创建订阅订单失败: {str(e)}"
        )

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
            order_id = await database_service.create_subscription_order(
                out_trade_no=out_trade_no,
                user_id=user_id,
                subscription_type=subscription_request.subscription_type.value,
                subscription_name=subscription_request.subscription_name,
                subscription_amount=subscription_request.subscription_amount,
                subscription_duration_days=subscription_request.subscription_duration_days,
                payment_type=subscription_request.payment_type,
                client_ip=client_ip,
                device=device
            )
            
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

@app.post("/api/get_payment_url", response_model=GetPaymentUrlResponse)
async def get_payment_url(
    request: Request,
    payment_request: GetPaymentUrlRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    获取支付跳转链接接口
    
    功能流程：
    1. 验证用户身份和支付数据
    2. 生成唯一的商户订单号
    3. 在数据库中创建订单记录（状态为 pending）
    4. 生成 ZPay 页面跳转支付链接
    5. 更新订单的支付链接信息
    6. 返回跳转链接给前端
    
    Args:
        request: FastAPI Request 对象
        payment_request: 支付请求数据
        current_user: 当前登录用户信息
        
    Returns:
        GetPaymentUrlResponse: 包含订单号和支付跳转链接的响应
        
    Raises:
        HTTPException: 生成失败时抛出异常
    """
    try:
        # 1. 从请求中获取用户ID，如果没有则使用当前登录用户ID
        user_id = payment_request.user_id or current_user['user_id']
        
        # 2. 验证用户权限（可选：如果允许用户为他人创建订单，可以跳过此检查）
        if user_id != current_user['user_id']:
            # 这里可以添加更复杂的权限验证逻辑
            # 例如：检查是否为管理员、是否有代付权限等
            pass
        
        # 3. 验证金额格式
        if not validate_amount(payment_request.amount):
            raise HTTPException(
                status_code=400,
                detail="金额格式错误，必须大于0且最多两位小数"
            )
        
        # 4. 生成唯一的商户订单号
        out_trade_no = generate_order_number()
        
        # 5. 获取客户端IP地址
        client_ip = get_client_ip(request)
        
        # 6. 准备订单数据
        order_data = {
            "out_trade_no": out_trade_no,
            "user_id": user_id,
            "name": payment_request.name,
            "amount": payment_request.amount,
            "payment_type": payment_request.payment_type,
            "status": "pending",
            "client_ip": client_ip,
            "device": "pc",  # 默认设备类型
            "params": {
                "return_url": payment_request.return_url
            } if payment_request.return_url else {}
        }
        
        # 7. 在数据库中创建订单记录
        created_order = await database_service.create_order(order_data)
        
        # 8. 生成支付跳转链接
        jump_url = payment_service.generate_payment_jump_url(
            request=payment_request,
            out_trade_no=out_trade_no,
            custom_return_url=payment_request.return_url
        )
        
        # 9. 更新订单的支付链接信息
        await database_service.update_order_payment_info(
            out_trade_no=out_trade_no,
            pay_url=jump_url,
            status="pending"
        )
        
        # 10. 返回响应
        return GetPaymentUrlResponse(
            out_trade_no=out_trade_no,
            pay_url=jump_url,
            status="pending"
        )
        
    except HTTPException:
        # 重新抛出 HTTP 异常
        raise
    except Exception as e:
        # 处理其他异常
        print(f"生成支付链接失败: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"生成支付链接失败: {str(e)}"
        )

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
        elif trade_status.upper() in ["FAILED", "TRADE_FAILED"]:
            # 支付失败
            await database_service.update_order_status(out_trade_no, "failed")
            print(f"订单 {out_trade_no} 支付失败")
        
        # 返回成功响应给 ZPay
        return "success"
        
    except Exception as e:
        print(f"处理支付通知失败: {str(e)}")
        raise HTTPException(status_code=500, detail="处理支付通知失败")

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

if __name__ == "__main__":
    # 运行服务器
    uvicorn.run(app, host="0.0.0.0", port=8000) 