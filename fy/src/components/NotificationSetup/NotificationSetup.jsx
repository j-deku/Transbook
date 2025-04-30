// src/components/NotificationSetup.jsx
import { useState, useEffect, useContext } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, useTheme } from '@mui/material';
import { messaging } from '../../firebase/firebaseConfig';
import { getToken, onMessage } from 'firebase/messaging';
import axiosInstance from '../../../axiosInstance';
import { toast } from 'react-toastify';
import { StoreContext } from '../../context/StoreContext';

/**
 * Helper to convert VAPID key
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return new Uint8Array([...raw].map(c => c.charCodeAt(0)));
}

/**
 * Fetches and syncs the current FCM token with the backend.
 */
export async function syncFcmToken() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
    const previous = localStorage.getItem('fcmToken');
    if (token && token !== previous) {
      localStorage.setItem('fcmToken', token);
      const jwt = localStorage.getItem('token');
      if (jwt) {
        await axiosInstance.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/user/update-token`,
          { fcmToken: token },
          { headers: { Authorization: `Bearer ${jwt}` } }
        );
      }
      console.log('🔄 FCM token synced to backend:', token);
    }
  } catch (err) {
    console.error('❌ FCM sync error:', err);
    throw err;
  }
}

const NotificationSetup = () => {
  const theme = useTheme();
  const { logout, token } = useContext(StoreContext); // grab auth token
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    if (!token) return;    // skip subscription when logged out

    let unsubscribeMessage;

    (async () => {
      // 1) Request permission
      if ('Notification' in window) {
        try {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
            setModalTitle('Enable Notifications');
            setModalMessage(
              'Notifications are disabled. To stay informed about updates, please enable notifications in your browser settings. You can usually find this under Settings > Privacy & Security > Site Permissions.'
            );
            setModalOpen(true);
            return;
          }
        } catch (err) {
          setModalTitle('Permission Error');
          setModalMessage('Error requesting notification permission.');
          setModalOpen(true);
          console.error('❌ Notification permission error:', err);
          return;
        }
      }

      // 2) Subscribe PushManager
      const registration = await navigator.serviceWorker.ready;
      try {
        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey)
        });
      } catch (err) {
        setModalTitle('Subscription Failed');
        setModalMessage('Unable to subscribe for this platform.');
        setModalOpen(true);
        console.error('❌ Push subscription error:', err);
        return;
      }

      // 3) Initial sync
      try {
        await syncFcmToken();
      } catch {
        toast.error('Failed to sync FCM token.');
      }

      // 4) Foreground messages
      unsubscribeMessage = onMessage(messaging, payload => {
        toast.info(<><strong>{payload.notification?.title}</strong><br />{payload.notification?.body}</>);
      });

      // 5) Token lifecycle: re-sync on page focus
      window.addEventListener('focus', syncFcmToken);

      // 6) Listen JWT change via storage event
      window.addEventListener('storage', (e) => {
        if (e.key === 'token') {
          syncFcmToken();
        }
      });

    })();

    // Cleanup
    return () => {
      if (unsubscribeMessage) unsubscribeMessage();
      window.removeEventListener('focus', syncFcmToken);
      window.removeEventListener('storage', syncFcmToken);
    };
  }, [token]);

  // Unsubscribe on logout
  useEffect(() => {
    const handleLogout = async () => {
      const fcmToken = localStorage.getItem('fcmToken');
      if (fcmToken) {
        try {
          await messaging.deleteToken(fcmToken);
          await axiosInstance.post(
            `${import.meta.env.VITE_API_BASE_URL}/api/user/remove-token`,
            { fcmToken },
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          );
        } catch (err) {
          console.error('Error unsubscribing FCM token:', err);
        }
        localStorage.removeItem('fcmToken');
      }
    };
    logout.subscribe(handleLogout);
    return () => logout.unsubscribe(handleLogout);
  }, [logout]);

  return (
    <>
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, color: '#fff' }}>{modalTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{modalMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => window.open('https://support.google.com/chrome/answer/3220216','_blank')} sx={{ color: theme.palette.primary.main }}>
            Learn How
          </Button>
          <Button onClick={() => setModalOpen(false)} sx={{ color: theme.palette.primary.main }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NotificationSetup;