"""
数据库服务 - 处理与 Supabase 的交互
"""
import os
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import uuid
from supabase import create_client, Client
from models import OrderModel, UserMembershipStatus, AudioAccessInfo, CyclePhaseAudioList


class DatabaseService:
    """数据库服务类"""
    
    def __init__(self):
        """初始化数据库服务"""
        # 从环境变量读取 Supabase 配置
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not self.supabase_url or not self.supabase_service_key:
            raise ValueError("缺少 Supabase 配置信息，请检查环境变量")
        
        # 创建 Supabase 客户端
        try:
            # 尝试使用兼容的方式创建客户端
            self.supabase: Client = create_client(
                self.supabase_url, 
                self.supabase_service_key
            )
            print("✅ Supabase 客户端创建成功 (标准方式)")
        except TypeError as e:
            if "proxy" in str(e):
                # 如果出现 proxy 参数错误，尝试使用不同版本的初始化方式
                from supabase import Client
                self.supabase = Client(
                    self.supabase_url,
                    self.supabase_service_key
                )
                print("✅ Supabase 客户端创建成功 (兼容方式)")
            else:
                raise
    
    async def create_order(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        创建订单记录
        
        Args:
            order_data: 订单数据
            
        Returns:
            Dict[str, Any]: 创建的订单记录
            
        Raises:
            Exception: 订单创建失败时抛出异常
        """
        try:
            # 准备订单数据
            insert_data = {
                "out_trade_no": order_data["out_trade_no"],
                "user_id": order_data["user_id"],
                "name": order_data["name"],
                "amount": order_data["amount"],
                "payment_type": order_data["payment_type"],
                "status": order_data.get("status", "pending"),
                "order_type": order_data.get("order_type", "payment"),
                "client_ip": order_data.get("client_ip"),
                "device": order_data.get("device", "pc"),
                "params": order_data.get("params", {})
            }
            
            # 如果是订阅订单，添加订阅相关字段
            if order_data.get("order_type") == "subscription":
                insert_data.update({
                    "subscription_type": order_data.get("subscription_type"),
                    "subscription_duration_days": order_data.get("subscription_duration_days"),
                    "subscription_start_date": order_data.get("subscription_start_date"),
                    "subscription_end_date": order_data.get("subscription_end_date")
                })
            
            # 插入订单记录
            result = self.supabase.table("orders").insert(insert_data).execute()
            
            if not result.data:
                raise Exception("订单创建失败：数据库返回空数据")
            
            return result.data[0]
            
        except Exception as e:
            raise Exception(f"创建订单失败: {str(e)}")
    
    async def create_subscription_order(self, subscription_order_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        创建订阅订单记录
        
        Args:
            subscription_order_data: 订阅订单数据
            
        Returns:
            Dict[str, Any]: 创建的订阅订单记录
        """
        # 设置为订阅类型订单
        subscription_order_data["order_type"] = "subscription"
        
        # 计算订阅开始和结束时间
        start_date = datetime.now()
        subscription_order_data["subscription_start_date"] = start_date.isoformat()
        
        # 如果不是永久会员，计算结束时间
        if subscription_order_data.get("subscription_duration_days"):
            end_date = start_date + timedelta(days=subscription_order_data["subscription_duration_days"])
            subscription_order_data["subscription_end_date"] = end_date.isoformat()
        
        return await self.create_order(subscription_order_data)
    
    async def get_order_by_trade_no(self, out_trade_no: str) -> Optional[Dict[str, Any]]:
        """
        根据商户订单号获取订单信息
        
        Args:
            out_trade_no: 商户订单号
            
        Returns:
            Optional[Dict[str, Any]]: 订单信息，如果不存在返回 None
        """
        try:
            result = self.supabase.table("orders").select("*").eq("out_trade_no", out_trade_no).execute()
            
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
        更新订单的支付信息
        
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
            update_data = {"status": status}
            
            if zpay_trade_no is not None:
                update_data["zpay_trade_no"] = zpay_trade_no
            if pay_url is not None:
                update_data["pay_url"] = pay_url
            if qr_code is not None:
                update_data["qr_code"] = qr_code
            
            result = self.supabase.table("orders").update(update_data).eq("out_trade_no", out_trade_no).execute()
            
            return len(result.data) > 0
            
        except Exception as e:
            print(f"更新订单支付信息失败: {str(e)}")
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
                "status": status,
                "paid_at": datetime.now().isoformat() if status == "paid" else None
            }
            
            result = self.supabase.table("orders").update(update_data).eq("out_trade_no", out_trade_no).execute()
            
            # 如果是订阅订单支付成功，需要更新用户会员状态
            if status == "paid":
                await self._handle_subscription_payment_success(out_trade_no)
            
            return len(result.data) > 0
            
        except Exception as e:
            print(f"更新订单状态失败: {str(e)}")
            return False
    
    async def _handle_subscription_payment_success(self, out_trade_no: str) -> bool:
        """
        处理订阅支付成功后的会员状态更新
        
        Args:
            out_trade_no: 商户订单号
            
        Returns:
            bool: 处理是否成功
        """
        try:
            # 获取订单信息
            order = await self.get_order_by_trade_no(out_trade_no)
            if not order or order.get("order_type") != "subscription":
                return True  # 不是订阅订单，无需处理
            
            user_id = order["user_id"]
            subscription_type = order["subscription_type"]
            subscription_duration_days = order.get("subscription_duration_days")
            
            # 计算会员到期时间
            now = datetime.now()
            
            # 获取当前用户会员状态
            current_membership = await self.get_user_membership_status(user_id)
            
            if subscription_type == "lifetime":
                # 永久会员
                membership_data = {
                    "user_id": user_id,
                    "membership_type": subscription_type,
                    "membership_expires_at": None,
                    "is_lifetime_member": True,
                    "membership_started_at": now.isoformat(),
                    "last_subscription_order_id": order["id"]
                }
            else:
                # 计算新的到期时间
                if current_membership and current_membership.get("membership_expires_at"):
                    # 如果用户已有会员，从当前到期时间开始延期
                    try:
                        current_expires = datetime.fromisoformat(current_membership["membership_expires_at"].replace('Z', '+00:00'))
                        if current_expires > now:
                            # 当前会员还未到期，延期
                            new_expires_at = current_expires + timedelta(days=subscription_duration_days)
                        else:
                            # 当前会员已到期，从现在开始
                            new_expires_at = now + timedelta(days=subscription_duration_days)
                    except:
                        # 解析时间失败，从现在开始
                        new_expires_at = now + timedelta(days=subscription_duration_days)
                else:
                    # 新会员，从现在开始
                    new_expires_at = now + timedelta(days=subscription_duration_days)
                
                membership_data = {
                    "user_id": user_id,
                    "membership_type": subscription_type,
                    "membership_expires_at": new_expires_at.isoformat(),
                    "is_lifetime_member": False,
                    "membership_started_at": current_membership.get("membership_started_at") or now.isoformat(),
                    "last_subscription_order_id": order["id"]
                }
            
            # 使用 upsert 更新或插入会员信息
            result = self.supabase.table("user_memberships").upsert(
                membership_data,
                on_conflict="user_id"
            ).execute()
            
            print(f"用户 {user_id} 会员状态更新成功: {subscription_type}")
            return len(result.data) > 0
            
        except Exception as e:
            print(f"处理订阅支付成功失败: {str(e)}")
            return False
    
    async def get_user_membership_status(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        获取用户会员状态
        
        Args:
            user_id: 用户ID
            
        Returns:
            Optional[Dict[str, Any]]: 用户会员状态
        """
        try:
            # 调用数据库函数检查会员状态
            result = self.supabase.rpc("check_user_membership_status", {"user_uuid": user_id}).execute()
            
            return result.data[0] if result.data else None
            
        except Exception as e:
            print(f"获取用户会员状态失败: {str(e)}")
            return None
    
    async def get_user_audio_access(self, user_id: str) -> Dict[str, Any]:
        """
        获取用户音频访问权限信息
        
        Args:
            user_id: 用户ID
            
        Returns:
            Dict[str, Any]: 用户音频访问权限信息
        """
        try:
            # 获取用户会员状态
            membership_status = await self.get_user_membership_status(user_id)
            is_member = membership_status.get("is_member", False) if membership_status else False
            
            # 获取所有音频列表
            audio_result = self.supabase.table("audio_access_control").select("*").order("cycle_phase, display_order").execute()
            
            if not audio_result.data:
                return {
                    "user_membership": membership_status or {"is_member": False, "membership_type": "free"},
                    "audio_phases": [],
                    "total_accessible_count": 0,
                    "total_audio_count": 0
                }
            
            # 按周期阶段分组音频
            phase_map = {
                "menstrual": "月经期",
                "follicular": "卵泡期", 
                "ovulation": "排卵期",
                "luteal": "黄体期"
            }
            
            phases_data = {}
            total_accessible_count = 0
            total_audio_count = len(audio_result.data)
            
            for audio in audio_result.data:
                phase = audio["cycle_phase"]
                if phase not in phases_data:
                    phases_data[phase] = {
                        "cycle_phase": phase,
                        "phase_display_name": phase_map.get(phase, phase),
                        "audios": [],
                        "free_audio_count": 0,
                        "total_audio_count": 0
                    }
                
                # 判断用户是否可以访问此音频
                is_accessible = audio["is_free"] or is_member
                if is_accessible:
                    total_accessible_count += 1
                
                if audio["is_free"]:
                    phases_data[phase]["free_audio_count"] += 1
                
                phases_data[phase]["audios"].append({
                    "audio_name": audio["audio_name"],
                    "audio_display_name": audio["audio_display_name"],
                    "cycle_phase": audio["cycle_phase"],
                    "is_free": audio["is_free"],
                    "is_accessible": is_accessible,
                    "display_order": audio["display_order"],
                    "description": audio.get("description"),
                    "duration_seconds": audio.get("duration_seconds")
                })
                phases_data[phase]["total_audio_count"] += 1
            
            # 转换为列表格式
            audio_phases = list(phases_data.values())
            
            return {
                "user_membership": membership_status or {
                    "user_id": user_id,
                    "is_member": False, 
                    "membership_type": "free",
                    "membership_expires_at": None,
                    "days_remaining": 0,
                    "is_lifetime_member": False
                },
                "audio_phases": audio_phases,
                "total_accessible_count": total_accessible_count,
                "total_audio_count": total_audio_count
            }
            
        except Exception as e:
            print(f"获取用户音频访问权限失败: {str(e)}")
            raise Exception(f"获取音频访问权限失败: {str(e)}")
    
    async def check_audio_access_permission(self, user_id: str, audio_name: str) -> bool:
        """
        检查用户对特定音频的访问权限
        
        Args:
            user_id: 用户ID
            audio_name: 音频文件名
            
        Returns:
            bool: 是否有访问权限
        """
        try:
            # 调用数据库函数检查访问权限
            result = self.supabase.rpc(
                "check_audio_access_permission", 
                {"user_uuid": user_id, "audio_file_name": audio_name}
            ).execute()
            
            return result.data[0] if result.data else False
            
        except Exception as e:
            print(f"检查音频访问权限失败: {str(e)}")
            return False
    
    async def get_user_orders(self, user_id: str, limit: int = 20, offset: int = 0) -> List[Dict[str, Any]]:
        """
        获取用户订单列表
        
        Args:
            user_id: 用户ID
            limit: 每页数量
            offset: 偏移量
            
        Returns:
            List[Dict[str, Any]]: 订单列表
        """
        try:
            result = self.supabase.table("orders").select("*").eq("user_id", user_id).order("created_at", desc=True).range(offset, offset + limit - 1).execute()
            
            return result.data or []
            
        except Exception as e:
            print(f"获取用户订单列表失败: {str(e)}")
            return [] 