const KOrderItem = require('../models/kManageOrders');
const path = require('path');

// Display all order items
exports.getManageProducts = (req, res) => {
    KOrderItem.getAll((err, orders) => {
        if (err) {
            console.error('Error fetching products:', err);
            return res.status(500).send('Error fetching products');
        }
        res.render('kManageOrders', {
            orders,
            userId: res.locals.userId,
            username: res.locals.username
        });
    });
};

// Render the add product form
exports.getAddProduct = (req, res) => {
    res.render('addProduct', {
        userId: res.locals.userId,
        username: res.locals.username
    });
};

// Handle adding a new product/order item
exports.postAddProduct = (req, res) => {
    const { korder_id, korder_num, kproductname, ksize, kquantity, kprice } = req.body;

    KOrderItem.create(korder_id, korder_num, kproductname, ksize, kquantity, kprice, (error) => {
        if (error) {
            console.error('Error adding product to database:', error);
            return res.status(500).send('Error adding product');
        }
        res.redirect('/kManageOrders');
    });
};

// Render the update order item form
exports.getUpdateProduct = (req, res) => {
    const productId = req.params.id;

    KOrderItem.findById(productId, (error, product) => {
        if (error || !product) {
            return res.status(404).send('Product not found');
        }
        res.render('updateProduct', {
            product,
            userId: res.locals.userId,
            username: res.locals.username
        });
    });
};

// Handle updating an existing order item
exports.postUpdateProduct = (req, res) => {
    const productId = req.params.id;
    const { korder_id, korder_num, kproductname, ksize, kquantity, kprice } = req.body;

    KOrderItem.update(productId, korder_id, korder_num, kproductname, ksize, kquantity, kprice, (error) => {
        if (error) {
            return res.status(500).send('Error updating product');
        }
        res.redirect('/kManageOrders');
    });
};

// Handle deleting an order item
exports.deleteProduct = (req, res) => {
    const productId = req.params.id;

    KOrderItem.delete(productId, (error) => {
        if (error) {
            return res.status(500).send('Error deleting product');
        }
        res.redirect('/kManageOrders');
    });
};

exports.updateProductQuantity = (req, res) => {
    const productId = req.params.id;
    const additionalQuantity = parseInt(req.body.kquantity);

    KOrderItem.findById(productId, (error, product) => {
        if (error || !product) {
            return res.status(404).send('Product not found');
        }

        const newQuantity = product.kquantity + additionalQuantity;
        KOrderItem.updateQuantity(productId, newQuantity, (error) => {
            if (error) {
                return res.status(500).send('Error updating product quantity');
            }
            res.send('Product quantity updated successfully');
        });
    });
};
