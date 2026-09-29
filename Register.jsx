import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext.jsx';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <Helmet>
        <title>Sign up — Connectly</title>
      </Helmet>
      <form onSubmit={handleSubmit} className="auth-form">
        <h1>Create your account</h1>
        {error && <p className="auth-form__error">{error}</p>}
        <label htmlFor="name">Full name</label>
        <input id="name" required value={form.name} onChange={handleChange('name')} />
        <label htmlFor="username">Username</label>
        <input id="username" required value={form.username} onChange={handleChange('username')} />
        <label htmlFor="email">Email</label>
        <input id="email" type="email" required value={form.email} onChange={handleChange('email')} />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={handleChange('password')}
        />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Sign up'}
        </button>
        <p>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
