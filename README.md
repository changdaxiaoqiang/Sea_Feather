# Sea_Feather 羽毛球活动预约系统 - 部署指南

## 1. 环境要求

| 软件 | 版本 | 说明 |
|------|------|------|
| Node.js | 18.x 或更高 | 后端运行环境 |
| PM2 | 最新版 | 进程管理 |
| Nginx | 1.20+ | Web 服务器 |
| 操作系统 | Ubuntu 20.04+ | 推荐 |

---

## 2. 服务器配置

### 2.1 初始化服务器

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 PM2
sudo npm install -g pm2

# 安装 Nginx
sudo apt install -y nginx
```

---

## 3. 项目部署

### 3.1 获取代码

```bash
cd /var/www
sudo git clone <仓库地址> Sea_Feather
cd Sea_Feather
```

### 3.2 安装后端依赖

```bash
cd backend
npm install --production
```

### 3.3 安装前端依赖

```bash
cd ../frontend
npm install
npm run build
```

### 3.4 目录权限

```bash
cd ..
sudo chown -R www-data:www-data Sea_Feather
sudo chmod -R 755 Sea_Feather
# 确保 uploads 目录可写
sudo chmod -R 777 Sea_Feather/uploads
```

---

## 4. 配置 Nginx

### 4.1 创建 Nginx 配置

```bash
sudo nano /etc/nginx/sites-available/seafeather
```

添加以下配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名

    # 前端静态文件
    location / {
        root /var/www/Sea_Feather/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 上传文件访问
    location /uploads {
        alias /var/www/Sea_Feather/uploads;
        expires 7d;
    }

    # 前端路由 fallback
    location /index.html {
        root /var/www/Sea_Feather/frontend/dist;
    }
}
```

### 4.2 启用配置

```bash
sudo ln -s /etc/nginx/sites-available/seafeather /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 5. 启动后端服务

### 5.1 使用 PM2 启动

```bash
cd /var/www/Sea_Feather/backend

# 创建 ecosystem.config.js
cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: 'seafeather-api',
    script: 'server.js',
    cwd: '/var/www/Sea_Feather/backend',
    instances: 1,
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/seafeather-error.log',
    out_file: '/var/log/pm2/seafeather-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
}
EOF

# 启动
pm2 start ecosystem.config.js

# 设置开机自启
pm2 save
pm2 startup
```

### 5.2 查看服务状态

```bash
pm2 status
pm2 logs seafeather-api
```

---

## 6. 微信公众号配置

### 6.1 JSSDK 配置

登录微信公众平台，进入 "设置与开发" -> "公众号设置" -> "功能设置"，添加：

- JS 接口安全域名
- 授权回调域名

### 6.2 后端配置

在 `backend/config.js` 中配置：

```javascript
module.exports = {
  wechat: {
    appId: 'your-app-id',
    appSecret: 'your-app-secret',
    token: 'your-token'
  }
};
```

---

## 7. HTTPS 配置（推荐）

### 7.1 安装 Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 7.2 获取证书

```bash
sudo certbot --nginx -d your-domain.com
```

按提示完成配置，证书会自动续期。

---

## 8. 数据备份

### 8.1 定时备份脚本

```bash
# 创建备份目录
mkdir -p /backup/seafeather

# 创建备份脚本
cat > /usr/local/bin/backup-seafeather.sh <<EOF
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp /var/www/Sea_Feather/backend/data.db /backup/seafeather/data_$DATE.db
# 删除 7 天前的备份
find /backup/seafeather -name "data_*.db" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-seafeather.sh
```

### 8.2 添加定时任务

```bash
crontab -e
# 添加以下行：每天凌晨 3 点执行备份
0 3 * * * /usr/local/bin/backup-seafeather.sh
```

---

## 9. 常见问题

### 9.1 服务启动失败

```bash
# 查看错误日志
pm2 logs seafeather-api

# 常见问题：
# 1. 端口被占用 -> 修改 PORT 环境变量
# 2. 数据库文件权限 -> chmod 666 data.db
```

### 9.2 图片上传失败

```bash
# 检查目录权限
ls -la /var/www/Sea_Feather/uploads

# 修复权限
sudo chmod -R 777 /var/www/Sea_Feather/uploads
```

### 9.3 微信 JSSDK 无效

```bash
# 检查配置
# 1. 确认域名已添加到 JS 接口安全域名
# 2. 确认后端配置的 appId 和 appSecret 正确
# 3. 检查服务器时间是否准确
```

---

## 10. 更新部署

```bash
cd /var/www/Sea_Feather

# 拉取最新代码
git pull

# 更新后端
cd backend
npm install --production

# 更新前端
cd ../frontend
npm install
npm run build

# 重启服务
pm2 restart seafeather-api
```

---

## 11. 监控

### 11.1 PM2 监控

```bash
pm2 monit
```

### 11.2 日志查看

```bash
# 实时日志
pm2 logs seafeather-api --lines 100

# 历史日志
tail -f /var/log/pm2/seafeather-out.log
```

---

## 12. 联系支持

如有问题，请提交 Issue 或联系技术支持。