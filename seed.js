const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: '127.0.0.1',
  port: 3306,
  user: 'std6730251417',
  password: 't7!s9Wqz',
  database: 'ip_std6730251417',
};

async function main() {
  try {
    const conn = await mysql.createConnection(DB_CONFIG);
    console.log(' Connected to MySQL DB via TCP 127.0.0.1:3306');

    await conn.query('DROP TABLE IF EXISTS products');
    await conn.query(`
      CREATE TABLE products (
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

    const products = [
      [
        'HyperX Cloud Alpha Wireless Gaming Headset',
        4590.00,
        25,
        '25 in stock',
        'Gaming Headset',
        2,
        'Bangkok Store',
        'In Stock',
        4.9,
        'https://row.hyperx.com/cdn/shop/files/hyperx_cloud_alpha_2_wireless_aj5c7aa_angle_4.jpg?v=1783627902',
        'หูฟังเกมมิ่งไร้สาย ไดรเวอร์ Dual Chamber แบตเตอรี่ใช้งานได้ยาวนานถึง 300 ชั่วโมง พร้อมระบบเสียง DTS Spatial Audio'
      ],
      [
        'MEZZON Wireless RGB Mechanical Keyboard',
        1890.00,
        14,
        '14 in stock',
        'Gaming Keyboard',
        1,
        'Main Warehouse',
        'In Stock',
        4.8,
        'https://media.sbdesignsquare.com/media/catalog/product/3/9/39023754-1.jpg',
        'คีย์บอร์ดเกมมิ่งไร้สาย Mechanical Full-size ไฟ RGB ปรับแต่งได้ 18 โหมด พร้อมปุ่ม Multi-function Knob'
      ],
      [
        'Logitech G PRO X SUPERLIGHT Wireless Gaming Mouse',
        4290.00,
        3,
        '3 in stock',
        'Gaming Mouse',
        1,
        'Bangkok Store',
        'Low in stock',
        4.9,
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlBLsKuJ2lV6B1njgvLjTtkfApV4rfZusJbGmHKuebsw&s=10',
        'เมาส์เกมมิ่งไร้สายน้ำหนักเบาพิเศษ เซนเซอร์ HERO 25K ความแม่นยำสูงระดับโปรอีสปอร์ต'
      ]
    ];

    for (const p of products) {
      await conn.query(`
        INSERT INTO products (name, price, stock, stock_text, category, location_count, location_text, badge_status, rating, image_url, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, p);
    }

    console.log(' Successfully seeded 3 gaming gear products into MySQL DB!');
    
    const [rows] = await conn.query('SELECT id, name, price, stock, badge_status FROM products');
    console.log('Current Products in DB:', JSON.stringify(rows, null, 2));

    await conn.end();
  } catch (e) {
    console.error('Seed error:', e.message);
  }
}

main();
