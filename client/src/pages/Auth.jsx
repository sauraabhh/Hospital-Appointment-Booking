import { useState } from 'react';
import api from '../api';

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState({ text: '', ok: false });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setMsg({ text: '', ok: false });
  };

  const submit = async e => {
    e.preventDefault();
    setMsg({ text: '', ok: false });
    try {
      if (mode === 'register') {
        await api.post('/auth/register', form);
        setMsg({ text: 'Registered successfully. Please login.', ok: true });
        setMode('login');
      } else {
        const { data } = await api.post('/auth/login', {
          email: form.email,
          password: form.password
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location = data.user.role === 'admin' ? '/admin' : '/doctors';
      }
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Cannot reach server', ok: false });
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-side">
        <h1>Your health, on your schedule</h1>
        <p>Book appointments with our specialists in just a few clicks.</p>
        <ul>
          <li> Choose your doctor and department</li>
          <li> See live available time slots</li>
          <li> Cancel anytime</li>
        </ul>
      </div>

      <form className="auth-form" onSubmit={submit}>
        <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>

        {mode === 'register' && (
          <label className="field">Full name
            <input name="name" placeholder="John Doe" value={form.name} onChange={handleChange} />
          </label>
        )}
        <label className="field">Email
          <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} />
        </label>
        <label className="field">Password
          <input name="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} />
        </label>

        {msg.text && <div className={`msg ${msg.ok ? 'msg-ok' : 'msg-err'}`}>{msg.text}</div>}

        <button type="submit" className="btn btn-block">
          {mode === 'login' ? 'Login' : 'Register'}
        </button>

        <p className="auth-switch">
          {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
          <button type="button" className="link-btn" onClick={switchMode}>
            {mode === 'login' ? 'Register' : 'Login'}
          </button>
        </p>
      </form>
    </div>
  );
}