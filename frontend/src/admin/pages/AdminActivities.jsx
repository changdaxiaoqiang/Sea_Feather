import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Users, Calendar, Sparkles, ChevronRight, Trophy, Activity, X, CheckCircle, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAdminActivities, deleteActivity, getActivitySummary, markRegistrationPaid } from '../../api';
import CourtDisplay from '../../components/CourtDisplay';
import { formatDate, formatTime, getActivityTypeName } from '../../utils';

const AdminActivities = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState({});

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

  const handlePaymentMethodChange = (regId, method) => {
    setPaymentMethods(prev => ({ ...prev, [regId]: method }));
  };

  const handleTogglePaid = async (regId, isPaid, paymentMethod) => {
    try {
      await markRegistrationPaid(regId, isPaid, paymentMethod);
      const summary = await getActivitySummary(selectedActivity.id);
      setRegistrations(summary.registrations || []);
    } catch (error) {
      alert('更新失败: ' + (error.response?.data?.error || error.message));
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
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleViewRegistrations(activity)}
                    className="p-3 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all"
                  >
                    <Users className="w-5 h-5" />
                  </button>
                  <div className="text-right mr-4">
                    <p className="font-display text-2xl font-bold text-gradient">¥{activity.price_activity}</p>
                    <p className="text-white/40 text-xs">起</p>
                  </div>
                  
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

      {selectedActivity && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={closePanel}
          />
          <div
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#1a1a2e] border-l border-white/10 z-50 overflow-y-auto"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg text-white">报名成员</h3>
                <p className="text-sm text-white/60">{selectedActivity.title}</p>
              </div>
              <button
                onClick={closePanel}
                className="p-2 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
            
            <div className="p-4 space-y-3">
              {registrations.length === 0 ? (
                <div className="text-center py-8 text-white/40">
                  暂无报名成员
                </div>
              ) : registrations.map(reg => (
                <div
                  key={reg.id}
                  className="bg-white/5 rounded-xl p-4 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                        {reg.member_headimgurl ? (
                          <img src={reg.member_headimgurl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-white/40" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">{reg.member_nickname || '用户'}</p>
                        <p className="text-xs text-white/40">
                          {reg.registration_type === 'activity' ? '仅活动' : reg.registration_type === 'both' ? '活动+晚宴' : '仅晚宴'}
                        </p>
                      </div>
                    </div>
                    {reg.status === 'waitlist' && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">候补</span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      {reg.actual_fee > 0 ? (
                        <span className="text-lg font-bold text-white">¥{reg.actual_fee}</span>
                      ) : (
                        <span className="text-sm text-white/40">待计算</span>
                      )}
                    </div>
                    
                    {reg.actual_fee > 0 && (
                      <div className="flex items-center gap-2">
                        {reg.is_paid ? (
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            {reg.payment_method === 'wechat' ? '微信' : reg.payment_method === 'card' ? '卡扣' : '已付'}
                          </span>
                        ) : (
                          <>
                            <select
                              value={paymentMethods[reg.id] || 'wechat'}
                              onChange={(e) => handlePaymentMethodChange(reg.id, e.target.value)}
                              className="px-2 py-1 text-sm bg-white/10 border border-white/10 rounded-lg text-white"
                            >
                              <option value="wechat" className="text-gray-900">微信转账</option>
                              <option value="card" className="text-gray-900">会员卡扣除</option>
                              <option value="cash" className="text-gray-900">现金</option>
                            </select>
                            <button
                              onClick={() => handleTogglePaid(reg.id, true, paymentMethods[reg.id] || 'wechat')}
                              className="px-3 py-1 bg-green-500 text-white text-sm rounded-full hover:bg-green-600"
                            >
                              确认收款
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
    </div>
  );
};

export default AdminActivities;
