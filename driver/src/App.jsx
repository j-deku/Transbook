import React, {useEffect} from 'react'
import './App.css'
import Navbar from './components/Navbar/Navbar'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './Pages/Home/Home'
import Support from './Pages/Support/Support'
import Earnings from './Pages/Earnings/Earnings'
import History from './Pages/History/History'
import { ToastContainer } from 'react-toastify'
import RegisForm from './Pages/RegisForm/RegisForm'
import LoginForm from './Pages/LoginForm/LoginForm'
import PropTypes from 'prop-types'
import Settings from './Pages/Settings/Settings'
import Footer from './components/Footer/Footer'
import DriverSocketProvider from '../provider/DriverSocketProvider'
import NotificationsProvider from './context/DriverNotificationsContext'
import EditFare from './Pages/EditFare/EditFare'
import FormSubmitted from './Pages/FormSubmitted/FormSubmitted'
import CreateRide from './Pages/CreateRide/CreateRide'
import ForgotPassword from './components/ForgotPassword/ForgotPassword'
import PasswordReset from './components/PasswordReset/PasswordReset'

const App = () => {
  const PrivateRoute = ({ children }) => {
    // Now checking for "token" instead of "adminToken"
    const token = localStorage.getItem("token");
    return token ? children : <Navigate to="/" />;
  };
  const PrivateSuccessRoute = ({ children }) => {
    const driverId = localStorage.getItem("driverId");
    return driverId ? children : <Navigate to="/" />;
  }
  PrivateRoute.propTypes = {
    children: PropTypes.node.isRequired,
  };

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
  

  return (
    <DriverSocketProvider className='app'>
    <NotificationsProvider>
    <div>
      <ToastContainer position="top-left" />
      <Navbar/>
      <Routes>
        <Route path="/" element={<LoginForm/>}/>
        <Route path="/form-submitted" element={<PrivateSuccessRoute><FormSubmitted/></PrivateSuccessRoute>}/>
        <Route path="/register" element={<RegisForm/>} />
        <Route path="/create-ride" element={<CreateRide/>}/>
        <Route path='/dashboard' element={<PrivateRoute><Home/></PrivateRoute>}/>
        <Route path='/history' element={<PrivateRoute><History/></PrivateRoute>}/>
        <Route path='/earnings' element={<PrivateRoute><Earnings/></PrivateRoute>}/>
        <Route path='/support' element={<PrivateRoute><Support/></PrivateRoute>}/>
        <Route path='/profile-settings' element={<PrivateRoute><Settings/></PrivateRoute>}/>
        <Route path="/driver/edit-fare/:rideId" element={<PrivateRoute><EditFare /></PrivateRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword/>}/>
        <Route path="/reset-password/:token" element={<PasswordReset/>}/>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
      <Footer/>
    </div>
    </NotificationsProvider>
    </DriverSocketProvider>
  )
}

export default App;
