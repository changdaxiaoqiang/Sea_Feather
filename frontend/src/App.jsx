import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ActivityDetail from './pages/ActivityDetail';
import RegisterPage from './pages/RegisterPage';
import RegistrationsPage from './pages/RegistrationsPage';
import ProfilePage from './pages/ProfilePage';
import ProductsPage from './pages/ProductsPage';
import AdminLayout from './admin/AdminLayout';
import AdminActivities from './admin/pages/AdminActivities';
import AdminActivityForm from './admin/pages/AdminActivityForm';
import AdminMembers from './admin/pages/AdminMembers';
import AdminProducts from './admin/pages/AdminProducts';
import AdminRedemptions from './admin/pages/AdminRedemptions';
import BottomNav from './components/BottomNav';
import { simulateOpenId } from './utils';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isActivityRoute = location.pathname.startsWith('/activity/');

  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminActivities />} />
          <Route path="activities/new" element={<AdminActivityForm />} />
          <Route path="activities/:id/edit" element={<AdminActivityForm />} />
          <Route path="activities/:id/edit/summary" element={<AdminActivityForm />} />
          <Route path="members" element={<AdminMembers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="redemptions" element={<AdminRedemptions />} />
        </Route>
      </Routes>
    );
  }

  return (
    <div className="h5-container flex flex-col h-screen overflow-hidden relative">
      <div className="flex-1 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+5rem)]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/activity/:id" element={<ActivityDetail />} />
          <Route path="/activity/:id/register" element={<RegisterPage />} />
          <Route path="/registrations" element={<RegistrationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/products" element={<ProductsPage />} />
        </Routes>
      </div>
      {!isActivityRoute && <BottomNav />}
    </div>
  );
}

function App() {
  useEffect(() => {
    simulateOpenId();
  }, []);

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;