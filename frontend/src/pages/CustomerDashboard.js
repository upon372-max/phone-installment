import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const CustomerDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState('plan');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const plansRes = await API.get('/plans/my-plan');
      setPlans(plansRes.data);
      if (plansRes.data.length > 0) {
        const paymentsRes = await API.get(`/payments/my-payments`);
        setPayments(paymentsRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const plan = plans[0];

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>📱 PhoneInstall</h2>
        <nav>
          {['plan', 'payments'].map((tab) => (
            <button
              key={tab}
              style={{ ...styles.navBtn, ...(activeTab === tab ? styles.activeNav : {}) }}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'plan' ? 'My Plan' : 'Payment History'}
            </button>
          ))}
        </nav>
        <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>

      <div style={styles.main}>
        {activeTab === 'plan' && (
          <div>
            <h1 style={styles.heading}>My Installment Plan</h1>
            {plan ? (
              <div>
                <div style={styles.cards}>
                  <div style={styles.statCard}>
                    <h3>Rs. {plan.remaining_balance}</h3>
                    <p>Remaining Balance</p>
                  </div>
                  <div style={styles.statCard}>
                    <h3>Rs. {plan.monthly_payment}</h3>
                    <p>Monthly Payment</p>
                  </div>
                  <div style={styles.statCard}>
                    <h3>{new Date(plan.next_due_date).toLocaleDateString()}</h3>
                    <p>Next Due Date</p>
                  </div>
                  <div style={styles.statCard}>
                    <h3>{plan.status}</h3>
                    <p>Status</p>
                  </div>
                </div>
                <div style={styles.detailCard}>
                  <h3>Plan Details</h3>
                  <p><strong>Phone:</strong> {plan.brand} {plan.model}</p>
                  <p><strong>Total Price:</strong> Rs. {plan.total_price}</p>
                  <p><strong>Down Payment:</strong> Rs. {plan.down_payment}</p>
                  <p><strong>Duration:</strong> {plan.duration_months} months</p>
                  <p><strong>Start Date:</strong> {new Date(plan.start_date).toLocaleDateString()}</p>
                </div>
              </div>
            ) : (
              <p>No installment plan found.</p>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            <h1 style={styles.heading}>Payment History</h1>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Method</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td style={styles.td}>Rs. {p.amount}</td>
                    <td style={styles.td}>{p.payment_method}</td>
                    <td style={styles.td}>{new Date(p.payment_date).toLocaleDateString()}</td>
                    <td style={styles.td}>{p.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#f0f2f5' },
  sidebar: { width: '220px', background: '#1a1a2e', padding: '24px 16px', display: 'flex', flexDirection: 'column' },
  logo: { color: 'white', marginBottom: '32px', fontSize: '18px' },
  navBtn: { display: 'block', width: '100%', padding: '10px 16px', marginBottom: '8px', background: 'transparent', color: '#aaa', border: 'none', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontSize: '14px' },
  activeNav: { background: '#4361ee', color: 'white' },
  logoutBtn: { marginTop: 'auto', padding: '10px', background: '#e63946', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  main: { flex: 1, padding: '32px' },
  heading: { marginBottom: '24px', color: '#1a1a2e' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' },
  detailCard: { background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', lineHeight: '2' },
  table: { width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  th: { padding: '12px 16px', background: '#f8f9fa', textAlign: 'left', fontWeight: '600', color: '#333' },
  td: { padding: '12px 16px', borderTop: '1px solid #eee', color: '#555' },
};

export default CustomerDashboard;