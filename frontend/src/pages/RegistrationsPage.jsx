import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, X, AlertCircle, CheckCircle, Zap, ArrowRight, ChevronRight, Wallet, Clock3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMyRegistrations, cancelRegistration } from '../api';
import { formatDate, formatTime, getOpenId, getActivityTypeName, getRegistrationTypeName, isPastActivity } from '../utils';

const RegistrationsPage = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState(null);

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    try {
      const openid = getOpenId();
      const res = await getMyRegistrations(openid);
      setRegistrations(res.data);
    } catch (error) {
      console.error('Failed to load registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('确定要取消报名吗？')) return;
    
    setCancelingId(id);
    try {
      const openid = getOpenId();
      await cancelRegistration(id, openid);
      loadRegistrations();
    } catch (error) {
      alert(error.response?.data?.error || '取消失败');
    } finally {
      setCancelingId(null);
    }
  };

  const canCancel = (reg) => {
    return reg.status === 'confirmed' || reg.status === 'waitlist';
  };

  const isPast = (date) => isPastActivity(date);

  const getStatusBadge = (reg) => {
    if (reg.status === 'cancelled') {
      return (
        <span className="tag-pill bg-white/10 text-white/60">
          <X className="w-3 h-3 mr-1" />
          已取消
        </span>
      );
    }
    if (reg.status === 'waitlist') {
      return (
        <span className="tag-pill tag-waitlist">
          <Zap className="w-3 h-3 mr-1" />
          候补中
        </span>
      );
    }
    if (reg.is_paid) {
      return (
        <span className="tag-pill bg-green-500/20 text-green-400 border border-green-500/30">
          <CheckCircle className="w-3 h-3 mr-1" />
          已付款
        </span>
      );
    }
    if (isPast(reg.activity_date)) {
      return (
        <span className="tag-pill bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <Wallet className="w-3 h-3 mr-1" />
          待付款
        </span>
      );
    }
    return (
      <span className="tag-pill tag-open">
        <CheckCircle className="w-3 h-3 mr-1" />
        已报名
      </span>
    );
  };

  return (
    <div className="min-h-screen pb-28">
      <div className="relative px-6 pt-14 pb-6 bg-gradient-to-b from-brand-primary/10 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              我的<span className="text-gradient">报名</span>
            </h1>
            <p className="text-white/50 text-sm mt-1">查看和管理您的活动报名</p>
          </div>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary p-0.5"
          >
            <div className="w-full h-full rounded-2xl bg-dark-900 flex items-center justify-center">
              <Calendar className="w-7 h-7 text-brand-primary" />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="px-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-brand-primary/30 border-t-brand-primary rounded-full"
            />
            <p className="mt-4 text-white/50 text-sm">加载中...</p>
          </div>
        ) : registrations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-24 h-24 rounded-full bg-dark-800 flex items-center justify-center mb-4">
              <Users className="w-12 h-12 text-white/20" />
            </div>
            <p className="text-white/50 text-lg mb-2">暂无报名记录</p>
            <p className="text-white/30 text-sm mb-6">去发现精彩活动吧</p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary px-8 py-3 rounded-xl font-display font-semibold text-white flex items-center gap-2"
            >
              去报名
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {registrations.map((reg, index) => (
                <motion.div
                  key={reg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`card-glass rounded-3xl overflow-hidden ${isPast(reg.activity_date) && reg.status !== 'cancelled' ? '' : ''}`}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(reg)}
                          <span className={`tag-pill ${reg.type === 'competition' ? 'tag-competition' : 'tag-regular'}`}>
                            {getActivityTypeName(reg.type)}
                          </span>
                        </div>
                        <h3 className="font-display text-xl font-bold tracking-wide">{reg.title}</h3>
                      </div>
                      {reg.actual_fee > 0 && (
                        <div className="text-right">
                          <p className="text-white/40 text-xs">应付</p>
                          <p className="font-display text-2xl font-bold text-gradient">¥{reg.actual_fee}</p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 p-3 bg-dark-800/50 rounded-xl">
                        <Calendar className="w-4 h-4 text-brand-primary" />
                        <span className="text-white/70 text-sm">{formatDate(reg.activity_date)}</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-dark-800/50 rounded-xl">
                        <Clock className="w-4 h-4 text-brand-secondary" />
                        <span className="text-white/70 text-sm">{formatTime(reg.start_time)}</span>
                      </div>
                      <div className="col-span-2 flex items-center gap-2 p-3 bg-dark-800/50 rounded-xl">
                        <MapPin className="w-4 h-4 text-white/50" />
                        <span className="text-white/70 text-sm">{reg.location || '未设置地点'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-dark-800/30 rounded-xl mb-4">
                      <span className="text-white/50 text-sm">报名类型</span>
                      <span className="text-white font-medium">{getRegistrationTypeName(reg.registration_type)}</span>
                    </div>

                    {reg.status === 'waitlist' && (
                      <div className="flex items-center gap-2 text-amber-400 text-sm mb-4 p-3 bg-amber-500/10 rounded-xl">
                        <AlertCircle className="w-4 h-4" />
                        候补第{reg.waitlist_order}位，有人取消时您将自动补上
                      </div>
                    )}

                    {!reg.is_paid && !reg.status === 'cancelled' && isPast(reg.activity_date) && (
                      <div className="flex items-center gap-2 text-amber-400 text-sm mb-4 p-3 bg-amber-500/10 rounded-xl">
                        <Clock3 className="w-4 h-4" />
                        活动已结束，请联系群主微信转账付款
                      </div>
                    )}

                    {canCancel(reg) && !isPast(reg.activity_date) && (
                      <button
                        onClick={() => handleCancel(reg.id)}
                        disabled={cancelingId === reg.id}
                        className="w-full py-3 border-2 border-red-500/30 text-red-400 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-red-500/10 transition-all disabled:opacity-50"
                      >
                        {cancelingId === reg.id ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full"
                            />
                            取消中...
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4" />
                            取消报名
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationsPage;