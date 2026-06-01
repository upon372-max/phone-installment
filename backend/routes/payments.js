const express = require('express');
const router = express.Router();
const { recordPayment, getPaymentsByPlan, getMyPayments } = require('../controllers/paymentController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.post('/', verifyToken, isAdmin, recordPayment);
router.get('/my-payments', verifyToken, getMyPayments);
router.get('/:plan_id', verifyToken, isAdmin, getPaymentsByPlan);

module.exports = router;