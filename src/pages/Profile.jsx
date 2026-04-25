// ─── Profile.jsx ─────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyEvents } from '../api';
import { useAuth } from '../AuthContext';

const TICO = { sports:'🏏', lunch:'🍽️', build:'💻', gaming:'🎮', movie:'🎬' };
const TBG  = { sports:'#051A0E', lunch:'#1A0800', build:'#060F28', gaming:'#100018', movie:'#180020' };
const FD   = d => d ? new Date(d).toLocaleDateString('en-IN',{weekday:'short',month:'short',day:'numeric'}) : '';

const COMPANIES = [
  'HP','Verizon','CohnReznick','DELL Technologies','Celestica',
  'HID','Kumaran Systems','Wipro','Logitech','DXC','Star Health',
];

export function Profile() {
  const { user, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [myEvents, setMyEvents] = useState([]);
  const [editing, setEditing]   = useState(false);

  // Edit form state
  const [form, setForm]       = useState({ name: user?.name || '', floor: user?.floor || '' });
  const [company, setCompany] = useState(user?.company || COMPANIES[0]);
  const [otherCo, setOtherCo] = useState('');
  const [tower, setTower]     = useState(user?.tower || 'Citius');
  const [saveBusy, setSaveBusy] = useState(false);

  useEffect(() => {
    getMyEvents().then(setMyEvents).catch(() => {});
  }, []);

  // Reset edit form when opening
  useEffect(() => {
    if (editing && user) {
      setForm({ name: user.name || '', floor: user.floor || '' });
      setCompany(COMPANIES.includes(user.company) ? user.company : 'Others');
      setOtherCo(COMPANIES.includes(user.company) ? '' : (user.company || ''));
      setTower(user.tower || 'Citius');
    }
  }, [editing, user]);

  const created = myEvents.filter(e => e.isCreator).length;
  const joined  = myEvents.filter(e => !e.isCreator).length;

  async function handleSaveProfile(e) {
    e.preventDefault();
    if (!form.name || !form.floor) { window.showToast?.('⚠️','Missing','Fill in all fields.'); return; }
    const finalCompany = company === 'Others' ? otherCo.trim() : company;
    if (!finalCompany) { window.showToast?.('⚠️','Missing','Enter your company name.'); return; }
    setSaveBusy(true);
    try {
      await updateProfile({ name: form.name, company: finalCompany, tower, floor: form.floor });
      setEditing(false);
      window.showToast?.('✅','Saved','Profile updated!');
    } catch(e) {
      window.showToast?.('⚠️','Error', e?.response?.data?.message || 'Could not save. Try again.');
    } finally { setSaveBusy(false); }
  }

  function handleSignOut() {
    signOut();
    navigate('/onboard', { replace: true });
  }

  return (
    <div className="page-wrap">
      <div style={{display:'grid', gridTemplateColumns:'300px 1fr', gap:24}}>

        {/* Left sidebar */}
        <div>
          <div className="card" style={{textAlign:'center', position:'sticky', top:82}}>
            <div style={{width:72,height:72,borderRadius:20,background:'var(--grad)',
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:28,fontWeight:800,color:'#fff',margin:'0 auto 12px',
              boxShadow:'0 0 30px rgba(139,92,246,.35)'}}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{fontSize:20,fontWeight:800,marginBottom:4}}>{user?.name}</div>
            <div style={{fontSize:13,color:'var(--txt2)',marginBottom:18}}>
              {user?.company} · {user?.tower} · Floor {user?.floor}
            </div>
            {user?.phone && (
              <div style={{fontSize:12,color:'var(--txt3)',marginBottom:14}}>📱 {user.phone}</div>
            )}

            {/* Stats */}
            <div style={{display:'flex',border:'1px solid var(--rim)',borderRadius:12,overflow:'hidden',marginBottom:18}}>
              {[['Joined', joined], ['Created', created], ['Connections', 18]].map(([lbl,val],i) => (
                <div key={lbl} style={{flex:1,padding:'11px 6px',borderRight:i<2?'1px solid var(--rim)':undefined,textAlign:'center'}}>
                  <div style={{fontSize:19,fontWeight:800}}>{val}</div>
                  <div style={{fontSize:10,color:'var(--txt3)',marginTop:2}}>{lbl}</div>
                </div>
              ))}
            </div>

            <button className="btn-ghost" style={{width:'100%',padding:10,marginBottom:10}}
              onClick={() => setEditing(e => !e)}>
              ✏️ {editing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Right main */}
        <div>

          {/* Edit Profile Form */}
          {editing && (
            <div className="card" style={{marginBottom:16,border:'1px solid rgba(139,92,246,.3)'}}>
              <div style={{fontSize:16,fontWeight:700,marginBottom:18}}>✏️ Edit Profile</div>
              <form onSubmit={handleSaveProfile}>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-input" placeholder="Your name"
                    value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))}/>
                </div>

                <div className="form-group">
                  <label className="form-label">Company</label>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:company==='Others'?8:0}}>
                    {[...COMPANIES,'Others'].map(c => (
                      <div key={c} onClick={() => setCompany(c)}
                        style={{padding:'6px 13px',borderRadius:20,cursor:'pointer',transition:'all .2s',
                          flexShrink:0,
                          background: company===c ? 'rgba(139,92,246,.12)' : 'var(--ink3)',
                          border:`1.5px solid ${company===c ? 'var(--violet)' : 'var(--rim)'}`,
                          color: company===c ? 'var(--violet)' : 'var(--txt2)',
                          fontSize:12,fontWeight:600}}>
                        {c}
                      </div>
                    ))}
                  </div>
                  {company === 'Others' && (
                    <input className="form-input" placeholder="Enter company name"
                      value={otherCo} onChange={e => setOtherCo(e.target.value)}/>
                  )}
                </div>

                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:18}}>
                  <div className="form-group" style={{margin:0}}>
                    <label className="form-label">Tower</label>
                    <div style={{display:'flex',gap:8}}>
                      {['Citius','Altius','Fortius'].map(t => (
                        <div key={t} onClick={() => setTower(t)}
                          style={{flex:1,padding:'9px 6px',borderRadius:10,textAlign:'center',cursor:'pointer',
                            background: tower===t ? 'rgba(139,92,246,.12)' : 'var(--ink3)',
                            border:`1.5px solid ${tower===t ? 'var(--violet)' : 'var(--rim)'}`,
                            color: tower===t ? 'var(--violet)' : 'var(--txt2)',fontSize:12,fontWeight:600}}>
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="form-group" style={{margin:0}}>
                    <label className="form-label">Floor</label>
                    <input className="form-input" type="number" placeholder="7" min="1" max="25"
                      value={form.floor} onChange={e => setForm(f=>({...f,floor:e.target.value}))}/>
                  </div>
                </div>

                <button className="btn-primary" type="submit" style={{width:'100%',padding:12}} disabled={saveBusy}>
                  {saveBusy ? 'Saving…' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* My Events */}
          <div className="card" style={{marginBottom:16}}>
            <div style={{fontSize:16,fontWeight:700,marginBottom:16}}>📅 My Events</div>
            {myEvents.length === 0
              ? <div style={{color:'var(--txt3)',fontSize:14,padding:'16px 0'}}>No events yet. Join or create one!</div>
              : myEvents.slice(0,8).map(e => (
                  <div key={e.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 0',borderBottom:'1px solid var(--rim)'}}>
                    <div style={{width:40,height:40,borderRadius:11,background:TBG[e.module?.toLowerCase()]||'#111',
                      display:'flex',alignItems:'center',justifyContent:'center',fontSize:19,flexShrink:0}}>
                      {TICO[e.module?.toLowerCase()]||'⚡'}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:600,marginBottom:3}}>{e.title}</div>
                      <div style={{fontSize:11,color:'var(--txt3)'}}>{FD(e.eventDate)}{e.eventTime?' · '+e.eventTime:''} · {e.location}</div>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}>
                      <span style={{padding:'3px 9px',borderRadius:20,fontSize:11,fontWeight:700,
                        background: e.expired?'var(--ink3)':'rgba(52,211,153,.12)',
                        color: e.expired?'var(--txt3)':'var(--jade)'}}>
                        {e.expired?'Done':'Active'}
                      </span>
                      <span style={{fontSize:11,color:'var(--txt3)'}}>{e.isCreator?'Created':'Joined'}</span>
                    </div>
                  </div>
                ))
            }
          </div>

          {/* Settings */}
          <div className="card">
            <div style={{fontSize:16,fontWeight:700,marginBottom:16}}>⚙️ Settings</div>
            {[
              {ico:'🔔',lbl:'Notifications',    fn:()=>window.showToast?.('🔔','Notifications','Coming soon!')},
              {ico:'📱',lbl:'Phone Number',     fn:()=>window.showToast?.('📱','Phone',`Saved as ${user?.phone||'not set'}`)},
            ].map(s => (
              <div key={s.lbl} onClick={s.fn}
                style={{display:'flex',alignItems:'center',gap:11,padding:'13px 0',borderBottom:'1px solid var(--rim)',cursor:'pointer'}}>
                <div style={{width:34,height:34,borderRadius:9,background:'var(--ink3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15}}>{s.ico}</div>
                <span style={{flex:1,fontSize:14,fontWeight:500}}>{s.lbl}</span>
                <span style={{fontSize:15,color:'var(--txt3)'}}>›</span>
              </div>
            ))}
            <div onClick={handleSignOut}
              style={{display:'flex',alignItems:'center',gap:11,padding:'13px 0',cursor:'pointer'}}>
              <div style={{width:34,height:34,borderRadius:9,background:'rgba(248,113,113,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15}}>🚪</div>
              <span style={{flex:1,fontSize:14,fontWeight:500,color:'var(--red)'}}>Sign Out</span>
              <span style={{fontSize:15,color:'var(--txt3)'}}>›</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
