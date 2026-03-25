import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Users, Calendar, Sparkles, ChevronRight, Trophy, Activity, X, CheckCircle, User, Calculator, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAdminActivities, deleteActivity, getActivitySummary, markRegistrationPaid, calculateActivity, updateActivity } from '../../api';
import CourtDisplay from '../../components/CourtDisplay';
import { formatDate, formatTime, getActivityTypeName } from '../../utils';

const AdminActivities = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState({});
  const [showCalculateModal, setShowCalculateModal] = useState(false);
  const [deductModal, setDeductModal] = useState(null);
  const [calculateForm, setCalculateForm] = useState({
    actual_court_fee: 0,
    actual_ball_count: 0,
    actual_ball_price: 0
  });
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const res = await getAdminActivities();
      setActivities(res.data);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除此活动吗？')) return;
    
    try {
      await deleteActivity(id);
      loadActivities();
    } catch (error) {
      alert('删除失败');
    }
  };

  const handleViewRegistrations = async (activity) => {
    try {
      const summary = await getActivitySummary(activity.id);
      setRegistrations(summary.registrations || []);
      setSelectedActivity(activity);
      const methods = {};
      (summary.registrations || []).forEach(reg => {
        methods[reg.id] = reg.payment_method || 'wechat';
      });
      setPaymentMethods(methods);
    } catch (error) {
      alert('加载报名列表失败');
    }
  };

  const openCalculateModal = (activity) => {
    setSelectedActivity(activity);
    setCalculateForm({
      actual_court_fee: activity.actual_court_fee || 0,
      actual_ball_count: activity.actual_ball_count || 0,
      actual_ball_price: activity.actual_ball_price || 0
    });
    setShowCalculateModal(true);
  };

  const handleCalculate = async () => {
    if (!selectedActivity) return;
    
    setCalculating(true);
    try {
      await updateActivity(selectedActivity.id, {
        ...selectedActivity,
        ...calculateForm
      });
      await calculateActivity(selectedActivity.id);
      alert('费用计算完成');
      closeCalculateModal();
      
      const summary = await getActivitySummary(selectedActivity.id);
      setRegistrations(summary.registrations || []);
      
      loadActivities();
    } catch (error) {
      alert('计算失败: ' + (error.response?.data?.error || error.message));
    } finally {
      setCalculating(false);
    }
  };

  const handlePaymentMethodChange = (regId, method) => {
    setPaymentMethods(prev => ({ ...prev, [regId]: method }));
  };

  const handleTogglePaid = async (regId, isPaid, paymentMethod, useBalance = 0) => {
    try {
      await markRegistrationPaid(regId, isPaid, paymentMethod, useBalance);
      const summary = await getActivitySummary(selectedActivity.id);
      setRegistrations(summary.registrations || []);
    } catch (error) {
      alert('更新失败: ' + (error.response?.data?.error || error.message));
    }
  };

  const openDeductModal = (reg) => {
    const isMember = !!reg.is_member;
    const balance = reg.member_balance || 0;
    
    let method = 'wechat';
    let useBalance = 0;
    
    if (isMember) {
      if (balance >= reg.actual_fee) {
        method = 'card';
        useBalance = reg.actual_fee;
      } else if (balance > 0) {
        method = 'wechat';
        useBalance = balance;
      }
    }
    
    setDeductModal({
      reg,
      isMember,
      balance,
      useBalance,
      method
    });
  };

  const closeDeductModal = () => setDeductModal(null);

  const confirmDeduct = async () => {
    try {
      await markRegistrationPaid(deductModal.reg.id, true, deductModal.method, deductModal.useBalance);
      const summary = await getActivitySummary(selectedActivity.id);
      setRegistrations(summary.registrations || []);
      closeDeductModal();
    } catch (error) {
      alert('扣款失败: ' + (error.response?.data?.error || error.message));
    }
  };

  const closePanel = () => {
    setSelectedActivity(null);
    setRegistrations([]);
    setPaymentMethods({});
  };

  const statusLabels = {
    pending: { text: '待发布', class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    active: { text: '进行中', class: 'bg-green-500/20 text-green-400 border-green-500/30' },
    completed: { text: '已结束', class: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    cancelled: { text: '已取消', class: 'bg-red-500/20 text-red-400 border-red-500/30' },
  };

  const closeCalculateModal = () => {
    setSelectedActivity(null);
    setShowCalculateModal(false);
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">活动管理</h1>
          <p className="text-white/50 mt-1">管理所有羽毛球活动</p>
        </div>
        <Link
          to="/admin/activities/new"
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C61 100%)',
            boxShadow: '0 4px 20px rgba(255, 107, 53, 0.4)'
          }}
        >
          <Plus className="w-5 h-5" />
          新建活动
        </Link>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-brand-primary/30 border-t-brand-primary rounded-full"
          />
        </div>
      ) : activities.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-glass rounded-3xl p-12 text-center"
        >
          <Calendar className="w-16 h-16 mx-auto text-white/20 mb-4" />
          <p className="text-white/50 text-lg mb-2">暂无活动</p>
          <p className="text-white/30 text-sm">点击右上角按钮创建第一个活动</p>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card-glass rounded-2xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`tag-pill ${activity.type === 'competition' ? 'tag-competition' : 'tag-regular'}`}>
                      {activity.type === 'competition' ? <Trophy className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                      <span className="ml-1">{getActivityTypeName(activity.type)}</span>
                    </span>
                    <span className={`tag-pill border ${statusLabels[activity.status]?.class || statusLabels.pending.class}`}>
                      {statusLabels[activity.status]?.text || '未知'}
                    </span>
                    {activity.actual_court_fee > 0 && (
                      <span className="tag-pill bg-green-500/20 text-green-400 border-green-500/30">
                        已计算
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-display text-xl font-bold text-white mb-2">{activity.title}</h3>
                  
                  <div className="flex items-center gap-6 text-sm text-white/50">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(activity.activity_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>{formatTime(activity.start_time)}-{formatTime(activity.end_time)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{activity.confirmed_count}/{activity.max_participants}</span>
                      {activity.waitlist_count > 0 && (
                        <span className="text-amber-400">候补{activity.waitlist_count}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    {activity.courts?.map((court) => (
                      <span key={court} className="px-2 py-1 bg-brand-primary/20 text-brand-primary text-xs rounded-lg">
                        {court}号场
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-display text-2xl font-bold text-gradient">¥{activity.price_activity}</p>
                    <p className="text-white/40 text-xs">起</p>
                  </div>
                  <button
                    onClick={() => handleViewRegistrations(activity)}
                    className="p-3 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all"
                    title="查看报名/收费"
                  >
                    <DollarSign className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => openCalculateModal(activity)}
                    className="p-3 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-all"
                    title="计算费用"
                  >
                    <Calculator className="w-5 h-5" />
                  </button>
                  
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/activities/${activity.id}/edit`}
                      className="p-3 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(activity.id)}
                      className="p-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Calculate Modal */}
      {showCalculateModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-50 transition-none"
            style={{ transition: 'none' }}
            onClick={closeCalculateModal}
          />
          <div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-[#1a1a2e] rounded-2xl border border-white/10 z-50 p-5 shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{ transition: 'none' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-white">计算费用</h3>
              <button
                onClick={closeCalculateModal}
                className="p-1.5 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">场地费总计 (¥)</label>
                <input
                  type="number"
                  value={calculateForm.actual_court_fee}
                  onChange={(e) => setCalculateForm({ ...calculateForm, actual_court_fee: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-primary text-sm"
                  placeholder="请输入场地费"
                />
              </div>
              
              <div>
                <label className="block text-sm text-white/60 mb-1.5">用球数量</label>
                <input
                  type="number"
                  value={calculateForm.actual_ball_count}
                  onChange={(e) => setCalculateForm({ ...calculateForm, actual_ball_count: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-primary text-sm"
                  placeholder="请输入用球数量"
                />
              </div>
              
              <div>
                <label className="block text-sm text-white/60 mb-1.5">羽毛球单价 (¥)</label>
                <input
                  type="number"
                  value={calculateForm.actual_ball_price}
                  onChange={(e) => setCalculateForm({ ...calculateForm, actual_ball_price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-primary text-sm"
                  placeholder="请输入羽毛球单价"
                />
              </div>

              {calculateForm.actual_court_fee > 0 && calculateForm.actual_ball_count > 0 && (
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-xs text-white/60 mb-1.5">费用预览</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">用球总费用:</span>
                    <span className="text-white">¥{calculateForm.actual_ball_count * calculateForm.actual_ball_price}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-white/40">场地费:</span>
                    <span className="text-white">¥{calculateForm.actual_court_fee}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={closeCalculateModal}
                className="flex-1 px-3 py-2.5 border border-white/20 rounded-lg text-white/60 hover:bg-white/5 transition-colors text-sm"
              >
                取消
              </button>
              <button
                onClick={handleCalculate}
                disabled={calculating}
                className="flex-1 px-3 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg text-white font-semibold hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 text-sm"
              >
                {calculating ? '计算中...' : '计算费用'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Registrations Modal */}
      {selectedActivity && !showCalculateModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-50"
            style={{ transition: 'none' }}
            onClick={closePanel}
          />
          <div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-[#1a1a2e] rounded-2xl border border-white/10 z-50 p-5 shadow-2xl max-h-[85vh] overflow-y-auto"
            style={{ transition: 'none' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg text-white">报名成员</h3>
                <p className="text-sm text-white/60">{selectedActivity.title}</p>
              </div>
              <button
                onClick={closePanel}
                className="p-1.5 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
            
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {registrations.length === 0 ? (
                <div className="text-center py-8 text-white/40">
                  暂无报名成员
                </div>
              ) : registrations.map(reg => (
                <div
                  key={reg.id}
                  className="bg-white/5 rounded-xl p-3 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                        {reg.member_headimgurl ? (
                          <img src={reg.member_headimgurl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-white/40" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{reg.member_nickname || '用户'}</p>
                        <p className="text-xs text-white/40">
                          {reg.registration_type === 'activity' ? '仅打球' : reg.registration_type === 'both' ? '晚宴+打球' : '仅晚宴'}
                        </p>
                      </div>
                    </div>
                    {reg.status === 'waitlist' && (
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">候补</span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      {reg.actual_fee > 0 ? (
                        <span className="text-base font-bold text-white">¥{reg.actual_fee}</span>
                      ) : (
                        <span className="text-xs text-white/40">待计算</span>
                      )}
                    </div>
                    
                    {reg.actual_fee > 0 && reg.status === 'confirmed' && (
                      <div className="flex items-center gap-1.5">
                        {reg.is_paid ? (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {reg.payment_method === 'wechat' ? '微信' : reg.payment_method === 'card' ? '卡扣' : '已付'}
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => openDeductModal(reg)}
                              className="px-3 py-1 bg-brand-primary text-white text-xs rounded-full hover:bg-brand-primary/90 transition-colors"
                            >
                              扣款
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {/* Deduct Modal */}
      {deductModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-[60]"
            onClick={closeDeductModal}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-[#1a1a2e] rounded-2xl border border-white/10 z-[60] p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-white">确认扣款</h3>
              <button onClick={closeDeductModal} className="p-1.5 rounded-lg hover:bg-white/10">
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">应扣金额：</span>
                <span className="font-bold text-white">¥{deductModal.reg.actual_fee}</span>
              </div>
              
              {deductModal.isMember ? (
                <div className="bg-brand-primary/10 rounded-xl p-3 border border-brand-primary/20">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-brand-primary/80">储值余额：</span>
                    <span className="font-bold text-brand-primary">¥{deductModal.balance}</span>
                  </div>
                  {deductModal.balance >= deductModal.reg.actual_fee ? (
                    <p className="text-xs text-brand-primary/60">余额充足，将直接从储值中扣除全额。</p>
                  ) : (
                    <>
                      <p className="text-xs text-red-400 mb-2">余额不足，将扣除全部余额，剩余需补缴。</p>
                      <div className="flex justify-between text-sm items-center">
                        <span className="text-white/60">抵扣金额：</span>
                        <input
                          type="number"
                          value={deductModal.useBalance}
                          onChange={(e) => setDeductModal({ ...deductModal, useBalance: Math.min(parseFloat(e.target.value) || 0, deductModal.balance, deductModal.reg.actual_fee) })}
                          className="w-24 px-2 py-1 bg-dark-800 border border-white/10 rounded text-white text-right focus:outline-none focus:border-brand-primary"
                        />
                      </div>
                      <div className="flex justify-between text-sm items-center mt-2">
                        <span className="text-white/60">需补缴：</span>
                        <span className="font-bold text-white">¥{Math.max(0, deductModal.reg.actual_fee - deductModal.useBalance)}</span>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-xs text-white/40">该用户非储值会员或无余额。</p>
              )}
              
              {(!deductModal.isMember || deductModal.useBalance < deductModal.reg.actual_fee) && (
                <div>
                  <label className="block text-sm text-white/60 mb-2">
                    {deductModal.isMember ? '补缴方式：' : '支付方式：'}
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeductModal({ ...deductModal, method: 'wechat' })}
                      className={`flex-1 py-2 rounded-lg border text-sm transition-colors ${deductModal.method === 'wechat' ? 'border-brand-primary bg-brand-primary/20 text-brand-primary' : 'border-white/10 text-white/60 hover:bg-white/5'}`}
                    >
                      微信
                    </button>
                    <button
                      onClick={() => setDeductModal({ ...deductModal, method: 'cash' })}
                      className={`flex-1 py-2 rounded-lg border text-sm transition-colors ${deductModal.method === 'cash' ? 'border-brand-primary bg-brand-primary/20 text-brand-primary' : 'border-white/10 text-white/60 hover:bg-white/5'}`}
                    >
                      现金
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={closeDeductModal}
                className="flex-1 px-4 py-2 border border-white/20 rounded-xl text-white hover:bg-white/5 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmDeduct}
                className="flex-1 px-4 py-2 bg-brand-primary rounded-xl text-white font-medium hover:bg-brand-primary/90 transition-colors"
              >
                确认扣款
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminActivities;
