// ─── shared.jsx — EventCard with all features ────────────────────────────────
import React, { useState, useEffect } from 'react';
import { joinEvent, leaveEvent, cancelEvent, getEventComments, postEventComment } from '../api';
import { useAuth } from '../AuthContext';
import './EventCard.css';

const AVC = ['#8B5CF6','#3B82F6','#EC4899','#10B981','#F59E0B','#EF4444','#6366F1'];
const FD  = d => d ? new Date(d).toLocaleDateString('en-IN',{weekday:'short',month:'short',day:'numeric'}) : '';

export function EventCard({ ev, isHist = false, onRefresh }) {
  const { user } = useAuth();
  const [loading, setLoading]   = useState(false);
  const [expanded, setExpanded] = useState(false); // show creator phone + comments
  const [comments, setComments] = useState([]);
  const [commentTxt, setCommentTxt] = useState('');
  const [commentBusy, setCommentBusy] = useState(false);

  // Use server-computed fields (isCreator, isJoined, spotsLeft, full)
  const spotsLeft = ev.spotsLeft ?? (ev.spots - (ev.joiners?.length || 0));
  const isCreator = ev.isCreator || (user && ev.creator?.id === user.id);
  const isJoined  = ev.isJoined  || (ev.joiners?.some(j => j.id === user?.id));

  let pillClass = 'pill-open', pillText = `${spotsLeft} spots left`;
  if (isHist || ev.expired)  { pillClass = 'pill-hist'; pillText = 'Ended'; }
  else if (spotsLeft <= 0)   { pillClass = 'pill-full'; pillText = 'Full'; }
  else if (spotsLeft <= 2)   { pillClass = 'pill-few';  pillText = `${spotsLeft} left!`; }

  // Load comments when expanded
  useEffect(() => {
    if (expanded && !isHist) {
      getEventComments(ev.id).then(setComments).catch(()=>{});
    }
  }, [expanded, ev.id, isHist]);

  async function handleJoin() {
    setLoading(true);
    try {
      await joinEvent(ev.id);
      onRefresh?.();
      window.showToast?.('🎉', 'Joined!', 'Creator will see your name.');
    } catch (e) {
      const msg = e?.response?.data?.message || 'Could not join';
      if (e?.response?.status === 422 || e?.response?.status === 409) {
        window.showToast?.('⚠️', 'Cannot join', msg);
      } else {
        window.showToast?.('⚠️', 'Error', msg);
      }
    } finally { setLoading(false); }
  }

  async function handleLeave() {
    setLoading(true);
    try { await leaveEvent(ev.id); onRefresh?.(); window.showToast?.('👋', 'Left event', 'Spot is open again.'); }
    catch { window.showToast?.('⚠️', 'Error', 'Could not leave'); }
    finally { setLoading(false); }
  }

  async function handleCancel() {
    if (!window.confirm('Cancel this event? This cannot be undone.')) return;
    setLoading(true);
    try { await cancelEvent(ev.id); onRefresh?.(); window.showToast?.('🗑', 'Cancelled', 'Event removed.'); }
    catch { window.showToast?.('⚠️', 'Error', 'Could not cancel'); }
    finally { setLoading(false); }
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!commentTxt.trim()) return;
    setCommentBusy(true);
    try {
      await postEventComment(ev.id, commentTxt.trim());
      setCommentTxt('');
      const updated = await getEventComments(ev.id);
      setComments(updated);
    } catch { window.showToast?.('⚠️', 'Error', 'Could not post comment'); }
    finally { setCommentBusy(false); }
  }

  // Joiner chips with phone (only visible to creator)
  const joiners = ev.joiners || [];

  return (
    <div className={`ev-card ${isHist ? 'ev-hist' : ''}`}>
      <div className="ev-top">
        <div className="ev-act-badge">
          <div className="ev-act-ico">{ev.activityIcon || '⚡'}</div>
          <span className="ev-act-name">{ev.activity}</span>
        </div>
        <span className={`pill ${pillClass}`}>{pillText}</span>
      </div>

      <div className="ev-title">{ev.title}</div>
      <div className="ev-metas">
        <div className="ev-mr">📅 {isHist ? 'Past: ' : ''}{FD(ev.eventDate)}{ev.eventTime ? ' · '+ev.eventTime : ''}</div>
        <div className="ev-mr">📍 {ev.location}</div>
        <div className="ev-mr">👤 by {ev.creator?.name || ev.creatorName}</div>
      </div>

      <div className="ev-foot">
        <div className="av-group">
          {joiners.slice(0,3).map((j,i) => (
            <div key={j.id || i} className="av-mini" style={{background: AVC[i % AVC.length]}}>
              {j.name?.[0]}
            </div>
          ))}
          <span className="av-cnt">{joiners.length} joined</span>
        </div>

        <div className="ev-actions">
          {(isHist || ev.expired) ? (
            <span className="hist-badge">✓ Done</span>
          ) : isCreator ? (
            <>
              <button className="btn-cancel-ev" onClick={handleCancel} disabled={loading}>🗑 Cancel</button>
              <button className="btn-comments" onClick={() => setExpanded(x => !x)} title="View joiners & comments">
                💬 {expanded ? 'Hide' : 'Joiners'}
              </button>
            </>
          ) : isJoined ? (
            <>
              <button className="btn-join joined" disabled>Joined ✓</button>
              <button className="btn-leave" onClick={handleLeave} disabled={loading}>Leave</button>
              <button className="btn-comments" onClick={() => setExpanded(x => !x)} title="Comments">💬</button>
            </>
          ) : spotsLeft <= 0 ? (
            <button className="btn-join full" disabled>Full</button>
          ) : (
            <button className="btn-join" onClick={handleJoin} disabled={loading}>
              {loading ? '...' : 'Join →'}
            </button>
          )}
        </div>
      </div>

      {/* Expanded: joiners with phone (creator only) + comment section */}
      {expanded && (
        <div className="ev-expanded">
          {/* Joiners list — creator sees phones */}
          {joiners.length > 0 && (
            <div className="ev-joiners-list">
              <div style={{fontSize:11,fontWeight:700,color:'var(--txt3)',textTransform:'uppercase',
                letterSpacing:.7,marginBottom:8}}>
                👥 Joiners {isCreator && '(tap to call)'}
              </div>
              {joiners.map((j,i) => (
                <div key={j.id || i} className="joiner-row">
                  <div className="av-mini" style={{background:AVC[i%AVC.length],width:28,height:28,fontSize:11}}>{j.name?.[0]}</div>
                  <div style={{flex:1}}>
                    <span style={{fontSize:13,fontWeight:600}}>{j.name}</span>
                    <span style={{fontSize:11,color:'var(--txt3)',marginLeft:6}}>{j.company}</span>
                  </div>
                  {/* Phone only shown to creator */}
                  {isCreator && j.phone && (
                    <a href={`tel:${j.phone}`} style={{fontSize:11,color:'var(--jade)',fontWeight:600,
                      padding:'3px 9px',borderRadius:20,background:'rgba(52,211,153,.1)',border:'1px solid rgba(52,211,153,.2)',
                      textDecoration:'none'}}>
                      📞 {j.phone}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Comment section — only for joiners + creator */}
          <div className="ev-comments">
            <div style={{fontSize:11,fontWeight:700,color:'var(--txt3)',textTransform:'uppercase',letterSpacing:.7,marginBottom:8}}>
              💬 Event Chat
            </div>
            <div className="comments-list">
              {comments.length === 0
                ? <div style={{fontSize:12,color:'var(--txt3)',padding:'8px 0'}}>No messages yet. Start the conversation!</div>
                : comments.map((c,i) => (
                    <div key={c.id || i} className="comment-item">
                      <div className="av-mini" style={{background:AVC[i%AVC.length],width:26,height:26,fontSize:10,flexShrink:0}}>
                        {c.authorName?.[0]}
                      </div>
                      <div>
                        <span style={{fontSize:12,fontWeight:700}}>{c.authorName}</span>
                        <span style={{fontSize:10,color:'var(--txt3)',marginLeft:6}}>{c.createdAgo}</span>
                        <div style={{fontSize:13,marginTop:3,color:'var(--txt)'}}>{c.text}</div>
                      </div>
                    </div>
                  ))
              }
            </div>
            {(isCreator || isJoined) && (
              <form onSubmit={handleComment} className="comment-form">
                <input className="comment-input" placeholder="Message joiners…"
                  value={commentTxt} onChange={e => setCommentTxt(e.target.value)}/>
                <button type="submit" className="comment-send" disabled={commentBusy}>➤</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
