// ─── ModulePage.jsx ───────────────────────────────────────────────────────────
// Live-updating module page. Subscribes to /topic/events/{id} for real-time
// spot updates when any user joins/leaves.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_BASE, getModuleEvents, getEventHistory } from '../api';
import { EventCard } from '../components/shared.jsx';

const FILTERS = {
  sports: [['all','⚡','All'],['Cricket','🏏','Cricket'],['Badminton','🏸','Badminton'],['Chess','♟','Chess'],['Running','🏃','Running'],['Football','⚽','Football'],['TT','🏓','TT'],['Carrom','🎯','Carrom']],
  lunch:  [['all','⚡','All'],['Food Court','🍱','Food Court'],['Biryani','🍛','Biryani'],['Tea Break','☕','Tea Break'],['Outside','🌮','Outside']],
  build:  [['all','⚡','All'],['React','⚛️','React'],['Python','🐍','Python'],['AI/ML','🤖','AI/ML'],['Hackathon','⚡','Hackathon'],['Mobile','📱','Mobile']],
  gaming: [['all','⚡','All'],['BGMI','🔫','BGMI'],['FIFA','⚽','FIFA'],['Chess','♟','Chess'],['Board Games','🎲','Board Games'],['Valorant','🎯','Valorant']],
  movie:  [['all','⚡','All'],['Movie','🎬','Movie'],['OTT','📺','OTT'],['Concert','🎵','Concert']],
};

export default function ModulePage({ mod, icon, title, sub }) {
  const navigate   = useNavigate();
  const [events, setEvents]   = useState([]);
  const [history, setHistory] = useState([]);
  const [flt, setFlt]         = useState('all');
  const [loading, setLoading] = useState(true);
  const stompRef  = useRef(null);
  const eventsRef = useRef([]); // keep ref so WS callback has latest value

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [live, hist] = await Promise.all([
        getModuleEvents(mod),
        getEventHistory(),
      ]);
      setEvents(live);
      eventsRef.current = live;
      setHistory(hist.filter(e => e.module === mod));
    } catch {}
    finally { setLoading(false); }
  }, [mod]);

  useEffect(() => { load(); }, [load]);

  // ── WebSocket — subscribe to spot updates for each event ──
  // Pattern: when any user joins/leaves any event on this page,
  // the server broadcasts { eventId, spotsLeft, full } to /topic/events/{id}.
  // We patch the local state immediately — O(1), no full reload.
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE}/ws`),
      onConnect: () => {
        // Subscribe to updates for all events currently on page
        eventsRef.current.forEach(ev => {
          client.subscribe(`/topic/events/${ev.id}`, msg => {
            const update = JSON.parse(msg.body);
            setEvents(prev => prev.map(e =>
              e.id === update.eventId
                ? { ...e, spotsLeft: update.spotsLeft, full: update.full }
                : e
            ));
          });
        });
      },
    });
    client.activate();
    stompRef.current = client;
    return () => client.deactivate();
  }, [events.length]); // re-subscribe when event list changes

  const chips    = FILTERS[mod] || [['all','⚡','All']];
  const filtered = flt === 'all' ? events : events.filter(e => e.activity === flt);
  const filtHist = flt === 'all' ? history : history.filter(e => e.activity === flt);

  return (
    <div className="page-wrap">
      <button className="back-btn" onClick={() => navigate('/')}>← Back</button>

      {/* Module hero */}
      <div style={{display:'flex',alignItems:'center',gap:18,marginBottom:28}}>
        <div style={{width:58,height:58,borderRadius:16,background:'var(--ink3)',
          border:'1px solid var(--rim)',display:'flex',alignItems:'center',
          justifyContent:'center',fontSize:28,flexShrink:0}}>
          {icon}
        </div>
        <div>
          <h1 style={{fontSize:30,fontWeight:800,marginBottom:4}}>{title}</h1>
          <p style={{fontSize:14,color:'var(--txt2)'}}>{sub}</p>
        </div>
        <button className="btn-primary" style={{marginLeft:'auto',padding:'9px 20px',fontSize:13}}
          onClick={() => navigate('/create')}>
          + Create Event
        </button>
      </div>

      {/* Filter chips */}
      <div className="filter-bar">
        {chips.map(([val, ico, lbl]) => (
          <div key={val} className={`fchip ${flt===val?'on':''}`} onClick={() => setFlt(val)}>
            <div className="fchip-ico">{ico}</div>
            <div className="fchip-lbl">{lbl}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{textAlign:'center',padding:'48px',color:'var(--txt3)'}}>Loading…</div>
      ) : (
        <>
          <div className="ev-grid">
            {filtered.length > 0
              ? filtered.map(e => <EventCard key={e.id} ev={e} onRefresh={load}/>)
              : <div className="empty-state" style={{gridColumn:'1/-1'}}>
                  <div className="empty-icon">🎯</div>
                  <div>No active events. Be the first to create one!</div>
                  <button className="btn-primary" style={{marginTop:16}} onClick={() => navigate('/create')}>
                    + Create Event
                  </button>
                </div>
            }
          </div>

          {filtHist.length > 0 && (
            <>
              <div className="sec-divider"/>
              <div style={{fontSize:17,fontWeight:700,marginBottom:16,color:'var(--txt2)'}}>
                📚 Past Events
              </div>
              <div className="ev-grid">
                {filtHist.map(e => <EventCard key={e.id} ev={e} isHist onRefresh={load}/>)}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
