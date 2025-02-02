const db = require('../models/db');
const Product = require('../models/Product');

const viewCheckout = async (req, res) => {
    const userId = req.session.userId;
    if (!userId) return res.redirect('/sign-in');

    try {
        const [userProfile] = await db.promise().query(
            'SELECT * FROM user_profile WHERE user_id = ?', [userId]
        );

        if (userProfile.length === 0) {
            return res.status(404).send('User profile not found');
        }

        const shippingAddress = {
            street_name: userProfile[0].street_name,
            barangay: userProfile[0].barangay,
            city: userProfile[0].city,
            zip_code: userProfile[0].zip_code
        };

        const { productId, size, quantity, price } = req.query;

        if (productId && size && quantity && price) {
            const [product] = await db.promise().query(
                'SELECT * FROM addproducts WHERE id = ?', [productId]
            );
            if (product.length === 0) return res.status(404).send("Product not found.");

            const total = parseFloat(price) * parseInt(quantity);

            return res.render('checkout', {
                userProfile: userProfile[0],
                cartItems: [{
                    product_id: product[0].id,
                    name: product[0].name,
                    imageUrl: product[0].imageUrl,
                    size,
                    quantity: parseInt(quantity),
                    price: parseFloat(price)
                }],
                total,
                shippingAddress,
                product_id: product[0].id,
                size,
                quantity: parseInt(quantity),
                price: parseFloat(price)
            });
        }

        const [cartItems] = await db.promise().query(
            'SELECT * FROM cart WHERE user_id = ?', [userId]
        );

        const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        res.render('checkout', {
            userProfile: userProfile[0],
            cartItems,
            total,
            shippingAddress
        });

    } catch (error) {
        console.error("Error loading checkout:", error);
        res.status(500).send("Internal Server Error");
    }
};

// Confirm Checkout (POST)
const confirmCheckout = async (req, res) => {
    const userId = req.session.userId;
    if (!userId) return res.redirect('/sign-in');

    const { productId, size, quantity, price } = req.body;

    try {
        let total, orderId;

        // Ensure data is in array format for batch processing
        if (!Array.isArray(productId) || !Array.isArray(size) || !Array.isArray(quantity) || !Array.isArray(price)) {
            return res.status(400).send("Invalid checkout data.");
        }

        // Calculate total price for the order
        total = price.reduce((sum, itemPrice, index) => {
            return sum + (parseFloat(itemPrice) * parseInt(quantity[index]));
        }, 0);

        // Create the order
        orderId = await createOrder(userId, total);

        // Prepare order items for insertion
        const orderItems = productId.map((id, index) => [
            orderId,
            parseInt(id),
            size[index],
            parseInt(quantity[index]),
            parseFloat(price[index])
        ]);

        // Decrement inventory for each product in the order
        for (let i = 0; i < productId.length; i++) {
            await Product.decrementInventory(productId[i], size[i], quantity[i]);
        }

        // Add items to order_items table
        await addOrderItems(orderId, orderItems);

        // Clear the cart after checkout
        await clearCart(userId);

        // Redirect to success page
        res.redirect(`/checkout/checkoutSuccess?orderId=${orderId}`);
    } catch (error) {
        console.error("Error during checkout:", error);
        res.status(500).send("Internal Server Error");
    }
};

// Checkout Success Page
const checkoutSuccess = async (req, res) => {
    const { orderId } = req.query;

    try {
        if (!orderId) {
            return res.status(400).send("Order ID is required");
        }

        // Fetch order details including order items
        const [orderItems] = await db.promise().query(
            'SELECT oi.*, p.name FROM order_items oi JOIN addproducts p ON oi.product_id = p.id WHERE oi.order_id = ?',
            [orderId]
        );

        if (orderItems.length === 0) {
            return res.status(404).send('Order items not found');
        }

        // Render the success page with order items
        res.render('checkoutSuccess', { orderId, orderItems });

    } catch (error) {
        console.error("Error displaying checkout success page:", error);
        res.status(500).send("Internal Server Error");
    }
};

// Cancel Order
const cancelOrder = async (req, res) => {
    const { orderId } = req.body;

    try {
        // Update the order status to 'Cancelled'
        const query = 'UPDATE orders SET order_status = "Cancelled" WHERE id = ?';
        await db.promise().query(query, [orderId]);

        const userId = req.session.userId;
        await clearCart(userId);

        res.redirect('/product'); 
    } catch (error) {
        console.error("Error cancelling order:", error);
        res.status(500).send("Internal Server Error");
    }
};

// Helper Functions
const createOrder = async (userId, totalAmount) => {
    const query = 'INSERT INTO orders (user_id, total_amount, payment_method, order_status) VALUES (?, ?, "COD", "Pending")';
    try {
        const [results] = await db.promise().query(query, [userId, totalAmount]);
        console.log("Order Created:", results.insertId); 
        return results.insertId;
    } catch (error) {
        console.error("Error creating order:", error);
        throw error; 
    }
};

const addOrderItems = async (orderId, orderItems) => {
    const query = 'INSERT INTO order_items (order_id, product_id, size, quantity, price) VALUES ?';
    try {
        // Insert all order items at once
        await db.promise().query(query, [orderItems]);
        console.log('Order Items Added:', orderItems);
    } catch (error) {
        console.error("Error adding order items:", error);
        throw error;
    }
};

const clearCart = async (userId) => {
    const query = 'DELETE FROM cart WHERE user_id = ?';
    try {
        await db.promise().query(query, [userId]);
    } catch (error) {
        console.error("Error clearing cart:", error);
        throw error;
    }
};

const placeOrder = async (req, res) => {
    const { productId, size, quantity } = req.body;

    try {
        await Product.decrementInventory(productId, size, quantity);
        res.json({ message: 'Order placed successfully, inventory updated' });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ error: 'Error placing order or updating inventory' });
    }
};

module.exports = {
    viewCheckout,
    confirmCheckout,
    checkoutSuccess,
    addOrderItems,
    clearCart,
    createOrder,
    cancelOrder,
    placeOrder
};
