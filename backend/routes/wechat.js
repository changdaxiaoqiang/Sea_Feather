const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');

const WECHAT_APPID = 'wx395b4fb84bc93a27';
const WECHAT_SECRET = 'be3634219a359c439a14864d4215247e';

const getAccessToken = () => {
  return new Promise((resolve, reject) => {
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WECHAT_APPID}&secret=${WECHAT_SECRET}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.access_token) {
            resolve(result.access_token);
          } else {
            reject(new Error('Failed to get access_token'));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
};

const getUserInfo = (accessToken, openid) => {
  return new Promise((resolve, reject) => {
    const url = `https://api.weixin.qq.com/cgi-bin/user/info?access_token=${accessToken}&openid=${openid}&lang=zh_CN`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.errcode) {
            resolve({ openid, nickname: '', headimgurl: '' });
          } else {
            resolve(result);
          }
        } catch (e) {
          resolve({ openid, nickname: '', headimgurl: '' });
        }
      });
    }).on('error', () => {
      resolve({ openid, nickname: '', headimgurl: '' });
    });
  });
};

router.get('/config', (req, res) => {
  res.json({
    appId: WECHAT_APPID,
    redirectUri: encodeURIComponent(req.query.redirectUri || '')
  });
});

router.post('/login', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: '缺少code参数' });
    }
    
    const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${WECHAT_APPID}&secret=${WECHAT_SECRET}&code=${code}&grant_type=authorization_code`;
    
    const tokenData = await new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });
    
    if (tokenData.errcode) {
      return res.status(400).json({ error: '授权失败' });
    }
    
    const openid = tokenData.openid;
    const accessToken = tokenData.access_token;
    
    let userInfo = { openid, nickname: '', headimgurl: '' };
    try {
      userInfo = await getUserInfo(accessToken, openid);
    } catch (e) {
      console.error('Failed to get user info:', e);
    }
    
    const timestamp = new Date().toISOString();
    
    let memberResult = req.db.exec('SELECT * FROM members WHERE openid = ?', [openid]);
    let member;
    
    if (memberResult.length === 0 || memberResult[0].values.length === 0) {
      req.db.run(
        'INSERT INTO members (openid, nickname, headimgurl, points, created_at) VALUES (?, ?, ?, ?, ?)',
        [openid, userInfo.nickname || '微信用户', userInfo.headimgurl || '', 0, timestamp]
      );
      memberResult = req.db.exec('SELECT * FROM members WHERE openid = ?', [openid]);
    } else {
      if (userInfo.nickname || userInfo.headimgurl) {
        req.db.run(
          'UPDATE members SET nickname = ?, headimgurl = ?, updated_at = ? WHERE openid = ?',
          [userInfo.nickname || memberResult[0].values[0][2], userInfo.headimgurl || memberResult[0].values[0][3], timestamp, openid]
        );
      }
      memberResult = req.db.exec('SELECT * FROM members WHERE openid = ?', [openid]);
    }
    
    const memRow = memberResult[0].values[0];
    member = {
      id: memRow[0],
      openid: memRow[1],
      nickname: memRow[2],
      headimgurl: memRow[3],
      points: memRow[4],
      balance: memRow[5] || 0,
      is_member: memRow[6] || 0
    };
    
    const token = crypto.createHash('sha256').update(openid + timestamp).digest('hex');
    
    res.json({
      token,
      member
    });
  } catch (error) {
    console.error('WeChat login error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/status', (req, res) => {
  const { openid } = req.query;
  
  if (!openid) {
    return res.status(400).json({ error: '缺少openid' });
  }
  
  const memberResult = req.db.exec('SELECT id, openid, nickname, headimgurl, points, balance, is_member FROM members WHERE openid = ?', [openid]);
  
  if (memberResult.length === 0 || memberResult[0].values.length === 0) {
    return res.json({ loggedIn: false });
  }
  
  const memRow = memberResult[0].values[0];
  res.json({
    loggedIn: true,
    member: {
      id: memRow[0],
      openid: memRow[1],
      nickname: memRow[2],
      headimgurl: memRow[3],
      points: memRow[4],
      balance: memRow[5] || 0,
      is_member: memRow[6] || 0
    }
  });
});

module.exports = router;
