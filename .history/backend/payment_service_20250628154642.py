"""
支付服务 - 处理与 ZPay 的交互
"""
import os
import httpx
from typing import Dict, Optional, Any
from models import ZPayRequest, ZPayResponse, CreateOrderRequest, GetPaymentUrlRequest, CreateSubscriptionOrderRequest
from utils import generate_md5_signature, normalize_payment_type


class PaymentService:
    """支付服务类"""
    
    def __init__(self):
        """初始化支付服务"""
        # 从环境变量读取 ZPay 配置（只保留二维码支付所需配置）
        self.zpay_url = "https://zpayz.cn/mapi.php"
        self.merchant_id = os.getenv("ZPAY_MERCHANT_ID")
        self.merchant_key = os.getenv("ZPAY_MERCHANT_KEY") 
        self.notify_url = os.getenv("ZPAY_NOTIFY_URL", "")
        
        if not self.merchant_id or not self.merchant_key:
            raise ValueError("缺少 ZPay 配置信息，请检查环境变量")
    
# 已删除订阅跳转支付方法，只保留二维码支付
    
# 已删除通用跳转支付方法，只保留二维码支付
    
    def get_subscription_pricing(self) -> Dict[str, Dict[str, Any]]:
        """
        获取订阅定价信息
        
        Returns:
            Dict[str, Dict[str, Any]]: 订阅定价信息
        """
        return {
            "3_months": {
                "name": "HERHZZZ 3个月会员",
                "duration_days": 90,
                "price": 29.99,
                "description": "3个月畅享全部高品质睡眠音频",
                "features": [
                    "解锁全部周期音频",
                    "高品质音频体验",
                    "个性化推荐",
                    "无广告畅听"
                ]
            },
            "1_year": {
                "name": "HERHZZZ 1年会员",
                "duration_days": 365,
                "price": 99.99,
                "description": "1年畅享全部高品质睡眠音频，更超值",
                "features": [
                    "解锁全部周期音频",
                    "高品质音频体验", 
                    "个性化推荐",
                    "无广告畅听",
                    "优先客服支持",
                    "新功能抢先体验"
                ],
                "savings": "相比3个月会员节省17%"
            },
            "lifetime": {
                "name": "HERHZZZ 永久会员",
                "duration_days": None,
                "price": 299.99,
                "description": "一次购买，终身畅享所有功能",
                "features": [
                    "永久解锁全部音频",
                    "高品质音频体验",
                    "个性化推荐",
                    "无广告畅听",
                    "优先客服支持",
                    "新功能抢先体验",
                    "终身免费更新",
                    "专属会员标识"
                ],
                "savings": "相比年费会员节省75%"
            }
        }
    
    def _prepare_zpay_params(
        self, 
        order_request: CreateOrderRequest,
        out_trade_no: str,
        client_ip: str,
        device: str = "pc"
    ) -> Dict[str, Any]:
        """
        准备 ZPay 请求参数
        
        Args:
            order_request: 订单请求数据
            out_trade_no: 商户订单号
            client_ip: 客户端IP
            device: 设备类型
            
        Returns:
            Dict[str, Any]: ZPay 请求参数
        """
        params = {
            "pid": self.merchant_id,
            "type": order_request.payment_type,  # alipay, wechat, union
            "out_trade_no": out_trade_no,
            "notify_url": self.notify_url,
            "name": order_request.name,
            "money": f"{order_request.amount:.2f}",  # 确保两位小数
            "clientip": client_ip,
            "device": device,
            "param": "",  # 业务扩展参数，暂时留空
            "sign_type": "MD5"
        }
        
        return params
    
    async def create_payment(
        self, 
        order_request: CreateOrderRequest,
        out_trade_no: str,
        client_ip: str,
        device: str = "pc"
    ) -> Dict[str, Any]:
        """
        创建支付订单
        
        Args:
            order_request: 订单请求数据
            out_trade_no: 商户订单号
            client_ip: 客户端IP
            device: 设备类型
            
        Returns:
            Dict[str, Any]: 支付响应数据
            
        Raises:
            Exception: 支付创建失败时抛出异常
        """
        try:
            # 准备请求参数
            params = self._prepare_zpay_params(
                order_request, out_trade_no, client_ip, device
            )
            
            # 生成签名
            params["sign"] = generate_md5_signature(params, self.merchant_key)
            
            # 发送请求到 ZPay
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.zpay_url,
                    data=params,
                    headers={
                        "Content-Type": "application/x-www-form-urlencoded",
                        "User-Agent": "HERHZZZ-Payment/1.0"
                    }
                )
                
                # 检查 HTTP 状态码
                response.raise_for_status()
                
                # 解析响应
                result = response.json()
                
                # 验证响应格式
                if not isinstance(result, dict):
                    raise Exception("ZPay 返回数据格式错误")
                
                # 检查业务状态码
                code = result.get("code", -1)
                if code != 1:  # ZPay 成功状态码通常是 1
                    error_msg = result.get("msg", "支付订单创建失败")
                    raise Exception(f"ZPay 错误: {error_msg}")
                
                return {
                    "code": code,
                    "msg": result.get("msg", ""),
                    "payurl": result.get("payurl"),
                    "qrcode": result.get("qrcode", result.get("img")),  # 兼容不同字段名
                    "zpay_trade_no": result.get("trade_no")  # 如果有返回交易号
                }
                
        except httpx.TimeoutException:
            raise Exception("ZPay 请求超时，请稍后重试")
        except httpx.HTTPStatusError as e:
            raise Exception(f"ZPay 服务异常: HTTP {e.response.status_code}")
        except Exception as e:
            if "ZPay 错误" in str(e):
                raise e
            else:
                raise Exception(f"支付服务异常: {str(e)}")
    
    def verify_notification(self, notification_data: Dict[str, Any]) -> bool:
        """
        验证 ZPay 支付通知的签名
        
        Args:
            notification_data: 通知数据
            
        Returns:
            bool: 签名是否有效
        """
        try:
            received_sign = notification_data.get("sign", "")
            if not received_sign:
                return False
            
            # 生成预期的签名
            expected_sign = generate_md5_signature(notification_data, self.merchant_key)
            
            # 比较签名（不区分大小写）
            return received_sign.lower() == expected_sign.lower()
            
        except Exception as e:
            print(f"验证支付通知签名失败: {str(e)}")
            return False
    
    def get_payment_type_name(self, payment_type: str) -> str:
        """
        获取支付方式的中文名称
        
        Args:
            payment_type: 支付方式代码
            
        Returns:
            str: 支付方式中文名称
        """
        type_map = {
            "alipay": "支付宝",
            "wxpay": "微信支付",
            "wechat": "微信支付", 
            "union": "银联支付"
        }
        return type_map.get(payment_type, payment_type) 