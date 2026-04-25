import axios from 'axios';

export const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// 40s timeout — handles Render free tier cold start (~30s)
const api = axios.create({ baseURL: API_BASE + '/api', timeout: 40000 });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('pm_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const sendOtp        = (phone)      => api.post('/auth/send-otp', { phone }).then(r => r.data);
export const verifyOtp      = (phone, otp) => api.post('/auth/verify-otp', { phone, otp }).then(r => r.data);
export const registerUser   = (body)       => api.post('/auth/register', body).then(r => r.data);
export const getMe          = ()           => api.get('/auth/me').then(r => r.data);
export const updateProfile  = (body)       => api.put('/auth/profile', body).then(r => r.data);

// ── EVENTS ───────────────────────────────────────────────────────────────────
export const getHomeEvents    = ()    => api.get('/events').then(r => r.data);
export const getModuleEvents  = mod  => api.get(`/events/module/${mod}`).then(r => r.data);
export const getEventHistory  = ()   => api.get('/events/history').then(r => r.data);
export const getMyEvents      = ()   => api.get('/events/mine').then(r => r.data);
export const getModuleCounts  = ()   => api.get('/events/module-counts').then(r => r.data);
export const createEvent      = b    => api.post('/events', b).then(r => r.data);
export const joinEvent        = id   => api.post(`/events/${id}/join`).then(r => r.data);
export const leaveEvent       = id   => api.delete(`/events/${id}/join`).then(r => r.data);
export const cancelEvent      = id   => api.delete(`/events/${id}`).then(r => r.data);
export const cancelByActivity = act  => api.delete(`/events/activity/${encodeURIComponent(act)}`).then(r => r.data);
export const getEventComments = id   => api.get(`/events/${id}/comments`).then(r => r.data);
export const postEventComment = (id, text) => api.post(`/events/${id}/comments`, { text }).then(r => r.data);

// ── CLOCKPOINT ───────────────────────────────────────────────────────────────
export const getPresence     = ()    => api.get('/clockpoint/presence').then(r => r.data);
export const checkIn         = ()    => api.post('/clockpoint/join').then(r => r.data);
export const checkOut        = ()    => api.delete('/clockpoint/join').then(r => r.data);
export const getChatHistory  = ()    => api.get('/clockpoint/chat').then(r => r.data);
export const sendChatMessage = text  => api.post('/clockpoint/chat', { text }).then(r => r.data);

// ── ANONYMOUS ─────────────────────────────────────────────────────────────────
export const getAnonPosts    = ()    => api.get('/anon').then(r => r.data);
export const postAnon        = text  => api.post('/anon', { text }).then(r => r.data);
export const relatePost      = id    => api.post(`/anon/${id}/relate`).then(r => r.data);

// ── USERS ─────────────────────────────────────────────────────────────────────
export const getAllUsers      = ()   => api.get('/users').then(r => r.data);
export const getCompanyStats = ()   => api.get('/users/companies').then(r => r.data);
