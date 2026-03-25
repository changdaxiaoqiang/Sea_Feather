const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let sql = 'SELECT * FROM activities';
    let countSql = 'SELECT COUNT(*) as total FROM activities';
    const params = [];
    
    if (status) {
      sql = 'SELECT * FROM activities WHERE status = ?';
      countSql = 'SELECT COUNT(*) as total FROM activities WHERE status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY activity_date DESC LIMIT ' + parseInt(limit) + ' OFFSET ' + offset;
    
    const activities = req.db.exec(sql, params);
    const activitiesList = activities.length > 0 ? activities[0].values.map(row => ({
      id: row[0], title: row[1], type: row[2], activity_date: row[3],
      start_time: row[4], end_time: row[5], images: row[6], courts: row[7],
      location: row[8], transportation: row[9], price_activity: row[10],
      price_dinner: row[11], price_dinner_only: row[12], max_participants: row[13],
      max_waitlist: row[14], status: row[15], registration_key: row[16] || '',
      actual_court_fee: row[17] || 0,
      actual_ball_count: row[18] || 0,
      actual_ball_price: row[19] || 0,
      created_at: row[20], updated_at: row[21]
    })) : [];
    
    const countResult = req.db.exec(countSql, params);
    const total = countResult.length > 0 ? countResult[0].values[0][0] : 0;
    
    const activitiesWithStats = activitiesList.map(activity => {
      const confirmedResult = req.db.exec(
        'SELECT COUNT(*) FROM registrations WHERE activity_id = ? AND status = ?',
        [activity.id, 'confirmed']
      );
      const confirmed = confirmedResult.length > 0 ? confirmedResult[0].values[0][0] : 0;
      
      const waitlistResult = req.db.exec(
        'SELECT COUNT(*) FROM registrations WHERE activity_id = ? AND status = ?',
        [activity.id, 'waitlist']
      );
      const waitlist = waitlistResult.length > 0 ? waitlistResult[0].values[0][0] : 0;
      
      const activityCountResult = req.db.exec(
        "SELECT COUNT(*) FROM registrations WHERE activity_id = ? AND status = 'confirmed' AND registration_type = 'activity'",
        [activity.id]
      );
      const activity_count = activityCountResult.length > 0 ? activityCountResult[0].values[0][0] : 0;
      
      const dinnerCountResult = req.db.exec(
        "SELECT COUNT(*) FROM registrations WHERE activity_id = ? AND status = 'confirmed' AND registration_type IN ('both', 'dinner')",
        [activity.id]
      );
      const dinner_count = dinnerCountResult.length > 0 ? dinnerCountResult[0].values[0][0] : 0;
      
      return {
        ...activity,
        images: JSON.parse(activity.images || '[]'),
        courts: JSON.parse(activity.courts || '[]'),
        confirmed_count: confirmed,
        waitlist_count: waitlist,
        activity_count,
        dinner_count
      };
    });
    
    res.json({
      data: activitiesWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const result = req.db.exec('SELECT * FROM activities WHERE id = ?', [req.params.id]);
    
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: '活动不存在' });
    }
    
    const row = result[0].values[0];
    const activity = {
      id: row[0], title: row[1], type: row[2], activity_date: row[3],
      start_time: row[4], end_time: row[5], images: row[6], courts: row[7],
      location: row[8], transportation: row[9], price_activity: row[10],
      price_dinner: row[11], price_dinner_only: row[12], max_participants: row[13],
      max_waitlist: row[14], status: row[15], registration_key: row[16] || '',
      actual_court_fee: row[17] || 0,
      actual_ball_count: row[18] || 0,
      actual_ball_price: row[19] || 0,
      created_at: row[20], updated_at: row[21]
    };
    
    const confirmedResult = req.db.exec(
      'SELECT COUNT(*) FROM registrations WHERE activity_id = ? AND status = ?',
      [activity.id, 'confirmed']
    );
    const confirmed = confirmedResult.length > 0 ? confirmedResult[0].values[0][0] : 0;
    
    const waitlistResult = req.db.exec(
      'SELECT COUNT(*) FROM registrations WHERE activity_id = ? AND status = ?',
      [activity.id, 'waitlist']
    );
    const waitlist = waitlistResult.length > 0 ? waitlistResult[0].values[0][0] : 0;
    
    const activityCountResult = req.db.exec(
      "SELECT COUNT(*) FROM registrations WHERE activity_id = ? AND status = 'confirmed' AND registration_type = 'activity'",
      [activity.id]
    );
    const activity_count = activityCountResult.length > 0 ? activityCountResult[0].values[0][0] : 0;
    
    const dinnerCountResult = req.db.exec(
      "SELECT COUNT(*) FROM registrations WHERE activity_id = ? AND status = 'confirmed' AND registration_type IN ('both', 'dinner')",
      [activity.id]
    );
    const dinner_count = dinnerCountResult.length > 0 ? dinnerCountResult[0].values[0][0] : 0;
    
    res.json({
      ...activity,
      images: JSON.parse(activity.images || '[]'),
      courts: JSON.parse(activity.courts || '[]'),
      confirmed_count: confirmed,
      waitlist_count: waitlist,
      activity_count,
      dinner_count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/register', (req, res) => {
  try {
    const { openid, type, key } = req.body;
    const activityId = parseInt(req.params.id);
    
    if (!openid) {
      return res.status(400).json({ error: '请先登录' });
    }
    
    const activityResult = req.db.exec('SELECT * FROM activities WHERE id = ?', [activityId]);
    if (activityResult.length === 0 || activityResult[0].values.length === 0) {
      return res.status(404).json({ error: '活动不存在' });
    }
    
    const actRow = activityResult[0].values[0];
    const registrationKey = actRow[16] || '';
    
    if (registrationKey && registrationKey.length >= 4) {
      if (!key || key !== registrationKey) {
        return res.status(400).json({ error: '报名密钥错误' });
      }
    }
    
    const activity = {
      id: actRow[0], title: actRow[1], type: actRow[2], activity_date: actRow[3],
      start_time: actRow[4], end_time: actRow[5], images: actRow[6], courts: actRow[7],
      location: actRow[8], transportation: actRow[9], price_activity: actRow[10],
      price_dinner: actRow[11], price_dinner_only: actRow[12], max_participants: actRow[13],
      max_waitlist: actRow[14], status: actRow[15], registration_key: actRow[16]
    };
    
    if (activity.status === 'cancelled' || activity.status === 'completed') {
      return res.status(400).json({ error: '活动已取消或已结束' });
    }
    
    let memberResult = req.db.exec('SELECT * FROM members WHERE openid = ?', [openid]);
    if (memberResult.length === 0 || memberResult.length > 0 && memberResult[0].values.length === 0) {
      const timestamp = new Date().toISOString();
      req.db.run(
        'INSERT INTO members (openid, nickname, headimgurl, points, created_at) VALUES (?, ?, ?, ?, ?)',
        [openid, '用户', '', 0, timestamp]
      );
      req.saveDB();
      memberResult = req.db.exec('SELECT * FROM members WHERE openid = ?', [openid]);
    }
    
    const memRow = memberResult[0].values[0];
    const member = { id: memRow[0], openid: memRow[1], nickname: memRow[2], headimgurl: memRow[3], points: memRow[4] };
    
    const existingRegResult = req.db.exec(
      'SELECT * FROM registrations WHERE activity_id = ? AND member_id = ? AND status IN (?, ?)',
      [activityId, member.id, 'confirmed', 'waitlist']
    );
    
    if (existingRegResult.length > 0 && existingRegResult[0].values.length > 0) {
      return res.status(400).json({ error: '您已报名此活动' });
    }
    
    const confirmedResult = req.db.exec(
      'SELECT COUNT(*) FROM registrations WHERE activity_id = ? AND status = ?',
      [activityId, 'confirmed']
    );
    const confirmed = confirmedResult.length > 0 ? confirmedResult[0].values[0][0] : 0;
    
    let status = 'confirmed';
    let waitlistOrder = 0;
    
    if (confirmed >= activity.max_participants) {
      const waitlistCountResult = req.db.exec(
        'SELECT COUNT(*) FROM registrations WHERE activity_id = ? AND status = ?',
        [activityId, 'waitlist']
      );
      const waitlistCount = waitlistCountResult.length > 0 ? waitlistCountResult[0].values[0][0] : 0;
      
      if (waitlistCount >= activity.max_waitlist) {
        return res.status(400).json({ error: '报名已满，候补也已满' });
      }
      
      status = 'waitlist';
      waitlistOrder = waitlistCount + 1;
    }
    
    const timestamp = new Date().toISOString();
    
    req.db.run(
      'INSERT INTO registrations (activity_id, member_id, registration_type, status, waitlist_order, actual_fee, is_paid, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [activityId, member.id, type, status, waitlistOrder, 0, 0, timestamp]
    );
    
    req.saveDB();
    
    res.json({ message: status === 'confirmed' ? '报名成功' : '已加入候补', status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;