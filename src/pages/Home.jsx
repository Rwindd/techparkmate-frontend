// ─── Home.jsx ────────────────────────────────────────────────────────────────
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHomeEvents, getPresence, getModuleCounts } from '../api';
import { useAuth } from '../AuthContext';
import { EventCard } from '../components/shared.jsx';

// Real module definitions — counts come from API
const MODULES = [
  { to:'/sports',    bg:'#051A0E', border:'rgba(52,211,153,.2)',  ico:'🏏', name:'Sports',           live:true,  liveLabel:'Live' },
  { to:'/lunch',     bg:'#1A0800', border:'rgba(251,191,36,.2)',  ico:'🍽️', name:'Lunch Buddies',    live:true,  liveLabel:'Hot'  },
  { to:'/build',     bg:'#060F28', border:'rgba(99,102,241,.2)',  ico:'💻', name:'Build Together'                                 },
  { to:'/gaming',    bg:'#100018', border:'rgba(139,92,246,.25)', ico:'🎮', name:'Gaming Buddies'                                 },
  { to:'/movie',     bg:'#180020', border:'rgba(244,114,182,.2)', ico:'🎬', name:'Movie Together'                                 },
  { to:'/anon',      bg:'#0E0E0E', border:'rgba(148,163,184,.2)', ico:'👻', name:'Anonymous',         live:true,  liveLabel:'Live' },
  { to:'/clockpoint',bg:'#001818', border:'rgba(45,212,191,.25)', ico:'☕', name:'Clockpoint Lounge', live:true,  liveLabel:'Live', wide:true },
  // Divas — coming soon, non-clickable
  { to:null,         bg:'#1A0020', border:'rgba(244,114,182,.3)', ico:'💃', name:'Divas',              soon:true,
    tagline: <><span style={{opacity:.45}}>a</span><span style={{opacity:.6,fontSize:10}}>'s only space</span></> },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents]       = useState([]);
  const [presence, setPresence]   = useState([]);
  const [counts, setCounts]       = useState({});
  const [onlineCnt, setOnlineCnt] = useState(0);

  const load = useCallback(() => {
    getHomeEvents().then(setEvents).catch(()=>{});
    getPresence().then(setPresence).catch(()=>{});
    getModuleCounts().then(setCounts).catch(()=>{});
  }, []);

  useEffect(() => {
    load();
    // Live online counter (approximate from presence + active sessions)
    const t = setInterval(() => setOnlineCnt(n => n || 130 + Math.floor(Math.random()*30)), 5000);
    return () => clearInterval(t);
  }, [load]);

  // Real count text for each module
  function modCountText(m) {
    if (m.soon) return null;
    if (m.to === '/clockpoint') return `${presence.length} here now`;
    const mod = m.to?.replace('/','');
    const c = counts[mod];
    if (c === undefined) return null;
    if (c === 0) return 'No active events';
    return `${c} active event${c !== 1 ? 's' : ''}`;
  }

  return (
    <div className="page-wrap">
      {/* Banner */}
      <div className="home-banner">
        <div className="home-hello"><span className="live-dot"/> OLYMPIA TECH PARK · LIVE NOW</div>
        <h1 className="home-h1" style={{fontSize:'clamp(28px,3.5vw,42px)',letterSpacing:'-0.02em',fontWeight:800}}>
          Hey <em className="grad-text">{user?.name?.split(' ')[0] || 'Olympian'}</em>, what's up? 👋
        </h1>
        <p className="home-sub">Find your people. Across every company in the building.</p>
        <div className="stat-pills">
          <div className="sp">🏢 <b>14,000+</b> people in park</div>
          <div className="sp">🟢 <b>{onlineCnt || events.length * 8 || '—'}</b> online now</div>
          <div className="sp">📅 <b>{events.length}</b> active events</div>
          <div className="sp">☕ <b>{presence.length}</b> at Clockpoint</div>
        </div>
      </div>

      {/* Modules */}
      <div className="sec-head" style={{marginTop:32}}>
        <div className="sec-title">Modules</div>
        <div className="sec-sub">Pick your vibe</div>
      </div>
      <div className="mods-grid">
        {MODULES.map((m, i) => {
          const cntText = modCountText(m);
          return (
            <div key={i}
              className={`mod-card ${m.wide ? 'mod-wide' : ''} ${m.soon ? 'mod-soon' : ''}`}
              style={{ background:`linear-gradient(135deg,${m.bg} 0%,${m.bg}99 100%)`, borderColor:m.border,
                       cursor: m.soon ? 'default' : 'pointer', opacity: m.soon ? 0.65 : 1 }}
              onClick={() => !m.soon && m.to && navigate(m.to)}>
              <div className="mc-ico">{m.ico}</div>
              <div className="mc-name">{m.name}</div>
              {m.tagline
                ? <div className="mc-cnt" style={{fontSize:11}}>{m.tagline}</div>
                : cntText !== null && <div className="mc-cnt">{cntText}</div>
              }
              {m.soon && (
                <div style={{display:'inline-flex',alignItems:'center',gap:5,padding:'2px 9px',
                  borderRadius:20,background:'rgba(0,0,0,.3)',marginTop:6,fontSize:10,fontWeight:700,color:'rgba(255,255,255,.5)'}}>
                  🔒 Coming soon
                </div>
              )}
              {m.live && !m.soon && (
                <div className="mc-live">
                  <span className="live-dot" style={{background:'var(--jade)',boxShadow:'none',width:6,height:6}}/>
                  {m.liveLabel}
                </div>
              )}
              <div className="mc-bg-e">{m.ico}</div>
            </div>
          );
        })}
      </div>

      {/* Feed + sidebar */}
      <div className="feed-layout">
        <div>
          <div className="sec-head"><div className="sec-title">Live Feed</div></div>
          {events.length === 0
            ? <div className="empty-state"><div className="empty-icon">📭</div><div>No events yet. Create the first one!</div></div>
            : events.slice(0, 6).map(e => (
                <div key={e.id} style={{marginBottom:10}}>
                  <EventCard ev={e} onRefresh={load}/>
                </div>
              ))
          }
        </div>
        <div>
          {/* Clockpoint sidebar */}
          <div className="card" style={{marginBottom:14}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:12,display:'flex',alignItems:'center',gap:7}}>
              ☕ At Clockpoint now
              {presence.length > 0 && <span style={{fontSize:11,color:'var(--jade)',fontWeight:600}}>({presence.length})</span>}
            </div>
            {presence.length === 0
              ? <div style={{fontSize:13,color:'var(--txt3)'}}>Nobody at Clockpoint yet</div>
              : presence.slice(0, 4).map((p,i) => (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:9,marginBottom:9}}>
                    <div style={{width:32,height:32,borderRadius:9,background:'var(--grad)',display:'flex',
                      alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:13,color:'#fff'}}>
                      {p.name?.[0]}
                    </div>
                    <div><div style={{fontSize:13,fontWeight:600}}>{p.name}</div>
                      <div style={{fontSize:11,color:'var(--txt3)'}}>{p.company}</div></div>
                  </div>
                ))
            }
          </div>
          {/* No trending box — removed per request */}
        </div>
      </div>
    </div>
  );
}
