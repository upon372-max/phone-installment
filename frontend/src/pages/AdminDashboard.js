import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import AddCustomerForm from '../components/AddCustomerForm';
import AddPhoneForm from '../components/AddPhoneForm';
import AddPlanForm from '../components/AddPlanForm';
import RecordPaymentForm from '../components/RecordPaymentForm';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [phoneSearch, setPhoneSearch] = useState('');
  const [phones, setPhones] = useState([]);
  const [plans, setPlans] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerPlan, setCustomerPlan] = useState(null);
  const [customerPayments, setCustomerPayments] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [c, p, pl] = await Promise.all([
        API.get('/customers'),
        API.get('/phones'),
        API.get('/plans'),
      ]);
      setCustomers(c.data);
      setPhones(p.data);
      setPlans(pl.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewPlan = async (customer) => {
    setSelectedCustomer(customer);
    const customerPlans = plans.filter(p => p.customer_id === customer.id);
    if (customerPlans.length > 0) {
      setCustomerPlan(customerPlans[0]);
      try {
        const payments = await API.get(`/payments/${customerPlans[0].id}`);
        setCustomerPayments(payments.data);
      } catch (err) {
        setCustomerPayments([]);
      }
    } else {
      setCustomerPlan(null);
      setCustomerPayments([]);
    }
    setShowModal(true);
  };

  const handlePrintReceipt = () => {
    const printWindow = window.open('', '_blank');
    const totalPaid = customerPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt - ${selectedCustomer.full_name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #4361ee; padding-bottom: 20px; margin-bottom: 20px; }
            .header h1 { color: #4361ee; margin: 0; }
            .header p { color: #666; margin: 5px 0; }
            .section { margin-bottom: 20px; }
            .section h3 { color: #4361ee; border-bottom: 1px solid #eee; padding-bottom: 8px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .item { padding: 8px; background: #f8f9fa; border-radius: 4px; }
            .item strong { display: block; color: #666; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #4361ee; color: white; padding: 10px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #eee; }
            .total { text-align: right; font-size: 18px; font-weight: bold; color: #4361ee; margin-top: 20px; }
            .footer { text-align: center; margin-top: 40px; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📱 Phone Installment</h1>
            <p>Payment Receipt</p>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="section">
            <h3>Customer Information</h3>
            <div class="grid">
              <div class="item"><strong>Name</strong>${selectedCustomer.full_name}</div>
              <div class="item"><strong>Email</strong>${selectedCustomer.email}</div>
              <div class="item"><strong>Phone</strong>${selectedCustomer.phone || 'N/A'}</div>
              <div class="item"><strong>Member Since</strong>${new Date(selectedCustomer.created_at).toLocaleDateString()}</div>
            </div>
          </div>
          <div class="section">
            <h3>Installment Plan Details</h3>
            <div class="grid">
              <div class="item"><strong>Phone</strong>${customerPlan.brand} ${customerPlan.model}</div>
              <div class="item"><strong>Total Price</strong>Rs. ${customerPlan.total_price}</div>
              <div class="item"><strong>Down Payment</strong>Rs. ${customerPlan.down_payment}</div>
              <div class="item"><strong>Monthly Payment</strong>Rs. ${customerPlan.monthly_payment}</div>
              <div class="item"><strong>Duration</strong>${customerPlan.duration_months} months</div>
              <div class="item"><strong>Remaining Balance</strong>Rs. ${customerPlan.remaining_balance}</div>
              <div class="item"><strong>Next Due Date</strong>${new Date(customerPlan.next_due_date).toLocaleDateString()}</div>
              <div class="item"><strong>Status</strong>${customerPlan.status.toUpperCase()}</div>
            </div>
          </div>
          <div class="section">
            <h3>Payment History</h3>
            ${customerPayments.length > 0 ? `
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                ${customerPayments.map((p, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td>Rs. ${p.amount}</td>
                    <td>${p.payment_method}</td>
                    <td>${new Date(p.payment_date).toLocaleDateString()}</td>
                    <td>${p.notes || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="total">Total Paid: Rs. ${totalPaid.toLocaleString()}</div>
            ` : '<p>No payments recorded yet.</p>'}
          </div>
          <div class="footer">
            <p>Phone Installment System | Generated automatically</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await API.delete(`/customers/${id}`);
        fetchData();
      } catch (err) {
        alert('Error deleting customer');
      }
    }
  };

  const handleDeletePhone = async (id) => {
    if (window.confirm('Are you sure you want to delete this phone?')) {
      try {
        await API.delete(`/phones/${id}`);
        fetchData();
      } catch (err) {
        alert('Error deleting phone');
      }
    }
  };

  const handleMarkComplete = async (id) => {
    if (window.confirm('Mark this plan as completed?')) {
      try {
        await API.put(`/plans/${id}`, { status: 'completed' });
        fetchData();
      } catch (err) {
        alert('Error updating plan');
      }
    }
  };

  const handleSendReminders = async () => {
    try {
      const res = await API.post('/reminders/send-reminders');
      alert(res.data.message);
    } catch (err) {
      alert('Error sending reminders');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = ['dashboard', 'customers', 'phones', 'plans', 'payments'];

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>📱 PhoneInstall</h2>
        <nav>
          {tabs.map((tab) => (
            <button
              key={tab}
              style={{ ...styles.navBtn, ...(activeTab === tab ? styles.activeNav : {}) }}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
        <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>

      <div style={styles.main}>
        {activeTab === 'dashboard' && (
          <div>
            <div style={styles.dashboardHeader}>
              <h1 style={styles.heading}>Dashboard</h1>
              <button style={styles.reminderBtn} onClick={handleSendReminders}>
                📅 Send Payment Reminders
              </button>
            </div>
            <div style={styles.cards}>
              <div style={styles.statCard}>
                <h3>{customers.length}</h3>
                <p>Total Customers</p>
              </div>
              <div style={styles.statCard}>
                <h3>{phones.length}</h3>
                <p>Total Phones</p>
              </div>
              <div style={styles.statCard}>
                <h3>{plans.filter(p => p.status === 'active').length}</h3>
                <p>Active Plans</p>
              </div>
              <div style={styles.statCard}>
                <h3>{plans.filter(p => p.status === 'completed').length}</h3>
                <p>Completed Plans</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div>
            <h1 style={styles.heading}>Customers</h1>
            <input
              style={styles.searchInput}
              placeholder="Search by name, email or phone..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
            />
            <AddCustomerForm onSuccess={fetchData} />
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Joined</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.filter(c =>
                  c.full_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                  c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
                  (c.phone && c.phone.includes(customerSearch))
                ).map((c) => (
                  <tr key={c.id}>
                    <td style={styles.td}>{c.full_name}</td>
                    <td style={styles.td}>{c.email}</td>
                    <td style={styles.td}>{c.phone}</td>
                    <td style={styles.td}>{new Date(c.created_at).toLocaleDateString()}</td>
                    <td style={styles.td}>
                      <button style={styles.viewBtn} onClick={() => handleViewPlan(c)}>
                        View Plan
                      </button>
                      {' '}
                      <button style={styles.deleteBtn} onClick={() => handleDeleteCustomer(c.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'phones' && (
          <div>
            <h1 style={styles.heading}>Phones</h1>
            <input
              style={styles.searchInput}
              placeholder="Search by brand or model..."
              value={phoneSearch}
              onChange={(e) => setPhoneSearch(e.target.value)}
            />
            <AddPhoneForm onSuccess={fetchData} />
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Brand</th>
                  <th style={styles.th}>Model</th>
                  <th style={styles.th}>Price</th>
                  <th style={styles.th}>Stock</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {phones.filter(p =>
                  p.brand.toLowerCase().includes(phoneSearch.toLowerCase()) ||
                  p.model.toLowerCase().includes(phoneSearch.toLowerCase())
                ).map((p) => (
                  <tr key={p.id}>
                    <td style={styles.td}>{p.brand}</td>
                    <td style={styles.td}>{p.model}</td>
                    <td style={styles.td}>Rs. {p.price}</td>
                    <td style={styles.td}>{p.stock}</td>
                    <td style={styles.td}>
                      <button style={styles.deleteBtn} onClick={() => handleDeletePhone(p.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'plans' && (
          <div>
            <h1 style={styles.heading}>Installment Plans</h1>
            <AddPlanForm onSuccess={fetchData} />
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Customer</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Total</th>
                  <th style={styles.th}>Remaining</th>
                  <th style={styles.th}>Next Due</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.id}>
                    <td style={styles.td}>{p.full_name}</td>
                    <td style={styles.td}>{p.brand} {p.model}</td>
                    <td style={styles.td}>Rs. {p.total_price}</td>
                    <td style={styles.td}>Rs. {p.remaining_balance}</td>
                    <td style={styles.td}>{new Date(p.next_due_date).toLocaleDateString()}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: p.status === 'active' ? '#d4edda' : '#cce5ff',
                        color: p.status === 'active' ? '#155724' : '#004085',
                      }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {p.status === 'active' && (
                        <button style={styles.completeBtn} onClick={() => handleMarkComplete(p.id)}>
                          Mark Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            <h1 style={styles.heading}>Record Payment</h1>
            <RecordPaymentForm onSuccess={fetchData} />
          </div>
        )}
      </div>

      {showModal && selectedCustomer && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0 }}>{selectedCustomer.full_name}'s Plan</h2>
              <div>
                {customerPlan && (
                  <button style={styles.printBtn} onClick={handlePrintReceipt}>
                    🖨️ Print Receipt
                  </button>
                )}
                {' '}
                <button style={styles.closeBtn} onClick={() => setShowModal(false)}>✕</button>
              </div>
            </div>
            {customerPlan ? (
              <div>
                <div style={styles.planGrid}>
                  <div style={styles.planItem}><strong>Phone:</strong> {customerPlan.brand} {customerPlan.model}</div>
                  <div style={styles.planItem}><strong>Total Price:</strong> Rs. {customerPlan.total_price}</div>
                  <div style={styles.planItem}><strong>Down Payment:</strong> Rs. {customerPlan.down_payment}</div>
                  <div style={styles.planItem}><strong>Monthly Payment:</strong> Rs. {customerPlan.monthly_payment}</div>
                  <div style={styles.planItem}><strong>Remaining Balance:</strong> Rs. {customerPlan.remaining_balance}</div>
                  <div style={styles.planItem}><strong>Next Due Date:</strong> {new Date(customerPlan.next_due_date).toLocaleDateString()}</div>
                  <div style={styles.planItem}><strong>Duration:</strong> {customerPlan.duration_months} months</div>
                  <div style={styles.planItem}><strong>Status:</strong> {customerPlan.status}</div>
                </div>
                <h3 style={{ marginTop: '24px' }}>Payment History</h3>
                {customerPayments.length > 0 ? (
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
                      {customerPayments.map(pay => (
                        <tr key={pay.id}>
                          <td style={styles.td}>Rs. {pay.amount}</td>
                          <td style={styles.td}>{pay.payment_method}</td>
                          <td style={styles.td}>{new Date(pay.payment_date).toLocaleDateString()}</td>
                          <td style={styles.td}>{pay.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No payments recorded yet.</p>
                )}
              </div>
            ) : (
              <p>No installment plan found for this customer.</p>
            )}
          </div>
        </div>
      )}
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
  heading: { marginBottom: '0', color: '#1a1a2e' },
  dashboardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  reminderBtn: { padding: '10px 20px', background: '#f4a261', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' },
  statCard: { background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' },
  table: { width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  th: { padding: '12px 16px', background: '#f8f9fa', textAlign: 'left', fontWeight: '600', color: '#333' },
  td: { padding: '12px 16px', borderTop: '1px solid #eee', color: '#555' },
  badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  searchInput: { width: '100%', padding: '10px 14px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  deleteBtn: { padding: '6px 12px', background: '#e63946', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  completeBtn: { padding: '6px 12px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  viewBtn: { padding: '6px 12px', background: '#4361ee', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  printBtn: { padding: '6px 16px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'white', borderRadius: '12px', padding: '32px', width: '700px', maxHeight: '80vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  closeBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' },
  planGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8f9fa', padding: '16px', borderRadius: '8px' },
  planItem: { fontSize: '14px', color: '#333' },
};

export default AdminDashboard;