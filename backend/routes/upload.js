const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片' });
    }
    
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;