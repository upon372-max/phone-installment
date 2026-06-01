const pool = require('../config/db');

const createPlan = async (req, res) => {
  const { customer_id, phone_id, total_price, down_payment, monthly_payment, duration_months, start_date } = req.body;
  try {
const remaining_balance = total_price - down_payment;
    const next_due_date = new Date(start_date);
    next_due_date.setMonth(next_due_date.getMonth() + 1);
    const newPlan = await pool.query(
      `INSERT INTO installment_plans (customer_id, phone_id, total_price, down_payment, monthly_payment, duration_months, remaining_balance, start_date, next_due_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [customer_id, phone_id, total_price, down_payment, monthly_payment, duration_months, remaining_balance, start_date, next_due_date]
    );
res.status(201).json({ message: 'Installment plan created successfully', plan: newPlan.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllPlans = async (req, res) => {
  try {
    const plans = await pool.query(
      `SELECT ip.*, u.full_name, u.email, u.phone as customer_phone, p.brand, p.model FROM installment_plans ip JOIN users u ON ip.customer_id = u.id JOIN phones p ON ip.phone_id = p.id ORDER BY ip.created_at DESC`
    );
    res.json(plans.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getPlanById = async (req, res) => {
  const { id } = req.params;
  try {
    const plan = await pool.query(
      `SELECT ip.*, u.full_name, u.email, u.phone as customer_phone, p.brand, p.model FROM installment_plans ip JOIN users u ON ip.customer_id = u.id JOIN phones p ON ip.phone_id = p.id WHERE ip.id = $1`,
      [id]
    );
    if (plan.rows.length === 0) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.json(plan.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyPlan = async (req, res) => {
  const customer_id = req.user.id;
  console.log('Customer ID from token:', customer_id);
  try {
    const plans = await pool.query(
      `SELECT ip.*, p.brand, p.model FROM installment_plans ip JOIN phones p ON ip.phone_id = p.id WHERE ip.customer_id = $1 ORDER BY ip.created_at DESC`,
      [customer_id]
    );
    console.log('Plans found:', plans.rows.length);
    res.json(plans.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updatePlanStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updated = await pool.query(
      'UPDATE installment_plans SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (updated.rows.length === 0) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.json({ message: 'Plan status updated', plan: updated.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createPlan, getAllPlans, getPlanById, getMyPlan, updatePlanStatus };