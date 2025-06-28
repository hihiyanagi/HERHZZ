"""
支付系统 Pydantic 模型定义
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, Literal, List
from datetime import datetime, timedelta
from decimal import Decimal
from enum import Enum


class CreateOrderRequest(BaseModel):
    """创建订单请求模型"""
    name: str = Field(..., min_length=1, max_length=100, description="商品名称")
    amount: float = Field(..., gt=0, description="金额（单位：元）")
    payment_type: Literal["alipay", "wechat", "union"] = Field(..., description="支付方式")
    user_id: str = Field(..., description="用户ID")
    
    @validator('amount')
    def validate_amount(cls, v):
        """验证金额格式"""
        if v <= 0:
            raise ValueError('金额必须大于0')
        
        # 检查小数位数不超过2位
        amount_str = f"{v:.10f}".rstrip('0').rstrip('.')
        if '.' in amount_str:
            decimal_places = len(amount_str.split('.')[1])
            if decimal_places > 2:
                raise ValueError('金额最多支持两位小数')
        
        return round(v, 2)  # 确保只保留两位小数


class CreateOrderResponse(BaseModel):
    """创建订单响应模型"""
    out_trade_no: str = Field(..., description="商户订单号")
    payurl: Optional[str] = Field(None, description="支付链接")
    qrcode: Optional[str] = Field(None, description="二维码链接")
    status: str = Field(default="pending", description="订单状态")


# 已删除跳转支付相关的请求和响应模型


# ===== 会员订阅系统模型 =====

class SubscriptionType(str, Enum):
    """订阅类型枚举"""
    THREE_MONTHS = "3_months"
    ONE_YEAR = "1_year"
    LIFETIME = "lifetime"


class CreateSubscriptionOrderRequest(BaseModel):
    """创建订阅订单请求模型"""
    subscription_type: SubscriptionType = Field(..., description="订阅类型")
    payment_type: Literal["alipay", "wxpay"] = Field(..., description="支付方式")
    user_id: Optional[str] = Field(None, description="用户ID（可选，可从session中获取）")
    return_url: Optional[str] = Field(None, description="支付成功后返回页面（可选）")
    
    @property
    def subscription_duration_days(self) -> Optional[int]:
        """获取订阅时长（天数）"""
        duration_map = {
            SubscriptionType.THREE_MONTHS: 90,
            SubscriptionType.ONE_YEAR: 365,
            SubscriptionType.LIFETIME: None  # 永久会员
        }
        return duration_map.get(self.subscription_type)
    
    @property
    def subscription_name(self) -> str:
        """获取订阅名称"""
        name_map = {
            SubscriptionType.THREE_MONTHS: "HERHZZZ 3个月会员",
            SubscriptionType.ONE_YEAR: "HERHZZZ 1年会员", 
            SubscriptionType.LIFETIME: "HERHZZZ 永久会员"
        }
        return name_map.get(self.subscription_type, "HERHZZZ 会员")
    
    @property
    def subscription_amount(self) -> float:
        """获取订阅价格"""
        price_map = {
            SubscriptionType.THREE_MONTHS: 29.99,
            SubscriptionType.ONE_YEAR: 99.99,
            SubscriptionType.LIFETIME: 299.99
        }
        return price_map.get(self.subscription_type, 0.0)


# 已删除包含跳转链接的订阅响应模型


class UserMembershipStatus(BaseModel):
    """用户会员状态模型"""
    user_id: str = Field(..., description="用户ID")
    is_member: bool = Field(..., description="是否为付费会员")
    membership_type: str = Field(..., description="会员类型")
    membership_expires_at: Optional[datetime] = Field(None, description="会员到期时间")
    days_remaining: Optional[int] = Field(None, description="剩余天数")
    is_lifetime_member: bool = Field(default=False, description="是否为永久会员")


class AudioAccessInfo(BaseModel):
    """音频访问信息模型"""
    audio_name: str = Field(..., description="音频文件名")
    audio_display_name: str = Field(..., description="音频显示名称")
    cycle_phase: str = Field(..., description="周期阶段")
    is_free: bool = Field(..., description="是否为免费音频")
    is_accessible: bool = Field(..., description="当前用户是否可以访问")
    display_order: int = Field(..., description="显示顺序")
    description: Optional[str] = Field(None, description="音频描述")
    duration_seconds: Optional[int] = Field(None, description="音频时长（秒）")


class CyclePhaseAudioList(BaseModel):
    """周期阶段音频列表模型"""
    cycle_phase: str = Field(..., description="周期阶段")
    phase_display_name: str = Field(..., description="阶段显示名称")
    audios: List[AudioAccessInfo] = Field(..., description="音频列表")
    free_audio_count: int = Field(..., description="免费音频数量")
    total_audio_count: int = Field(..., description="总音频数量")


class UserAudioAccessResponse(BaseModel):
    """用户音频访问权限响应模型"""
    user_membership: UserMembershipStatus = Field(..., description="用户会员状态")
    audio_phases: List[CyclePhaseAudioList] = Field(..., description="各阶段音频列表")
    total_accessible_count: int = Field(..., description="用户可访问的音频总数")
    total_audio_count: int = Field(..., description="音频总数")


# 已删除ZPay跳转支付请求模型


class ZPayRequest(BaseModel):
    """ZPay 支付请求模型"""
    pid: str = Field(..., description="商户ID")
    cid: Optional[str] = Field(None, description="支付渠道ID")
    type: str = Field(..., description="支付方式")
    out_trade_no: str = Field(..., description="商户订单号")
    notify_url: str = Field(..., description="服务器异步通知地址")
    name: str = Field(..., description="商品名称")
    money: str = Field(..., description="商品金额")
    clientip: str = Field(..., description="用户IP地址")
    device: str = Field(default="pc", description="设备类型")
    param: str = Field(default="", description="业务扩展参数")
    sign: str = Field(..., description="签名")
    sign_type: str = Field(default="MD5", description="签名类型")


class ZPayResponse(BaseModel):
    """ZPay 支付响应模型"""
    code: int = Field(..., description="响应代码")
    msg: str = Field(..., description="响应消息")
    payurl: Optional[str] = Field(None, description="支付链接")
    qrcode: Optional[str] = Field(None, description="二维码链接")


class OrderModel(BaseModel):
    """订单数据模型"""
    id: str
    out_trade_no: str
    user_id: str
    name: str
    amount: Decimal
    payment_type: str
    status: str
    order_type: str = "payment"  # payment 或 subscription
    subscription_type: Optional[str] = None
    subscription_duration_days: Optional[int] = None
    subscription_start_date: Optional[datetime] = None
    subscription_end_date: Optional[datetime] = None
    zpay_trade_no: Optional[str] = None
    pay_url: Optional[str] = None
    qr_code: Optional[str] = None
    client_ip: Optional[str] = None
    device: str = "pc"
    params: Optional[dict] = None
    paid_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class PaymentNotification(BaseModel):
    """支付通知模型（用于处理 ZPay 回调）"""
    trade_no: str = Field(..., description="ZPay 交易号")
    out_trade_no: str = Field(..., description="商户订单号")
    type: str = Field(..., description="支付方式")
    name: str = Field(..., description="商品名称")
    money: str = Field(..., description="支付金额")
    trade_status: str = Field(..., description="交易状态")
    sign: str = Field(..., description="签名")
    
    class Config:
        # 允许任意字段名（ZPay 可能返回其他字段）
        extra = "allow" 