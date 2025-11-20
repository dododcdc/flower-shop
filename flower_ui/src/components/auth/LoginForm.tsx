import React, { useState } from 'react';
import { login } from '../../api/authAPI';
import type { LoginRequest } from '../../models/auth';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await login({ username, password } as LoginRequest);
      if (res?.token) {
        localStorage.setItem('flower_token', res.token);
        window.location.href = '/dashboard';
      } else {
        setError('登录失败，请重试');
      }
    } catch {
      setError('登录失败，请检查凭证');
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ width: 320, padding: 20, border: '1px solid #ddd', borderRadius: 8 }}>
      <h2>管理员登录</h2>
      <div>
        <label>用户名</label>
        <input value={username} onChange={e => setUsername(e.target.value)} />
      </div>
      <div>
        <label>密码</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit">登录</button>
    </form>
  );
};

export default LoginForm;
