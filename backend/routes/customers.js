const express = require('express');
const router = express.Router();
const { createCustomer, getAllCustomers, getCustomerById, updateCustomer, deleteCustomer } = require('../controllers/customerController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.post('/', verifyToken, isAdmin, createCustomer);
router.get('/', verifyToken, isAdmin, getAllCustomers);
router.get('/:id', verifyToken, isAdmin, getCustomerById);
router.put('/:id', verifyToken, isAdmin, updateCustomer);
router.delete('/:id', verifyToken, isAdmin, deleteCustomer);

module.exports = router;