const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const PERMISSIONS = [
  { key: 'activities', label: '活动管理' },
  { key: 'members', label: '成员管理' },
  { key: 'products', label: '商品管理' },
  { key: 'redemptions', label: '兑换记录' },
  { key: 'system', label: '系统管理' },
  { key: 'all', label: '全部权限' }
];

router.get('/permissions', (req, res) => {
  res.json(PERMISSIONS);
});

router.get('/users', (req, res) => {
  try {
    const result = req.db.exec('SELECT id, username, role, permissions, status, created_at, updated_at FROM admin_users ORDER BY id ASC');
    const users = result.length > 0 ? result[0].values.map(row => ({
      id: row[0],
      username: row[1],
      role: row[2],
      permissions: JSON.parse(row[3] || '[]'),
      status: row[4],
      created_at: row[5],
      updated_at: row[6]
    })) : [];
    res.json({ data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/users', (req, res) => {
  try {
    const { username, password, role, permissions } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    
    const check = req.db.exec('SELECT id FROM admin_users WHERE username = ?', [username]);
    if (check.length > 0 && check[0].values.length > 0) {
      return res.status(400).json({ error: '用户名已存在' });
    }
    
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    const timestamp = new Date().toISOString();
    
    req.db.run(
      'INSERT INTO admin_users (username, password, role, permissions, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [username, hash, role || 'admin', JSON.stringify(permissions || []), timestamp, timestamp]
    );
    
    req.saveDB();
    res.json({ message: '用户创建成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role, permissions, status } = req.body;
    
    if (username) {
      const check = req.db.exec('SELECT id FROM admin_users WHERE username = ? AND id != ?', [username, id]);
      if (check.length > 0 && check[0].values.length > 0) {
        return res.status(400).json({ error: '用户名已存在' });
      }
    }
    
    const updates = [];
    const params = [];
    
    if (username) {
      updates.push('username = ?');
      params.push(username);
    }
    if (password) {
      const hash = crypto.createHash('sha256').update(password).digest('hex');
      updates.push('password = ?');
      params.push(hash);
    }
    if (role) {
      updates.push('role = ?');
      params.push(role);
    }
    if (permissions) {
      updates.push('permissions = ?');
      params.push(JSON.stringify(permissions));
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    
    updates.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(id);
    
    req.db.run(`UPDATE admin_users SET ${updates.join(', ')} WHERE id = ?`, params);
    req.saveDB();
    
    res.json({ message: '用户更新成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const check = req.db.exec('SELECT id FROM admin_users WHERE id = ?', [id]);
    if (check.length === 0 || check[0].values.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    req.db.run('DELETE FROM admin_users WHERE id = ?', [id]);
    req.saveDB();
    
    res.json({ message: '用户删除成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    const result = req.db.exec('SELECT id, username, role, permissions FROM admin_users WHERE username = ? AND password = ? AND status = 1', [username, hash]);
    
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    const row = result[0].values[0];
    res.json({
      user: {
        id: row[0],
        username: row[1],
        role: row[2],
        permissions: JSON.parse(row[3] || '[]')
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
