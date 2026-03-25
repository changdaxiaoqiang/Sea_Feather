import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Navigation, Users, ChevronLeft, ChevronRight, Car, ArrowLeft, Check, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getActivity } from '../api';
import { formatDate, formatTime, getActivityTypeName, isPastActivity } from '../utils';
import CourtDisplay from '../components/CourtDisplay';

const ALL_COURTS = [1, 2, 3, 5, 6];

const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    loadActivity();
  }, [id]);

  const loadActivity = async () => {
    try {
      const res = await getActivity(id);
      setActivity(res);
    } catch (error) {
      console.error('Failed to load activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const isPast = activity ? isPastActivity(activity.activity_date) : false;

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

  const isFull = activity.confirmed_count >= activity.max_participants;
  const canRegister = !isPast && activity.status === 'active';

  return (
    <div className="min-h-screen pb-32 bg-dark-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {activity.images && activity.images.length > 0 && (
            <div className="relative h-72 overflow-hidden">
              <motion.img
                key={currentImage}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                src={activity.images[currentImage]}
                alt={activity.title}
                className="w-full h-full object-cover"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/30 to-transparent" />
              
              <button
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 w-11 h-11 bg-dark-900/60 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              {activity.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImage(prev => prev > 0 ? prev - 1 : activity.images.length - 1)}
                    className="absolute top-1/2 left-4 -translate-y-1/2 w-10 h-10 bg-dark-900/60 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImage(prev => prev < activity.images.length - 1 ? prev + 1 : 0)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 w-10 h-10 bg-dark-900/60 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {activity.images.map((_, idx) => (
                      <motion.div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx === currentImage ? 'w-6 bg-brand-primary' : 'w-1.5 bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
              
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`tag-pill ${activity.type === 'competition' ? 'tag-competition' : 'tag-regular'}`}>
                    {getActivityTypeName(activity.type)}
                  </span>
                  {isPast && <span className="tag-pill bg-white/10 text-white/60">已结束</span>}
                  {isFull && !isPast && <span className="tag-pill tag-full">已满</span>}
                </div>
                <h1 className="font-display text-3xl font-bold tracking-wide">
                  {activity.title}
                </h1>
              </div>
            </div>
          )}

          <div className="px-6 py-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card-glass rounded-3xl p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <p className="text-white/50 text-sm">活动时间</p>
                  <p className="text-white font-semibold">{formatDate(activity.activity_date)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-secondary/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-brand-secondary" />
                </div>
                <div>
                  <p className="text-white/50 text-sm">时间</p>
                  <p className="text-white font-semibold">
                    {formatTime(activity.start_time)} - {formatTime(activity.end_time)}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-glass rounded-3xl p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-brand-primary" />
                </div>
                <p className="text-white font-semibold">活动场地</p>
              </div>
              <CourtDisplay courts={activity.courts || []} allCourts={ALL_COURTS} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card-glass rounded-3xl p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-brand-primary" />
                </div>
                <p className="text-white font-semibold">活动地点</p>
              </div>
              <p className="text-white/70">{activity.location || '未设置'}</p>
            </motion.div>

            {activity.transportation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card-glass rounded-3xl p-5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-secondary/20 flex items-center justify-center">
                    <Car className="w-5 h-5 text-brand-secondary" />
                  </div>
                  <p className="text-white font-semibold">交通到达</p>
                </div>
                <p className="text-white/70 whitespace-pre-line">{activity.transportation}</p>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="card-glass rounded-3xl p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-brand-primary" />
                </div>
                <p className="text-white font-semibold">报名情况</p>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/50">已报名</span>
                <span className="text-white font-semibold">
                  {activity.confirmed_count} / {activity.max_participants} 人
                </span>
              </div>
              
              <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((activity.confirmed_count / activity.max_participants) * 100, 100)}%` }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full"
                />
              </div>
              
              {activity.waitlist_count > 0 && (
                <p className="mt-3 text-amber-400 text-sm flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  候补 {activity.waitlist_count} 人
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="card-glass rounded-3xl p-5"
            >
              <p className="text-white font-semibold mb-4">报名费用（活动结束后结算）</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-dark-800/50 rounded-xl">
                  <span className="text-white/70">仅活动</span>
                  <span className="font-display text-xl font-bold text-gradient">¥{activity.price_activity}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-brand-primary/10 rounded-xl border border-brand-primary/20">
                  <span className="text-white/70">活动+晚宴</span>
                  <span className="font-display text-xl font-bold text-brand-primary">¥{activity.price_dinner}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-dark-800/50 rounded-xl">
                  <span className="text-white/70">仅晚宴</span>
                  <span className="font-display text-xl font-bold text-gradient">¥{activity.price_dinner_only}</span>
                </div>
              </div>
              <p className="mt-4 text-white/40 text-sm">
                实际费用 = 场地费 + 用球费，活动结束后根据实际消耗计算
              </p>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-dark-900 via-dark-900 to-transparent pt-12"
      >
        <div className="max-w-[430px] mx-auto">
          <button
            onClick={() => navigate(`/activity/${id}/register`)}
            disabled={!canRegister}
            className={`w-full py-4 rounded-2xl font-display text-lg font-bold tracking-wide transition-all flex items-center justify-center gap-3 ${
              canRegister
                ? 'btn-primary text-white'
                : 'bg-dark-700 text-white/40 cursor-not-allowed'
            }`}
          >
            {isPast ? (
              '活动已结束'
            ) : (
              <>
                <Check className="w-5 h-5" />
                立即报名
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ActivityDetail;