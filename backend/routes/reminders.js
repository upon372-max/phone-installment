const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { sendPaymentReminder } = require('../services/notification');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Send reminders to customers with payments due in next 3 days
router.post('/send-reminders', verifyToken, isAdmin, async (req, res) => {
  try {
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);

    const duePlans = await pool.query(
      `SELECT ip.*, u.email, u.full_name, u.phone 
      FROM installment_plans ip
      JOIN users u ON ip.customer_id = u.id
      WHERE ip.status = 'active'
      AND ip.next_due_date BETWEEN $1 AND $2`,
      [today, threeDaysLater]
    );

    if (duePlans.rows.length === 0) {
      return res.json({ message: 'No payments due in the next 3 days' });
    }

    let sent = 0;
    for (const plan of duePlans.rows) {
      await sendPaymentReminder(
        plan.email,
        plan.phone,
        plan.full_name,
        plan.monthly_payment,
        plan.next_due_date
      );
      sent++;
    }

    res.json({ message: `Reminders sent to ${sent} customer(s)` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;