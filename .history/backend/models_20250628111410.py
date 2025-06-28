"""
支付系统 Pydantic 模型定义
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, Literal
from datetime import datetime
from decimal import Decimal


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


class GetPaymentUrlRequest(BaseModel):
    """获取支付跳转链接请求模型"""
    name: str = Field(..., min_length=1, max_length=100, description="商品名称")
    amount: float = Field(..., gt=0, description="金额（单位：元）")
    payment_type: Literal["alipay", "wxpay"] = Field(..., description="支付方式（alipay=支付宝, wxpay=微信）")
    user_id: Optional[str] = Field(None, description="用户ID（可选，可从session中获取）")
    return_url: Optional[str] = Field(None, description="支付成功后返回页面（可选）")
    
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


class GetPaymentUrlResponse(BaseModel):
    """获取支付跳转链接响应模型"""
    out_trade_no: str = Field(..., description="商户订单号")
    pay_url: str = Field(..., description="支付跳转链接")
    status: str = Field(default="pending", description="订单状态")


class ZPayJumpRequest(BaseModel):
    """ZPay 页面跳转支付请求模型"""
    pid: str = Field(..., description="商户ID")
    cid: Optional[str] = Field(None, description="支付渠道ID")
    type: str = Field(..., description="支付方式")
    out_trade_no: str = Field(..., description="商户订单号")
    name: str = Field(..., description="商品名称")
    money: str = Field(..., description="商品金额")
    notify_url: str = Field(..., description="异步通知地址")
    return_url: Optional[str] = Field(None, description="同步跳转地址")
    param: str = Field(default="", description="附加参数")
    sign: str = Field(..., description="签名")
    sign_type: str = Field(default="MD5", description="签名类型")


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