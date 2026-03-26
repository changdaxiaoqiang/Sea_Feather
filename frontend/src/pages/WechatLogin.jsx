import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, MessageCircle } from 'lucide-react';
import { wechatLogin, getWechatConfig } from '../api';
import { setOpenId, setMember, setToken, getWechatAuthUrl, isLoggedIn } from '../utils';

const WechatLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  useEffect(() => {
    if (isLoggedIn()) {
      const redirectUri = localStorage.getItem('loginRedirect') || '/';
      localStorage.removeItem('loginRedirect');
      navigate(redirectUri);
      return;
    }

    if (code) {
      handleWechatLogin(code);
    }
  }, [code, navigate]);

  const handleWechatLogin = async (code) => {
    try {
      const res = await wechatLogin(code);
      setOpenId(res.member.openid);
      setMember(res.member);
      setToken(res.token);
      
      const redirectUri = localStorage.getItem('loginRedirect') || '/';
      localStorage.removeItem('loginRedirect');
      navigate(redirectUri);
    } catch (error) {
      console.error('Login failed:', error);
      alert('登录失败，请重试');
      navigate('/');
    }
  };

  const handleWechatAuth = async () => {
    const currentUrl = window.location.href.split('?')[0];
    const authUrl = getWechatAuthUrl(currentUrl);
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-glow-orange"
        >
          <Flame className="w-12 h-12 text-white" />
        </motion.div>
        
        <h1 className="font-display text-3xl font-bold text-white mb-2">Sea Feather</h1>
        <p className="text-white/60 mb-8">羽毛球活动平台</p>

        <div className="space-y-4">
          <button
            onClick={handleWechatAuth}
            className="w-full py-4 px-8 rounded-xl font-display text-lg font-bold tracking-wide transition-all flex items-center justify-center gap-3"
            style={{
              background: '#07C160',
              boxShadow: '0 4px 20px rgba(7, 193, 96, 0.4)'
            }}
          >
            <MessageCircle className="w-6 h-6" />
            微信授权登录
          </button>
          
          <p className="text-white/40 text-sm">
            点击上方按钮进行微信授权
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default WechatLogin;
