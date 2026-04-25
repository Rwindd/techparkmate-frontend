// ─── Onboarding.jsx ───────────────────────────────────────────────────────────
// Phone-OTP based login. First time → full form. Returning → OTP verify.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './Onboarding.css';

const PARADE = [
  { e:'🏏', l:'Sports'},{e:'🍽️', l:'Lunch'},{e:'☕', l:'Clockpoint'},
  {e:'🎮', l:'Gaming'},{e:'💻', l:'Build'},{e:'🎬', l:'Movies'},{e:'👻', l:'Anon'},
];

const COMPANIES = [
  'HP','Verizon','CohnReznick','DELL Technologies','Celestica',
  'HID','Kumaran Systems','Wipro','Logitech','DXC','Star Health','Others',
];

export default function Onboarding() {
  const { user, loading, register, verifyOtp, sendOtp } = useAuth();
  const navigate = useNavigate();

  // step: 'phone' | 'otp' | 'newuser'
  const [step, setStep]           = useState('phone');
  const [phone, setPhone]         = useState('');
  const [otp, setOtp]             = useState('');
  const [otpSent, setOtpSent]     = useState(false);
  const [form, setForm]           = useState({ name:'', floor:'' });
  const [company, setCompany]     = useState('HP');
  const [otherCo, setOtherCo]     = useState('');
  const [tower, setTower]         = useState('Citius');
  const [err, setErr]             = useState('');
  const [busy, setBusy]           = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => { if (!loading && user) navigate('/', { replace: true }); }, [user, loading, navigate]);

  // Countdown for resend OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  function cleanPhone(p) {
    return p.replace(/\D/g, '').slice(-10); // extract last 10 digits
  }

  async function handleSendOtp() {
    const p = cleanPhone(phone);
    if (p.length !== 10) { setErr('Enter a valid 10-digit phone number.'); return; }
    setBusy(true); setErr('');
    try {
      const result = await sendOtp(p);
      setOtpSent(true);
      setCountdown(30);
      if (result.isNew) {
        setStep('newuser'); // New user — collect details
      } else {
        setStep('otp');     // Existing user — just OTP verify
      }
    } catch(e) {
      setErr(e.message || 'Could not send OTP. Try again.');
    } finally { setBusy(false); }
  }

  async function handleOtpVerify() {
    if (otp.length < 4) { setErr('Enter the OTP sent to your phone.'); return; }
    setBusy(true); setErr('');
    try {
      await verifyOtp(cleanPhone(phone), otp);
      navigate('/', { replace: true });
    } catch(e) {
      setErr(e.message || 'Invalid OTP. Try again.');
    } finally { setBusy(false); }
  }

  async function handleNewUserSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.floor) { setErr('Please fill in all fields.'); return; }
    if (otp.length < 4) { setErr('Enter the OTP sent to your phone.'); return; }
    const finalCompany = company === 'Others' ? otherCo.trim() : company;
    if (!finalCompany) { setErr('Please enter your company name.'); return; }
    setBusy(true); setErr('');
    try {
      await register(form.name, finalCompany, tower, form.floor, cleanPhone(phone), otp);
      navigate('/', { replace: true });
    } catch(e) {
      setErr(e.message || 'Registration failed. Check OTP and try again.');
    } finally { setBusy(false); }
  }

  return (
    <div className="ob-page">
      <div className="ob-orb ob-orb-1"/><div className="ob-orb ob-orb-2"/><div className="ob-orb ob-orb-3"/>
      <div className="ob-wrap">

        {/* LEFT */}
        <div className="ob-left">
          <div className="ob-logo-ring">⬡</div>
          <div className="ob-parade">
            {PARADE.map((p,i) => (
              <div key={i} className="parade-item" style={{animationDelay:`${i*0.2}s`}}>
                <span>{p.e}</span><span className="parade-lbl">{p.l}</span>
              </div>
            ))}
          </div>
          <h1 className="ob-headline">Your whole<br/>tech park<br/>in <em>one place.</em></h1>
          <p className="ob-tagline">ParkMate connects everyone in Olympia Tech Park. 14,000+ colleagues. One community.</p>
          <div className="ob-chips">
            <div className="ob-chip">🏢 <b>Olympia</b> only</div>
            <div className="ob-chip">🟢 <b>Live</b> Clockpoint chat</div>
            <div className="ob-chip">🔒 Phone verified</div>
          </div>
        </div>

        {/* RIGHT — form */}
        <div className="ob-card">

          {/* STEP 1: Enter phone */}
          {step === 'phone' && (
            <>
              <div className="ob-card-title">Join ParkMate 👋</div>
              <div className="ob-card-sub">Enter your phone number to get started. We verify, no passwords needed.</div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div style={{display:'flex',gap:8}}>
                  <span style={{padding:'12px 14px',background:'var(--ink3)',border:'1.5px solid var(--rim)',borderRadius:11,color:'var(--txt2)',fontSize:14,flexShrink:0}}>+91</span>
                  <input className="form-input" type="tel" maxLength={10} placeholder="9876543210"
                    value={phone} onChange={e => setPhone(e.target.value.replace(/\D/,''))}
                    onKeyDown={e => e.key==='Enter' && handleSendOtp()} style={{flex:1}}/>
                </div>
              </div>
              {err && <p className="ob-err">{err}</p>}
              <button className="ob-submit" onClick={handleSendOtp} disabled={busy}>
                {busy ? 'Sending OTP…' : 'Get OTP →'}
              </button>
            </>
          )}

          {/* STEP 2: Existing user OTP verify */}
          {step === 'otp' && (
            <>
              <div className="ob-card-title">Welcome back! 👋</div>
              <div className="ob-card-sub">OTP sent to +91 {phone}. Enter it below to log in.</div>
              <div className="form-group">
                <label className="form-label">OTP</label>
                <input className="form-input" type="number" placeholder="Enter OTP"
                  value={otp} maxLength={6} onChange={e => setOtp(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && handleOtpVerify()}/>
              </div>
              {err && <p className="ob-err">{err}</p>}
              <button className="ob-submit" onClick={handleOtpVerify} disabled={busy}>
                {busy ? 'Verifying…' : 'Verify & Enter →'}
              </button>
              <p style={{fontSize:12,color:'var(--txt3)',textAlign:'center',marginTop:12}}>
                {countdown > 0
                  ? `Resend OTP in ${countdown}s`
                  : <span style={{cursor:'pointer',color:'var(--violet)'}} onClick={handleSendOtp}>Resend OTP</span>
                }
              </p>
              <p style={{fontSize:12,color:'var(--txt3)',textAlign:'center',marginTop:6,cursor:'pointer'}}
                onClick={() => { setStep('phone'); setErr(''); setOtp(''); }}>
                ← Change number
              </p>
            </>
          )}

          {/* STEP 3: New user — full form + OTP */}
          {step === 'newuser' && (
            <>
              <div className="ob-card-title">Set up your profile 🎉</div>
              <div className="ob-card-sub">OTP sent to +91 {phone}. Fill in your details and verify.</div>
              <form onSubmit={handleNewUserSubmit}>
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input className="form-input" placeholder="e.g. Aravindh Kumar"
                    value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))}/>
                </div>

                {/* Company — scrollable list */}
                <div className="form-group">
                  <label className="form-label">Company</label>
                  <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:6,scrollbarWidth:'none'}}>
                    {COMPANIES.map(c => (
                      <div key={c} onClick={() => setCompany(c)}
                        style={{flexShrink:0,padding:'7px 14px',borderRadius:20,
                          background: company===c ? 'rgba(139,92,246,.12)' : 'var(--ink3)',
                          border:`1.5px solid ${company===c ? 'var(--violet)' : 'var(--rim)'}`,
                          color: company===c ? 'var(--violet)' : 'var(--txt2)',
                          fontSize:12,fontWeight:600,cursor:'pointer',transition:'all .2s',whiteSpace:'nowrap'}}>
                        {c}
                      </div>
                    ))}
                  </div>
                  {company === 'Others' && (
                    <input className="form-input" placeholder="Type your company name"
                      style={{marginTop:8}} value={otherCo}
                      onChange={e => setOtherCo(e.target.value)}/>
                  )}
                </div>

                <div className="ob-two-col">
                  <div className="form-group" style={{margin:0}}>
                    <label className="form-label">Tower</label>
                    <div className="tower-grid">
                      {['Citius','Altius','Fortius'].map(t => (
                        <div key={t} className={`tower-opt ${tower===t?'on':''}`} onClick={()=>setTower(t)}>{t}</div>
                      ))}
                    </div>
                  </div>
                  <div className="form-group" style={{margin:0}}>
                    <label className="form-label">Floor</label>
                    <input className="form-input" type="number" placeholder="7" min="1" max="25"
                      value={form.floor} onChange={e => setForm(f=>({...f,floor:e.target.value}))}/>
                  </div>
                </div>

                <div className="form-group" style={{marginTop:18}}>
                  <label className="form-label">OTP</label>
                  <input className="form-input" type="number" placeholder="Enter OTP from SMS"
                    value={otp} onChange={e => setOtp(e.target.value)}/>
                  <p style={{fontSize:11,color:'var(--txt3)',marginTop:4}}>
                    {countdown > 0
                      ? `Resend in ${countdown}s`
                      : <span style={{cursor:'pointer',color:'var(--violet)'}} onClick={handleSendOtp}>Resend OTP</span>
                    }
                  </p>
                </div>

                {err && <p className="ob-err">{err}</p>}
                <button className="ob-submit" type="submit" disabled={busy}>
                  {busy ? 'Creating account…' : 'Enter Olympia →'}
                </button>
              </form>
              <p style={{fontSize:12,color:'var(--txt3)',textAlign:'center',marginTop:8,cursor:'pointer'}}
                onClick={() => { setStep('phone'); setErr(''); setOtp(''); }}>
                ← Change number
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
