import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

function App() {
  useEffect(() => {
    simulateOpenId();
  }, []);

  const isAdminRoute = window.location.pathname.startsWith('/admin');

  return (
    <BrowserRouter>
      {isAdminRoute ? (
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
      ) : (
        <div className="h5-container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/activity/:id" element={<ActivityDetail />} />
            <Route path="/activity/:id/register" element={<RegisterPage />} />
            <Route path="/registrations" element={<RegistrationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/products" element={<ProductsPage />} />
          </Routes>
          <BottomNav />
        </div>
      )}
    </BrowserRouter>
  );
}

export default App;