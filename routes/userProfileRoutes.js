const express = require('express');
const router = express.Router();
const userProfileController = require('../controllers/userProfileController');

const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/sign-in');
};

router.get('/:token', isAuthenticated, userProfileController.getUserProfileById);
router.post('/upsert', isAuthenticated, userProfileController.upsertProfile);
router.get('/checkoutSuccess', (req, res) => res.render('checkoutSuccess'));
router.get('/adminUserProfile/:token', isAuthenticated, userProfileController.getUserProfileById);
router.post('/adminUserProfile/upsert', isAuthenticated, userProfileController.upsertProfile);

module.exports = router;
