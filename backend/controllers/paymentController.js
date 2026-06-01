const pool = require('../config/db');
const { sendPaymentConfirmation, sendPaymentConfirmationWhatsApp } = require('../services/notification');

// Record a payment (admin only)
const recordPayment = async (req, res) => {
  const { plan_id, amount, payment_method, notes } = req.body;
  const recorded_by = req.user.id;
  try {
    const plan = await pool.query('SELECT * FROM installment_plans WHERE id = $1', [plan_id]);
    if (plan.rows.length === 0) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    const newPayment = await pool.query(
      'INSERT INTO payments (plan_id, amount, payment_method, notes, recorded_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [plan_id, amount, payment_method, notes, recorded_by]
    );
    const newBalance = parseFloat(plan.rows[0].remaining_balance) - parseFloat(amount);
    const newDueDate = new Date(plan.rows[0].next_due_date);
    newDueDate.setMonth(newDueDate.getMonth() + 1);
    const newStatus = newBalance <= 0 ? 'completed' : 'active';
    await pool.query(
      'UPDATE installment_plans SET remaining_balance = $1, next_due_date = $2, status = $3 WHERE id = $4',
      [Math.max(newBalance, 0), newDueDate, newStatus, plan_id]
    );

    // Get customer details
    const customer = await pool.query(
      'SELECT u.email, u.full_name, u.phone FROM users u JOIN installment_plans ip ON u.id = ip.customer_id WHERE ip.id = $1',
      [plan_id]
    );

    // Send notifications
    if (customer.rows.length > 0) {
      const { email, full_name, phone } = customer.rows[0];
      
      // Send email
      await sendPaymentConfirmation(
        email,
        full_name,
        amount,
        Math.max(newBalance, 0),
        newDueDate
      );

      // Send WhatsApp if phone number exists
      if (phone) {
        await sendPaymentConfirmationWhatsApp(
          phone,
          full_name,
          amount,
          Math.max(newBalance, 0),
          newDueDate
        );
      }
    }

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment: newPayment.rows[0],
      remaining_balance: Math.max(newBalance, 0),
      status: newStatus
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all payments for a plan
const getPaymentsByPlan = async (req, res) => {
  const { plan_id } = req.params;
  try {
    const payments = await pool.query(
      `SELECT p.*, u.full_name as recorded_by_name 
      FROM payments p
      JOIN users u ON p.recorded_by = u.id
      WHERE p.plan_id = $1
      ORDER BY p.payment_date DESC`,
      [plan_id]
    );
    res.json(payments.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get customer's own payment history
const getMyPayments = async (req, res) => {
  const customer_id = req.user.id;
  try {
    const payments = await pool.query(
      `SELECT p.*, ip.monthly_payment, ip.remaining_balance 
      FROM payments p
      JOIN installment_plans ip ON p.plan_id = ip.id
      WHERE ip.customer_id = $1
      ORDER BY p.payment_date DESC`,
      [customer_id]
    );
    res.json(payments.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { recordPayment, getPaymentsByPlan, getMyPayments };