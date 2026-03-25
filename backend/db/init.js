const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');

let db;

async function initDB() {
  const SQL = await initSqlJs();
  
  try {
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
    }
    
    db.run(`
      CREATE TABLE IF NOT EXISTS members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        openid TEXT UNIQUE,
        nickname TEXT,
        headimgurl TEXT,
        points INTEGER DEFAULT 0,
        balance REAL DEFAULT 0,
        is_member INTEGER DEFAULT 0,
        member_expire_date DATE,
        status INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    db.run(`
      CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        activity_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        images TEXT DEFAULT '[]',
        courts TEXT DEFAULT '[]',
        location TEXT,
        transportation TEXT,
        price_activity REAL DEFAULT 0,
        price_dinner REAL DEFAULT 0,
        price_dinner_only REAL DEFAULT 0,
        max_participants INTEGER DEFAULT 0,
        max_waitlist INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        actual_court_fee REAL DEFAULT 0,
        actual_ball_count INTEGER DEFAULT 0,
        actual_ball_price REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    db.run(`
      CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        activity_id INTEGER NOT NULL,
        member_id INTEGER NOT NULL,
        registration_type TEXT NOT NULL,
        status TEXT DEFAULT 'confirmed',
        waitlist_order INTEGER DEFAULT 0,
        actual_fee REAL DEFAULT 0,
        is_paid INTEGER DEFAULT 0,
        payment_method TEXT,
        paid_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (activity_id) REFERENCES activities(id),
        FOREIGN KEY (member_id) REFERENCES members(id)
      )
    `);
    
    db.run(`
      CREATE TABLE IF NOT EXISTS points_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        member_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        amount INTEGER NOT NULL,
        source TEXT,
        reference_id INTEGER,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (member_id) REFERENCES members(id)
      )
    `);
    
    db.run(`
      CREATE TABLE IF NOT EXISTS balance_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        member_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        payment_method TEXT,
        source TEXT,
        reference_id INTEGER,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (member_id) REFERENCES members(id)
      )
    `);
    
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        image TEXT,
        points_required INTEGER DEFAULT 0,
        stock INTEGER DEFAULT 0,
        status INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    db.run(`
      CREATE TABLE IF NOT EXISTS redemptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        member_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        points_used INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (member_id) REFERENCES members(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);
    
    saveDB();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database init error:', error);
    throw error;
  }
  
  return db;
}

function saveDB() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

function getDB() {
  return db;
}

module.exports = { initDB, getDB, saveDB };