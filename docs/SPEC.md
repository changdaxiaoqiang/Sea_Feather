# 羽毛球活动预约系统 - 规格文档

## 1. 项目概述

**项目名称**: Sea_Feather 羽毛球活动预约系统  
**项目类型**: 微信公众号 H5 应用 + 管理后台  
**核心功能**: 羽毛球活动发布、报名、候补、积分兑换  
**目标用户**: 羽毛球爱好者、俱乐部成员

---

## 2. 技术架构

### 2.1 技术栈

| 层级 | 技术 |
|------|------|
| 前端 H5 | React + Vite + Tailwind CSS + Framer Motion |
| 后端 | Node.js + Express + SQLite (better-sqlite3) |
| 图片存储 | 本地文件系统 (uploads/) |
| 微信公众号 | 微信 JSSDK |

### 2.2 项目结构

```
Sea_Feather/
├── frontend/          # H5前端 (用户端)
├── backend/          # 后端API服务
├── uploads/          # 上传的图片文件
└── docs/             # 文档
```

---

## 3. 功能模块

### 3.1 用户端 H5

#### 3.1.1 首页 (活动列表)
- 展示即将进行的活动卡片
- 活动卡片显示：日期、时间、活动类型（比赛/日常）、已报名/总人数
- 活动状态标签：报名中、已满、已结束
- 下拉刷新加载更多

#### 3.1.2 活动详情页
- 活动宣传图 (轮播图)
- 活动信息：日期、时间、类型、价格
- 场地占用：使用球场图案明暗表示（1、2、3、5、6号场）
- 活动地点文字说明
- 交通到达指引
- 报名按钮 (根据报名状态显示不同状态)

#### 3.1.3 报名选择页
- 三种报名类型：
  - 仅参加活动
  - 活动 + 晚宴
  - 仅晚宴
- 显示每种类型的价格和积分
- 选择后确认报名
- 需要获取微信名称

#### 3.1.4 已报名列表
- 显示用户已报名的活动
- 可查看报名详情
- 可取消报名（根据取消政策）
- 显示候补状态

#### 3.1.5 我的页面
- 用户信息：微信头像、微信名称
- 当前积分余额
- 积分记录 (收入/支出明细)
- 积分兑换入口

### 3.2 管理后台

#### 3.2.1 活动管理
- 发布新活动
  - 活动名称、类型（比赛/日常）
  - 活动日期、时间
  - 宣传图上传（支持多图）
  - 选择占用场地 (多选 1、2、3、5、6)
  - 活动地点、交通说明
  - 设置各类型价格（仅活动、活动+晚宴、仅晚宴）
  - 报名人数上限
  - 候补人数上限
- 编辑活动
- 删除活动
- 查看活动报名列表

#### 3.2.2 成员管理
- 成员列表（微信名称、头像、积分、注册时间）
- 查看成员报名历史
- 手动调整积分
- 禁用/启用成员

#### 3.2.3 候补管理
- 候补队列显示
- 手动补位操作
- 候补通知

#### 3.2.4 积分商品管理
- 商品列表（名称、图片、所需积分、库存）
- 添加/编辑/删除商品
- 兑换记录

---

## 4. 数据库设计

### 4.1 数据表

#### members (成员表)
```sql
CREATE TABLE members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  openid TEXT UNIQUE,           -- 微信openid
  nickname TEXT,                -- 微信昵称
  headimgurl TEXT,              -- 微信头像
  points INTEGER DEFAULT 0,    -- 积分余额
  status INTEGER DEFAULT 1,    -- 状态: 1启用 0禁用
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### activities (活动表)
```sql
CREATE TABLE activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,                    -- 活动名称
  type TEXT,                    -- 类型: 比赛/日常活动
  activity_date DATE,           -- 活动日期
  start_time TIME,              -- 开始时间
  end_time TIME,                -- 结束时间
  images TEXT,                  -- 宣传图 (JSON数组)
  courts TEXT,                  -- 占用场地 (JSON数组: [1,2,3,5,6])
  location TEXT,                -- 活动地点
  transportation TEXT,          -- 交通到达
  price_activity DECIMAL,       -- 仅活动价格
  price_dinner DECIMAL,         -- 活动+晚宴价格
  price_dinner_only DECIMAL,    -- 仅晚宴价格
  max_participants INTEGER,     -- 报名人数上限
  max_waitlist INTEGER,         -- 候补人数上限
  status TEXT DEFAULT 'pending', -- 状态: pending/active/completed/cancelled
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### registrations (报名表)
```sql
CREATE TABLE registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  activity_id INTEGER,          -- 活动ID
  member_id INTEGER,           -- 成员ID
  registration_type TEXT,       -- 报名类型: activity/dinner/both
  points_paid INTEGER,         -- 支付的积分
  status TEXT DEFAULT 'confirmed', -- 状态: confirmed/waitlist/cancelled
  waitlist_order INTEGER,      -- 候补顺序
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (activity_id) REFERENCES activities(id),
  FOREIGN KEY (member_id) REFERENCES members(id)
);
```

#### points_records (积分记录表)
```sql
CREATE TABLE points_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER,            -- 成员ID
  type TEXT,                   -- 类型: income/expense
  amount INTEGER,              -- 积分数量 (正数增加, 负数减少)
  source TEXT,                 -- 来源: activity_registration/activity_cancel/redemption
  reference_id INTEGER,        -- 相关ID (活动ID/商品ID等)
  description TEXT,            -- 描述
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id)
);
```

#### products (积分商品表)
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEYINCREMENT,
  name TEXT,                   -- 商品名称
  image TEXT,                  -- 商品图片
  points_required INTEGER,     -- 所需积分
  stock INTEGER,               -- 库存数量
  status INTEGER DEFAULT 1,    -- 状态: 1上架 0下架
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### redemptions (兑换记录表)
```sql
CREATE TABLE redemptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER,           -- 成员ID
  product_id INTEGER,          -- 商品ID
  points_used INTEGER,         -- 使用积分
  status TEXT DEFAULT 'pending', -- 状态: pending/completed/cancelled
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

---

## 5. API 接口设计

### 5.1 用户端接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/activities` | GET | 获取活动列表 |
| `/api/activities/:id` | GET | 获取活动详情 |
| `/api/activities/:id/register` | POST | 报名活动 |
| `/api/registrations` | GET | 我的报名列表 |
| `/api/registrations/:id/cancel` | POST | 取消报名 |
| `/api/member/profile` | GET | 获取个人信息 |
| `/api/member/points` | GET | 获取积分详情 |
| `/api/member/points/records` | GET | 积分记录 |
| `/api/products` | GET | 商品列表 |
| `/api/products/:id/redeem` | POST | 兑换商品 |

### 5.2 管理端接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/admin/activities` | GET/POST | 活动列表/创建 |
| `/api/admin/activities/:id` | PUT/DELETE | 更新/删除活动 |
| `/api/admin/activities/:id/registrations` | GET | 活动报名列表 |
| `/api/admin/members` | GET | 成员列表 |
| `/api/admin/members/:id` | PUT | 更新成员 |
| `/api/admin/members/:id/points` | POST | 手动调整积分 |
| `/api/admin/products` | GET/POST | 商品列表/创建 |
| `/api/admin/products/:id` | PUT/DELETE | 更新/删除商品 |
| `/api/admin/redemptions` | GET | 兑换记录 |
| `/api/admin/upload` | POST | 上传图片 |

---

## 6. H5 页面设计

### 6.1 页面结构

```
/                    -> 首页（活动列表）
/activity/:id        -> 活动详情
/activity/:id/register -> 报名选择
/registrations       -> 已报名列表
/profile             -> 我的页面
/products            -> 积分商城
/product/:id         -> 商品详情
```

### 6.2 设计规范

- **配色**: 
  - 主色: #1a5c3a (深绿色 - 羽毛球绿)
  - 辅助色: #f5f5f0 (米白色背景)
  - 强调色: #e63946 (红色用于按钮/状态)
  - 文字: #333333 / #666666

- **球场可视化**:
  - 5个球场图标横排显示
  - 占用: 显示为实色 (#1a5c3a)
  - 空闲: 显示为半透明灰色

- **响应式**: 
  - 移动端优先
  - 最大宽度: 480px (居中显示)

---

## 7. 管理后台设计

### 7.1 页面结构

```
/admin              -> 仪表盘
/admin/activities   -> 活动管理
/admin/activity/new -> 新建活动
/admin/members     -> 成员管理
/admin/products    -> 商品管理
/admin/redemptions -> 兑换记录
```

### 7.2 设计规范

- **配色**: 
  - 侧边栏: #1a1a2e (深蓝色)
  - 内容区: #f8f9fa (浅灰)
  - 按钮: #1a5c3a (主色)

---

## 8. 微信接入

### 8.1 JSSDK 配置
- 微信分享
- 获取用户信息 (openid, nickname, headimgurl)

### 8.2 页面路径
- 使用 JSSDK wx.config 配置
- 分享链接和支付配置

---

## 9. 部署

### 9.1 环境要求
- Node.js 18+
- PM2 (进程管理)
- Nginx (反向代理)

### 9.2 部署步骤
1. 安装依赖: `npm install`
2. 启动后端: `pm2 start backend/server.js`
3. 构建前端: `cd frontend && npm run build`
4. 配置 Nginx

---

## 10. 数据持久化

- 使用 SQLite 数据库文件
- 数据库文件: `backend/data.db`
- 备份策略: 定期导出 SQL 文件
