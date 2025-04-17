import { useContext, useState } from "react";
import './AdminLogin.css'
import { assets } from '../../assets/assets'

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
import {jwtDecode} from 'jwt-decode';
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import axiosInstance from "../../../axiosInstance";

const AdminLogin = () => {
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

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post(`/api/admin/login`, values, {
        withCredentials: true,
      });
      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        sessionStorage.setItem("token", response.data.token);
        localStorage.setItem("adminEmail", values.email);
        successTone.play();
        toast.success(response.data.message);
        navigate("/dashboard");

                    const token = localStorage.getItem("token");
                    if (token) {
                      try {
                        const decoded = jwtDecode(token);
                        const adminId = decoded.id || decoded.adminId; // adjust based on your token structure
                        if (adminId) {
                          localStorage.setItem("adminId", adminId);
                        } else {
                          console.warn("Admin id not found in token.");
                        }
                      } catch (error) {
                        console.error("Error decoding token:", error);
                      }
                    } else {
                      console.warn("Token not found in localStorage.");
                    }
        
      }else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Not authorized login");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='overlay'>
    <div className='logo'>
      <img src={assets.TransLogo} alt='transBook logo'/>
    </div>
 <div className='form'>
      <Typography
        variant="h5"
        sx={{ mb: 3, textAlign: "center", color: "gray" }}
      >
        Administrator Login
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
                placeholder='Enter admin email'
                required
                fullWidth
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="current-email"
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
                placeholder='Enter your password'
                required
                fullWidth
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
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
    </div>
    </div>
  )
}

export default AdminLogin
