import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const C = {
  bg: '#faf7f2',
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
};

const CustomerDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState('plan');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const plansRes = await API.get('/plans/my-plan');
      setPlans(plansRes.data);
      if (plansRes.data.length > 0) {
        const paymentsRes = await API.get('/payments/my-payments');
        setPayments(paymentsRes.data);
      }
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => { logout(); navigate('/'); };
  const plan = plans[0];

  const progressPercent = plan
    ? Math.round(((parseFloat(plan.total_price) - parseFloat(plan.remaining_balance)) / parseFloat(plan.total_price)) * 100)
    : 0;

  return (
    <div style={styles.container}>
      <style>{`
        * { box-sizing: border-box; }
        .nb:hover { background: ${C.brown5} !important; color: ${C.brown1} !important; }
        .rb:hover { opacity: 0.85; }
        .tr:hover { background: ${C.brown5} !important; }
      `}</style>

      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>📱</span>
            <div>
              <div style={styles.logoText}>PhoneInstall</div>
              <div style={styles.logoSub}>Customer Portal</div>
            </div>
          </div>
          <div style={styles.divider}></div>
          <nav>
            {[
              { id: 'plan', icon: '📋', label: 'My Plan' },
              { id: 'payments', icon: '💳', label: 'Payment History' },
            ].map(t => (
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
          <div style={styles.customerBadge}>
            <div style={styles.customerAvatar}>C</div>
            <div>
              <div style={styles.customerName}>Customer</div>
              <div style={styles.customerRole}>My Account</div>
            </div>
          </div>
          <button className="rb" style={styles.logoutBtn} onClick={handleLogout}>Sign out</button>
        </div>
      </div>

      {/* Main */}
      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>{activeTab === 'plan' ? 'My Installment Plan' : 'Payment History'}</h1>
            <p style={styles.pageDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {/* My Plan */}
        {activeTab === 'plan' && (
          <div>
            {plan ? (
              <div>
                {/* Stats row */}
                <div style={styles.statsRow}>
                  {[
                    { label: 'Remaining Balance', value: `Rs. ${plan.remaining_balance}`, icon: '💰', color: C.brown1, bg: C.brown5 },
                    { label: 'Monthly Payment', value: `Rs. ${plan.monthly_payment}`, icon: '📅', color: C.blue, bg: C.blueBg },
                    { label: 'Next Due Date', value: new Date(plan.next_due_date).toLocaleDateString(), icon: '🗓️', color: '#7c3aed', bg: '#ede9fe' },
                    { label: 'Status', value: plan.status.toUpperCase(), icon: '✅', color: C.green, bg: C.greenBg },
                  ].map((s, i) => (
                    <div key={i} style={{ ...styles.statCard, background: s.bg }}>
                      <div style={styles.statTop}>
                        <span style={styles.statIcon}>{s.icon}</span>
                      </div>
                      <div style={{ ...styles.statValue, color: s.color }}>{s.value}</div>
                      <div style={{ ...styles.statLabel, color: s.color }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div style={styles.progressCard}>
                  <div style={styles.progressHeader}>
                    <span style={styles.progressTitle}>Repayment Progress</span>
                    <span style={styles.progressPercent}>{progressPercent}% completed</span>
                  </div>
                  <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${progressPercent}%` }}></div>
                  </div>
                  <div style={styles.progressFooter}>
                    <span>Rs. {(parseFloat(plan.total_price) - parseFloat(plan.remaining_balance)).toLocaleString()} paid</span>
                    <span>Rs. {parseFloat(plan.remaining_balance).toLocaleString()} remaining</span>
                  </div>
                </div>

                {/* Plan details */}
                <div style={styles.detailCard}>
                  <h3 style={styles.detailTitle}>Plan Details</h3>
                  <div style={styles.detailGrid}>
                    {[
                      { label: 'Phone', value: `${plan.brand} ${plan.model}` },
                      { label: 'Total Price', value: `Rs. ${plan.total_price}` },
                      { label: 'Down Payment', value: `Rs. ${plan.down_payment}` },
                      { label: 'Monthly Payment', value: `Rs. ${plan.monthly_payment}` },
                      { label: 'Duration', value: `${plan.duration_months} months` },
                      { label: 'Start Date', value: new Date(plan.start_date).toLocaleDateString() },
                    ].map((item, i) => (
                      <div key={i} style={styles.detailItem}>
                        <div style={styles.detailLabel}>{item.label}</div>
                        <div style={styles.detailValue}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📋</div>
                <h3 style={styles.emptyTitle}>No Plan Found</h3>
                <p style={styles.emptySub}>You don't have an active installment plan yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Payment History */}
        {activeTab === 'payments' && (
          <div>
            {payments.length > 0 ? (
              <div>
                {/* Summary card */}
                <div style={styles.summaryCard}>
                  <div style={styles.summaryItem}>
                    <div style={styles.summaryLabel}>Total Payments Made</div>
                    <div style={styles.summaryValue}>{payments.length}</div>
                  </div>
                  <div style={styles.summaryDivider}></div>
                  <div style={styles.summaryItem}>
                    <div style={styles.summaryLabel}>Total Amount Paid</div>
                    <div style={styles.summaryValue}>Rs. {payments.reduce((s, p) => s + parseFloat(p.amount), 0).toLocaleString()}</div>
                  </div>
                  <div style={styles.summaryDivider}></div>
                  <div style={styles.summaryItem}>
                    <div style={styles.summaryLabel}>Last Payment</div>
                    <div style={styles.summaryValue}>{new Date(payments[0]?.payment_date).toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Payments table */}
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.thead}>
                        {['#', 'Amount', 'Method', 'Date', 'Notes'].map(h => <th key={h} style={styles.th}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p, i) => (
                        <tr key={p.id} className="tr" style={styles.tr}>
                          <td style={{ ...styles.td, color: C.text3 }}>{i + 1}</td>
                          <td style={{ ...styles.td, fontWeight: '600', color: C.brown1 }}>Rs. {p.amount}</td>
                          <td style={styles.td}><span style={styles.methodBadge}>{p.payment_method}</span></td>
                          <td style={styles.td}>{new Date(p.payment_date).toLocaleDateString()}</td>
                          <td style={{ ...styles.td, color: C.text3 }}>{p.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>💳</div>
                <h3 style={styles.emptyTitle}>No Payments Yet</h3>
                <p style={styles.emptySub}>Your payment history will appear here once payments are recorded.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', background: C.bg, fontFamily: "'Segoe UI', system-ui, sans-serif" },
  sidebar: { width: '240px', background: C.card, borderRight: `1px solid ${C.brown4}`, padding: '24px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'sticky', top: 0, height: '100vh' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', marginBottom: '8px' },
  logoIcon: { fontSize: '28px' },
  logoText: { fontSize: '17px', fontWeight: '700', color: C.brown1 },
  logoSub: { fontSize: '11px', color: C.text3 },
  divider: { height: '1px', background: C.brown4, margin: '12px 0' },
  navBtn: { display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', background: 'transparent', color: C.text3, border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', position: 'relative', transition: 'all 0.2s', textAlign: 'left' },
  navActive: { background: C.brown5, color: C.brown1, fontWeight: '600' },
  navIcon: { fontSize: '16px', width: '20px' },
  navDot: { position: 'absolute', right: '12px', width: '6px', height: '6px', borderRadius: '50%', background: C.brown1 },
  customerBadge: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', marginBottom: '8px' },
  customerAvatar: { width: '36px', height: '36px', borderRadius: '50%', background: `linear-gradient(135deg, ${C.brown1}, ${C.brown2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '16px' },
  customerName: { fontSize: '13px', fontWeight: '600', color: C.text1 },
  customerRole: { fontSize: '11px', color: C.text3 },
  logoutBtn: { width: '100%', padding: '10px', background: '#fde8e8', color: '#9b2226', border: '1px solid #fecaca', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'opacity 0.2s' },
  main: { flex: 1, padding: '32px', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' },
  pageTitle: { fontSize: '26px', fontWeight: '700', color: C.text1, margin: '0 0 4px', letterSpacing: '-0.3px' },
  pageDate: { fontSize: '13px', color: C.text3, margin: 0 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '20px' },
  statCard: { borderRadius: '14px', padding: '20px' },
  statTop: { marginBottom: '8px' },
  statIcon: { fontSize: '22px' },
  statValue: { fontSize: '20px', fontWeight: '700', marginBottom: '4px' },
  statLabel: { fontSize: '12px', fontWeight: '500' },
  progressCard: { background: C.card, border: `1px solid ${C.brown4}`, borderRadius: '14px', padding: '20px 24px', marginBottom: '20px' },
  progressHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  progressTitle: { fontSize: '14px', fontWeight: '600', color: C.text1 },
  progressPercent: { fontSize: '14px', fontWeight: '700', color: C.brown1 },
  progressBar: { height: '10px', background: C.brown4, borderRadius: '10px', overflow: 'hidden', marginBottom: '10px' },
  progressFill: { height: '100%', background: `linear-gradient(90deg, ${C.brown1}, ${C.brown2})`, borderRadius: '10px', transition: 'width 0.5s ease' },
  progressFooter: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: C.text3 },
  detailCard: { background: C.card, border: `1px solid ${C.brown4}`, borderRadius: '14px', padding: '24px' },
  detailTitle: { fontSize: '16px', fontWeight: '600', color: C.text1, marginBottom: '16px' },
  detailGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' },
  detailItem: { background: C.brown5, borderRadius: '10px', padding: '12px 14px', border: `1px solid ${C.brown4}` },
  detailLabel: { fontSize: '11px', color: C.text3, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '4px' },
  detailValue: { fontSize: '15px', color: C.text1, fontWeight: '600' },
  summaryCard: { background: C.card, border: `1px solid ${C.brown4}`, borderRadius: '14px', padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '0' },
  summaryItem: { flex: 1, textAlign: 'center' },
  summaryDivider: { width: '1px', height: '40px', background: C.brown4 },
  summaryLabel: { fontSize: '12px', color: C.text3, marginBottom: '6px', fontWeight: '500' },
  summaryValue: { fontSize: '20px', fontWeight: '700', color: C.brown1 },
  tableWrap: { background: C.card, borderRadius: '14px', border: `1px solid ${C.brown4}`, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: C.brown5 },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: C.text2, letterSpacing: '0.3px', textTransform: 'uppercase' },
  tr: { borderTop: `1px solid ${C.brown4}`, transition: 'background 0.15s' },
  td: { padding: '13px 16px', fontSize: '14px', color: C.text1 },
  methodBadge: { padding: '4px 10px', background: C.brown5, color: C.brown2, borderRadius: '6px', fontSize: '12px', fontWeight: '600' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', background: C.card, borderRadius: '14px', border: `1px solid ${C.brown4}` },
  emptyIcon: { fontSize: '48px', marginBottom: '16px' },
  emptyTitle: { fontSize: '18px', fontWeight: '600', color: C.text1, marginBottom: '8px' },
  emptySub: { fontSize: '14px', color: C.text3, textAlign: 'center' },
};

export default CustomerDashboard;