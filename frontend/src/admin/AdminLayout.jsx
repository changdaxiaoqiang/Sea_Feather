import React, { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Calendar, Users, Package, Gift, ChevronLeft, Flame, Shield, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = React.useState(null);

  useEffect(() => {
    const user = localStorage.getItem('adminUser');
    if (!user) {
      navigate('/admin/login');
    } else {
      setAdminUser(JSON.parse(user));
      if (window.location.pathname === '/admin') {
        navigate('/admin/activities');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  if (!adminUser) return null;

  const navItems = [
    { path: '/admin', icon: Calendar, label: '活动管理', end: true },
    { path: '/admin/members', icon: Users, label: '成员管理' },
    { path: '/admin/products', icon: Package, label: '商品管理' },
    { path: '/admin/redemptions', icon: Gift, label: '兑换记录' },
    { path: '/admin/system', icon: Shield, label: '系统管理' },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)' }}>
      <aside className="w-64 flex-shrink-0 relative" style={{ background: '#151520' }}>
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at 20% 20%, rgba(255, 107, 53, 0.08) 0%, transparent 50%)'
        }} />
        
        <div className="relative p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary p-0.5">
              <div className="w-full h-full rounded-xl flex items-center justify-center" style={{ background: '#151520' }}>
                <Flame className="w-5 h-5 text-brand-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-white font-display font-bold tracking-wide">Badminton</h1>
              <p className="text-white/40 text-xs">管理后台</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-2 relative">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r from-brand-primary/20 to-brand-secondary/10 text-brand-primary border border-brand-primary/30' 
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6 space-y-2">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center">
              <span className="text-brand-primary text-sm font-bold">{adminUser?.username?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{adminUser?.username}</p>
              <p className="text-white/40 text-xs">{adminUser?.role === 'super_admin' ? '超级管理员' : '管理员'}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all border border-white/10"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">返回H5</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">退出登录</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;