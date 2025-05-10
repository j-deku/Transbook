import { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../axiosInstance';
import { StoreContext } from '../context/StoreContext';

export function useCommissionRate() {
  const { url } = useContext(StoreContext);
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const resp = await axiosInstance.get(`${url}/api/admin/commission`);
        if (!isMounted) return;
        const { data } = resp;
        // ensure we have a number
        const parsed = parseFloat(data.rate);
        setRate(!isNaN(parsed) ? parsed : 0);
      } catch (err) {
        console.error('Failed to load commission rate:', err);
        if (isMounted) setRate(0);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [url]);

  
  return loading ? null : rate;
}
