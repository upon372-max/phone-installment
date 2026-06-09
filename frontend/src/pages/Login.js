import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      login(res.data.token, res.data.role);
      if (res.data.role === 'admin') navigate('/admin');
      else navigate('/customer');
    } catch (err) {
      setError('Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <style>{`
        * { box-sizing: border-box; }
        .inp:focus { border-color: #a67c52 !important; box-shadow: 0 0 0 3px rgba(166,124,82,0.12) !important; outline: none !important; }
        .inp::placeholder { color: #c4a882; }
        .btn:hover { background: #8b5e3c !important; }
      `}</style>

      <div style={styles.left}>
        <div style={styles.leftTop}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>📱</span>
            <span style={styles.logoText}>PhoneInstall</span>
          </div>
        </div>
        <div style={styles.leftMiddle}>
          <h1 style={styles.headline}>Smart Phone Installment Management</h1>
          <p style={styles.sub}>Track plans, record payments, and keep your customers informed — all from one elegant dashboard.</p>
          <div style={styles.features}>
            {['Installment plan tracking', 'Automated email & WhatsApp alerts', 'Payment history & receipts', 'Role-based access control'].map((f, i) => (
              <div key={i} style={styles.feature}>
                <div style={styles.featureDot}></div>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={styles.leftBottom}>
          <div style={styles.quote}>"Managing phone installments has never been this seamless."</div>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.card}>
          <div style={styles.cardTop}>
            <h2 style={styles.cardTitle}>Sign in</h2>
            <p style={styles.cardSub}>Welcome back! Please enter your details.</p>
          </div>

          {error && <div style={styles.error}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>Email address</label>
              <input className="inp" style={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input className="inp" style={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button className="btn" style={loading ? styles.btnOff : styles.btn} type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <div style={styles.divider}></div>
          <p style={styles.hint}>Use your admin or customer credentials.</p>
        </div>
      </div>
    </div>
  );
};

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
};

const styles = {
  page: { display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif" },
  left: { flex: '0 0 46%', background: `linear-gradient(160deg, ${C.brown1} 0%, #8b5e3c 50%, ${C.brown2} 100%)`, padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  leftTop: {},
  logo: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoIcon: { fontSize: '24px' },
  logoText: { fontSize: '20px', fontWeight: '700', color: 'white', letterSpacing: '-0.3px' },
  leftMiddle: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: '40px', paddingBottom: '40px' },
  headline: { fontSize: '34px', fontWeight: '700', color: 'white', lineHeight: '1.3', marginBottom: '16px', letterSpacing: '-0.5px' },
  sub: { fontSize: '15px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.7', marginBottom: '36px', maxWidth: '340px' },
  features: { display: 'flex', flexDirection: 'column', gap: '14px' },
  feature: { display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.85)', fontSize: '14px' },
  featureDot: { width: '6px', height: '6px', borderRadius: '50%', background: C.brown4, flexShrink: 0 },
  leftBottom: {},
  quote: { fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', borderLeft: `2px solid rgba(255,255,255,0.2)`, paddingLeft: '14px' },
  right: { flex: 1, background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' },
  card: { background: C.card, borderRadius: '20px', padding: '44px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px rgba(107,68,35,0.06), 0 12px 40px rgba(107,68,35,0.1)', border: `1px solid ${C.brown4}` },
  cardTop: { marginBottom: '28px' },
  cardTitle: { fontSize: '26px', fontWeight: '700', color: C.text1, marginBottom: '6px', letterSpacing: '-0.3px' },
  cardSub: { fontSize: '14px', color: C.text3 },
  error: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 14px', marginBottom: '20px', color: '#dc2626', fontSize: '14px' },
  field: { marginBottom: '18px' },
  label: { display: 'block', fontSize: '14px', fontWeight: '500', color: C.text2, marginBottom: '6px' },
  input: { width: '100%', padding: '11px 14px', border: `1.5px solid ${C.brown4}`, borderRadius: '10px', fontSize: '15px', color: C.text1, background: C.brown5, transition: 'all 0.2s' },
  btn: { width: '100%', padding: '12px', background: C.brown1, color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '4px', transition: 'background 0.2s', letterSpacing: '0.2px' },
  btnOff: { width: '100%', padding: '12px', background: C.brown3, color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'not-allowed', marginTop: '4px' },
  divider: { height: '1px', background: C.brown4, margin: '24px 0' },
  hint: { fontSize: '13px', color: C.text4, textAlign: 'center' },
};

export default Login;