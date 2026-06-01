const express = require('express');
const router = express.Router();
const { addPhone, getAllPhones, getPhoneById, updatePhone, deletePhone } = require('../controllers/phoneController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.post('/', verifyToken, isAdmin, addPhone);
router.get('/', verifyToken, getAllPhones);
router.get('/:id', verifyToken, getPhoneById);
router.put('/:id', verifyToken, isAdmin, updatePhone);
router.delete('/:id', verifyToken, isAdmin, deletePhone);

module.exports = router;