<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

$host = "localhost";
$user = "std6730251417";
$pass = "t7!s9Wqz";
$db   = "ip_std6730251417";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
    exit();
}
$conn->set_charset("utf8");

// Create table if not exists
$sql_table = "CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    stock_text VARCHAR(100),
    category VARCHAR(100),
    location_count INT DEFAULT 1,
    location_text VARCHAR(255),
    badge_status VARCHAR(50) DEFAULT 'In Stock',
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
$conn->query($sql_table);

// Check count
$res_count = $conn->query("SELECT COUNT(*) as count FROM products");
$count = $res_count->fetch_assoc()['count'];
if ($count == 0) {
    $conn->query("INSERT INTO products (name, price, stock, stock_text, category, location_count, location_text, badge_status, image_url) VALUES 
    ('White T-Shirt (Cotton 100%)', 290.00, 45, '45 in stock', 'Apparel', 3, 'Bangkok Main Warehouse', 'In Stock', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500'),
    ('Black Oversized T-Shirt', 350.00, 18, '18 in stock', 'Apparel', 2, 'Chiang Mai Branch', 'Low Stock', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500'),
    ('Yellow Summer Graphic Tee', 320.00, 30, '30 in stock', 'Apparel', 1, 'Phuket Store', 'In Stock', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500')");
}

$result = $conn->query("SELECT * FROM products ORDER BY id ASC");
$products = [];
if ($result) {
    while($row = $result->fetch_assoc()) {
        $row['id'] = (string)$row['id'];
        $row['price'] = (float)$row['price'];
        $row['stock'] = (int)$row['stock'];
        $row['location_count'] = (int)$row['location_count'];
        $products[] = $row;
    }
}

echo json_encode($products, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
$conn->close();
?>