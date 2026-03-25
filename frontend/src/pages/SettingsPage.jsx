import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Edit2, Info, ChevronRight, Trophy, X } from 'lucide-react';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="min-h-screen bg-dark-900 pb-6 relative">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative px-6 pt-14 pb-6 bg-gradient-to-b from-brand-primary/10 to-transparent"
      >
        <button
          onClick={() => navigate(-1)}
          className="absolute top-14 left-6 w-11 h-11 bg-dark-800/80 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 z-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold tracking-wide">
            设<span className="text-gradient">置</span>
          </h1>
        </div>
      </motion.div>

      <div className="px-6 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-glass rounded-3xl overflow-hidden"
        >
          <button
            onClick={() => setShowAbout(true)}
            className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                <Info className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">关于我们</p>
                <p className="text-white/50 text-sm">版本与开发者信息</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/30" />
          </button>
        </motion.div>
      </div>

      {/* About Modal */}
      <AnimatePresence>
        {showAbout && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setShowAbout(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: "-50%", x: "-50%" }}
              animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
              exit={{ opacity: 0, scale: 0.9, y: "-50%", x: "-50%" }}
              className="fixed top-1/2 left-1/2 w-[85%] max-w-sm z-[60] bg-dark-800 rounded-3xl border border-white/10 p-6 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary p-0.5 mb-4 shadow-glow-sm">
                  <div className="w-full h-full rounded-2xl bg-dark-900 flex items-center justify-center">
                    <Trophy className="w-10 h-10 text-brand-primary" />
                  </div>
                </div>
                <h3 className="font-display text-2xl font-bold mb-1">Badminton</h3>
                <p className="text-white/50 text-sm mb-6">羽毛球活动管理平台 v1.0.0</p>
                
                <div className="w-full bg-white/5 rounded-2xl p-4 border border-white/10 mb-6 text-left">
                  <p className="text-white/80 text-sm leading-relaxed mb-2">
                    <span className="text-white font-medium">开发者：</span>
                  </p>
                  <p className="text-brand-primary font-medium">抖音 & 小红书：</p>
                  <p className="text-white text-lg font-bold tracking-wide mt-1">强尼打工记</p>
                </div>

                <button
                  onClick={() => setShowAbout(false)}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-colors"
                >
                  关闭
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsPage;