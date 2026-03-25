import React from 'react';
import { Home, Calendar, User, Zap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/registrations', icon: Calendar, label: '已报名' },
    { path: '/profile', icon: User, label: '我的' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-full bg-transparent z-[100] pb-[env(safe-area-inset-bottom)] shrink-0 absolute bottom-0">
      <div className="px-4 pb-6 pt-2 bg-transparent">
        <div className="relative">
          <div className="absolute inset-0 bg-dark-800/80 backdrop-blur-xl rounded-3xl border border-white/10" />
          
          <div className="relative flex justify-around py-3">
            {navItems.map((item, index) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`relative flex flex-col items-center gap-1 px-6 py-2 transition-all duration-300 ${
                    active ? 'scale-110' : ''
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl blur-lg opacity-30"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <div className={`relative p-2 rounded-xl transition-all duration-300 ${
                    active 
                      ? 'bg-gradient-to-br from-brand-primary to-brand-secondary shadow-glow-sm' 
                      : 'bg-white/5'
                  }`}>
                    <item.icon 
                      className={`w-5 h-5 transition-colors duration-300 ${
                        active ? 'text-white' : 'text-white/50'
                      }`} 
                    />
                  </div>
                  <span className={`text-xs font-medium transition-colors duration-300 ${
                    active ? 'text-brand-primary' : 'text-white/40'
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomNav;