const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'std6730251417',
    password: 't7!s9Wqz',
    database: 'ip_std6730251417'
  });

  console.log('Connected to MySQL.');

  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Table users verified/created.');

  await conn.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      stock INT NOT NULL DEFAULT 0,
      stock_text VARCHAR(100),
      category VARCHAR(100),
      location_count INT DEFAULT 1,
      location_text VARCHAR(255),
      badge_status VARCHAR(50) DEFAULT 'In Stock',
      rating DECIMAL(3, 1) DEFAULT 5.0,
      image_url TEXT,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Table products verified/created.');

  // Check users count
  const [users] = await conn.query('SELECT COUNT(*) as cnt FROM users');
  if (users[0].cnt === 0) {
    await conn.query(`
      INSERT INTO users (username, password, name, role) VALUES
      ('kanwit', '123456', 'Kanwit Admin', 'admin'),
      ('user1', '123456', 'Demo User', 'user')
    `);
    console.log('Inserted default demo users.');
  }

  // Check products count
  const [prods] = await conn.query('SELECT COUNT(*) as cnt FROM products');
  if (prods[0].cnt === 0) {
    await conn.query(`
      INSERT INTO products (name, price, stock, stock_text, category, location_count, location_text, badge_status, rating, image_url, description) VALUES
      ('HyperX Cloud Alpha Wireless Gaming Headset', 6990.00, 15, '15 in stock', 'Gaming Headset', 3, 'Bangkok & Online', 'In Stock', 4.9, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', 'หูฟังเกมมิ่งไร้สาย แบตเตอรี่ใช้งานได้ยาวนานสูงสุดถึง 300 ชั่วโมง พร้อมระบบเสียงรอบทิศทาง DTS Headphone:X Spatial Audio และเมมโมรี่โฟมลิขสิทธิ์เฉพาะของ HyperX'),
      ('MEZZON Gaming Desk RGB Pro Edition 140cm', 4590.00, 8, '8 in stock', 'Gaming Desk', 2, 'Warehouse & BKK', 'Limited', 4.8, 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=500', 'โต๊ะเกมมิ่งระดับพรีเมียม ขนาด 140 ซม. พร้อมระบบไฟ RGB ปรับแต่งได้ 16 ล้านสี ผิวสัมผัส Carbon Fiber กันรอยและกันน้ำ พร้อมช่องเก็บสายไฟ'),
      ('Logitech G PRO X Mechanical Gaming Keyboard', 4290.00, 20, '20 in stock', 'Gaming Keyboard', 4, 'All Branches', 'Hot', 5.0, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', 'คีย์บอร์ดเกมมิ่งเกรดโปรระดับมืออาชีพ สวิตช์ GX Blue Clicky สามารถถอดเปลี่ยนสวิตช์ได้ (Hot-Swappable) ดีไซน์ Tenkeyless พกพาสะดวก')
    `);
    console.log('Inserted default products.');
  }

  console.log('Database sync complete!');
  await conn.end();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
