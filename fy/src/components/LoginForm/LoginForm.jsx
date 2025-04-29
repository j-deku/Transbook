import { useContext, useState } from "react";
import './LoginForm.css'
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
import { syncFcmToken } from "../NotificationSetup/NotificationSetup";

const LoginForm = ({ setLogin }) => {
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

  // Validation schema
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters long")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain uppercase, lowercase, number, and special character."
      )
      .required("Password is required"),
  });

  const handleGoogleLogin = () => {
      window.location.href = `${url}/api/auth/google`;
    };

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    const baseUrl = url || "http://localhost:5000";
    try {
      const response = await axiosInstance.post(`${baseUrl}/api/user/login`, values, {
        withCredentials: true,
      });
      if (response.data.success) {
        const jwtToken = response.data.token;
        setToken(jwtToken);
        localStorage.setItem('token', jwtToken);
        
             try {
                await syncFcmToken();
               } catch (fcmErr) {
                 console.warn('Login succeeded but FCM sync failed:', fcmErr.code || fcmErr.message);
               }        
               successTone.play();
        setLogin(false);
        toast.success(response.data.message);

            const token = localStorage.getItem("token");
            if (token) {
              try {
                const decoded = jwtDecode(token);
                const userId = decoded.id || decoded.userId; // adjust based on your token structure
                if (userId) {
                  localStorage.setItem("userId", userId);
                } else {
                  console.warn("User id not found in token.");
                }
              } catch (error) {
                console.error("Error decoding token:", error);
              }
            } else {
              console.warn("Token not found in localStorage.");
            }
        
        navigate("/");
      } else if (response.data.redirect) {
        toast.warn(
          "User not verified. Redirecting to verification page..."
        );
        window.open(`${response.data.redirect}`, "_blank");
        setLogin(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.warn(error.response.data.message || "Incorrect credentials. Password mismatch.");
      } else if (error.response && error.response.status === 400) {
        toast.error(error.response.data.message || "Use Google login for this account.");
      } else if (error.response && error.response.status === 403) {
        toast.error(error.response.data.message || "Please verify your email to continue.");
      } else if(error.response && error.response.status === 404) {
        toast.error(error.response.data.message || "No account found with this email. Please register first.");
      } else if (error.response && error.response.status === 500) {
        toast.error(error.response.data.message || "Server down. Please try again later.");
      } else if (error.code === "ERR_NETWORK") {
        toast.warn("Network error. Please check your internet connection.");
      } else if(error.code === "ERR_BAD_REQUEST") {
        toast.error("Bad request. Please check your input.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div>
      <Typography
        variant="h5"
        sx={{ mb: 3, textAlign: "center", color: "gray" }}
      >
        Login
      </Typography>
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
        }) => (
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
                placeholder="Enter your email"
                autoComplete="email"
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                inputMode="email"
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
                autoComplete="current-password"
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
                inputMode="password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaLock style={{ marginRight: "8px" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePassword}>
                        {showPassword ? (
                          <MdVisibility />
                        ) : (
                          <MdVisibilityOff />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Typography variant="h7">
              Forgot password?
              <span
                onClick={() => setLogin(false)}
                style={{ color: "#1A73E8", fontWeight: "bold" }}
              >
                <a href="/forgot-password"> Reset password </a>
              </span>
            </Typography>
            <br />
            <br />
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={24} /> : "Login"}
              </Button>
            </Box>
          </form>
        )}
      </Formik>
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h6" sx={{ my: 2 }}>
          OR
        </Typography>
        <Button
          onClick={handleGoogleLogin}
          variant="outlined"
          sx={{ textTransform: "none", mb: 2, borderRadius: "20px" }}
          className="google-btn"
        >
        <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="google" width={30} height={30} style={{marginRight: "10px"}}/>
          Login with Google
        </Button>
      </Box>
    </div>
  );
};
LoginForm.propTypes = {
  setLogin: PropTypes.func.isRequired,
};

export default LoginForm;
