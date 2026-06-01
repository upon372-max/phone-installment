const express = require('express');
const router = express.Router();
const { createPlan, getAllPlans, getPlanById, getMyPlan, updatePlanStatus } = require('../controllers/planController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.post('/', verifyToken, isAdmin, createPlan);
router.get('/', verifyToken, isAdmin, getAllPlans);
router.get('/my-plan', verifyToken, getMyPlan);
router.get('/:id', verifyToken, isAdmin, getPlanById);
router.put('/:id', verifyToken, isAdmin, updatePlanStatus);

module.exports = router;