import { createContext, useEffect, useState } from "react";
import PropTypes from 'prop-types';

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState({});
  const url = "http://localhost:5000";
  const [token, setToken] = useState("");
  const [cookie, setCookie] = useState("");
  const [user, setUser] = useState(null); // User state
  const [searchData, setSearchData] = useState(null);

  // Check for token and fetch user data on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      // Set user data if saved
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) {
        setUser(storedUser);
      }
    }
  }, []);

  // Capture user data and avatar after Google login
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const name = urlParams.get('name');
    const email = urlParams.get('email');
    const avatar = urlParams.get('avatar'); // Get avatar URL from query params

    if (token) {
      localStorage.setItem('token', token);
      const userData = { name, email, avatar }; // Store user data along with avatar
      localStorage.setItem('user', JSON.stringify(userData)); // Save to localStorage
      setUser(userData); // Update user state
    }
  }, []);

  // Context value with userData included
  const ContextValue = {
    cartItems,
    setCartItems,
    url,
    token,
    setToken,
    cookie,
    setCookie,
    user, // Provide user data (including avatar)
    setUser,
    searchData, // Store ride search data
    setSearchData, // Update search data
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
