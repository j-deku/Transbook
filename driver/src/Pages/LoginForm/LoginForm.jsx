import { useContext, useState } from "react";
import './LoginForm.css';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { Formik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";
import { Howl } from "howler";
import {jwtDecode} from 'jwt-decode'
import PropTypes from "prop-types";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import axiosInstance from "../../../axiosInstance";
import { assets } from "../../assets/assets";

const LoginForm = () => {
  const { url, setToken } = useContext(StoreContext);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const successTone = new Howl({
    src: ["/apple-sms.mp3"],
    volume: 1,
    autoplay: false,
    loop: false,
  });

  // Validation schema for driver login
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters long")
      .required("Password is required"),
  });

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      // Submit credentials to driver login endpoint
      const response = await axiosInstance.post(`${url}/api/driver/login`, values, {
        withCredentials: true,
      });
      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("driverId", response.data.driver._id);
        localStorage.setItem("driverName", response.data.driver.name);
        localStorage.setItem("driverImageUrl", response.data.driver.imageUrl);
  
        successTone.play();
        toast.success(response.data.message);
        navigate("/dashboard");
  
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const decoded = jwtDecode(token);
            const driverId = decoded.id || decoded.driverId; // adjust based on your token structure
            if (driverId) {
              localStorage.setItem("driverId", driverId);
            } else {
              console.warn("Driver id not found in token.");
            }
          } catch (error) {
            console.error("Error decoding token:", error);
          }
        } else {
          console.warn("Token not found in localStorage.");
        }
      } else if (response.data.redirect) {
        toast.warn("User not verified. Redirecting to verification page...");
        window.open(`${response.data.redirect}`, "_blank");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      // Check if error is due to pending admin approval (status code 403)
      if (error.response && error.response.status === 403) {
        toast.warn(
          error.response.data.message || "Your account is pending admin approval."
        );
      } else if(error.response && error.response.status === 401) {
          toast.error(error.response.data.message || "Not authorized login. Please register first.");
        } else if(error.response && error.response.status === 404) {
            toast.error(error.response.data.message || "Invalid credentials. \n Password mismatch");
          } else if(error.response && error.response.status === 500){
              toast.error(error.response.data.message || "Server down. Please try again later.");
            } else if (error.code === "ERR_NETWORK") {
              toast.error("Network error. Please check your connection.");
            } else {
              toast.error("An unexpected error occurred. Please try again.");
            }

      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="overlay">
        <div className='logo'>
          <img src="/TT-logo.png" alt='toli-toli logo'/>
        </div>
      <div className="form">
        <Typography variant="h5" sx={{ mb: 3, textAlign: "center", color: "gray" }}>
          Driver Login
        </Typography>
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  required
                  fullWidth
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  inputMode="email"
                  placeholder="Enter your email"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaEnvelope style={{ marginRight: "8px" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Box sx={{ mb: 3 }}>
                <TextField
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  required
                  fullWidth
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your password"
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaLock style={{ marginRight: "8px" }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={togglePassword}>
                          {showPassword ? <MdVisibility /> : <MdVisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ textAlign: "center", mb: 2 }}>
                Forgot password? <a href="/forgot-password">Reset password</a>
              </Typography>
              <Box sx={{ textAlign: "center", mb: 2 }}>
                <Button type="submit" variant="contained" fullWidth disabled={isSubmitting}>
                  {isSubmitting ? <CircularProgress size={24} /> : "Login"}
                </Button>
              </Box>
            </form>
          )}
        </Formik>
        <p>Not yet registered? <a href="/register">Register Account</a></p>
      </div>
    </div>
  );
};

LoginForm.propTypes = {
  setLogin: PropTypes.func.isRequired,
};

export default LoginForm;
