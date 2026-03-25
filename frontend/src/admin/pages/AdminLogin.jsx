import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff, Flame, Check } from 'lucide-react';
import { systemLogin } from '../../api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedCredentials = localStorage.getItem('adminRemember');
    if (savedCredentials) {
      try {
        const { username: savedUser, password: savedPass } = JSON.parse(savedCredentials);
        setUsername(savedUser || '');
        setPassword(savedPass || '');
        if (savedUser && savedPass) {
          setRememberMe(true);
        }
      } catch (e) {
        console.error('Failed to parse saved credentials');
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await systemLogin({ username, password });
      localStorage.setItem('adminUser', JSON.stringify(res.user));
      
      if (rememberMe) {
        localStorage.setItem('adminRemember', JSON.stringify({ username, password }));
      } else {
        localStorage.removeItem('adminRemember');
      }
      
      navigate('/admin/activities');
    } catch (err) {
      setError(err.response?.data?.error || '用户名或密码错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)' }}>
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary p-0.5">
              <div className="w-full h-full rounded-xl flex items-center justify-center" style={{ background: '#151520' }}>
                <Flame className="w-6 h-6 text-brand-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-white font-display text-2xl font-bold tracking-wide">Badminton</h1>
              <p className="text-white/40 text-xs">管理后台</p>
            </div>
          </div>

          <h2 className="text-white font-display text-3xl font-bold mb-2">欢迎回来</h2>
          <p className="text-white/50 mb-8">请登录您的账户</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-white/60 mb-2">用户名</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-primary transition-colors"
                  placeholder="请输入用户名"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">密码</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-primary transition-colors"
                  placeholder="请输入密码"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  rememberMe
                    ? 'bg-brand-primary border-brand-primary'
                    : 'border-white/30 hover:border-white/50'
                }`}
              >
                {rememberMe && <Check className="w-3 h-3 text-white" />}
              </button>
              <span
                onClick={() => setRememberMe(!rememberMe)}
                className="ml-2 text-white/60 text-sm cursor-pointer"
              >
                记住密码
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-display text-lg font-bold tracking-wide transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C61 100%)',
                boxShadow: '0 4px 20px rgba(255, 107, 53, 0.4)'
              }}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                  登录中...
                </>
              ) : (
                '登录'
              )}
            </button>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl"
              >
                <p className="text-red-400 text-sm text-center">{error}</p>
              </motion.div>
            )}
          </form>

          <p className="text-center text-white/30 text-sm mt-8">
            © 2026 Badminton. All rights reserved.<br />
            作者小红书&抖音：强尼打工记
          </p>
        </motion.div>
      </div>

      {/* Right Side - Banner */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C61 50%, #FFAB91 100%)'
        }}>
          {/* Decorative elements */}
          <div className="absolute inset-0">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-20 right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl"
            />
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-white/10 blur-3xl"
            />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full p-12 text-white">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.8 }}
              className="w-32 h-32 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8"
            >
              <Flame className="w-16 h-16" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display text-5xl font-bold text-center mb-4"
            >
              Badminton
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white/80 text-xl text-center max-w-md"
            >
              羽毛球活动管理平台
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12 flex gap-8"
            >
              <div className="text-center">
                <div className="font-display text-3xl font-bold">1000+</div>
                <div className="text-white/60 text-sm">活跃用户</div>
              </div>
              <div className="text-center">
                <div className="font-display text-3xl font-bold">500+</div>
                <div className="text-white/60 text-sm">活动举办</div>
              </div>
              <div className="text-center">
                <div className="font-display text-3xl font-bold">50+</div>
                <div className="text-white/60 text-sm">合作伙伴</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
