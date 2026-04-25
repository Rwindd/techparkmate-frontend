import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Onboarding  from './pages/Onboarding';
import Layout      from './components/Layout';
import Home        from './pages/Home';
import ModulePage  from './pages/ModulePage';
import Clockpoint  from './pages/Clockpoint';
import { Anonymous }   from './pages/Anonymous';
import { Olympians }   from './pages/Olympians';
import { CreateEvent } from './pages/CreateEvent';
import { Profile }     from './pages/Profile';
import './styles/global.css';
import './pages/Home.css';
import './pages/animations.css';

function Guard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',
      alignItems:'center',justifyContent:'center',background:'var(--ink)',gap:16}}>
      <div style={{fontSize:40,animation:'spin .8s linear infinite',display:'inline-block'}}>⬡</div>
      <div style={{fontSize:13,color:'var(--txt3)'}}>Loading ParkMate…</div>
    </div>
  );
  return user ? children : <Navigate to="/onboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/onboard" element={<Onboarding />} />
          <Route path="/" element={<Guard><Layout /></Guard>}>
            <Route index         element={<Home />} />
            <Route path="sports" element={<ModulePage mod="sports"  icon="🏏" title="Sports"        sub="Find teammates, start a match." />} />
            <Route path="lunch"  element={<ModulePage mod="lunch"   icon="🍽️" title="Lunch Buddies" sub="Stop eating alone." />} />
            <Route path="build"  element={<ModulePage mod="build"   icon="💻" title="Build Together" sub="Find your weekend project partner." />} />
            <Route path="gaming" element={<ModulePage mod="gaming"  icon="🎮" title="Gaming Buddies" sub="Assemble your squad." />} />
            <Route path="movie"  element={<ModulePage mod="movie"   icon="🎬" title="Movie Together" sub="Find Olympians for movies & OTT." />} />
            <Route path="clockpoint" element={<Clockpoint />} />
            <Route path="anon"       element={<Anonymous />} />
            <Route path="olympians"  element={<Olympians />} />
            <Route path="create"     element={<CreateEvent />} />
            <Route path="profile"    element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
