const db = require('./db');

// ecommerce
exports.getMonthlySales = async () => {
    const [rows] = await db.promise().query(`
        SELECT SUM(total_amount) AS total
        FROM orders
        WHERE order_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
    `);
    return rows;
};

exports.getWeeklySales = async () => {
    const [rows] = await db.promise().query(`
        SELECT SUM(total_amount) AS total
        FROM orders
        WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)
    `);
    return rows;
};

exports.getDailySales = async () => {
    const [rows] = await db.promise().query(`
        SELECT SUM(total_amount) AS total
        FROM orders
        WHERE DATE(order_date) = CURDATE()
    `);
    return rows;
};

exports.getYearlySales = async () => {
    const [rows] = await db.promise().query(`
        SELECT SUM(total_amount) AS total
        FROM orders
        WHERE order_date >= DATE_FORMAT(NOW(), '%Y-01-01')
        AND order_date < DATE_FORMAT(NOW() + INTERVAL 1 YEAR, '%Y-01-01')
    `);
    return rows;
};

// kiosk orders
exports.getKioskMonthlySales = async () => {
    const [rows] = await db.promise().query(`
        SELECT SUM(ktotal_amount) AS total
        FROM korders
        WHERE korder_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
    `);
    return rows;
};

exports.getKioskWeeklySales = async () => {
    const [rows] = await db.promise().query(`
        SELECT SUM(ktotal_amount) AS total
        FROM korders
        WHERE korder_date >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)
    `);
    return rows;
};

exports.getKioskDailySales = async () => {
    const [rows] = await db.promise().query(`
        SELECT SUM(ktotal_amount) AS total
        FROM korders
        WHERE DATE(korder_date) = CURDATE()
    `);
    return rows;
};

exports.getKioskYearlySales = async () => {
    const [rows] = await db.promise().query(`
        SELECT SUM(ktotal_amount) AS total
        FROM korders
        WHERE korder_date >= DATE_FORMAT(NOW(), '%Y-01-01')
        AND korder_date < DATE_FORMAT(NOW() + INTERVAL 1 YEAR, '%Y-01-01')
    `);
    return rows;
};

//both
exports.getCombinedDailySales = async () => {
    const [rows1] = await db.promise().query(`
        SELECT SUM(total_amount) AS total
        FROM orders
        WHERE DATE(order_date) = CURDATE()
    `);
    const [rows2] = await db.promise().query(`
        SELECT SUM(ktotal_amount) AS total
        FROM korders
        WHERE DATE(korder_date) = CURDATE()
    `);
    const total1 = rows1[0].total || 0;
    const total2 = rows2[0].total || 0;
    return [{ total: (parseFloat(total1) + parseFloat(total2)).toFixed(2) }];
};

exports.getCombinedWeeklySales = async () => {
    const [rows1] = await db.promise().query(`
        SELECT SUM(total_amount) AS total
        FROM orders
        WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)
    `);
    const [rows2] = await db.promise().query(`
        SELECT SUM(ktotal_amount) AS total
        FROM korders
        WHERE korder_date >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)
    `);
    const total1 = rows1[0].total || 0;
    const total2 = rows2[0].total || 0;
    return [{ total: (parseFloat(total1) + parseFloat(total2)).toFixed(2) }];
};

exports.getCombinedMonthlySales = async () => {
    const [rows1] = await db.promise().query(`
        SELECT SUM(total_amount) AS total
        FROM orders
        WHERE order_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
    `);
    const [rows2] = await db.promise().query(`
        SELECT SUM(ktotal_amount) AS total
        FROM korders
        WHERE korder_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
    `);
    const total1 = rows1[0].total || 0;
    const total2 = rows2[0].total || 0;
    return [{ total: (parseFloat(total1) + parseFloat(total2)).toFixed(2) }];
};

exports.getCombinedYearlySales = async () => {
    const [rows1] = await db.promise().query(`
        SELECT SUM(total_amount) AS total
        FROM orders
        WHERE order_date >= DATE_FORMAT(NOW(), '%Y-01-01')
        AND order_date < DATE_FORMAT(NOW() + INTERVAL 1 YEAR, '%Y-01-01')
    `);
    const [rows2] = await db.promise().query(`
        SELECT SUM(ktotal_amount) AS total
        FROM korders
        WHERE korder_date >= DATE_FORMAT(NOW(), '%Y-01-01')
        AND korder_date < DATE_FORMAT(NOW() + INTERVAL 1 YEAR, '%Y-01-01')
    `);
    const total1 = rows1[0].total || 0;
    const total2 = rows2[0].total || 0;
    return [{ total: (parseFloat(total1) + parseFloat(total2)).toFixed(2) }];
};

exports.getTotalSales = async () => {
    const [rows1] = await db.promise().query(`
        SELECT SUM(total_amount) AS total
        FROM orders
    `);
    const [rows2] = await db.promise().query(`
        SELECT SUM(ktotal_amount) AS total
        FROM korders
    `);
    const total1 = rows1[0].total || 0;
    const total2 = rows2[0].total || 0;
    return [{ total: (parseFloat(total1) + parseFloat(total2)).toFixed(2) }];
};

// other necessary functions
exports.getBestSeller = async () => {
    const [rows] = await db.promise().query(`
        SELECT product_id, SUM(quantity) AS total_sold
        FROM order_items
        GROUP BY product_id
        ORDER BY total_sold DESC
        LIMIT 1
    `);
    return rows;
};

exports.getBestSellerProduct = async (productId) => {
    const [rows] = await db.promise().query(`
        SELECT name, imageUrl
        FROM addproducts
        WHERE id = ?
    `, [productId]);
    return rows;
};

exports.getPast7DaysSales = async () => {
    const [rows] = await db.promise().query(`
        SELECT DATE(order_date) AS date, SUM(total_amount) AS total
        FROM orders
        WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(order_date)
        ORDER BY DATE(order_date)
    `);
    return rows;
};
