const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Create new customer (admin only)
const createCustomer = async (req, res) => {
  const { full_name, email, password, phone } = req.body;
  try {
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      'INSERT INTO users (full_name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email, phone, role, created_at',
      [full_name, email, hashedPassword, phone, 'customer']
    );
    res.status(201).json({ message: 'Customer created successfully', customer: newUser.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all customers (admin only)
const getAllCustomers = async (req, res) => {
  try {
    const customers = await pool.query(
      'SELECT id, full_name, email, phone, created_at FROM users WHERE role = $1',
      ['customer']
    );
    res.json(customers.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single customer
const getCustomerById = async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await pool.query(
      'SELECT id, full_name, email, phone, created_at FROM users WHERE id = $1 AND role = $2',
      [id, 'customer']
    );
    if (customer.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update customer
const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { full_name, email, phone } = req.body;
  try {
    const updated = await pool.query(
      'UPDATE users SET full_name = $1, email = $2, phone = $3 WHERE id = $4 AND role = $5 RETURNING id, full_name, email, phone',
      [full_name, email, phone, id, 'customer']
    );
    if (updated.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({ message: 'Customer updated successfully', customer: updated.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete customer
const deleteCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await pool.query(
      'DELETE FROM users WHERE id = $1 AND role = $2 RETURNING *',
      [id, 'customer']
    );
    if (deleted.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createCustomer, getAllCustomers, getCustomerById, updateCustomer, deleteCustomer };