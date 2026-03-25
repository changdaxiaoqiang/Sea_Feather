import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Coins, History, Gift, ChevronRight, ChevronLeft, Minus, Plus, Sparkles, ArrowRight, Trophy, Camera, Edit2, Settings, X } from 'lucide-react';
import { getMemberProfile, getPointsRecords, updateMemberProfile, uploadImage, getBalanceRecords } from '../api';
import { getOpenId } from '../utils';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [records, setRecords] = useState([]);
  const [balanceRecords, setBalanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ nickname: '', headimgurl: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const openid = getOpenId();
      const [profileRes, recordsRes, balanceRes] = await Promise.all([
        getMemberProfile(openid),
        getPointsRecords(openid, { limit: 10 }),
        getBalanceRecords(openid, { limit: 10 })
      ]);
      setMember(profileRes);
      setRecords(recordsRes.data);
      setBalanceRecords(balanceRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setEditForm({ nickname: member?.nickname || '', headimgurl: member?.headimgurl || '' });
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

  const handleSave = async () => {
    try {
      const openid = getOpenId();
      await updateMemberProfile({ openid, nickname: editForm.nickname, headimgurl: editForm.headimgurl });
      setMember(prev => ({ ...prev, nickname: editForm.nickname, headimgurl: editForm.headimgurl }));
      setEditing(false);
    } catch (error) {
      alert('保存失败');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-brand-primary/30 border-t-brand-primary rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-full pb-6">
      <div className="relative px-6 pt-14 pb-8">
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-brand-primary/20 to-transparent rounded-b-[40px]" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex items-center gap-5 mb-8"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-primary to-brand-secondary p-1">
              <div className="w-full h-full rounded-3xl bg-dark-900 flex items-center justify-center overflow-hidden">
                {member?.headimgurl ? (
                  <img src={member.headimgurl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-brand-primary" />
                )}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center border-4 border-dark-900">
              {member?.is_member ? (
                <Trophy className="w-4 h-4 text-white" />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight">
                {member?.nickname || '球友'}
              </h1>
              {member?.is_member === 1 && (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">会员</span>
              )}
            </div>
            <p className="text-white/50 text-sm">ID: {member?.id}</p>
            {member?.is_member === 1 && member?.member_expire_date && (
              <p className="text-white/40 text-xs">有效期至: {member.member_expire_date}</p>
            )}
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Settings className="w-5 h-5 text-white" />
          </button>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="relative overflow-hidden rounded-3xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-light animate-gradient" />
            <div className="absolute inset-0 bg-black/20" />
            
            <div className="relative p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <Coins className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white/80 text-xs">我的积分</p>
                  <div className="flex items-baseline gap-1">
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-display text-3xl font-bold"
                    >
                      {member?.points || 0}
                    </motion.span>
                  </div>
                </div>
              </div>
              <p className="text-white/60 text-xs">
                可兑换商品
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden rounded-3xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-400" />
            <div className="absolute inset-0 bg-black/10" />
            
            <div className="relative p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white/80 text-xs">会员卡余额</p>
                  <div className="flex items-baseline gap-1">
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-display text-3xl font-bold"
                    >
                      ¥{member?.balance || 0}
                    </motion.span>
                  </div>
                </div>
              </div>
              <p className="text-white/60 text-xs">
                支付活动费用
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="px-6 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-glass rounded-3xl overflow-hidden"
        >
          <button
            onClick={() => navigate('/products')}
            className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary p-0.5">
                <div className="w-full h-full rounded-2xl bg-dark-900 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-brand-primary" />
                </div>
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">积分商城</p>
                <p className="text-white/50 text-sm">兑换心仪好物</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/30" />
          </button>
          
          <div className="h-px bg-white/5" />
          
          <button
            onClick={() => navigate('/registrations')}
            className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-primary/20 flex items-center justify-center">
                <History className="w-6 h-6 text-brand-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">我的报名</p>
                <p className="text-white/50 text-sm">查看活动记录</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/30" />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-primary" />
              <span className="font-display font-semibold tracking-wide">积分记录</span>
            </div>
          </div>
          
          {records.length === 0 ? (
            <div className="card-glass rounded-3xl p-8 text-center">
              <p className="text-white/50">暂无积分记录</p>
            </div>
          ) : (
            <div className="card-glass rounded-3xl overflow-hidden divide-y divide-white/5">
              {records.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      record.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {record.type === 'income' ? (
                        <Plus className="w-5 h-5 text-green-400" />
                      ) : (
                        <Minus className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-white">{record.description}</p>
                      <p className="text-xs text-white/40">
                        {new Date(record.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`font-display text-lg font-bold ${
                    record.type === 'income' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {record.type === 'income' ? '+' : ''}{record.amount}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-green-500" />
            <span className="font-display font-semibold tracking-wide">余额记录</span>
          </div>
          
          {balanceRecords.length === 0 ? (
            <div className="card-glass rounded-3xl p-8 text-center">
              <p className="text-white/50">暂无余额记录</p>
            </div>
          ) : (
            <div className="card-glass rounded-3xl overflow-hidden divide-y divide-white/5">
              {balanceRecords.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + index * 0.05 }}
                  className="p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      record.type === 'recharge' ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {record.type === 'recharge' ? (
                        <Plus className="w-5 h-5 text-green-400" />
                      ) : (
                        <Minus className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-white">{record.description}</p>
                      <p className="text-xs text-white/40">
                        {new Date(record.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`font-display text-lg font-bold ${
                    record.type === 'recharge' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {record.type === 'recharge' ? '+' : ''}{record.amount}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {editing && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setEditing(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: "-50%", x: "-50%" }}
              animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
              exit={{ opacity: 0, scale: 0.95, y: "-50%", x: "-50%" }}
              className="fixed top-1/2 left-1/2 w-[90%] max-w-sm z-[60] bg-dark-800 rounded-3xl p-6 border border-white/10 shadow-2xl"
            >
              <h3 className="font-semibold text-lg mb-6 text-center">编辑资料</h3>
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-dark-900 overflow-hidden flex items-center justify-center border-4 border-white/5">
                      {editForm.headimgurl ? (
                        <img src={editForm.headimgurl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-10 h-10 text-white/40" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
                      <Camera className="w-4 h-4 text-white" />
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2 ml-1">昵称</label>
                  <input
                    type="text"
                    value={editForm.nickname}
                    onChange={(e) => setEditForm(prev => ({ ...prev, nickname: e.target.value }))}
                    className="w-full px-4 py-3.5 bg-dark-900 rounded-2xl border border-white/10 text-white focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/50 transition-all"
                    placeholder="请输入昵称"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 py-3 border border-white/20 hover:bg-white/5 rounded-xl text-white transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 bg-brand-primary hover:bg-brand-primary/90 rounded-xl text-white font-medium transition-colors shadow-glow-sm"
                >
                  保存
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;