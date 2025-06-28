"""
支付系统工具函数
"""
import hashlib
import uuid
from typing import Dict, Any
from datetime import datetime


def generate_md5_signature(params: Dict[str, Any], key: str) -> str:
    """
    生成 ZPay MD5 签名
    
    Args:
        params: 请求参数字典
        key: 商户密钥
        
    Returns:
        str: MD5 签名（小写）
        
    ZPay MD5签名算法：
    1. 将所有参数按照参数名ASCII码从小到大排序（a-z）
    2. sign、sign_type、和空值不参与签名
    3. 将排序后的参数拼接成URL键值对格式：a=b&c=d&e=f
    4. 拼接商户密钥：a=b&c=d&e=f + KEY
    5. MD5加密得出签名（小写）
    """
    # 过滤掉 sign、sign_type 和空值
    filtered_params = {}
    for k, v in params.items():
        if k not in ['sign', 'sign_type'] and v is not None and v != '':
            filtered_params[k] = str(v)
    
    # 按照参数名ASCII码排序
    sorted_keys = sorted(filtered_params.keys())
    
    # 拼接成 URL 键值对格式
    param_string = '&'.join([f"{key}={filtered_params[key]}" for key in sorted_keys])
    
    # 拼接商户密钥
    sign_string = param_string + key
    
    # MD5 加密（小写）
    md5_hash = hashlib.md5(sign_string.encode('utf-8')).hexdigest().lower()
    
    return md5_hash


def generate_order_number() -> str:
    """
    生成唯一的商户订单号
    
    Returns:
        str: 格式为 YYYYMMDD-HHMMSS-UUID前8位 的订单号
    """
    now = datetime.now()
    date_part = now.strftime("%Y%m%d")
    time_part = now.strftime("%H%M%S")
    uuid_part = str(uuid.uuid4()).replace('-', '')[:8].upper()
    
    return f"{date_part}-{time_part}-{uuid_part}"


def get_client_ip(request) -> str:
    """
    获取客户端真实IP地址
    
    Args:
        request: FastAPI Request 对象
        
    Returns:
        str: 客户端IP地址
    """
    # 优先获取代理服务器转发的真实IP
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    # 回退到直接连接的IP
    return request.client.host if request.client else "127.0.0.1"


def validate_amount(amount: float) -> bool:
    """
    验证金额格式（最多两位小数，大于0）
    
    Args:
        amount: 金额
        
    Returns:
        bool: 是否为有效金额
    """
    if amount <= 0:
        return False
    
    # 检查小数位数不超过2位
    amount_str = f"{amount:.10f}".rstrip('0').rstrip('.')
    if '.' in amount_str:
        decimal_places = len(amount_str.split('.')[1])
        return decimal_places <= 2
    
    return True 