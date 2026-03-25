import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Check, User, Shield, Key } from 'lucide-react';
import { motion } from 'framer-motion';
import { getSystemUsers, createSystemUser, updateSystemUser, deleteSystemUser, getSystemPermissions } from '../../api';

const AdminSystem = () => {
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    username: '',
    password: '',
    role: 'admin',
    permissions: [],
    status: 1
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, permsRes] = await Promise.all([
        getSystemUsers(),
        getSystemPermissions()
      ]);
      setUsers(usersRes.data || []);
      setPermissions(permsRes || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setForm({
        username: user.username,
        password: '',
        role: user.role,
        permissions: user.permissions || [],
        status: user.status
      });
    } else {
      setEditingUser(null);
      setForm({
        username: '',
        password: '',
        role: 'admin',
        permissions: [],
        status: 1
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (!form.username || (!editingUser && !form.password)) {
        alert('请填写用户名和密码');
        return;
      }
      
      if (editingUser) {
        await updateSystemUser(editingUser.id, form);
      } else {
        await createSystemUser(form);
      }
      
      setShowModal(false);
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || '操作失败');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除此用户吗？')) return;
    
    try {
      await deleteSystemUser(id);
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || '删除失败');
    }
  };

  const togglePermission = (perm) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }));
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">系统管理</h1>
          <p className="text-white/50 mt-1">管理后台用户权限</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C61 100%)',
            boxShadow: '0 4px 20px rgba(255, 107, 53, 0.4)'
          }}
        >
          <Plus className="w-5 h-5" />
          新增用户
        </button>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-brand-primary/30 border-t-brand-primary rounded-full"
          />
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card-glass rounded-2xl p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{user.username}</h3>
                      {user.role === 'super_admin' && (
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">超级管理员</span>
                      )}
                      {user.status === 0 && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">禁用</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-white/40 text-sm">{user.role === 'super_admin' ? '超级管理员' : '管理员'}</span>
                      <span className="text-white/20 text-xs">|</span>
                      <span className="text-white/40 text-sm">
                        权限: {user.permissions?.includes('all') ? '全部' : (user.permissions?.join(', ') || '无')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal(user)}
                    className="p-3 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  {user.username !== 'admin' && (
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-50"
            onClick={() => setShowModal(false)}
          />
          <div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-[#1a1a2e] rounded-2xl border border-white/10 z-50 p-5 shadow-2xl max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-white">
                {editingUser ? '编辑用户' : '新增用户'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">用户名</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-primary text-sm"
                  placeholder="请输入用户名"
                />
              </div>
              
              <div>
                <label className="block text-sm text-white/60 mb-1.5">
                  密码 {editingUser && <span className="text-white/30">(留空则不修改)</span>}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-primary text-sm"
                  placeholder={editingUser ? '留空不修改密码' : '请输入密码'}
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">角色</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-primary text-sm"
                >
                  <option value="admin" className="text-gray-900">管理员</option>
                  <option value="super_admin" className="text-gray-900">超级管理员</option>
                </select>
              </div>

              {form.role !== 'super_admin' && (
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">权限</label>
                  <div className="flex flex-wrap gap-2">
                    {permissions.filter(p => p.key !== 'all').map(perm => (
                      <button
                        key={perm.key}
                        onClick={() => togglePermission(perm.key)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          form.permissions.includes(perm.key)
                            ? 'bg-brand-primary text-white'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {perm.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {editingUser && (
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">状态</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: parseInt(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-primary text-sm"
                  >
                    <option value={1} className="text-gray-900">启用</option>
                    <option value={0} className="text-gray-900">禁用</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-3 py-2.5 border border-white/20 rounded-lg text-white/60 hover:bg-white/5 transition-colors text-sm"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-3 py-2.5 bg-gradient-to-r from-brand-primary to-orange-500 rounded-lg text-white font-semibold hover:from-brand-primary-dark hover:to-orange-600 transition-all text-sm"
              >
                {editingUser ? '保存' : '创建'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminSystem;
