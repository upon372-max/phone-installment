import React, { useState, useEffect } from 'react';
import API from '../api';

const AddPlanForm = ({ onSuccess }) => {
  const [form, setForm] = useState({ customer_id: '', phone_id: '', total_price: '', down_payment: '', monthly_payment: '', duration_months: '', start_date: '' });
  const [customers, setCustomers] = useState([]);
  const [phones, setPhones] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const [c, p] = await Promise.all([API.get('/customers'), API.get('/phones')]);
      setCustomers(c.data);
      setPhones(p.data);
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/plans', form);
      setMessage('Installment plan created successfully!');
      setError('');
      setForm({ customer_id: '', phone_id: '', total_price: '', down_payment: '', monthly_payment: '', duration_months: '', start_date: '' });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating plan');
      setMessage('');
    }
  };

  return (
    <div style={styles.formCard}>
      <h3 style={styles.formTitle}>Create Installment Plan</h3>
      {message && <p style={styles.success}>{message}</p>}
      {error && <p style={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <select style={styles.input} name="customer_id" value={form.customer_id} onChange={handleChange} required>
          <option value="">Select Customer</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
        </select>
        <select style={styles.input} name="phone_id" value={form.phone_id} onChange={handleChange} required>
          <option value="">Select Phone</option>
          {phones.map(p => <option key={p.id} value={p.id}>{p.brand} {p.model} - Rs. {p.price}</option>)}
        </select>
        <input style={styles.input} name="total_price" type="number" placeholder="Total Price (Rs.)" value={form.total_price} onChange={handleChange} required />
        <input style={styles.input} name="down_payment" type="number" placeholder="Down Payment (Rs.)" value={form.down_payment} onChange={handleChange} required />
        <input style={styles.input} name="monthly_payment" type="number" placeholder="Monthly Payment (Rs.)" value={form.monthly_payment} onChange={handleChange} required />
        <input style={styles.input} name="duration_months" type="number" placeholder="Duration (months)" value={form.duration_months} onChange={handleChange} required />
        <label style={styles.label}>Start Date</label>
        <input style={styles.input} name="start_date" type="date" value={form.start_date} onChange={handleChange} required />
        <button style={styles.button} type="submit">Create Plan</button>
      </form>
    </div>
  );
};

const styles = {
  formCard: { background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px', maxWidth: '500px' },
  formTitle: { marginBottom: '16px', color: '#1a1a2e' },
  label: { display: 'block', marginBottom: '4px', fontSize: '13px', color: '#555' },
  input: { display: 'block', width: '100%', padding: '10px 14px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px', background: '#4361ee', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', cursor: 'pointer' },
  success: { color: 'green', marginBottom: '12px' },
  error: { color: 'red', marginBottom: '12px' },
};

export default AddPlanForm;