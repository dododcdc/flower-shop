import React, { useState, useEffect } from 'react';

interface DebugToastProps {
  message: string;
  duration?: number;
}

const DebugToast: React.FC<DebugToastProps> = ({ message, duration = 3000 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      console.log('🔥 DebugToast 显示消息:', message);

      const timer = setTimeout(() => {
        console.log('🔥 DebugToast 关闭消息');
        setVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 100,
        right: 20,
        zIndex: 9999,
        background: 'linear-gradient(135deg, #FF6B35 0%, #F44336 100%)',
        color: 'white',
        padding: '16px 24px',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 'bold',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        transform: visible ? 'translateX(0)' : 'translateX(400px)',
        transition: 'all 0.3s ease',
        maxWidth: '300px',
      }}
    >
      🎉 {message}
    </div>
  );
};

export default DebugToast;