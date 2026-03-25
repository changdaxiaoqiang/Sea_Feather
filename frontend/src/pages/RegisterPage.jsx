import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Check, UtensilsCrossed, Trophy, ArrowRight, MessageCircle, Key, X } from 'lucide-react';
import { getActivity, registerActivity, getMemberProfile } from '../api';
import { formatDate, formatTime, getOpenId } from '../utils';

const FloatingOrb = ({ delay, size, x, y }) => (
  <motion.div
    className="absolute rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-secondary/10 blur-3xl"
    style={{ width: size, height: size, left: x, top: y }}
    animate={{ y: [0, -20, 0], opacity: [0.3, 0.5, 0.3] }}
    transition={{ duration: 6, delay, repeat: Infinity, ease: 'easeInOut' }}
  />
);

const Toast = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -50, x: "-50%" }}
    animate={{ opacity: 1, y: 0, x: "-50%" }}
    exit={{ opacity: 0, y: -50, x: "-50%" }}
    className="fixed left-1/2 top-20 z-50 w-max max-w-[calc(100vw-2rem)]"
  >
    <div className={`px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 ${
      type === 'error' ? 'bg-red-500/80' : 'bg-green-500/80'
    } backdrop-blur-sm`}>
      <span className="text-white font-medium break-words">{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-white/20 rounded shrink-0">
        <X className="w-4 h-4 text-white" />
      </button>
    </div>
  </motion.div>
);

const TypeOption = ({ type, label, price, selected, onSelect, icon, badge }) => (
  <motion.button
    whileTap={{ scale: 0.98 }}
    onClick={() => onSelect(type)}
    className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 ${
      selected
        ? 'border-brand-primary bg-gradient-to-r from-brand-primary/20 to-brand-secondary/10 shadow-glow-sm'
        : 'border-white/5 bg-dark-800/30 hover:border-white/10'
    }`}
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
      selected
        ? 'bg-gradient-to-br from-brand-primary to-brand-secondary shadow-glow-sm'
        : 'bg-dark-700'
    }`}>
      <div className={selected ? 'text-white' : 'text-white/40'}>
        {icon}
      </div>
    </div>
    <div className="flex-1 text-left">
      <div className="flex items-center gap-2">
        <span className="font-medium text-white">{label}</span>
        {badge && (
          <span className="px-2 py-0.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-xs font-bold rounded-full shadow-glow-sm">
            {badge}
          </span>
        )}
      </div>
      <span className="text-white/40 text-sm">¥{price}</span>
    </div>
    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
      selected ? 'border-brand-primary bg-brand-primary' : 'border-white/20'
    }`}>
      {selected && <Check className="w-4 h-4 text-white" />}
    </div>
  </motion.button>
);

const RegisterPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState('activity');
  const [member, setMember] = useState(null);
  const [registrationKey, setRegistrationKey] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [activityRes, openid] = await Promise.all([
        getActivity(id),
        Promise.resolve(getOpenId())
      ]);
      setActivity(activityRes);
      
      const memberData = await getMemberProfile(openid);
      setMember(memberData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPrice = () => {
    if (!activity) return 0;
    if (selectedType === 'activity') return activity.price_activity;
    if (selectedType === 'dinner') return activity.price_dinner_only;
    if (selectedType === 'both') return activity.price_dinner;
    return activity.price_activity;
  };

  const getTypeName = () => {
    const names = {
      'activity': '仅参加活动',
      'dinner': '仅参加晚宴',
      'both': '活动 + 晚宴'
    };
    return names[selectedType];
  };

  const handleRegister = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const openid = getOpenId();
      await registerActivity(id, { openid, type: selectedType, key: registrationKey });
      navigate('/registrations', { replace: true });
    } catch (err) {
      const errorMsg = err.response?.data?.error || '报名失败';
      setToast({ message: errorMsg, type: 'error' });
      setSubmitting(false);
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

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/50">
        活动不存在
      </div>
    );
  }

  const price = getPrice();

  return (
    <div className="min-h-screen pb-36 bg-dark-900 relative overflow-hidden">
      <FloatingOrb delay={0} size="200px" x="-10%" y="5%" />
      <FloatingOrb delay={2} size="150px" x="70%" y="20%" />
      <FloatingOrb delay={4} size="180px" x="20%" y="60%" />

      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 z-50 w-11 h-11 bg-dark-800/60 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/5"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative px-6 pt-16 pb-8"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-glow-orange"
          >
            <Trophy className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="font-display text-3xl font-bold text-white tracking-wide">
            确认报名
          </h1>
          <p className="text-white/50 mt-2 text-sm">请确认您的报名信息</p>
        </div>
      </motion.div>

      <div className="px-6 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-glass rounded-2xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/10 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-white">{activity.title}</h2>
              <div className="flex items-center gap-2 text-xs text-white/40">
                <span>{formatDate(activity.activity_date)}</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span>{formatTime(activity.start_time)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="font-display font-semibold tracking-wide text-white/70 text-sm">报名类型</span>
          </div>
          <div className="space-y-2">
            <TypeOption
              type="activity"
              label="仅打球"
              price={activity.price_activity}
              selected={selectedType === 'activity'}
              onSelect={setSelectedType}
              icon={<Trophy className="w-5 h-5" />}
            />
            <TypeOption
              type="both"
              label="晚宴+打球"
              price={activity.price_dinner}
              selected={selectedType === 'both'}
              onSelect={setSelectedType}
              icon={<UtensilsCrossed className="w-5 h-5" />}
              badge="推荐"
            />
            <TypeOption
              type="dinner"
              label="仅晚宴"
              price={activity.price_dinner_only}
              selected={selectedType === 'dinner'}
              onSelect={setSelectedType}
              icon={<UtensilsCrossed className="w-5 h-5" />}
            />
          </div>
        </motion.div>

        <AnimatePresence>
          {activity.registration_key && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Key className="w-4 h-4 text-brand-primary" />
                <span className="font-display font-semibold tracking-wide text-white/70 text-sm">邀请码</span>
              </div>
              <div className="card-glass rounded-2xl p-1">
                <input
                  type="text"
                  maxLength={4}
                  value={registrationKey}
                  onChange={(e) => setRegistrationKey(e.target.value.replace(/\D/g, ''))}
                  placeholder="请输入4位邀请码"
                  className="w-full p-4 bg-transparent border-0 text-white text-center text-2xl tracking-[0.5em] placeholder:text-white/20 focus:outline-none"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card-glass rounded-2xl overflow-hidden"
        >
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/50">报名类型</span>
              <span className="text-white font-medium">{getTypeName()}</span>
            </div>
            <div className="h-px bg-white/5" />
            <div className="flex justify-between items-center">
              <span className="text-white/50">付款方式</span>
              <span className="text-white/70 text-sm">活动后微信转账</span>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/5 border-t border-brand-primary/10">
            <div className="flex justify-between items-center">
              <span className="text-white/70">预计费用</span>
              <motion.span
                key={price}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="font-display text-3xl font-bold text-gradient"
              >
                ¥{price}
              </motion.span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/10 rounded-2xl p-4"
        >
          <div className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-amber-400/80 text-sm space-y-1.5">
              <p className="font-medium text-amber-400">费用说明</p>
              <ul className="text-amber-300/60 space-y-1 text-xs">
                <li>• 活动结束后根据实际消耗计算费用</li>
                <li>• 费用 = 场地费 + 用球费 + 晚宴（如参加）</li>
              </ul>
            </div>
          </div>
        </motion.div>

      </div>

      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.35 }}
        className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-dark-900 via-dark-900 to-transparent pt-12 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]"
      >
        <div className="max-w-[430px] mx-auto">
          <button
            onClick={handleRegister}
            disabled={submitting}
            className={`w-full py-4 rounded-2xl font-display text-lg font-bold tracking-wide transition-all flex items-center justify-center gap-3 ${
              submitting
                ? 'bg-dark-700 text-white/40 cursor-not-allowed'
                : 'btn-primary text-white'
            }`}
          >
            {submitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
                提交中...
              </>
            ) : (
              <>
                确认报名
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
