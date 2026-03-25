import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Check, UtensilsCrossed, Trophy, ArrowRight, MessageCircle } from 'lucide-react';
import { getActivity, registerActivity, getMemberProfile } from '../api';
import { formatDate, formatTime, getOpenId } from '../utils';

const TypeOption = ({ type, label, price, selected, onSelect, icon, badge }) => (
  <motion.button
    whileTap={{ scale: 0.98 }}
    onClick={() => onSelect(type)}
    className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 ${
      selected
        ? 'border-brand-primary bg-brand-primary/10 shadow-glow-sm'
        : 'border-white/10 bg-dark-800/50 hover:border-white/20'
    }`}
  >
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
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
        <span className="font-semibold text-white">{label}</span>
        {badge && (
          <span className="px-2 py-0.5 bg-brand-primary text-white text-xs font-bold rounded-full">
            {badge}
          </span>
        )}
      </div>
      <span className="text-white/50 text-sm">¥{price}</span>
    </div>
    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
      selected ? 'border-brand-primary bg-brand-primary' : 'border-white/30'
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
  const [error, setError] = useState('');

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
      setError('加载失败');
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
    setSubmitting(true);
    setError('');

    try {
      const openid = getOpenId();
      await registerActivity(id, { openid, type: selectedType });
      navigate('/registrations', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || '报名失败');
    } finally {
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
    <div className="min-h-screen pb-36 bg-dark-900">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative px-6 pt-14 pb-6 bg-gradient-to-b from-brand-primary/10 to-transparent"
      >
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-11 h-11 bg-dark-800/80 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-2xl font-bold text-center tracking-wide">
          报名活动
        </h1>
      </motion.div>

      <div className="px-6 space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-glass rounded-3xl p-5"
        >
          <h2 className="font-display text-lg font-semibold mb-2">{activity.title}</h2>
          <div className="flex items-center gap-4 text-sm text-white/50">
            <span>{formatDate(activity.activity_date)}</span>
            <span>|</span>
            <span>{formatTime(activity.start_time)}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-brand-primary" />
            <span className="font-display font-semibold tracking-wide">选择报名类型</span>
          </div>
          <div className="space-y-3">
            <TypeOption
              type="activity"
              label="仅参加活动"
              price={activity.price_activity}
              selected={selectedType === 'activity'}
              onSelect={setSelectedType}
              icon={<Trophy className="w-6 h-6" />}
            />
            <TypeOption
              type="both"
              label="活动 + 晚宴"
              price={activity.price_dinner}
              selected={selectedType === 'both'}
              onSelect={setSelectedType}
              icon={<UtensilsCrossed className="w-6 h-6" />}
              badge="推荐"
            />
            <TypeOption
              type="dinner"
              label="仅参加晚宴"
              price={activity.price_dinner_only}
              selected={selectedType === 'dinner'}
              onSelect={setSelectedType}
              icon={<UtensilsCrossed className="w-6 h-6" />}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-glass rounded-3xl p-5"
        >
          <p className="font-display font-semibold tracking-wide mb-4">报名确认</p>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-dark-800/50 rounded-xl">
              <span className="text-white/50">报名类型</span>
              <span className="text-white font-medium">{getTypeName()}</span>
            </div>
            
            <div className="h-px bg-white/10" />
            
            <div className="flex justify-between items-center p-3 bg-brand-primary/10 rounded-xl border border-brand-primary/20">
              <span className="text-white/70">预计费用</span>
              <div className="text-right">
                <span className="font-display text-3xl font-bold text-brand-primary">¥{price}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-dark-800/50 rounded-xl">
              <span className="text-white/50">付款方式</span>
              <span className="text-white font-medium">活动后微信转账</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4"
        >
          <div className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-amber-400/90 text-sm space-y-2">
              <p className="font-medium">费用说明</p>
              <ul className="text-amber-300/80 space-y-1">
                <li>• 活动结束后根据实际消耗计算费用</li>
                <li>• 费用 = 场地费 + 用球费 + 晚宴（如参加）</li>
                <li>• 请添加群主微信，活动结束后转账</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4"
          >
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-dark-900 via-dark-900 to-transparent pt-12"
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
                <Check className="w-5 h-5" />
                确认报名
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;