# 羽毛球活动预约系统 - 技术文档

## 1. 系统架构

### 1.1 整体架构

```
┌─────────────────┐     ┌─────────────────┐
│   微信公众号     │────▶│    H5 前端      │
│   (微信浏览器)   │◀────│   (React)       │
└────────┬────────┘     └────────┬────────┘
         │                        │
         │                        ▼
         │               ┌─────────────────┐
         │               │   Node.js 后端   │
         │               │   (Express)      │
         └──────────────▶│    SQLite DB    │
                         └─────────────────┘
```

### 1.2 技术选型

| 组件 | 技术 | 版本 |
|------|------|------|
| 前端框架 | React | 18.x |
| 构建工具 | Vite | 5.x |
| 样式 | Tailwind CSS | 3.x |
| 动画 | Framer Motion | 11.x |
| 后端框架 | Express | 4.x |
| 数据库 | better-sqlite3 | 9.x |
| 图片处理 | multer | 1.x |

---

## 2. 项目结构

```
Sea_Feather/
├── frontend/                 # H5 前端
│   ├── src/
│   │   ├── components/      # 组件
│   │   ├── pages/           # 页面
│   │   ├── hooks/           # 自定义 hooks
│   │   ├── api/             # API 调用
│   │   ├── utils/           # 工具函数
│   │   └── App.jsx          # 入口
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── backend/                  # 后端服务
│   ├── routes/              # 路由
│   ├── middleware/          # 中间件
│   ├── db/                  # 数据库
│   ├── data.db              # SQLite 数据文件
│   ├── server.js            # 入口
│   └── package.json
│
├── uploads/                  # 上传文件目录
│
└── docs/                     # 文档
    ├── SPEC.md
    ├── product/
    └── tech/
```

---

## 3. 数据库设计

### 3.1 表结构

详细字段说明见 `SPEC.md` 第 4 节。

### 3.2 初始化脚本

```javascript
// backend/db/init.js
const Database = require('better-sqlite3');
const db = new Database('data.db');

// 创建表
db.exec(`
  CREATE TABLE IF NOT EXISTS members (...);
  CREATE TABLE IF NOT EXISTS activities (...);
  CREATE TABLE IF NOT EXISTS registrations (...);
  CREATE TABLE IF NOT EXISTS points_records (...);
  CREATE TABLE IF NOT EXISTS products (...);
  CREATE TABLE IF NOT EXISTS redemptions (...);
`);
```

---

## 4. API 接口

### 4.1 用户端 API

#### 活动

```javascript
// GET /api/activities
// 获取活动列表
// Query: ?status=active&page=1&limit=10

// GET /api/activities/:id
// 获取活动详情

// POST /api/activities/:id/register
// 报名活动
// Body: { member_id, type: 'activity' | 'dinner' | 'both' }
```

#### 报名

```javascript
// GET /api/registrations
// 我的报名列表

// POST /api/registrations/:id/cancel
// 取消报名
```

#### 会员

```javascript
// GET /api/member/profile
// 获取个人信息

// GET /api/member/points
// 获取积分余额

// GET /api/member/points/records
// 积分记录
```

#### 商品

```javascript
// GET /api/products
// 商品列表

// POST /api/products/:id/redeem
// 兑换商品
```

### 4.2 管理端 API

#### 活动管理

```javascript
// GET /api/admin/activities
// POST /api/admin/activities
// PUT /api/admin/activities/:id
// DELETE /api/admin/activities/:id

// GET /api/admin/activities/:id/registrations
// 获取活动报名列表
```

#### 会员管理

```javascript
// GET /api/admin/members
// PUT /api/admin/members/:id
// POST /api/admin/members/:id/points
// 手动调整积分
```

#### 商品管理

```javascript
// GET /api/admin/products
// POST /api/admin/products
// PUT /api/admin/products/:id
// DELETE /api/admin/products/:id
```

#### 文件上传

```javascript
// POST /api/admin/upload
// 上传图片
// Return: { url: '/uploads/filename.jpg' }
```

---

## 5. 前端组件

### 5.1 页面组件

| 页面 | 组件 | 路径 |
|------|------|------|
| 首页 | HomePage | `/` |
| 活动详情 | ActivityDetail | `/activity/:id` |
| 报名 | RegisterPage | `/activity/:id/register` |
| 已报名 | RegistrationsPage | `/registrations` |
| 我的 | ProfilePage | `/profile` |
| 商品列表 | ProductsPage | `/products` |
| 商品详情 | ProductDetail | `/product/:id` |

### 5.2 公共组件

| 组件 | 说明 |
|------|------|
| ActivityCard | 活动卡片 |
| CourtDisplay | 球场可视化 |
| BottomNav | 底部导航 |
| Loading | 加载状态 |

---

## 6. 微信集成

### 6.1 JSSDK 配置

```javascript
// 微信 JSSDK 初始化
wx.config({
  debug: false,
  appId: 'wx...',
  timestamp: 1234567890,
  nonceStr: '随机字符串',
  signature: '签名',
  jsApiList: ['updateTimelineShareCard', 'onMenuShareTimeline']
});
```

### 6.2 用户授权

```javascript
// 获取用户信息流程
// 1. 用户访问页面
// 2. 后端获取 openid
// 3. 首次授权获取 nickname、headimgurl
// 4. 存储到 members 表
```

---

## 7. 关键逻辑

### 7.1 报名候补逻辑

```javascript
// 报名时
if (已报名人数 < 上限) {
  创建正式报名记录
} else if (候补人数 < 候补上限) {
  创建候补记录，waitlist_order = 当前候补数 + 1
} else {
  返回错误：报名已满
}

// 取消报名时
if (状态为候补) {
  删除候补记录
  候补顺序重新计算
} else {
  将状态改为已取消
  退还积分
  
  // 检查候补队列
  const firstWaitlist = 查询第一条候补记录
  if (firstWaitlist) {
    将候补转为正式报名
    通知该用户
  }
}
```

### 7.2 积分计算

```javascript
// 报名时增加积分
points_records 表:
- type: 'income'
- amount: 活动价格
- source: 'activity_registration'
- reference_id: 活动ID

// 取消报名时退还积分
- type: 'expense' (负数表示减少)
- amount: -活动价格
- source: 'activity_cancel'

// 兑换商品时扣除积分
- type: 'expense'
- amount: -商品所需积分
- source: 'redemption'
- reference_id: 商品ID
```

---

## 8. 安全考虑

1. **SQL 注入**: 使用参数化查询
2. **XSS**: 前后端数据过滤
3. **权限控制**: 管理端需验证身份
4. **文件上传**: 限制文件类型和大小

---

## 9. 性能优化

1. **数据库索引**: 为常用查询字段添加索引
2. **图片压缩**: 上传时自动压缩
3. **缓存**: 活动列表可缓存 5 分钟
4. **分页**: 列表数据分页加载

---

## 10. 错误处理

| 错误码 | 说明 |
|--------|------|
| 1001 | 活动不存在 |
| 1002 | 活动已满 |
| 1003 | 已报名 |
| 1004 | 积分不足 |
| 1005 | 库存不足 |
| 2001 | 未登录 |
| 2002 | 无权限 |