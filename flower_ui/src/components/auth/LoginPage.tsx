import React from 'react';
import LoginForm from './LoginForm';

const LoginPage: React.FC = () => {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <LoginForm />
    </div>
  );
};

export default LoginPage;
