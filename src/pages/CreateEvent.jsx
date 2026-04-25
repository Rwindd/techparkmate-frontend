// ─── CreateEvent.jsx ──────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent, cancelByActivity } from '../api';

const MACTS = {
  sports: ['Cricket','Badminton','Chess','Running','Football','TT','Carrom','Volleyball','Other'],
  lunch:  ['Food Court','Biryani','Tea Break','Outside','Other'],
  build:  ['React','Python','AI/ML','Hackathon','Backend','Mobile','Other'],
  gaming: ['BGMI','FIFA','Chess','Board Games','Valorant','Other'],
  movie:  ['Movie','OTT','Concert','Other'],
};
const ICO = {
  Cricket:'🏏',Badminton:'🏸',Chess:'♟',Running:'🏃',Football:'⚽',TT:'🏓',
  'Food Court':'🍱',Biryani:'🍛','Tea Break':'☕',React:'⚛️',Python:'🐍',
  'AI/ML':'🤖',Hackathon:'⚡',BGMI:'🔫',FIFA:'⚽',Movie:'🎬',OTT:'📺',
  Outside:'🌮',Mobile:'📱','Board Games':'🎲',Valorant:'🎯',Concert:'🎵',
  Backend:'🗄️',Carrom:'🎯',Volleyball:'🏐',Other:'✨',
};
const MODS = ['sports','lunch','build','gaming','movie'];
const FD = d => d ? new Date(d+'T12:00:00').toLocaleDateString('en-IN',{weekday:'short',month:'short',day:'numeric'}) : '';

export function CreateEvent() {
  const navigate = useNavigate();
  const [mod, setMod]         = useState('sports');
  const [act, setAct]         = useState('Cricket');
  const [customAct, setCustomAct] = useState('');   // when "Other" picked
  const [title, setTitle]     = useState('');
  const [date, setDate]       = useState('');
  const [time, setTime]       = useState('');
  const [loc, setLoc]         = useState('');
  const [spots, setSpots]     = useState(4);
  const [dateErr, setDateErr] = useState('');
  const [dupModal, setDupModal] = useState(false);
  const [success, setSuccess] = useState(false);
  const [busy, setBusy]       = useState(false);

  useEffect(() => { setAct(MACTS[mod][0]); setCustomAct(''); }, [mod]);

  const today = new Date().toISOString().split('T')[0];
  const maxDate = (() => { const d=new Date(); d.setDate(d.getDate()+30); return d.toISOString().split('T')[0]; })();

  function validateDate(v) {
    if (!v) { setDateErr(''); return; }
    const sel = new Date(v+'T00:00:00'), t = new Date(); t.setHours(0,0,0,0);
    const mx = new Date(t); mx.setDate(mx.getDate()+30);
    if (sel < t)  { setDateErr('⚠️ Cannot create events in the past.'); return; }
    if (sel > mx) { setDateErr('⚠️ Must be within 1 month from today.'); return; }
    setDateErr('');
  }

  const finalActivity = act === 'Other' ? (customAct.trim() || 'Other') : act;
  const finalIcon = act === 'Other' ? '✨' : ICO[act] || '⚡';

  async function submit(cancelFirst = false) {
    if (!title || !date || !loc) { window.showToast?.('⚠️','Missing','Fill in title, date, location.'); return; }
    if (dateErr) { window.showToast?.('⚠️','Invalid date','Pick a valid date.'); return; }
    setBusy(true);
    try {
      if (cancelFirst) await cancelByActivity(finalActivity);
      await createEvent({
        module: mod.toUpperCase(),
        activity: finalActivity,
        activityIcon: finalIcon,
        title, eventDate: date, eventTime: time, location: loc, spots,
        visibility: 'ALL',
      });
      setSuccess(true);
    } catch(e) {
      if (e?.response?.status === 409) setDupModal(true);
      else window.showToast?.('⚠️','Error', e?.response?.data?.message || 'Could not create event.');
    } finally { setBusy(false); }
  }

  if (success) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div className="card" style={{textAlign:'center',padding:48,maxWidth:380,animation:'popIn .5s cubic-bezier(.34,1.56,.64,1)'}}>
        <div style={{fontSize:64,display:'block',animation:'rockIt .6s .2s cubic-bezier(.34,1.56,.64,1) both'}}>🚀</div>
        <h2 style={{fontSize:26,fontWeight:800,margin:'14px 0 8px'}}>Event Posted!</h2>
        <p style={{fontSize:14,color:'var(--txt2)',marginBottom:22}}>Your event is live. Olympians can join now.</p>
        <button className="btn-primary" onClick={() => navigate('/')}>Back to Home</button>
      </div>
    </div>
  );

  return (
    <div className="page-wrap">
      {dupModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:8000,backdropFilter:'blur(8px)',padding:20}}>
          <div className="card" style={{maxWidth:420,width:'100%',textAlign:'center',padding:36,animation:'popIn .4s cubic-bezier(.34,1.56,.64,1)'}}>
            <div style={{fontSize:52,marginBottom:14}}>⚠️</div>
            <h2 style={{fontSize:22,fontWeight:800,marginBottom:8}}>You already have a {finalActivity} event!</h2>
            <p style={{fontSize:14,color:'var(--txt2)',lineHeight:1.6,marginBottom:24}}>
              Only one active "{finalActivity}" event at a time. Cancel the existing one to create a new one.
            </p>
            <div style={{display:'flex',gap:10,justifyContent:'center'}}>
              <button className="btn-ghost" onClick={() => setDupModal(false)}>Keep it</button>
              <button className="btn-primary" style={{background:'linear-gradient(135deg,#ef4444,#f97316)'}}
                onClick={() => { setDupModal(false); submit(true); }}>
                Cancel old & Create new
              </button>
            </div>
          </div>
        </div>
      )}

      <button className="back-btn" onClick={() => navigate('/')}>← Back</button>

      <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:26}}>
        <div className="card">
          <h2 style={{fontSize:26,fontWeight:800,marginBottom:5}}>Create an Event ✨</h2>
          <p style={{fontSize:14,color:'var(--txt2)',marginBottom:28}}>
            Events auto-expire once started. One event per activity at a time.
          </p>

          {/* Module */}
          <div className="form-group">
            <label className="form-label">Module</label>
            <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
              {MODS.map(m => (
                <div key={m} onClick={() => setMod(m)}
                  style={{padding:'8px 15px',borderRadius:11,cursor:'pointer',transition:'all .2s',
                    background: mod===m ? 'rgba(139,92,246,.1)' : 'var(--ink3)',
                    border:`1.5px solid ${mod===m ? 'var(--violet)' : 'var(--rim)'}`,
                    color: mod===m ? 'var(--violet)' : 'var(--txt2)', fontSize:13,fontWeight:600}}>
                  {m==='sports'?'🏏':m==='lunch'?'🍽️':m==='build'?'💻':m==='gaming'?'🎮':'🎬'} {m.charAt(0).toUpperCase()+m.slice(1)}
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="form-group">
            <label className="form-label">Activity</label>
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {MACTS[mod].map(a => (
                <div key={a} onClick={() => setAct(a)}
                  style={{display:'flex',alignItems:'center',gap:6,padding:'7px 13px',borderRadius:10,
                    background: act===a ? 'rgba(52,211,153,.08)' : 'var(--ink3)',
                    border:`1.5px solid ${act===a ? 'var(--jade)' : 'var(--rim)'}`,
                    color: act===a ? 'var(--jade)' : 'var(--txt2)', fontSize:13,cursor:'pointer',transition:'all .2s'}}>
                  {ICO[a]||'✨'} {a}
                </div>
              ))}
            </div>
            {act === 'Other' && (
              <input className="form-input" style={{marginTop:10}}
                placeholder="Describe your activity e.g. 'Volleyball', 'Book club'…"
                value={customAct} onChange={e => setCustomAct(e.target.value)}/>
            )}
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Event Title</label>
            <input className="form-input" placeholder="e.g. Sunday cricket — HP vs Verizon 🏏"
              value={title} onChange={e => setTitle(e.target.value)}/>
          </div>

          {/* Date + Time */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:18}}>
            <div>
              <label className="form-label">Date</label>
              <input className="form-input" type="date" min={today} max={maxDate}
                value={date} onChange={e => { setDate(e.target.value); validateDate(e.target.value); }}/>
              {dateErr && <p style={{fontSize:12,color:'var(--ember)',marginTop:6,
                background:'rgba(251,146,60,.08)',border:'1px solid rgba(251,146,60,.2)',
                borderRadius:8,padding:'7px 11px'}}>{dateErr}</p>}
            </div>
            <div>
              <label className="form-label">Time</label>
              <input className="form-input" type="time" value={time} onChange={e => setTime(e.target.value)}/>
            </div>
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label">Location</label>
            <input className="form-input" placeholder="e.g. Guindy Ground, Food Court L2, Clockpoint…"
              value={loc} onChange={e => setLoc(e.target.value)}/>
          </div>

          {/* Spots */}
          <div className="form-group">
            <label className="form-label">Spots Needed</label>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {[2,4,6,8,10].map(n => (
                <div key={n} onClick={() => setSpots(n)}
                  style={{width:46,height:38,borderRadius:10,display:'flex',alignItems:'center',
                    justifyContent:'center',cursor:'pointer',transition:'all .2s',
                    background: spots===n ? 'rgba(139,92,246,.1)' : 'var(--ink3)',
                    border:`1.5px solid ${spots===n ? 'var(--violet)' : 'var(--rim)'}`,
                    color: spots===n ? 'var(--violet)' : 'var(--txt2)', fontSize:14,fontWeight:700}}>
                  {n===10 ? '10+' : n}
                </div>
              ))}
            </div>
          </div>

          {/* Live Preview */}
          <div style={{background:'var(--ink3)',border:'1px solid var(--rim2)',borderRadius:15,padding:18,marginTop:8}}>
            <div style={{fontSize:10,fontWeight:700,color:'var(--txt3)',textTransform:'uppercase',letterSpacing:'.8px',marginBottom:12}}>
              👀 Live Preview
            </div>
            <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:7}}>
              <span style={{fontSize:18}}>{finalIcon}</span>
              <span style={{fontSize:13,fontWeight:700,color:'var(--txt2)'}}>{finalActivity}</span>
            </div>
            <div style={{fontSize:17,fontWeight:700,marginBottom:8}}>{title || 'Your event title here…'}</div>
            <div style={{fontSize:12,color:'var(--txt2)',display:'flex',flexDirection:'column',gap:4}}>
              <div>📅 {date ? FD(date)+(time?' · '+time:'') : 'Pick a date & time'}</div>
              <div>📍 {loc || 'Add a location'}</div>
              <div>👥 {spots} spots</div>
            </div>
          </div>

          <button className="btn-primary" style={{width:'100%',padding:14,fontSize:15,marginTop:20}}
            onClick={() => submit(false)} disabled={busy}>
            {busy ? 'Posting…' : 'Post Event 🚀'}
          </button>
        </div>

        {/* Sidebar */}
        <div>
          <div className="card">
            <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>📋 Rules</div>
            <div style={{fontSize:13,color:'var(--txt2)',lineHeight:1.85}}>
              ✅ Events within <b>1 month</b> only<br/>
              ✅ <b>1 event per activity</b> — cancel old to create new<br/>
              ✅ Once event starts → moves to History<br/>
              ✅ Joiners can Leave anytime<br/>
              ✅ Creator can Cancel anytime<br/>
              ✅ Creator sees joiner phone numbers
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
