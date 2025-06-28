"""
数据库服务 - 处理订单相关的数据库操作
"""
import os
from typing import Optional, Dict, Any
from supabase import create_client, Client
from models import OrderModel
from datetime import datetime


class DatabaseService:
    """数据库服务类"""
    
    def __init__(self):
        """初始化 Supabase 客户端"""
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("缺少 Supabase 环境变量配置")
        
        self.supabase: Client = create_client(supabase_url, supabase_key)
    
    async def create_order(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        创建新订单
        
        Args:
            order_data: 订单数据字典
            
        Returns:
            Dict[str, Any]: 创建的订单数据
            
        Raises:
            Exception: 创建失败时抛出异常
        """
        try:
            result = self.supabase.table('orders').insert(order_data).execute()
            
            if result.data:
                return result.data[0]
            else:
                raise Exception(f"创建订单失败: {result}")
                
        except Exception as e:
            raise Exception(f"数据库操作失败: {str(e)}")
    
    async def get_order_by_trade_no(self, out_trade_no: str) -> Optional[Dict[str, Any]]:
        """
        根据商户订单号获取订单
        
        Args:
            out_trade_no: 商户订单号
            
        Returns:
            Optional[Dict[str, Any]]: 订单数据，不存在则返回 None
        """
        try:
            result = self.supabase.table('orders').select('*').eq(
                'out_trade_no', out_trade_no
            ).execute()
            
            return result.data[0] if result.data else None
            
        except Exception as e:
            print(f"查询订单失败: {str(e)}")
            return None
    
    async def update_order_payment_info(
        self, 
        out_trade_no: str, 
        zpay_trade_no: Optional[str] = None,
        pay_url: Optional[str] = None,
        qr_code: Optional[str] = None,
        status: str = "pending"
    ) -> bool:
        """
        更新订单支付信息
        
        Args:
            out_trade_no: 商户订单号
            zpay_trade_no: ZPay 交易号
            pay_url: 支付链接
            qr_code: 二维码链接
            status: 订单状态
            
        Returns:
            bool: 更新是否成功
        """
        try:
            update_data = {
                'status': status,
                'updated_at': datetime.utcnow().isoformat()
            }
            
            if zpay_trade_no:
                update_data['zpay_trade_no'] = zpay_trade_no
            if pay_url:
                update_data['pay_url'] = pay_url
            if qr_code:
                update_data['qr_code'] = qr_code
            
            result = self.supabase.table('orders').update(update_data).eq(
                'out_trade_no', out_trade_no
            ).execute()
            
            return bool(result.data)
            
        except Exception as e:
            print(f"更新订单失败: {str(e)}")
            return False
    
    async def update_order_status(self, out_trade_no: str, status: str) -> bool:
        """
        更新订单状态
        
        Args:
            out_trade_no: 商户订单号
            status: 新状态
            
        Returns:
            bool: 更新是否成功
        """
        try:
            update_data = {
                'status': status,
                'updated_at': datetime.utcnow().isoformat()
            }
            
            # 如果状态是 paid，记录支付时间
            if status == 'paid':
                update_data['paid_at'] = datetime.utcnow().isoformat()
            
            result = self.supabase.table('orders').update(update_data).eq(
                'out_trade_no', out_trade_no
            ).execute()
            
            return bool(result.data)
            
        except Exception as e:
            print(f"更新订单状态失败: {str(e)}")
            return False
    
    async def get_user_orders(
        self, 
        user_id: str, 
        limit: int = 20, 
        offset: int = 0
    ) -> list:
        """
        获取用户的订单列表
        
        Args:
            user_id: 用户ID
            limit: 限制数量
            offset: 偏移量
            
        Returns:
            list: 订单列表
        """
        try:
            result = self.supabase.table('orders').select('*').eq(
                'user_id', user_id
            ).order('created_at', desc=True).range(offset, offset + limit - 1).execute()
            
            return result.data or []
            
        except Exception as e:
            print(f"查询用户订单失败: {str(e)}")
            return [] 