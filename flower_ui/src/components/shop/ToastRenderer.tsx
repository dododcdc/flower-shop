import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import ToastNotification from './ToastNotification';
import { ToastManager } from './ToastNotification';

const ToastRenderer: React.FC = () => {
  const [currentToast, setCurrentToast] = useState<{ id: string; props: any } | null>(null);

  useEffect(() => {
    const manager = ToastManager.getInstance();
    let isSubscribed = true;

    // 轮询检查Toast队列
    const checkQueue = () => {
      if (!isSubscribed) return;

      const queue = (manager as any).toastQueue || [];
      const current = (manager as any).currentToast;

      if (queue.length > 0 && !current && !currentToast) {
        const nextToast = queue[0];
        setCurrentToast(nextToast);
      } else if (!queue.length && !current && currentToast) {
        setCurrentToast(null);
      }

      setTimeout(checkQueue, 100);
    };

    checkQueue();

    return () => {
      isSubscribed = false;
      setCurrentToast(null);
    };
  }, [currentToast]);

  if (!currentToast) {
    return null;
  }

  const { id, props } = currentToast;

  return createPortal(
    <ToastNotification
      {...props}
      onClose={() => {
        ToastManager.getInstance().remove(id);
        setCurrentToast(null);
      }}
    />,
    document.body
  );
};

export default ToastRenderer;