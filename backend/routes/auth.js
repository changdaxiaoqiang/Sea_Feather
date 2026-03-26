const express = require('express');
const router = express.Router();
const crypto = require('crypto');

router.post('/admin/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '请输入用户名和密码' });
    }
    
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    const result = req.db.exec('SELECT * FROM admin_users WHERE username = ? AND password = ? AND status = 1', [username, hash]);
    
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    const row = result[0].values[0];
    const token = crypto.createHash('sha256').update(username + Date.now()).digest('hex');
    
    let permissions = [];
    try {
      const permStr = row[4];
      if (typeof permStr === 'string') {
        permissions = JSON.parse(permStr);
      } else if (Array.isArray(permStr)) {
        permissions = permStr;
      }
    } catch (e) {
      permissions = [];
    }
    
    res.json({
      token,
      user: {
        id: row[0],
        username: row[1],
        role: row[3],
        permissions
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
