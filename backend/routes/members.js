const express = require('express');
const router = express.Router();

router.get('/profile', (req, res) => {
  try {
    const { openid } = req.query;
    
    if (!openid) {
      return res.status(400).json({ error: '缺少用户标识' });
    }
    
    let memberResult = req.db.exec('SELECT * FROM members WHERE openid = ?', [openid]);
    
    if (memberResult.length === 0 || memberResult[0].values.length === 0) {
      const timestamp = new Date().toISOString();
      req.db.run(
        'INSERT INTO members (openid, nickname, headimgurl, points, created_at) VALUES (?, ?, ?, ?, ?)',
        [openid, '用户', '', 0, timestamp]
      );
      req.saveDB();
      memberResult = req.db.exec('SELECT * FROM members WHERE openid = ?', [openid]);
    }
    
    const memRow = memberResult[0].values[0];
    res.json({
      id: memRow[0], openid: memRow[1], nickname: memRow[2], headimgurl: memRow[3],
      points: memRow[4], balance: memRow[5] || 0, is_member: memRow[6] || 0, 
      member_expire_date: memRow[7], status: memRow[8]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/profile', (req, res) => {
  try {
    const { openid, nickname, headimgurl } = req.body;
    
    if (!openid) {
      return res.status(400).json({ error: '缺少用户标识' });
    }
    
    let memberResult = req.db.exec('SELECT * FROM members WHERE openid = ?', [openid]);
    
    if (memberResult.length > 0 && memberResult[0].values.length > 0) {
      const timestamp = new Date().toISOString();
      req.db.run(
        'UPDATE members SET nickname = ?, headimgurl = ?, updated_at = ? WHERE openid = ?',
        [nickname || memberResult[0].values[0][2], headimgurl || memberResult[0].values[0][3], timestamp, openid]
      );
    } else {
      const timestamp = new Date().toISOString();
      req.db.run(
        'INSERT INTO members (openid, nickname, headimgurl, points, created_at) VALUES (?, ?, ?, ?, ?)',
        [openid, nickname || '用户', headimgurl || '', 0, timestamp]
      );
    }
    
    req.saveDB();
    memberResult = req.db.exec('SELECT * FROM members WHERE openid = ?', [openid]);
    const memRow = memberResult[0].values[0];
    res.json({
      id: memRow[0], openid: memRow[1], nickname: memRow[2], headimgurl: memRow[3], points: memRow[4]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/points', (req, res) => {
  try {
    const { openid } = req.query;
    
    if (!openid) {
      return res.status(400).json({ error: '缺少用户标识' });
    }
    
    const memberResult = req.db.exec('SELECT points FROM members WHERE openid = ?', [openid]);
    
    if (memberResult.length === 0 || memberResult[0].values.length === 0) {
      return res.json({ points: 0 });
    }
    
    res.json({ points: memberResult[0].values[0][0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/points/records', (req, res) => {
  try {
    const { openid, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    if (!openid) {
      return res.status(400).json({ error: '缺少用户标识' });
    }
    
    const memberResult = req.db.exec('SELECT id FROM members WHERE openid = ?', [openid]);
    
    if (memberResult.length === 0 || memberResult[0].values.length === 0) {
      return res.json({ data: [], pagination: { page: 1, limit: 20, total: 0 } });
    }
    
    const memberId = memberResult[0].values[0][0];
    
    const records = req.db.exec(
      'SELECT * FROM points_records WHERE member_id = ? ORDER BY created_at DESC LIMIT ' + parseInt(limit) + ' OFFSET ' + offset,
      [memberId]
    );
    
    const result = records.length > 0 ? records[0].values.map(row => ({
      id: row[0], member_id: row[1], type: row[2], amount: row[3],
      source: row[4], reference_id: row[5], description: row[6], created_at: row[7]
    })) : [];
    
    const countResult = req.db.exec('SELECT COUNT(*) FROM points_records WHERE member_id = ?', [memberId]);
    const total = countResult.length > 0 ? countResult[0].values[0][0] : 0;
    
    res.json({
      data: result,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/balance/records', (req, res) => {
  try {
    const { openid, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    if (!openid) {
      return res.status(400).json({ error: '缺少用户标识' });
    }
    
    const memberResult = req.db.exec('SELECT id FROM members WHERE openid = ?', [openid]);
    
    if (memberResult.length === 0 || memberResult[0].values.length === 0) {
      return res.json({ data: [], pagination: { page: 1, limit: 20, total: 0 } });
    }
    
    const memberId = memberResult[0].values[0][0];
    
    const records = req.db.exec(
      'SELECT * FROM balance_records WHERE member_id = ? ORDER BY created_at DESC LIMIT ' + parseInt(limit) + ' OFFSET ' + offset,
      [memberId]
    );
    
    const result = records.length > 0 ? records[0].values.map(row => ({
      id: row[0], member_id: row[1], type: row[2], amount: row[3],
      payment_method: row[4], source: row[5], reference_id: row[6],
      description: row[7], created_at: row[8]
    })) : [];
    
    const countResult = req.db.exec('SELECT COUNT(*) FROM balance_records WHERE member_id = ?', [memberId]);
    const total = countResult.length > 0 ? countResult[0].values[0][0] : 0;
    
    res.json({
      data: result,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;