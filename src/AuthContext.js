import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto-login on every page load using stored JWT
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('pm_token');
      if (!token) { setLoading(false); return; }
      try {
        const r = await axios.get(`${API}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 40000,
        });
        setUser(r.data);
      } catch {
        // Token invalid or server down — clear and show onboarding
        localStorage.removeItem('pm_token');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /** Step 1: Send OTP. Returns { isNew: boolean } */
  async function sendOtp(phone) {
    const r = await axios.post(`${API}/api/auth/send-otp`, { phone }, { timeout: 40000 });
    return r.data;
  }

  /** Step 2a: Existing user OTP verify */
  async function verifyOtp(phone, otp) {
    const r = await axios.post(`${API}/api/auth/verify-otp`, { phone, otp }, { timeout: 40000 });
    localStorage.setItem('pm_token', r.data.token);
    setUser(r.data.user);
    return r.data.user;
  }

  /** Step 2b: New user — name/company/tower/floor + OTP */
  async function register(name, company, tower, floor, phone, otp) {
    const r = await axios.post(`${API}/api/auth/register`, { name, company, tower, floor, phone, otp }, { timeout: 40000 });
    localStorage.setItem('pm_token', r.data.token);
    setUser(r.data.user);
    return r.data.user;
  }

  /** Update profile — calls PUT /api/auth/profile */
  async function updateProfile(updates) {
    const token = localStorage.getItem('pm_token');
    const r = await axios.put(`${API}/api/auth/profile`, updates, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 40000,
    });
    setUser(r.data);
    return r.data;
  }

  /** Directly update user in context (e.g. after optimistic UI update) */
  function updateUser(updated) {
    setUser(updated);
  }

  function signOut() {
    localStorage.removeItem('pm_token');
    setUser(null);
  }

  return (
    <Ctx.Provider value={{ user, loading, sendOtp, verifyOtp, register, updateProfile, updateUser, signOut }}>
      {children}
    </Ctx.Provider>
  );
}
