import { createContext, useEffect, useState } from "react";
import PropTypes from 'prop-types';

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {
  // Initialize cartItems from localStorage if available, otherwise an empty array
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem("selectedRides");
    return saved ? JSON.parse(saved) : [];
  });
  
  const url = "https://transbook-backend.onrender.com";
  const [token, setToken] = useState("");
  const [cookie, setCookie] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [searchData, setSearchData] = useState(null);

  // Check for token and fetch user data on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) {
        setUser(storedUser);
      }
    }
  }, []);

  // Capture user data after Google login
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const name = urlParams.get('name');
    const email = urlParams.get('email');
    const avatar = urlParams.get('avatar');

    if (token) {
      localStorage.setItem('token', token);
      const userData = { name, email, avatar };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }
  }, []);

  // Update localStorage whenever cartItems changes
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
