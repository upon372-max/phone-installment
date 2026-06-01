const pool = require('../config/db');

// Add new phone
const addPhone = async (req, res) => {
  const { brand, model, price, stock } = req.body;
  try {
    const newPhone = await pool.query(
      'INSERT INTO phones (brand, model, price, stock) VALUES ($1, $2, $3, $4) RETURNING *',
      [brand, model, price, stock]
    );
    res.status(201).json({ message: 'Phone added successfully', phone: newPhone.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all phones
const getAllPhones = async (req, res) => {
  try {
    const phones = await pool.query('SELECT * FROM phones ORDER BY created_at DESC');
    res.json(phones.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single phone
const getPhoneById = async (req, res) => {
  const { id } = req.params;
  try {
    const phone = await pool.query('SELECT * FROM phones WHERE id = $1', [id]);
    if (phone.rows.length === 0) {
      return res.status(404).json({ message: 'Phone not found' });
    }
    res.json(phone.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update phone
const updatePhone = async (req, res) => {
  const { id } = req.params;
  const { brand, model, price, stock } = req.body;
  try {
    const updated = await pool.query(
      'UPDATE phones SET brand = $1, model = $2, price = $3, stock = $4 WHERE id = $5 RETURNING *',
      [brand, model, price, stock, id]
    );
    if (updated.rows.length === 0) {
      return res.status(404).json({ message: 'Phone not found' });
    }
    res.json({ message: 'Phone updated successfully', phone: updated.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete phone
const deletePhone = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await pool.query('DELETE FROM phones WHERE id = $1 RETURNING *', [id]);
    if (deleted.rows.length === 0) {
      return res.status(404).json({ message: 'Phone not found' });
    }
    res.json({ message: 'Phone deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { addPhone, getAllPhones, getPhoneById, updatePhone, deletePhone };