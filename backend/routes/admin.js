const express = require('express');
const router = express.Router();

router.get('/activities', (req, res) => {
  try {
    const activities = req.db.exec('SELECT * FROM activities ORDER BY activity_date DESC');
    const result = activities.length > 0 ? activities[0].values.map(row => ({
      id: row[0], title: row[1], type: row[2], activity_date: row[3],
      start_time: row[4], end_time: row[5], images: row[6], courts: row[7],
      location: row[8], transportation: row[9], price_activity: row[10],
      price_dinner: row[11], price_dinner_only: row[12], max_participants: row[13],
      max_waitlist: row[14], status: row[15],
      actual_court_fee: row[16] || 0,
      actual_ball_count: row[17] || 0,
      actual_ball_price: row[18] || 0,
      created_at: row[19], updated_at: row[20]
    })) : [];
    
    const withStats = result.map(a => {
      const confirmed = req.db.exec('SELECT COUNT(*) FROM registrations WHERE activity_id = ? AND status = ?', [a.id, 'confirmed']);
      const waitlist = req.db.exec('SELECT COUNT(*) FROM registrations WHERE activity_id = ? AND status = ?', [a.id, 'waitlist']);
      return {
        ...a,
        images: JSON.parse(a.images || '[]'),
        courts: JSON.parse(a.courts || '[]'),
        confirmed_count: confirmed.length > 0 ? confirmed[0].values[0][0] : 0,
        waitlist_count: waitlist.length > 0 ? waitlist[0].values[0][0] : 0
      };
    });
    
    res.json({ data: withStats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/activities', (req, res) => {
  try {
    const {
      title, type, activity_date, start_time, end_time,
      images, courts, location, transportation,
      price_activity, price_dinner, price_dinner_only,
      max_participants, max_waitlist, status
    } = req.body;
    
    const timestamp = new Date().toISOString();
    
    req.db.run(`
      INSERT INTO activities (
        title, type, activity_date, start_time, end_time,
        images, courts, location, transportation,
        price_activity, price_dinner, price_dinner_only,
        max_participants, max_waitlist, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title, type, activity_date, start_time, end_time,
      JSON.stringify(images || []), JSON.stringify(courts || []),
      location, transportation,
      price_activity || 0, price_dinner || 0, price_dinner_only || 0,
      max_participants || 20, max_waitlist || 5,
      status || 'active', timestamp, timestamp
    ]);
    
    req.saveDB();
    
    const result = req.db.exec('SELECT * FROM activities WHERE title = ? ORDER BY id DESC LIMIT 1', [title]);
    const row = result[0].values[0];
    const activity = {
      id: row[0], title: row[1], type: row[2], activity_date: row[3],
      start_time: row[4], end_time: row[5], images: row[6], courts: row[7],
      location: row[8], transportation: row[9], price_activity: row[10],
      price_dinner: row[11], price_dinner_only: row[12], max_participants: row[13],
      max_waitlist: row[14], status: row[15]
    };
    
    res.json({
      ...activity,
      images: JSON.parse(activity.images || '[]'),
      courts: JSON.parse(activity.courts || '[]')
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/activities/:id', (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, type, activity_date, start_time, end_time,
      images, courts, location, transportation,
      price_activity, price_dinner, price_dinner_only,
      max_participants, max_waitlist, status,
      actual_court_fee, actual_ball_count, actual_ball_price
    } = req.body;
    
    const timestamp = new Date().toISOString();
    
    req.db.run(`
      UPDATE activities SET
        title = ?, type = ?, activity_date = ?, start_time = ?, end_time = ?,
        images = ?, courts = ?, location = ?, transportation = ?,
        price_activity = ?, price_dinner = ?, price_dinner_only = ?,
        max_participants = ?, max_waitlist = ?, status = ?,
        actual_court_fee = ?, actual_ball_count = ?, actual_ball_price = ?,
        updated_at = ?
      WHERE id = ?
    `, [
      title, type, activity_date, start_time, end_time,
      JSON.stringify(images || []), JSON.stringify(courts || []),
      location, transportation,
      price_activity || 0, price_dinner || 0, price_dinner_only || 0,
      max_participants || 20, max_waitlist || 5,
      status || 'active',
      actual_court_fee || 0, actual_ball_count || 0, actual_ball_price || 0,
      timestamp, id
    ]);
    
    req.saveDB();
    
    const result = req.db.exec('SELECT * FROM activities WHERE id = ?', [id]);
    const row = result[0].values[0];
    const activity = {
      id: row[0], title: row[1], type: row[2], activity_date: row[3],
      start_time: row[4], end_time: row[5], images: row[6], courts: row[7],
      location: row[8], transportation: row[9], price_activity: row[10],
      price_dinner: row[11], price_dinner_only: row[12], max_participants: row[13],
      max_waitlist: row[14], status: row[15],
      actual_court_fee: row[16] || 0,
      actual_ball_count: row[17] || 0,
      actual_ball_price: row[18] || 0
    };
    
    res.json({
      ...activity,
      images: JSON.parse(activity.images || '[]'),
      courts: JSON.parse(activity.courts || '[]')
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/activities/:id/calculate', (req, res) => {
  try {
    const { id } = req.params;
    
    const activityResult = req.db.exec('SELECT * FROM activities WHERE id = ?', [id]);
    if (activityResult.length === 0 || activityResult[0].values.length === 0) {
      return res.status(404).json({ error: '活动不存在' });
    }
    
    const actRow = activityResult[0].values[0];
    const activity = {
      actual_court_fee: actRow[16] || 0,
      actual_ball_count: actRow[17] || 0,
      actual_ball_price: actRow[18] || 0,
      courts: JSON.parse(actRow[7] || '[]')
    };
    
    const registrations = req.db.exec(`
      SELECT * FROM registrations WHERE activity_id = ? AND status = 'confirmed'
    `, [id]);
    
    const regs = registrations.length > 0 ? registrations[0].values.map(row => ({
      id: row[0], registration_type: row[3]
    })) : [];
    
    const totalBallCost = activity.actual_ball_count * activity.actual_ball_price;
    const perPersonBallCost = regs.length > 0 ? (totalBallCost / regs.length).toFixed(2) : 0;
    
    const perPersonCourtCost = activity.actual_court_fee / activity.courts.length;
    
    const updates = [];
    
    regs.forEach(reg => {
      let activityFee = 0;
      let dinnerFee = 0;
      
      if (reg.registration_type === 'activity') {
        activityFee = perPersonBallCost + perPersonCourtCost;
      } else if (reg.registration_type === 'both') {
        activityFee = perPersonBallCost + perPersonCourtCost;
      } else if (reg.registration_type === 'dinner') {
        dinnerFee = 0;
      }
      
      const totalFee = activityFee + dinnerFee;
      updates.push({ regId: reg.id, fee: totalFee });
      req.db.run('UPDATE registrations SET actual_fee = ? WHERE id = ?', [totalFee, reg.id]);
    });
    
    req.saveDB();
    
    res.json({
      message: '费用计算完成',
      summary: {
        totalBallCost,
        perPersonBallCost: parseFloat(perPersonBallCost),
        totalCourtFee: activity.actual_court_fee,
        participants: regs.length,
        updates
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/activities/:id/summary', (req, res) => {
  try {
    const { id } = req.params;
    
    const activityResult = req.db.exec('SELECT * FROM activities WHERE id = ?', [id]);
    if (activityResult.length === 0 || activityResult[0].values.length === 0) {
      return res.status(404).json({ error: '活动不存在' });
    }
    
    const actRow = activityResult[0].values[0];
    const activity = {
      title: actRow[1],
      actual_court_fee: actRow[16] || 0,
      actual_ball_count: actRow[17] || 0,
      actual_ball_price: actRow[18] || 0,
      courts: JSON.parse(actRow[7] || '[]')
    };
    
    const registrations = req.db.exec(`
      SELECT r.*, m.nickname, m.headimgurl
      FROM registrations r
      JOIN members m ON r.member_id = m.id
      WHERE r.activity_id = ? AND r.status IN ('confirmed', 'waitlist')
      ORDER BY r.status, r.waitlist_order, r.id
    `, [id]);
    
    const regs = registrations.length > 0 ? registrations[0].values.map(row => ({
      id: row[0], activity_id: row[1], member_id: row[2], registration_type: row[3], 
      status: row[4], waitlist_order: row[5], actual_fee: row[6], is_paid: row[7],
      payment_method: row[8], paid_at: row[9],
      member_nickname: row[10], member_headimgurl: row[11]
    })) : [];
    
    const totalExpected = regs.reduce((sum, r) => sum + (r.actual_fee || 0), 0);
    const totalPaid = regs.filter(r => r.is_paid).reduce((sum, r) => sum + (r.actual_fee || 0), 0);
    
    res.json({
      activity,
      registrations: regs,
      summary: {
        totalParticipants: regs.length,
        totalExpected,
        totalPaid,
        unpaidAmount: totalExpected - totalPaid,
        unpaidCount: regs.filter(r => !r.is_paid).length
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/registrations/:id/paid', (req, res) => {
  try {
    const { id } = req.params;
    const { is_paid, payment_method } = req.body;
    
    const regResult = req.db.exec('SELECT * FROM registrations WHERE id = ?', [id]);
    if (regResult.length === 0 || regResult[0].values.length === 0) {
      return res.status(404).json({ error: '报名记录不存在' });
    }
    
    const reg = regResult[0].values[0];
    const memberId = reg[2];
    const activityId = reg[1];
    const actualFee = reg[6];
    const timestamp = new Date().toISOString();
    
    const activityResult = req.db.exec('SELECT title FROM activities WHERE id = ?', [activityId]);
    const activityTitle = activityResult.length > 0 && activityResult[0].values.length > 0 ? activityResult[0].values[0][0] : '活动';
    
    if (is_paid && payment_method === 'card' && actualFee > 0) {
      const memberResult = req.db.exec('SELECT balance, nickname FROM members WHERE id = ?', [memberId]);
      if (memberResult.length === 0 || memberResult[0].values.length === 0) {
        return res.status(404).json({ error: '用户不存在' });
      }
      
      const balance = memberResult[0].values[0][0];
      if (balance < actualFee) {
        return res.status(400).json({ error: '余额不足' });
      }
      
      req.db.run('UPDATE members SET balance = balance - ? WHERE id = ?', [actualFee, memberId]);
      req.db.run(
        'INSERT INTO balance_records (member_id, type, amount, payment_method, source, reference_id, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [memberId, 'deduction', -actualFee, 'card', 'activity_payment', activityId, `活动扣费: ${activityTitle} - ¥${actualFee}`, timestamp]
      );
    }
    
    if (is_paid && payment_method !== 'card' && actualFee > 0) {
      const memberResult = req.db.exec('SELECT nickname FROM members WHERE id = ?', [memberId]);
      const nickname = memberResult.length > 0 && memberResult[0].values.length > 0 ? memberResult[0].values[0][0] : '用户';
      req.db.run(
        'INSERT INTO balance_records (member_id, type, amount, payment_method, source, reference_id, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [memberId, 'income', actualFee, payment_method, 'activity_payment', activityId, `活动缴费: ${activityTitle} - ¥${actualFee}`, timestamp]
      );
    }
    
    req.db.run(
      'UPDATE registrations SET is_paid = ?, payment_method = ?, paid_at = ? WHERE id = ?',
      [is_paid ? 1 : 0, payment_method || null, is_paid ? timestamp : null, id]
    );
    req.saveDB();
    
    res.json({ message: '付款状态已更新' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/activities/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    req.db.run('DELETE FROM registrations WHERE activity_id = ?', [id]);
    req.db.run('DELETE FROM activities WHERE id = ?', [id]);
    
    req.saveDB();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/activities/:id/registrations', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;
    
    let sql = `
      SELECT r.*, m.nickname, m.headimgurl
      FROM registrations r
      JOIN members m ON r.member_id = m.id
      WHERE r.activity_id = ?
    `;
    const params = [id];
    
    if (status) {
      sql += ' AND r.status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY r.status ASC, r.waitlist_order ASC, r.id ASC';
    
    const registrations = req.db.exec(sql, params);
    const result = registrations.length > 0 ? registrations[0].values.map(row => ({
      id: row[0], activity_id: row[1], member_id: row[2], registration_type: row[3],
      status: row[4], waitlist_order: row[5], actual_fee: row[6], is_paid: row[7], created_at: row[8],
      nickname: row[10], headimgurl: row[11]
    })) : [];
    
    res.json({ data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/members', (req, res) => {
  try {
    const { page = 1, limit = 20, keyword } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let sql = 'SELECT * FROM members WHERE 1=1';
    const params = [];
    
    if (keyword) {
      sql += ' AND nickname LIKE ?';
      params.push('%' + keyword + '%');
    }
    
    sql += ' ORDER BY created_at DESC LIMIT ' + parseInt(limit) + ' OFFSET ' + offset;
    
    const members = req.db.exec(sql, params);
    const result = members.length > 0 ? members[0].values.map(row => ({
      id: row[0], openid: row[1], nickname: row[2], headimgurl: row[3],
      points: row[4], status: row[5], created_at: row[6], updated_at: row[7]
    })) : [];
    
    res.json({ data: result, pagination: { page: parseInt(page), limit: parseInt(limit), total: result.length } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/members/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { nickname, status, balance, is_member, member_expire_date } = req.body;
    
    const timestamp = new Date().toISOString();
    req.db.run(
      'UPDATE members SET nickname = ?, status = ?, balance = ?, is_member = ?, member_expire_date = ?, updated_at = ? WHERE id = ?',
      [nickname, status, balance || 0, is_member || 0, member_expire_date || null, timestamp, id]
    );
    req.saveDB();
    
    const result = req.db.exec('SELECT * FROM members WHERE id = ?', [id]);
    const row = result[0].values[0];
    res.json({
      id: row[0], openid: row[1], nickname: row[2], headimgurl: row[3],
      points: row[4], balance: row[5] || 0, is_member: row[6] || 0,
      member_expire_date: row[7], status: row[8], created_at: row[9], updated_at: row[10]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/members/:id/balance', (req, res) => {
  try {
    const { id } = req.params;
    const { amount, payment_method, description } = req.body;
    
    const memberResult = req.db.exec('SELECT * FROM members WHERE id = ?', [id]);
    if (memberResult.length === 0 || memberResult[0].values.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    const type = amount >= 0 ? 'recharge' : 'deduction';
    const timestamp = new Date().toISOString();
    
    req.db.run('UPDATE members SET balance = balance + ? WHERE id = ?', [amount, id]);
    req.db.run(
      'INSERT INTO balance_records (member_id, type, amount, payment_method, source, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, type, amount, payment_method || 'offline', 'admin_recharge', description || '管理员操作', timestamp]
    );
    
    req.saveDB();
    
    const result = req.db.exec('SELECT * FROM members WHERE id = ?', [id]);
    const row = result[0].values[0];
    res.json({
      id: row[0], openid: row[1], nickname: row[2], headimgurl: row[3],
      points: row[4], balance: row[5] || 0, is_member: row[6] || 0,
      member_expire_date: row[7], status: row[8]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/members/:id/member', (req, res) => {
  try {
    const { id } = req.params;
    const { months, price } = req.body;
    
    const memberResult = req.db.exec('SELECT * FROM members WHERE id = ?', [id]);
    if (memberResult.length === 0 || memberResult[0].values.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    const currentExpire = memberResult[0].values[0][7];
    let newExpire;
    const now = new Date();
    
    if (currentExpire && new Date(currentExpire) > now) {
      const current = new Date(currentExpire);
      current.setMonth(current.getMonth() + parseInt(months));
      newExpire = current.toISOString().split('T')[0];
    } else {
      const future = new Date(now);
      future.setMonth(future.getMonth() + parseInt(months));
      newExpire = future.toISOString().split('T')[0];
    }
    
    const timestamp = new Date().toISOString();
    
    req.db.run('UPDATE members SET is_member = 1, member_expire_date = ? WHERE id = ?', [newExpire, id]);
    if (price > 0) {
      req.db.run('UPDATE members SET balance = balance - ? WHERE id = ?', [price, id]);
      req.db.run(
        'INSERT INTO balance_records (member_id, type, amount, payment_method, source, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, 'deduction', -price, 'member_fee', 'member_recharge', `会员续费${months}个月`, timestamp]
      );
    }
    
    req.saveDB();
    
    const result = req.db.exec('SELECT * FROM members WHERE id = ?', [id]);
    const row = result[0].values[0];
    res.json({
      id: row[0], openid: row[1], nickname: row[2], headimgurl: row[3],
      points: row[4], balance: row[5] || 0, is_member: row[6] || 0,
      member_expire_date: row[7], status: row[8]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/members/:id/points', (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description } = req.body;
    
    const memberResult = req.db.exec('SELECT * FROM members WHERE id = ?', [id]);
    if (memberResult.length === 0 || memberResult[0].values.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    const type = amount >= 0 ? 'income' : 'expense';
    const timestamp = new Date().toISOString();
    
    req.db.run('UPDATE members SET points = points + ? WHERE id = ?', [amount, id]);
    req.db.run(
      'INSERT INTO points_records (member_id, type, amount, source, description, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, type, amount, 'admin_adjust', description || '管理员调整', timestamp]
    );
    
    req.saveDB();
    
    const result = req.db.exec('SELECT * FROM members WHERE id = ?', [id]);
    const row = result[0].values[0];
    res.json({
      id: row[0], openid: row[1], nickname: row[2], headimgurl: row[3],
      points: row[4], status: row[5]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/products', (req, res) => {
  try {
    const products = req.db.exec('SELECT * FROM products ORDER BY created_at DESC');
    const result = products.length > 0 ? products[0].values.map(row => ({
      id: row[0], name: row[1], image: row[2], points_required: row[3],
      stock: row[4], status: row[5], created_at: row[6], updated_at: row[7]
    })) : [];
    res.json({ data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/products', (req, res) => {
  try {
    const { name, image, points_required, stock, status } = req.body;
    const timestamp = new Date().toISOString();
    
    req.db.run(
      'INSERT INTO products (name, image, points_required, stock, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, image, points_required || 0, stock || 0, status || 1, timestamp, timestamp]
    );
    req.saveDB();
    
    const result = req.db.exec('SELECT * FROM products ORDER BY id DESC LIMIT 1');
    const row = result[0].values[0];
    res.json({
      id: row[0], name: row[1], image: row[2], points_required: row[3],
      stock: row[4], status: row[5], created_at: row[6], updated_at: row[7]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, image, points_required, stock, status } = req.body;
    const timestamp = new Date().toISOString();
    
    req.db.run(
      'UPDATE products SET name = ?, image = ?, points_required = ?, stock = ?, status = ?, updated_at = ? WHERE id = ?',
      [name, image, points_required, stock, status, timestamp, id]
    );
    req.saveDB();
    
    const result = req.db.exec('SELECT * FROM products WHERE id = ?', [id]);
    const row = result[0].values[0];
    res.json({
      id: row[0], name: row[1], image: row[2], points_required: row[3],
      stock: row[4], status: row[5], created_at: row[6], updated_at: row[7]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/products/:id', (req, res) => {
  try {
    req.db.run('DELETE FROM products WHERE id = ?', [req.params.id]);
    req.saveDB();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/redemptions', (req, res) => {
  try {
    const redemptions = req.db.exec(`
      SELECT r.*, m.nickname, m.headimgurl, p.name as product_name, p.image as product_image
      FROM redemptions r
      JOIN members m ON r.member_id = m.id
      JOIN products p ON r.product_id = p.id
      ORDER BY r.created_at DESC
    `);
    const result = redemptions.length > 0 ? redemptions[0].values.map(row => ({
      id: row[0], member_id: row[1], product_id: row[2], points_used: row[3],
      status: row[4], created_at: row[5], nickname: row[6], headimgurl: row[7],
      product_name: row[8], product_image: row[9]
    })) : [];
    res.json({ data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;