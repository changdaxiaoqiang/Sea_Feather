const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { status = 'active', page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let sql = 'SELECT * FROM products';
    const params = [];
    
    if (status === 'active') {
      sql = 'SELECT * FROM products WHERE status = 1';
    }
    
    sql += ' ORDER BY created_at DESC LIMIT ' + parseInt(limit) + ' OFFSET ' + offset;
    
    const products = req.db.exec(sql, params);
    const productList = products.length > 0 ? products[0].values.map(row => ({
      id: row[0], name: row[1], image: row[2], points_required: row[3],
      stock: row[4], status: row[5], created_at: row[6], updated_at: row[7]
    })) : [];
    
    const countResult = req.db.exec('SELECT COUNT(*) FROM products WHERE status = 1');
    const total = countResult.length > 0 ? countResult[0].values[0][0] : 0;
    
    res.json({
      data: productList,
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

router.get('/:id', (req, res) => {
  try {
    const result = req.db.exec('SELECT * FROM products WHERE id = ?', [req.params.id]);
    
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: '商品不存在' });
    }
    
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

router.post('/:id/redeem', (req, res) => {
  try {
    const { openid } = req.body;
    const productId = parseInt(req.params.id);
    
    if (!openid) {
      return res.status(400).json({ error: '请先登录' });
    }
    
    const productResult = req.db.exec('SELECT * FROM products WHERE id = ? AND status = 1', [productId]);
    
    if (productResult.length === 0 || productResult[0].values.length === 0) {
      return res.status(404).json({ error: '商品不存在或已下架' });
    }
    
    const prodRow = productResult[0].values[0];
    const product = {
      id: prodRow[0], name: prodRow[1], image: prodRow[2], points_required: prodRow[3], stock: prodRow[4]
    };
    
    if (product.stock <= 0) {
      return res.status(400).json({ error: '库存不足' });
    }
    
    let memberResult = req.db.exec('SELECT * FROM members WHERE openid = ?', [openid]);
    
    if (memberResult.length === 0 || memberResult[0].values.length === 0) {
      return res.status(400).json({ error: '用户不存在' });
    }
    
    const memRow = memberResult[0].values[0];
    const member = { id: memRow[0], points: memRow[4] };
    
    if (member.points < product.points_required) {
      return res.status(400).json({ error: '积分不足' });
    }
    
    const timestamp = new Date().toISOString();
    
    req.db.run('UPDATE members SET points = points - ? WHERE id = ?', [product.points_required, member.id]);
    
    req.db.run(
      'INSERT INTO points_records (member_id, type, amount, source, reference_id, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [member.id, 'expense', -product.points_required, 'redemption', productId, '兑换商品: ' + product.name, timestamp]
    );
    
    req.db.run('UPDATE products SET stock = stock - 1 WHERE id = ?', [productId]);
    
    req.db.run(
      'INSERT INTO redemptions (member_id, product_id, points_used, status, created_at) VALUES (?, ?, ?, ?, ?)',
      [member.id, productId, product.points_required, 'pending', timestamp]
    );
    
    req.saveDB();
    
    res.json({ message: '兑换成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;