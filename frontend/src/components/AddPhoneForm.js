import React, { useState } from 'react';
import API from '../api';

const AddPhoneForm = ({ onSuccess }) => {
  const [form, setForm] = useState({ brand: '', model: '', price: '', stock: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/phones', form);
      setMessage('Phone added successfully!');
      setError('');
      setForm({ brand: '', model: '', price: '', stock: '' });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding phone');
      setMessage('');
    }
  };

  return (
    <div style={styles.formCard}>
      <h3 style={styles.formTitle}>Add New Phone</h3>
      {message && <p style={styles.success}>{message}</p>}
      {error && <p style={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input style={styles.input} name="brand" placeholder="Brand (e.g. Samsung)" value={form.brand} onChange={handleChange} required />
        <input style={styles.input} name="model" placeholder="Model (e.g. Galaxy A54)" value={form.model} onChange={handleChange} required />
        <input style={styles.input} name="price" type="number" placeholder="Price (Rs.)" value={form.price} onChange={handleChange} required />
        <input style={styles.input} name="stock" type="number" placeholder="Stock quantity" value={form.stock} onChange={handleChange} required />
        <button style={styles.button} type="submit">Add Phone</button>
      </form>
    </div>
  );
};

const styles = {
  formCard: { background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px', maxWidth: '500px' },
  formTitle: { marginBottom: '16px', color: '#1a1a2e' },
  input: { display: 'block', width: '100%', padding: '10px 14px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px', background: '#4361ee', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', cursor: 'pointer' },
  success: { color: 'green', marginBottom: '12px' },
  error: { color: 'red', marginBottom: '12px' },
};

export default AddPhoneForm;