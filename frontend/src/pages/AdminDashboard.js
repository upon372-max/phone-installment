import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import AddCustomerForm from '../components/AddCustomerForm';
import AddPhoneForm from '../components/AddPhoneForm';
import AddPlanForm from '../components/AddPlanForm';
import RecordPaymentForm from '../components/RecordPaymentForm';

const C = {
  bg: '#faf7f2',
  sidebar: '#ffffff',
  card: '#ffffff',
  brown1: '#6b4423',
  brown2: '#a67c52',
  brown3: '#c4a882',
  brown4: '#e8d5b7',
  brown5: '#f5efe6',
  text1: '#2c1810',
  text2: '#6b4423',
  text3: '#9c7a5a',
  text4: '#b8956a',
  green: '#2d6a4f',
  greenBg: '#d8f3dc',
  blue: '#1d4e89',
  blueBg: '#dbeafe',
  red: '#9b2226',
  redBg: '#fde8e8',
};

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

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [c, p, pl] = await Promise.all([API.get('/customers'), API.get('/phones'), API.get('/plans')]);
      setCustomers(c.data);
      setPhones(p.data);
      setPlans(pl.data);
    } catch (err) { console.error(err); }
  };

  const handleViewPlan = async (customer) => {
    setSelectedCustomer(customer);
    const cp = plans.filter(p => p.customer_id === customer.id);
    if (cp.length > 0) {
      setCustomerPlan(cp[0]);
      try { const pay = await API.get(`/payments/${cp[0].id}`); setCustomerPayments(pay.data); }
      catch { setCustomerPayments([]); }
    } else { setCustomerPlan(null); setCustomerPayments([]); }
    setShowModal(true);
  };

  const handlePrintReceipt = () => {
    const pw = window.open('', '_blank');
    const total = customerPayments.reduce((s, p) => s + parseFloat(p.amount), 0);
    pw.document.write(`<html><head><title>Receipt</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#2c1810}.header{text-align:center;border-bottom:2px solid #6b4423;padding-bottom:20px;margin-bottom:20px}.header h1{color:#6b4423}.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:20px 0}.item{padding:10px;background:#f5efe6;border-radius:6px}.item strong{display:block;color:#9c7a5a;font-size:12px;margin-bottom:2px}table{width:100%;border-collapse:collapse}th{background:#6b4423;color:white;padding:10px;text-align:left}td{padding:10px;border-bottom:1px solid #e8d5b7}.total{text-align:right;font-size:18px;font-weight:bold;color:#6b4423;margin-top:20px}.footer{text-align:center;margin-top:40px;color:#9c7a5a;font-size:12px}</style></head><body><div class="header"><h1>📱 PhoneInstall — Payment Receipt</h1><p>Generated: ${new Date().toLocaleDateString()}</p></div><div class="grid"><div class="item"><strong>Customer</strong>${selectedCustomer.full_name}</div><div class="item"><strong>Phone</strong>${selectedCustomer.phone||'N/A'}</div><div class="item"><strong>Device</strong>${customerPlan.brand} ${customerPlan.model}</div><div class="item"><strong>Status</strong>${customerPlan.status.toUpperCase()}</div><div class="item"><strong>Total Price</strong>Rs. ${customerPlan.total_price}</div><div class="item"><strong>Remaining</strong>Rs. ${customerPlan.remaining_balance}</div><div class="item"><strong>Monthly</strong>Rs. ${customerPlan.monthly_payment}</div><div class="item"><strong>Next Due</strong>${new Date(customerPlan.next_due_date).toLocaleDateString()}</div></div><h3>Payment History</h3><table><thead><tr><th>#</th><th>Amount</th><th>Method</th><th>Date</th><th>Notes</th></tr></thead><tbody>${customerPayments.map((p,i)=>`<tr><td>${i+1}</td><td>Rs. ${p.amount}</td><td>${p.payment_method}</td><td>${new Date(p.payment_date).toLocaleDateString()}</td><td>${p.notes||'-'}</td></tr>`).join('')}</tbody></table><div class="total">Total Paid: Rs. ${total.toLocaleString()}</div><div class="footer">PhoneInstall System</div></body></html>`);
    pw.document.close();
    pw.print();
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Delete this customer?')) {
      try { await API.delete(`/customers/${id}`); fetchData(); }
      catch { alert('Error deleting customer'); }
    }
  };

  const handleDeletePhone = async (id) => {
    if (window.confirm('Delete this phone?')) {
      try { await API.delete(`/phones/${id}`); fetchData(); }
      catch { alert('Error deleting phone'); }
    }
  };

  const handleMarkComplete = async (id) => {
    if (window.confirm('Mark this plan as completed?')) {
      try { await API.put(`/plans/${id}`, { status: 'completed' }); fetchData(); }
      catch { alert('Error updating plan'); }
    }
  };

  const handleSendReminders = async () => {
    try { const res = await API.post('/reminders/send-reminders'); alert(res.data.message); }
    catch { alert('Error sending reminders'); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const tabs = [
    { id: 'dashboard', icon: '▦', label: 'Dashboard' },
    { id: 'customers', icon: '👥', label: 'Customers' },
    { id: 'phones', icon: '📱', label: 'Phones' },
    { id: 'plans', icon: '📋', label: 'Plans' },
    { id: 'payments', icon: '💳', label: 'Payments' },
  ];

  return (
    <div style={styles.container}>
      <style>{`
        * { box-sizing: border-box; }
        .nb:hover { background: ${C.brown5} !important; color: ${C.brown1} !important; }
        .rb:hover { opacity: 0.85; }
        .tr:hover { background: ${C.brown5} !important; }
        .inp:focus { border-color: ${C.brown2} !important; box-shadow: 0 0 0 3px rgba(166,124,82,0.12) !important; outline: none !important; }
        .inp::placeholder { color: ${C.brown3}; }
        select:focus { border-color: ${C.brown2} !important; outline: none; }
        select option { background: white; color: ${C.text1}; }
      `}</style>

      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>📱</span>
            <div>
              <div style={styles.logoText}>PhoneInstall</div>
              <div style={styles.logoSub}>Admin Panel</div>
            </div>
          </div>
          <div style={styles.divider}></div>
          <nav>
            {tabs.map(t => (
              <button key={t.id} className="nb" style={{ ...styles.navBtn, ...(activeTab === t.id ? styles.navActive : {}) }} onClick={() => setActiveTab(t.id)}>
                <span style={styles.navIcon}>{t.icon}</span>
                {t.label}
                {activeTab === t.id && <div style={styles.navDot}></div>}
              </button>
            ))}
          </nav>
        </div>
        <div>
          <div style={styles.divider}></div>
          <div style={styles.adminBadge}>
            <div style={styles.adminAvatar}>A</div>
            <div>
              <div style={styles.adminName}>Administrator</div>
              <div style={styles.adminRole}>Full Access</div>
            </div>
          </div>
          <button className="rb" style={styles.logoutBtn} onClick={handleLogout}>Sign out</button>
        </div>
      </div>

      {/* Main */}
      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>{tabs.find(t => t.id === activeTab)?.label}</h1>
            <p style={styles.pageDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          {activeTab === 'dashboard' && (
            <button className="rb" style={styles.reminderBtn} onClick={handleSendReminders}>📅 Send Reminders</button>
          )}
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={styles.statsRow}>
              {[
                { label: 'Total Customers', value: customers.length, icon: '👥', color: C.brown1, bg: C.brown5 },
                { label: 'Total Phones', value: phones.length, icon: '📱', color: '#1d4e89', bg: '#dbeafe' },
                { label: 'Active Plans', value: plans.filter(p => p.status === 'active').length, icon: '✅', color: C.green, bg: C.greenBg },
                { label: 'Completed', value: plans.filter(p => p.status === 'completed').length, icon: '🏆', color: '#7c3aed', bg: '#ede9fe' },
              ].map((s, i) => (
                <div key={i} style={{ ...styles.statCard, background: s.bg, border: `1px solid ${s.bg}` }}>
                  <div style={styles.statTop}>
                    <span style={styles.statIcon}>{s.icon}</span>
                    <span style={{ ...styles.statNum, color: s.color }}>{s.value}</span>
                  </div>
                  <div style={{ ...styles.statLabel, color: s.color }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Recent Installment Plans</h2>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.thead}>
                      {['Customer', 'Phone', 'Total', 'Remaining', 'Next Due', 'Status'].map(h => <th key={h} style={styles.th}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {plans.slice(0, 5).map(p => (
                      <tr key={p.id} className="tr" style={styles.tr}>
                        <td style={styles.td}><div style={styles.nameCell}><div style={styles.avatar}>{p.full_name[0]}</div>{p.full_name}</div></td>
                        <td style={styles.td}>{p.brand} {p.model}</td>
                        <td style={styles.td}>Rs. {p.total_price}</td>
                        <td style={{ ...styles.td, fontWeight: '600', color: C.brown1 }}>Rs. {p.remaining_balance}</td>
                        <td style={styles.td}>{new Date(p.next_due_date).toLocaleDateString()}</td>
                        <td style={styles.td}><span style={{ ...styles.badge, background: p.status === 'active' ? C.greenBg : C.blueBg, color: p.status === 'active' ? C.green : C.blue }}>{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Customers */}
        {activeTab === 'customers' && (
          <div>
            <input className="inp" style={styles.search} placeholder="Search customers by name, email or phone..." value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} />
            <AddCustomerForm onSuccess={fetchData} />
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thead}>
                    {['Name', 'Email', 'Phone', 'Joined', 'Actions'].map(h => <th key={h} style={styles.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {customers.filter(c =>
                    c.full_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                    c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
                    (c.phone && c.phone.includes(customerSearch))
                  ).map(c => (
                    <tr key={c.id} className="tr" style={styles.tr}>
                      <td style={styles.td}><div style={styles.nameCell}><div style={styles.avatar}>{c.full_name[0]}</div>{c.full_name}</div></td>
                      <td style={styles.td}>{c.email}</td>
                      <td style={styles.td}>{c.phone}</td>
                      <td style={styles.td}>{new Date(c.created_at).toLocaleDateString()}</td>
                      <td style={styles.td}>
                        <button className="rb" style={styles.viewBtn} onClick={() => handleViewPlan(c)}>View Plan</button>
                        {' '}
                        <button className="rb" style={styles.deleteBtn} onClick={() => handleDeleteCustomer(c.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Phones */}
        {activeTab === 'phones' && (
          <div>
            <input className="inp" style={styles.search} placeholder="Search phones by brand or model..." value={phoneSearch} onChange={e => setPhoneSearch(e.target.value)} />
            <AddPhoneForm onSuccess={fetchData} />
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thead}>
                    {['Brand', 'Model', 'Price', 'Stock', 'Actions'].map(h => <th key={h} style={styles.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {phones.filter(p =>
                    p.brand.toLowerCase().includes(phoneSearch.toLowerCase()) ||
                    p.model.toLowerCase().includes(phoneSearch.toLowerCase())
                  ).map(p => (
                    <tr key={p.id} className="tr" style={styles.tr}>
                      <td style={styles.td}><span style={styles.brandTag}>{p.brand}</span></td>
                      <td style={styles.td}>{p.model}</td>
                      <td style={{ ...styles.td, fontWeight: '600', color: C.brown1 }}>Rs. {p.price}</td>
                      <td style={styles.td}><span style={{ ...styles.badge, background: p.stock > 5 ? C.greenBg : C.redBg, color: p.stock > 5 ? C.green : C.red }}>{p.stock} units</span></td>
                      <td style={styles.td}><button className="rb" style={styles.deleteBtn} onClick={() => handleDeletePhone(p.id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Plans */}
        {activeTab === 'plans' && (
          <div>
            <AddPlanForm onSuccess={fetchData} />
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thead}>
                    {['Customer', 'Phone', 'Total', 'Remaining', 'Next Due', 'Status', 'Actions'].map(h => <th key={h} style={styles.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {plans.map(p => (
                    <tr key={p.id} className="tr" style={styles.tr}>
                      <td style={styles.td}><div style={styles.nameCell}><div style={styles.avatar}>{p.full_name[0]}</div>{p.full_name}</div></td>
                      <td style={styles.td}>{p.brand} {p.model}</td>
                      <td style={styles.td}>Rs. {p.total_price}</td>
                      <td style={{ ...styles.td, fontWeight: '600', color: C.brown1 }}>Rs. {p.remaining_balance}</td>
                      <td style={styles.td}>{new Date(p.next_due_date).toLocaleDateString()}</td>
                      <td style={styles.td}><span style={{ ...styles.badge, background: p.status === 'active' ? C.greenBg : C.blueBg, color: p.status === 'active' ? C.green : C.blue }}>{p.status}</span></td>
                      <td style={styles.td}>
                        {p.status === 'active' && <button className="rb" style={styles.completeBtn} onClick={() => handleMarkComplete(p.id)}>Mark Complete</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payments */}
        {activeTab === 'payments' && (
          <div>
            <RecordPaymentForm onSuccess={fetchData} />
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedCustomer && (
        <div style={styles.overlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>
                <div style={styles.modalAvatar}>{selectedCustomer.full_name[0]}</div>
                <div>
                  <h2 style={{ margin: 0, color: C.text1, fontSize: '20px' }}>{selectedCustomer.full_name}</h2>
                  <p style={{ margin: 0, color: C.text3, fontSize: '13px' }}>{selectedCustomer.email}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {customerPlan && <button className="rb" style={styles.printBtn} onClick={handlePrintReceipt}>🖨️ Print</button>}
                <button style={styles.closeBtn} onClick={() => setShowModal(false)}>✕</button>
              </div>
            </div>

            {customerPlan ? (
              <div>
                <div style={styles.planGrid}>
                  {[
                    { label: 'Phone', value: `${customerPlan.brand} ${customerPlan.model}` },
                    { label: 'Total Price', value: `Rs. ${customerPlan.total_price}` },
                    { label: 'Down Payment', value: `Rs. ${customerPlan.down_payment}` },
                    { label: 'Monthly Payment', value: `Rs. ${customerPlan.monthly_payment}` },
                    { label: 'Remaining Balance', value: `Rs. ${customerPlan.remaining_balance}` },
                    { label: 'Next Due Date', value: new Date(customerPlan.next_due_date).toLocaleDateString() },
                    { label: 'Duration', value: `${customerPlan.duration_months} months` },
                    { label: 'Status', value: customerPlan.status.toUpperCase() },
                  ].map((item, i) => (
                    <div key={i} style={styles.planItem}>
                      <div style={styles.planLabel}>{item.label}</div>
                      <div style={styles.planValue}>{item.value}</div>
                    </div>
                  ))}
                </div>

                <h3 style={{ color: C.text1, margin: '24px 0 12px', fontSize: '16px' }}>Payment History</h3>
                {customerPayments.length > 0 ? (
                  <div style={styles.tableWrap}>
                    <table style={styles.table}>
                      <thead>
                        <tr style={styles.thead}>
                          {['Amount', 'Method', 'Date', 'Notes'].map(h => <th key={h} style={styles.th}>{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {customerPayments.map(pay => (
                          <tr key={pay.id} className="tr" style={styles.tr}>
                            <td style={{ ...styles.td, fontWeight: '600', color: C.brown1 }}>Rs. {pay.amount}</td>
                            <td style={styles.td}>{pay.payment_method}</td>
                            <td style={styles.td}>{new Date(pay.payment_date).toLocaleDateString()}</td>
                            <td style={styles.td}>{pay.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p style={{ color: C.text3, fontSize: '14px' }}>No payments recorded yet.</p>}
              </div>
            ) : <p style={{ color: C.text3 }}>No installment plan found for this customer.</p>}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', background: C.bg, fontFamily: "'Segoe UI', system-ui, sans-serif" },
  sidebar: { width: '240px', background: C.sidebar, borderRight: `1px solid ${C.brown4}`, padding: '24px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'sticky', top: 0, height: '100vh' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', marginBottom: '8px' },
  logoIcon: { fontSize: '28px' },
  logoText: { fontSize: '17px', fontWeight: '700', color: C.brown1 },
  logoSub: { fontSize: '11px', color: C.text3, letterSpacing: '0.5px' },
  divider: { height: '1px', background: C.brown4, margin: '12px 0' },
  navBtn: { display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', background: 'transparent', color: C.text3, border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', position: 'relative', transition: 'all 0.2s', textAlign: 'left' },
  navActive: { background: C.brown5, color: C.brown1, fontWeight: '600' },
  navIcon: { fontSize: '16px', width: '20px' },
  navDot: { position: 'absolute', right: '12px', width: '6px', height: '6px', borderRadius: '50%', background: C.brown1 },
  adminBadge: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', marginBottom: '8px' },
  adminAvatar: { width: '36px', height: '36px', borderRadius: '50%', background: `linear-gradient(135deg, ${C.brown1}, ${C.brown2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '16px' },
  adminName: { fontSize: '13px', fontWeight: '600', color: C.text1 },
  adminRole: { fontSize: '11px', color: C.text3 },
  logoutBtn: { width: '100%', padding: '10px', background: C.redBg, color: C.red, border: `1px solid #fecaca`, borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'opacity 0.2s' },
  main: { flex: 1, padding: '32px', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' },
  pageTitle: { fontSize: '26px', fontWeight: '700', color: C.text1, margin: '0 0 4px', letterSpacing: '-0.3px' },
  pageDate: { fontSize: '13px', color: C.text3, margin: 0 },
  reminderBtn: { padding: '10px 20px', background: C.brown1, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'opacity 0.2s' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '28px' },
  statCard: { borderRadius: '14px', padding: '20px', transition: 'transform 0.2s' },
  statTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
  statIcon: { fontSize: '24px' },
  statNum: { fontSize: '32px', fontWeight: '800', lineHeight: 1 },
  statLabel: { fontSize: '13px', fontWeight: '500' },
  section: {},
  sectionTitle: { fontSize: '17px', fontWeight: '600', color: C.text1, marginBottom: '14px' },
  search: { width: '100%', padding: '11px 14px', border: `1.5px solid ${C.brown4}`, borderRadius: '10px', fontSize: '14px', color: C.text1, background: 'white', marginBottom: '20px', transition: 'all 0.2s' },
  tableWrap: { background: 'white', borderRadius: '14px', border: `1px solid ${C.brown4}`, overflow: 'hidden', marginBottom: '24px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: C.brown5 },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: C.text2, letterSpacing: '0.3px', textTransform: 'uppercase' },
  tr: { borderTop: `1px solid ${C.brown4}`, transition: 'background 0.15s' },
  td: { padding: '13px 16px', fontSize: '14px', color: C.text1 },
  nameCell: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: { width: '30px', height: '30px', borderRadius: '50%', background: `linear-gradient(135deg, ${C.brown1}, ${C.brown2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '13px', flexShrink: 0 },
  badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  brandTag: { padding: '4px 10px', background: C.brown5, color: C.brown1, borderRadius: '6px', fontSize: '12px', fontWeight: '600' },
  viewBtn: { padding: '6px 12px', background: C.brown5, color: C.brown1, border: `1px solid ${C.brown4}`, borderRadius: '7px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'opacity 0.2s' },
  deleteBtn: { padding: '6px 12px', background: C.redBg, color: C.red, border: '1px solid #fecaca', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'opacity 0.2s' },
  completeBtn: { padding: '6px 12px', background: C.greenBg, color: C.green, border: `1px solid #b7e4c7`, borderRadius: '7px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'opacity 0.2s' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(44,24,16,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'white', borderRadius: '20px', padding: '32px', width: '680px', maxHeight: '82vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(44,24,16,0.2)', border: `1px solid ${C.brown4}` },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  modalTitle: { display: 'flex', alignItems: 'center', gap: '14px' },
  modalAvatar: { width: '46px', height: '46px', borderRadius: '50%', background: `linear-gradient(135deg, ${C.brown1}, ${C.brown2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '20px' },
  printBtn: { padding: '8px 16px', background: C.greenBg, color: C.green, border: `1px solid #b7e4c7`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'opacity 0.2s' },
  closeBtn: { width: '32px', height: '32px', borderRadius: '50%', background: C.brown5, border: 'none', color: C.text2, cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  planGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  planItem: { background: C.brown5, borderRadius: '10px', padding: '12px 14px', border: `1px solid ${C.brown4}` },
  planLabel: { fontSize: '11px', color: C.text3, fontWeight: '600', letterSpacing: '0.3px', textTransform: 'uppercase', marginBottom: '4px' },
  planValue: { fontSize: '15px', color: C.text1, fontWeight: '600' },
};

export default AdminDashboard;