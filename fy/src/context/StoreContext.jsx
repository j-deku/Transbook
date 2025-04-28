// src/context/StoreContext.jsx
import React, { createContext, useEffect, useState, useCallback } from "react";
import PropTypes from 'prop-types';

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {
  // Cart items state
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem("selectedRides");
    return saved ? JSON.parse(saved) : [];
  });

  const url = import.meta.env.VITE_API_BASE_URL;
  const [token, setToken] = useState("");
  const [cookie, setCookie] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [searchData, setSearchData] = useState(null);

  // Event listeners registry for logout
  const logoutListeners = React.useRef(new Set()).current;

  const subscribeLogout = useCallback((fn) => {
    logoutListeners.add(fn);
  }, [logoutListeners]);

  const unsubscribeLogout = useCallback((fn) => {
    logoutListeners.delete(fn);
  }, [logoutListeners]);

  // Trigger logout and notify listeners
  const logout = useCallback(() => {
    // Clear user state & storage
    setToken("");
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Notify subscribers
    logoutListeners.forEach(fn => {
      try { fn(); } catch (e) { console.error('Logout listener error:', e); }
    });
  }, [logoutListeners]);

  // On init, load token & user
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    }
  }, []);

  // Google login redirect handling
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const jwt = params.get('token');
    if (jwt) {
      localStorage.setItem('token', jwt);
      setToken(jwt);
      const name = params.get('name');
      const email = params.get('email');
      const avatar = params.get('avatar');
      const userData = { name, email, avatar };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }
  }, []);

  // Persist cartItems
  useEffect(() => {
    localStorage.setItem("selectedRides", JSON.stringify(cartItems));
  }, [cartItems]);

  const ContextValue = {
    cartItems,
    setCartItems,
    url,
    token,
    setToken,
    cookie,
    setCookie,
    searchTerm,
    setSearchTerm,
    user,
    setUser,
    searchData,
    setSearchData,
    // Logout API: call to clear and notify
    logout: {
      exec: logout,
      subscribe: subscribeLogout,
      unsubscribe: unsubscribeLogout,
    },
  };

  return (
    <StoreContext.Provider value={ContextValue}>
      {children}
    </StoreContext.Provider>
  );
};

StoreContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default StoreContextProvider;
