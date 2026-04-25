// ─── Olympians.jsx ────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { getAllUsers, getCompanyStats } from '../api';
const AVC=['#8B5CF6','#3B82F6','#EC4899','#10B981','#F59E0B','#EF4444','#6366F1'];
export function Olympians() {
  const [users,setUsers]=useState([]);
  const [cos,setCos]=useState([]);
  useEffect(()=>{getAllUsers().then(setUsers).catch(()=>{});getCompanyStats().then(setCos).catch(()=>{});}, []);
  const maxC=Math.max(...cos.map(c=>c.count),1);
  const CEmo={'HP':'🖨️','Verizon':'📡','Cognizant':'🧠','Infosys':'💼','TCS':'🌐','Wipro':'🌿','DXC':'💎'};
  return (
    <div className="page-wrap">
      <div style={{textAlign:'center',padding:'16px 0 36px'}}>
        <h1 style={{fontSize:34,fontWeight:800}}>The <span className="grad-text">Olympians</span></h1>
        <p style={{fontSize:15,color:'var(--txt2)',marginTop:8}}>14,000+ people. One building. Your community.</p>
      </div>
      <div className="sec-head"><div className="sec-title">By Company</div></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:36}}>
        {cos.map(c=>(
          <div key={c.company} className="card" style={{cursor:'pointer',transition:'all .2s'}}>
            <div style={{fontSize:26,marginBottom:8}}>{CEmo[c.company]||'🏢'}</div>
            <div style={{fontSize:14,fontWeight:700,marginBottom:3}}>{c.company}</div>
            <div style={{fontSize:12,color:'var(--txt2)'}}>{c.count} member{c.count>1?'s':''}</div>
            <div style={{height:3,borderRadius:2,background:'var(--ink4)',marginTop:10,overflow:'hidden'}}>
              <div style={{height:'100%',borderRadius:2,background:'var(--grad)',width:`${Math.round(c.count/maxC*100)}%`,transition:'width 1.2s'}}/>
            </div>
          </div>
        ))}
      </div>
      <div className="sec-head"><div className="sec-title">All Members</div><div className="sec-sub">{users.length} members</div></div>
      <div className="card" style={{padding:0,overflow:'hidden'}}>
        <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr 1fr 1fr',padding:'12px 18px',borderBottom:'1px solid var(--rim)',fontSize:11,fontWeight:700,color:'var(--txt3)',textTransform:'uppercase',letterSpacing:'.7px'}}>
          <div>Name</div><div>Company</div><div>Tower · Floor</div><div>Interest</div>
        </div>
        {users.map((u,i)=>(
          <div key={u.id} style={{display:'grid',gridTemplateColumns:'1.4fr 1fr 1fr 1fr',padding:'13px 18px',borderBottom:'1px solid var(--rim)',alignItems:'center',cursor:'pointer',transition:'background .15s'}}>
            <div style={{display:'flex',alignItems:'center',gap:9}}>
              <div style={{width:32,height:32,borderRadius:9,background:AVC[i%AVC.length],display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#fff'}}>{u.name?.[0]}</div>
              <span style={{fontSize:14,fontWeight:600}}>{u.name}</span>
            </div>
            <span style={{fontSize:13,color:'var(--txt2)'}}>{u.company}</span>
            <span style={{fontSize:13,color:'var(--txt2)'}}>{u.tower} · F{u.floor}</span>
            <span style={{fontSize:11,padding:'3px 9px',borderRadius:20,background:'rgba(139,92,246,.12)',color:'var(--violet)',fontWeight:700,display:'inline-block'}}>Member</span>
          </div>
        ))}
      </div>
    </div>
  );
}
