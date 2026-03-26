import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ActivityDetail from './pages/ActivityDetail';
import RegisterPage from './pages/RegisterPage';
import RegistrationsPage from './pages/RegistrationsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import ProductsPage from './pages/ProductsPage';
import WechatLogin from './pages/WechatLogin';
import AdminLayout from './admin/AdminLayout';
import AdminActivities from './admin/pages/AdminActivities';
import AdminActivityForm from './admin/pages/AdminActivityForm';
import AdminMembers from './admin/pages/AdminMembers';
import AdminProducts from './admin/pages/AdminProducts';
import AdminRedemptions from './admin/pages/AdminRedemptions';
import AdminSystem from './admin/pages/AdminSystem';
import AdminLogin from './admin/pages/AdminLogin';
import BottomNav from './components/BottomNav';
import { isLoggedIn, logout } from './utils';

function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoggedIn()) {
      localStorage.setItem('loginRedirect', location.pathname);
      navigate('/login');
    }
  }, [navigate, location]);

  if (!isLoggedIn()) {
    return null;
  }

  return children;
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isActivityRoute = location.pathname.startsWith('/activity/');
  const isSettingsRoute = location.pathname.startsWith('/settings');

  if (location.pathname === '/admin/login') {
    return <AdminLogin />;
  }
  
  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminActivities />} />
          <Route path="activities" element={<AdminActivities />} />
          <Route path="activities/new" element={<AdminActivityForm />} />
          <Route path="activities/:id/edit" element={<AdminActivityForm />} />
          <Route path="activities/:id/edit/summary" element={<AdminActivityForm />} />
          <Route path="members" element={<AdminMembers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="redemptions" element={<AdminRedemptions />} />
          <Route path="system" element={<AdminSystem />} />
        </Route>
      </Routes>
    );
  }

  return (
    <div className="h5-container flex flex-col h-screen overflow-hidden relative">
      <div className="flex-1 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+5rem)]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<WechatLogin />} />
          <Route path="/activity/:id" element={<ActivityDetail />} />
          <Route path="/activity/:id/register" element={
            <ProtectedRoute>
              <RegisterPage />
            </ProtectedRoute>
          } />
          <Route path="/registrations" element={
            <ProtectedRoute>
              <RegistrationsPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/products" element={<ProductsPage />} />
        </Routes>
      </div>
      {!isActivityRoute && !isSettingsRoute && <BottomNav />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
