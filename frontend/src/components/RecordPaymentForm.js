import React, { useState, useEffect } from 'react';
import API from '../api';

const RecordPaymentForm = ({ onSuccess }) => {
  const [form, setForm] = useState({ plan_id: '', amount: '', payment_method: 'cash', notes: '' });
  const [plans, setPlans] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlans = async () => {
      const res = await API.get('/plans');
      setPlans(res.data.filter(p => p.status === 'active'));
    };
    fetchPlans();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/payments', form);
      setMessage('Payment recorded successfully!');
      setError('');
      setForm({ plan_id: '', amount: '', payment_method: 'cash', notes: '' });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error recording payment');
      setMessage('');
    }
  };

  return (
    <div style={styles.formCard}>
      <h3 style={styles.formTitle}>Record Payment</h3>
      {message && <p style={styles.success}>{message}</p>}
      {error && <p style={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <select style={styles.input} name="plan_id" value={form.plan_id} onChange={handleChange} required>
          <option value="">Select Active Plan</option>
          {plans.map(p => (
            <option key={p.id} value={p.id}>
              {p.full_name} — {p.brand} {p.model} — Balance: Rs. {p.remaining_balance}
            </option>
          ))}
        </select>
        <input style={styles.input} name="amount" type="number" placeholder="Amount (Rs.)" value={form.amount} onChange={handleChange} required />
        <select style={styles.input} name="payment_method" value={form.payment_method} onChange={handleChange}>
          <option value="cash">Cash</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="easypaisa">Easypaisa</option>
          <option value="jazzcash">JazzCash</option>
        </select>
        <input style={styles.input} name="notes" placeholder="Notes (optional)" value={form.notes} onChange={handleChange} />
        <button style={styles.button} type="submit">Record Payment</button>
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

export default RecordPaymentForm;