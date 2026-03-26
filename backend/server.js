const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB, saveDB, getDB } = require('./db/init');

const activityRoutes = require('./routes/activities');
const registrationRoutes = require('./routes/registrations');
const memberRoutes = require('./routes/members');
const productRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const systemRoutes = require('./routes/system');
const wechatRoutes = require('./routes/wechat');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  req.db = getDB();
  req.saveDB = saveDB;
  next();
});

app.use('/api/activities', activityRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/member', memberRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/upload', uploadRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/wechat', wechatRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`Sea Feather API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

module.exports = app;