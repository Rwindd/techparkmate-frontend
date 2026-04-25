// ─── Anonymous.jsx ────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { getAnonPosts, postAnon, relatePost } from '../api';

export function Anonymous() {
  const [posts, setPosts] = useState([]);
  const [txt, setTxt]     = useState('');
  useEffect(() => { getAnonPosts().then(setPosts).catch(()=>{}); }, []);
  async function submit() {
    const t=txt.trim(); if(!t){return;}
    try { const p=await postAnon(t); setPosts(prev=>[p,...prev]); setTxt(''); window.showToast?.('👻','Posted!','Your anonymous post is live.'); }
    catch { window.showToast?.('⚠️','Error','Could not post.'); }
  }
  async function doRelate(id) {
    try { await relatePost(id); setPosts(prev=>prev.map(p=>p.id===id?{...p,relateCount:p.relateCount+1}:p)); }
    catch {}
  }
  return (
    <div className="page-wrap">
      <div style={{textAlign:'center',padding:'16px 0 28px'}}>
        <div style={{fontSize:60,display:'inline-block',animation:'bob 3s ease-in-out infinite'}}>👻</div>
        <h1 style={{fontSize:30,fontWeight:800,margin:'10px 0 6px'}}>Anonymous Zone</h1>
        <p style={{fontSize:14,color:'var(--txt2)'}}>Vent, gossip, confess. No names attached.</p>
      </div>
      <div style={{maxWidth:700,margin:'0 auto'}}>
        <div className="card" style={{marginBottom:22}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
            <div style={{width:36,height:36,borderRadius:10,background:'var(--ink3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17}}>👻</div>
            <span style={{fontSize:13,color:'var(--txt3)'}}>What's on your mind, Anonymous Olympian?</span>
          </div>
          <textarea value={txt} onChange={e=>setTxt(e.target.value)} placeholder="Food court AC is set to Antarctica again…"
            style={{width:'100%',background:'var(--ink3)',border:'1.5px solid var(--rim)',borderRadius:11,padding:'12px 14px',color:'var(--txt)',fontSize:14,resize:'none',outline:'none',minHeight:72,marginBottom:10,fontFamily:'inherit'}}/>
          <button className="btn-ghost" onClick={submit}>Post Anonymously 👻</button>
        </div>
        {posts.map(p => (
          <div key={p.id} className="card" style={{marginBottom:12}}>
            <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:10}}>
              <div style={{width:34,height:34,borderRadius:10,background:'var(--ink3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15}}>👻</div>
              <div><span style={{fontSize:13,fontWeight:700}}>Anonymous Olympian</span> <span style={{fontSize:11,color:'var(--txt3)'}}>· {p.createdAt ? new Date(p.createdAt).toLocaleString('en-IN',{dateStyle:'short',timeStyle:'short'}) : 'just now'}</span></div>
            </div>
            <p style={{fontSize:15,lineHeight:1.6,marginBottom:12}}>{p.text}</p>
            <div style={{display:'flex',gap:14}}>
              <div onClick={()=>doRelate(p.id)} style={{fontSize:12,color:'var(--txt3)',cursor:'pointer',display:'flex',alignItems:'center',gap:5}}>😤 {p.relateCount||0} relate</div>
              <div style={{fontSize:12,color:'var(--txt3)',display:'flex',alignItems:'center',gap:5}}>💬 {p.commentCount||0} comments</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
