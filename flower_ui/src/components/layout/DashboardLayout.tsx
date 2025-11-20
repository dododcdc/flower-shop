import React from 'react';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div>
      <header style={{ padding: 16, background: '#1976d2', color: '#fff' }}>
        <strong>花言花语 - 管理后台</strong>
      </header>
      <main style={{ padding: 16 }}>{children}</main>
    </div>
  );
};

export default DashboardLayout;
