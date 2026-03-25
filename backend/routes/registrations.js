const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { openid } = req.query;
    
    if (!openid) {
      return res.status(400).json({ error: '缺少用户标识' });
    }
    
    const memberResult = req.db.exec('SELECT id FROM members WHERE openid = ?', [openid]);
    if (memberResult.length === 0 || memberResult[0].values.length === 0) {
      return res.json({ data: [] });
    }
    
    const memberId = memberResult[0].values[0][0];
    
    const registrations = req.db.exec(`
      SELECT r.*, a.title, a.type, a.activity_date, a.start_time, a.end_time, a.location, a.images, a.price_activity, a.price_dinner, a.price_dinner_only, a.status as activity_status
      FROM registrations r
      JOIN activities a ON r.activity_id = a.id
      WHERE r.member_id = ? AND r.status IN ('confirmed', 'waitlist')
      ORDER BY a.activity_date DESC
    `, [memberId]);
    
    const result = registrations.length > 0 ? registrations[0].values.map(row => ({
      id: row[0], activity_id: row[1], member_id: row[2], registration_type: row[3],
      status: row[4], waitlist_order: row[5], actual_fee: row[6], is_paid: row[7], created_at: row[8],
      title: row[9], type: row[10], activity_date: row[11], start_time: row[12],
      end_time: row[13], location: row[14], images: row[15],
      activity_status: row[16]
    })) : [];
    
    res.json({ data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/cancel', (req, res) => {
  try {
    const { openid } = req.body;
    const registrationId = parseInt(req.params.id);
    
    const regResult = req.db.exec(`
      SELECT r.*, a.title, a.status as activity_status
      FROM registrations r
      JOIN activities a ON r.activity_id = a.id
      WHERE r.id = ?
    `, [registrationId]);
    
    if (regResult.length === 0 || regResult[0].values.length === 0) {
      return res.status(404).json({ error: '报名记录不存在' });
    }
    
    const regRow = regResult[0].values[0];
    const registration = {
      id: regRow[0], activity_id: regRow[1], member_id: regRow[2], registration_type: regRow[3],
      status: regRow[4], waitlist_order: regRow[5], actual_fee: regRow[6], is_paid: regRow[7],
      activity_status: regRow[9]
    };
    
    const memberResult = req.db.exec('SELECT * FROM members WHERE openid = ?', [openid]);
    if (memberResult.length === 0 || memberResult[0].values.length === 0 || memberResult[0].values[0][0] !== registration.member_id) {
      return res.status(403).json({ error: '无权限' });
    }
    
    if (registration.status === 'cancelled') {
      return res.status(400).json({ error: '已取消' });
    }
    
    if (registration.is_paid) {
      return res.status(400).json({ error: '已付款无法取消，请联系管理员' });
    }
    
    req.db.run('UPDATE registrations SET status = ? WHERE id = ?', ['cancelled', registrationId]);
    
    if (registration.status === 'confirmed') {
      const nextWaitlist = req.db.exec(
        'SELECT * FROM registrations WHERE activity_id = ? AND status = ? ORDER BY waitlist_order ASC LIMIT 1',
        [registration.activity_id, 'waitlist']
      );
      
      if (nextWaitlist.length > 0 && nextWaitlist[0].values.length > 0) {
        const waitRow = nextWaitlist[0].values[0];
        req.db.run('UPDATE registrations SET status = ?, waitlist_order = 0 WHERE id = ?', ['confirmed', waitRow[0]]);
      }
    }
    
    req.saveDB();
    
    res.json({ message: '取消成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;