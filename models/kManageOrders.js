const db = require('./db');

const KOrderItem = {
    getAll: (callback) => {
        const sql = 'SELECT * FROM korder_items';
        db.query(sql, (error, results) => {
            if (error) {
                return callback(error);
            }
            callback(null, results);
        });
    },

    create: (korder_id, korder_num, kproductname, ksize, kquantity, kprice, callback) => {
        const query = `
            INSERT INTO korder_items (korder_id, korder_num, kproductname, ksize, kquantity, kprice)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        db.query(query, [korder_id, korder_num, kproductname, ksize, kquantity, kprice], (err, results) => {
            if (err) {
                console.error('Error inserting product into database:', err);
                return callback(err);
            }
            callback(null, results);
        });
    },

    findById: (id, callback) => {
        const sql = 'SELECT * FROM korder_items WHERE id = ?';
        db.query(sql, [id], (error, result) => {
            if (error) {
                return callback(error);
            }
            callback(null, result[0]);
        });
    },

    update: (id, korder_id, korder_num, kproductname, ksize, kquantity, kprice, callback) => {
        const query = `
            UPDATE korder_items
            SET korder_id = ?, korder_num = ?, kproductname = ?, ksize = ?, kquantity = ?, kprice = ?
            WHERE id = ?
        `;
        db.query(query, [korder_id, korder_num, kproductname, ksize, kquantity, kprice, id], (error, result) => {
            if (error) {
                return callback(error);
            }
            callback(null, result);
        });
    },

    delete: (id, callback) => {
        const sql = 'DELETE FROM korder_items WHERE id = ?';
        db.query(sql, [id], (error, result) => {
            if (error) {
                return callback(error);
            }
            callback(null, result);
        });
    },

    updateQuantity: (id, quantity, callback) => {
        const query = `
            UPDATE korder_items
            SET kquantity = ?
            WHERE id = ?
        `;
        db.query(query, [quantity, id], (error, result) => {
            if (error) {
                return callback(error);
            }
            callback(null, result);
        });
    }
};

module.exports = KOrderItem;
