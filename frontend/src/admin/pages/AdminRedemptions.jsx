import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { getRedemptions } from '../../api';

const AdminRedemptions = () => {
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRedemptions();
  }, []);

  const loadRedemptions = async () => {
    try {
      const res = await getRedemptions();
      setRedemptions(res.data);
    } catch (error) {
      console.error('Failed to load redemptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-white/10 text-white/60',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">兑换记录</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : redemptions.length === 0 ? (
        <div className="bg-white/5 rounded-xl p-12 text-center text-white/50 border border-white/10">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>暂无兑换记录</p>
        </div>
      ) : (
        <div className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase">用户</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase">商品</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase">消耗积分</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase">兑换时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {redemptions.map((redemption) => (
                <tr key={redemption.id} className="hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center overflow-hidden">
                        {redemption.headimgurl ? (
                          <img src={redemption.headimgurl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-4 h-4 text-white/40" />
                        )}
                      </div>
                      <span>{redemption.nickname || '未知用户'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {redemption.product_image && (
                        <img
                          src={redemption.product_image}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <span>{redemption.product_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-red-600">{redemption.points_used}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[redemption.status]}`}>
                      {redemption.status === 'pending' ? '待处理' :
                       redemption.status === 'completed' ? '已完成' : '已取消'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/60">
                    {new Date(redemption.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminRedemptions;