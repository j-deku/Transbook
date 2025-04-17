import { useState } from "react";
import PropTypes from "prop-types";
import "./Forms.css";
import LoginForm from "../LoginForm/LoginForm";
import RegisForm from "../RegisForm/RegisForm";
import { Box } from "@mui/material";
import { FaTimes } from "react-icons/fa";
const Forms = ({ setLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  
  const toggleStyle = {
    color: "#0e2cf2",
    cursor: "pointer",
    fontWeight: "bold",
  };
  const closeIcon = {
    position: "absolute",
    top: 16, 
    right: 16,
    cursor: "pointer",
    fontSize: 24,
    color: "gray",
    zIndex: 1,
  };

  
  if(localStorage.getItem("userId")){
    setLogin(true);
  }

  return (
    <div className="login-container">
      <Box
        sx={{
          maxWidth: 400,
          margin: "auto",
          mt: 5,
          p: 6,
          boxShadow: 3,
          borderRadius: 2,
          color: "gray",
          background: isLogin ? "aliceblue" : "white",
          transition: "all 0.5s",
          position: "relative",
        }}
      >
        <FaTimes
          onClick={() => setLogin(false)}
          className="closeButton"
          style={closeIcon}
          aria-label={"Close Login Form"}
        />
        {isLogin ? (
          <LoginForm setLogin={setLogin} />
        ) : (
          <RegisForm setLogin={setLogin} />
        )}
        <p>
          {isLogin ? (
            <>
              Don’t have an account?{" "}
              <span onClick={() => setIsLogin(false)} style={toggleStyle}>
                Register
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span onClick={() => setIsLogin(true)} style={toggleStyle}>
                Login
              </span>
            </>
          )}
        </p>
      </Box>
    </div>
  );
};
Forms.propTypes = {
  setLogin: PropTypes.func.isRequired,
};

export default Forms;
