// App.jsx
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import { Navigate, Route, Routes } from "react-router-dom";
import Add from "./Pages/Add/Add";
import Lists from "./Pages/Lists/Lists";
import Bookings from "./Pages/Bookings/Bookings";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify";
import AdminLogin from "./components/AdminLogin/AdminLogin";
import PasswordReset from "./components/PasswordReset/PasswordReset";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import Dashboard from "./Pages/Dashboard/Dashboard";
import PropTypes from "prop-types";
import AssignRides from "./Pages/AssignRides/AssignRides";
import AddDriver from "./Pages/AddDriver/AddDriver";
import ListDrivers from "./Pages/ListDrivers/ListDrivers";
import UpdateRides from "./Pages/UpdateRides/UpdateRides";
import UpdateDrivers from "./Pages/UpdateDrivers/UpdateDrivers";
import AdminSocketProvider from "../provider/AdminSocketProvider";
import { useEffect } from "react";

const PrivateRoute = ({ children }) => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'PLAY_CUSTOM_SOUND') {
          // Attempt to play a custom audio if user has interacted
          const audio = new Audio('/apple-toast.mp3');
          audio.play().catch((err) => {
            console.warn('Could not play the custom notification sound:', err);
          });
        }
      });
    }
  }, []);

  // Now checking for "token" instead of "adminToken"
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};


const App = () => {
  return (
    <div>
    <AdminSocketProvider>
      <ToastContainer/>
      <Navbar />
      <hr />
      <div className="app-content">
        <Sidebar />
        <Routes>
          <Route path="/" element={<AdminLogin />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard/></PrivateRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword/>}/>
          <Route path="/reset-password/:token" element={<PasswordReset/>}/>
          <Route path="/add" element={<PrivateRoute><Add /></PrivateRoute>} />
          <Route path="/list" element={<PrivateRoute><Lists /></PrivateRoute>} />
          <Route path="/book" element={<PrivateRoute><Bookings/></PrivateRoute>} />
          <Route path="/add-driver" element={<PrivateRoute><AddDriver/></PrivateRoute>} />
          <Route path="/list-drivers" element={<PrivateRoute><ListDrivers/></PrivateRoute>} />
          <Route path="/assign-rides" element={<PrivateRoute><AssignRides/></PrivateRoute>} />

          <Route path="/update-ride/:id" element={<PrivateRoute><UpdateRides/></PrivateRoute>} />
          <Route path="/update-driver/:id" element={<PrivateRoute><UpdateDrivers/></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      </AdminSocketProvider>
    </div>
  );
};

export default App;