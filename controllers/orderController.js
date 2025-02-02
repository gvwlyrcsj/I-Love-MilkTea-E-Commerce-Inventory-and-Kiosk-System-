const pool = require('../models/db');

exports.getOrderHistory = async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.redirect('/sign-in');
        }

        const [orderHistory] = await pool.promise().query(
            `SELECT orders.id AS order_id, orders.order_date, orders.order_status AS status, 
                    orders.payment_method, orders.total_amount,
                    order_items.product_id, order_items.size, order_items.quantity, order_items.price, 
                    addproducts.name AS product_name, addproducts.imageUrl,
                    user_profile.name AS user_name, user_profile.phone AS user_phone, 
                    user_profile.street_name, user_profile.city, user_profile.barangay, user_profile.zip_code
             FROM orders 
             JOIN order_items ON orders.id = order_items.order_id 
             JOIN addproducts ON order_items.product_id = addproducts.id 
             JOIN user_profile ON orders.user_id = user_profile.user_id
             WHERE orders.user_id = ? 
             ORDER BY orders.order_date DESC`, 
            [userId]
        );

        res.render('orderHistory', { orderHistory });
    } catch (error) {
        console.error("Error fetching order history:", error);
        res.status(500).send("Error fetching order history");
    }
};

exports.getAllOrders = async (req, res) => {
    try {
      const [allOrders] = await pool.promise().query(
        `SELECT orders.id AS order_id, orders.order_date, orders.order_status AS status, 
                orders.total_amount, orders.payment_method, 
                order_items.product_id, order_items.size, order_items.quantity, order_items.price, 
                addproducts.name AS product_name, addproducts.imageUrl, 
                user_profile.name AS user_name, user_profile.phone AS user_phone, 
                CONCAT(user_profile.street_name, ', ', user_profile.barangay, ', ', user_profile.city, ' - ', user_profile.zip_code) AS user_address
         FROM orders 
         JOIN order_items ON orders.id = order_items.order_id 
         JOIN addproducts ON order_items.product_id = addproducts.id 
         JOIN user_profile ON orders.user_id = user_profile.user_id
         ORDER BY orders.order_date DESC`
      );
  
      const ordersMap = allOrders.reduce((acc, order) => {
        const date = new Date(order.order_date);
        const formattedOrderDate = `${("0" + (date.getMonth() + 1)).slice(-2)}/${("0" + date.getDate()).slice(-2)}/${date.getFullYear()}`;
        const orderId = order.order_id;
  
        if (!acc[orderId]) {
          acc[orderId] = {
            order_id: orderId,
            order_date: formattedOrderDate,
            status: order.status,
            total_amount: order.total_amount,
            payment_method: order.payment_method,
            user_name: order.user_name,
            user_phone: order.user_phone,
            user_address: order.user_address,
            products: []
          };
        }
        acc[orderId].products.push({
          product_id: order.product_id,
          size: order.size,
          quantity: order.quantity,
          price: order.price,
          name: order.product_name,
          imageUrl: order.imageUrl
        });
        return acc;
      }, {});
  
      res.render('orders', { allOrders: Object.values(ordersMap) });
    } catch (error) {
      console.error("Error fetching all order histories:", error);
      res.status(500).send("Error fetching all order histories");
    }
  };
  
  exports.updateOrderStatus = async (req, res) => {
      try {
          const { orderId, status } = req.body;
  
          // Ensure that orderId and status are valid
          if (!orderId || !status) {
              return res.status(400).json({ message: 'Missing orderId or status' });
          }
  
          // Update query with async/await
          const [rows] = await pool.promise().query(
              `UPDATE orders SET order_status = ? WHERE id = ?`,
              [status, orderId]
          );
  
          if (rows.affectedRows > 0) {
              return res.status(200).json({ message: 'Order status updated successfully' });
          } else {
              return res.status(404).json({ message: 'Order not found' });
          }
      } catch (error) {
          console.error('Error updating order status:', error);
          res.status(500).json({ message: 'Error updating order status' });
      }
  };
    
  exports.cancelOrder = async (req, res) => {
    const { orderId } = req.body;

    if (!orderId) {
        return res.status(400).send('Order ID is required.');
    }

    try {
        const query = 'UPDATE orders SET order_status = ? WHERE id = ?';
        const [result] = await pool.promise().query(query, ['Cancelled', orderId]);

        if (result.affectedRows === 0) {
            return res.status(404).send('Order not found.');
        }

        res.status(200).send('Order status updated to "Cancelled" successfully.');
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).send('Failed to update order status.');
    }
};
