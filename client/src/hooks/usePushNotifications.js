import { useEffect } from 'react';
import axios from '../utils/axios';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = window.atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};

// Asks permission once and saves this device for push notifications.
// Members get new posts/notices; admins get "new registration" alerts.
const usePushNotifications = (enabled = true) => {
  useEffect(() => {
    if (!enabled || !import.meta.env.PROD) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return;
    if (Notification.permission === 'denied') return;

    const setup = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const permission   = await Notification.requestPermission();
        if (permission !== 'granted') return;

        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          let key = import.meta.env.VITE_VAPID_PUBLIC_KEY;
          if (!key) key = (await axios.get('/notifications/public-key')).data.key;
          if (!key) return;
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly:      true,
            applicationServerKey: urlBase64ToUint8Array(key),
          });
        }
        await axios.post('/notifications/subscribe', { subscription: subscription.toJSON() });
      } catch (err) {
        console.log('Push setup skipped:', err.message);
      }
    };
    setup();
  }, [enabled]);
};

export default usePushNotifications;
