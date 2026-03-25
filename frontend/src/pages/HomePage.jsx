import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Clock, Trophy, Activity, ChevronRight, Sparkles, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getActivities } from '../api';
import { formatDate, formatTime, getActivityTypeName, isPastActivity } from '../utils';
import logoImage from '../assets/logo.png';

const FloatingOrb = ({ delay, size, x, y }) => (
  <motion.div
    className="absolute rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-secondary/10 blur-3xl"
    style={{
      width: size,
      height: size,
      left: x,
      top: y,
    }}
    animate={{
      y: [0, -30, 0],
      opacity: [0.3, 0.6, 0.3],
    }}
    transition={{
      duration: 8,
      delay,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  />
);

const ActivityCard = ({ activity, index }) => {
  const isPast = isPastActivity(activity.activity_date);
  const isFull = activity.confirmed_count >= activity.max_participants;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link to={`/activity/${activity.id}`}>
        <div className={`card-glass rounded-3xl overflow-hidden group cursor-pointer ${isPast ? 'opacity-60' : ''}`}>
          <div className="relative h-48 overflow-hidden">
            {activity.images && activity.images.length > 0 ? (
              <img
                src={activity.images[0]}
                alt={activity.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-dark-700 to-dark-800 flex items-center justify-center">
                <Activity className="w-20 h-20 text-brand-primary/30" />
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/50 to-transparent" />
            
            <div className="absolute top-4 left-4 flex gap-2">
              <span className={`tag-pill ${activity.type === 'competition' ? 'tag-competition' : 'tag-regular'}`}>
                {activity.type === 'competition' ? (
                  <Trophy className="w-3 h-3 mr-1" />
                ) : (
                  <Activity className="w-3 h-3 mr-1" />
                )}
                {getActivityTypeName(activity.type)}
              </span>
            </div>
            
            <div className="absolute top-4 right-4">
              <span className={`tag-pill ${
                isPast ? 'bg-white/10 text-white/60' : isFull ? 'tag-full' : 'tag-open'
              }`}>
                {isPast ? '已结束' : isFull ? '已满' : '报名中'}
              </span>
            </div>
            
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="font-display text-2xl font-bold text-white mb-2 tracking-wide">
                {activity.title}
              </h3>
              
              <div className="flex items-center gap-4 text-sm text-white/70">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(activity.activity_date)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(activity.start_time)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[...Array(Math.min(activity.confirmed_count, 3))].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary border-2 border-dark-900 flex items-center justify-center"
                    >
                      <Users className="w-4 h-4 text-white" />
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <span className="text-white font-semibold">{activity.confirmed_count}</span>
                  <span className="text-white/40">/{activity.max_participants}</span>
                  {activity.waitlist_count > 0 && (
                    <span className="ml-2 text-amber-400 text-xs">候补{activity.waitlist_count}人</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-baseline gap-1">
                <span className="font-display text-2xl font-bold text-gradient">
                  ¥{activity.price_activity}
                </span>
                <span className="text-white/40 text-sm">起</span>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-2">
                {activity.courts?.map((court) => (
                  <span
                    key={court}
                    className="px-2 py-1 bg-brand-primary/20 text-brand-primary text-xs font-medium rounded-lg"
                  >
                    {court}号场
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1 text-brand-primary group-hover:translate-x-1 transition-transform">
                <span className="text-sm font-medium">查看详情</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const HomePage = () => {
  const [activities, setActivities] = useState([]);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const openid = localStorage.getItem('sf_openid') || 'test_user_1';
      const [activitiesRes, profileRes] = await Promise.all([
        getActivities({ status: 'active' }),
        import('../api').then(m => m.getMemberProfile(openid))
      ]);
      const today = new Date().toISOString().split('T')[0];
      const upcoming = activitiesRes.data.filter(a => a.activity_date >= today);
      const past = activitiesRes.data.filter(a => a.activity_date < today);
      setActivities([...upcoming, ...past.reverse()]);
      setMember(profileRes);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full pb-6">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/10 via-transparent to-transparent" />
        
        <div className="relative px-6 pt-14 pb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-2"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-5 h-5 text-brand-primary" />
                <span className="text-brand-primary text-sm font-medium tracking-wider font-display uppercase">
                  Badminton
                </span>
              </div>
              <h1 className="font-display text-4xl font-bold tracking-tight">
                羽球飞舞
              </h1>
            </div>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary p-0.5 overflow-hidden"
            >
              <div className="w-full h-full rounded-2xl bg-dark-900 flex items-center justify-center overflow-hidden">
                <img src={logoImage} alt="Logo" className="w-full h-full object-cover scale-110" />
              </div>
            </motion.div>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-sm"
          >
            每周精彩 · 挥洒汗水 · 结交朋友
          </motion.p>
        </div>
        
        <div className="absolute top-0 right-0 w-64 h-64 opacity-30">
          <FloatingOrb delay={0} size={120} x="70%" y="10%" />
          <FloatingOrb delay={2} size={80} x="80%" y="60%" />
        </div>
      </div>

      <div className="px-6">
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-primary" />
              <span className="font-display text-lg font-semibold tracking-wide">近期活动</span>
            </div>
            {member && (
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.location.href='/profile'}>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                  {member.headimgurl ? (
                    <img src={member.headimgurl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-4 h-4 text-white/40" />
                  )}
                </div>
                <p className="font-medium text-white text-sm">{member.nickname || '用户'}</p>
              </div>
            )}
          </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-brand-primary/30 border-t-brand-primary rounded-full"
            />
            <p className="mt-4 text-white/50 text-sm">加载中...</p>
          </div>
        ) : activities.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-24 h-24 rounded-full bg-dark-800 flex items-center justify-center mb-4">
              <Activity className="w-12 h-12 text-white/20" />
            </div>
            <p className="text-white/50 text-lg mb-2">暂无活动</p>
            <p className="text-white/30 text-sm">敬请期待下一场精彩活动</p>
          </motion.div>
        ) : (
          <div className="space-y-5">
            <AnimatePresence>
              {activities.map((activity, index) => (
                <ActivityCard key={activity.id} activity={activity} index={index} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;