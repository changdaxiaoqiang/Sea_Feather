import React, { useState, useEffect } from 'react';
import { User, Coins, Edit, Search, Camera } from 'lucide-react';
import { getAdminMembers, adjustMemberPoints, updateMember, uploadImage, rechargeBalance, rechargeMember } from '../../api';

const AdminMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [editingMember, setEditingMember] = useState(null);
  const [editForm, setEditForm] = useState({ nickname: '', headimgurl: '' });
  const [uploading, setUploading] = useState(false);
  const [adjustingMember, setAdjustingMember] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [adjustDesc, setAdjustDesc] = useState('');
  const [rechargingMember, setRechargingMember] = useState(null);
  const [rechargeAmount, setRechargeAmount] = useState(0);
  const [rechargeMethod, setRechargeMethod] = useState('wechat');
  const [memberRecharging, setMemberRecharging] = useState(null);
  const [memberMonths, setMemberMonths] = useState(1);

  useEffect(() => {
    loadMembers();
  }, [keyword]);

  const loadMembers = async () => {
    try {
      const res = await getAdminMembers({ keyword });
      setMembers(res.data);
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustPoints = async () => {
    if (!adjustAmount || !adjustDesc) {
      alert('请填写完整信息');
      return;
    }

    try {
      await adjustMemberPoints(adjustingMember.id, {
        amount: parseInt(adjustAmount),
        description: adjustDesc
      });
      setAdjustingMember(null);
      setAdjustAmount(0);
      setAdjustDesc('');
      loadMembers();
    } catch (error) {
      alert('调整失败');
    }
  };

  const handleUpdateStatus = async (member, newStatus) => {
    try {
      await updateMember(member.id, { status: newStatus });
      loadMembers();
    } catch (error) {
      alert('更新失败');
    }
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setEditForm({ nickname: member.nickname || '', headimgurl: member.headimgurl || '' });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await uploadImage(formData);
      setEditForm(prev => ({ ...prev, headimgurl: res.url }));
    } catch (error) {
      alert('上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await updateMember(editingMember.id, {
        nickname: editForm.nickname,
        headimgurl: editForm.headimgurl
      });
      setEditingMember(null);
      loadMembers();
    } catch (error) {
      alert('保存失败');
    }
  };

  const handleRecharge = async () => {
    if (!rechargeAmount) {
      alert('请填写金额');
      return;
    }
    try {
      await rechargeBalance(rechargingMember.id, {
        amount: parseFloat(rechargeAmount),
        payment_method: rechargeMethod,
        description: '充值'
      });
      setRechargingMember(null);
      setRechargeAmount(0);
      loadMembers();
    } catch (error) {
      alert('充值失败');
    }
  };

  const handleMemberRecharge = async () => {
    try {
      const prices = { 1: 30, 3: 80, 6: 150, 12: 280 };
      const price = prices[memberMonths] || 30;
      await rechargeMember(memberRecharging.id, {
        months: memberMonths,
        price: price
      });
      setMemberRecharging(null);
      setMemberMonths(1);
      loadMembers();
    } catch (error) {
      alert('续费失败');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">成员管理</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索昵称..."
            className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white/5 rounded-xl p-12 text-center text-white/50 border border-white/10">
          暂无成员
        </div>
      ) : (
        <div className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase">成员</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase">积分</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase">余额</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase">会员</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase">注册时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center overflow-hidden">
                        {member.headimgurl ? (
                          <img src={member.headimgurl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-white/40" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{member.nickname || '未设置昵称'}</div>
                        <div className="text-xs text-white/60">{member.openid}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Coins className="w-4 h-4 text-amber-500" />
                      <span className="font-bold text-amber-600">{member.points}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-green-600">¥{member.balance || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      member.is_member ? 'bg-amber-100 text-amber-800' : 'bg-white/10 text-white/40'
                    }`}>
                      {member.is_member ? '会员' : '普通'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      member.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {member.status === 1 ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/60">
                    {new Date(member.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditMember(member)}
                        className="px-3 py-1.5 text-sm bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => setRechargingMember(member)}
                        className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        充值
                      </button>
                      <button
                        onClick={() => setMemberRecharging(member)}
                        className="px-3 py-1.5 text-sm bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                      >
                        续会员
                      </button>
                      <button
                        onClick={() => setAdjustingMember(member)}
                        className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        调积分
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(member, member.status === 1 ? 0 : 1)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          member.status === 1
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {member.status === 1 ? '禁用' : '启用'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] rounded-xl max-w-md w-full p-6 border border-white/10">
            <h3 className="font-semibold text-lg mb-4">编辑成员信息</h3>
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-white/10 overflow-hidden flex items-center justify-center">
                    {editForm.headimgurl ? (
                      <img src={editForm.headimgurl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-white/40" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-dark">
                    <Camera className="w-4 h-4 text-white" />
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">昵称</label>
                <input
                  type="text"
                  value={editForm.nickname}
                  onChange={(e) => setEditForm(prev => ({ ...prev, nickname: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                  placeholder="请输入昵称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">头像链接</label>
                <input
                  type="text"
                  value={editForm.headimgurl}
                  onChange={(e) => setEditForm(prev => ({ ...prev, headimgurl: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                  placeholder="输入头像图片链接"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingMember(null)}
                className="flex-1 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10"
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {adjustingMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] rounded-xl max-w-md w-full p-6 border border-white/10">
            <h3 className="font-semibold text-lg mb-4">调整积分 - {adjustingMember.nickname}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">当前积分</label>
                <p className="text-2xl font-bold text-amber-600">{adjustingMember.points}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  调整数量 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                  placeholder="正数增加，负数减少"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  调整原因 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={adjustDesc}
                  onChange={(e) => setAdjustDesc(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                  placeholder="例如：管理员赠送、补偿等"
                />
              </div>
              <div className="text-sm text-white/60">
                调整后积分：<span className="font-bold text-primary">{adjustingMember.points + (parseInt(adjustAmount) || 0)}</span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setAdjustingMember(null);
                  setAdjustAmount(0);
                  setAdjustDesc('');
                }}
                className="flex-1 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10"
              >
                取消
              </button>
              <button
                onClick={handleAdjustPoints}
                className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                确认调整
              </button>
            </div>
          </div>
        </div>
      )}

      {rechargingMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] rounded-xl max-w-md w-full p-6 border border-white/10">
            <h3 className="font-semibold text-lg mb-4">余额充值 - {rechargingMember.nickname}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">当前余额</label>
                <p className="text-2xl font-bold text-green-600">¥{rechargingMember.balance || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">充值金额</label>
                <input
                  type="number"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                  placeholder="请输入充值金额"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">支付方式</label>
                <select
                  value={rechargeMethod}
                  onChange={(e) => setRechargeMethod(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                >
                  <option value="wechat">微信转账</option>
                  <option value="card">会员卡扣除</option>
                  <option value="cash">现金</option>
                </select>
              </div>
              <div className="text-sm text-white/60">
                充值后余额：<span className="font-bold text-green-600">¥{(rechargingMember.balance || 0) + (parseFloat(rechargeAmount) || 0)}</span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setRechargingMember(null);
                  setRechargeAmount(0);
                }}
                className="flex-1 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10"
              >
                取消
              </button>
              <button
                onClick={handleRecharge}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                确认充值
              </button>
            </div>
          </div>
        </div>
      )}

      {memberRecharging && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] rounded-xl max-w-md w-full p-6 border border-white/10">
            <h3 className="font-semibold text-lg mb-4">会员续费 - {memberRecharging.nickname}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">当前状态</label>
                <p className="text-lg">
                  {memberRecharging.is_member ? (
                    <span className="text-amber-500">会员有效期至: {memberRecharging.member_expire_date || '未知'}</span>
                  ) : (
                    <span className="text-white/60">普通用户</span>
                  )}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">选择套餐</label>
                <div className="grid grid-cols-2 gap-3">
                  {[{ months: 1, price: 30 }, { months: 3, price: 80 }, { months: 6, price: 150 }, { months: 12, price: 280 }].map(item => (
                    <button
                      key={item.months}
                      onClick={() => setMemberMonths(item.months)}
                      className={`p-3 rounded-lg border transition-colors ${
                        memberMonths === item.months
                          ? 'border-primary bg-primary/20 text-primary'
                          : 'border-white/10 text-white/60 hover:border-white/20'
                      }`}
                    >
                      <div className="font-bold">{item.months}个月</div>
                      <div className="text-sm">¥{item.price}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-sm text-white/60">
                扣除余额：<span className="font-bold text-red-400">¥{[30, 80, 150, 280][memberMonths - 1]}</span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setMemberRecharging(null);
                  setMemberMonths(1);
                }}
                className="flex-1 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10"
              >
                取消
              </button>
              <button
                onClick={handleMemberRecharge}
                className="flex-1 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                确认续费
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMembers;