// src/App.jsx
import { useEffect, useState, useContext } from 'react'
import './App.css'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './Pages/Home/Home'
import Cart from './Pages/Cart/Cart'
import PlaceBookings from './Pages/PlaceBookings/PlaceBookings'
import Verify from './Pages/Verify/Verify'
import Footer from './components/Footer/Footer'
import NewsFeed from './components/NewsFeed/NewsFeed'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import LoadingPage from './components/LoadingPage/LoadingPage'
import ProfileDetails from './components/ProfileDetails/ProfileDetails'
import PrivacyPolicy from './components/Policy/PrivacyPolicy'
import Faq from './components/FAQ/Faq'
import DeliveryInfo from './components/DeliveryInfo/DeliveryInfo'
import AboutUs from './components/AboutUs/AboutUs'
import { loadAllImages } from './utils/loadImages'
import VerifyOTP from './components/VerifyOTP/VerifyOTP'
import Forms from './components/Forms/Forms'
import Fleets from './components/Fleets/Fleets'
import MyBookings from './Pages/MyBookings/MyBookings'
import SearchInput from './Pages/SearchInput/SearchInput'
import ForgotPassword from './components/ForgotPassword/ForgotPassword'
import PasswordReset from './components/PasswordReset/PasswordReset'
import FirstQuestion from './components/FirstQuestion/FirstQuestion'
import BookingDashboard from './Pages/BookingDashboard/BookingDashboard'
import UserSocketProvider from '../Provider/UserSocketProvider'
import NotificationSetup from './components/NotificationSetup/NotificationSetup'
import TrackRide from './Pages/TrackRide/TrackRide'
import { StoreContext } from './context/StoreContext'

const App = () => {
  const [login, setLogin] = useState(false)
  const [isLoading, setIsLoading] = useState(() => !sessionStorage.getItem('assetsLoaded'))
  const { token } = useContext(StoreContext)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data?.type === 'PLAY_SOUND') {
          const audio = new Audio('/apple-toast.mp3')
          audio.play().catch(err => console.warn('Audio playback blocked:', err))
        }
      })
    }
  }, [])

  useEffect(() => {
    const preload = async () => {
      if (!localStorage.getItem('assetsLoaded')) {
        await loadAllImages()
        localStorage.setItem('assetsLoaded', 'true')
      }
      sessionStorage.setItem('assetsLoaded', 'true')
      setIsLoading(false)
    }
    if (isLoading) preload()
  }, [isLoading])

  if (isLoading) return <LoadingPage />

  return (
    <div>
      <UserSocketProvider>
        <ToastContainer position="top-left" />
        {token && <NotificationSetup />} 
        {login && <Forms setLogin={setLogin} />}
        <div className="app">
          <Navbar setLogin={setLogin} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/newsFeed" element={<NewsFeed />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/deliveryInfo" element={<DeliveryInfo />} />
            <Route path="/aboutUs" element={<AboutUs />} />
            <Route path="/message-us" element={<Faq />} />
            <Route path="/fleets" element={<Fleets />} />
            <Route path="/SearchInput" element={<SearchInput />} />
            <Route path="/searchRides" element={<BookingDashboard />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/profile" element={<ProfileDetails />} />
            <Route path="/checkout" element={<PlaceBookings />} />
            <Route path="/myBookings" element={<MyBookings />} />
            <Route path="/track-ride/:rideId" element={<TrackRide />} />
            <Route path="/verify-otp" element={<VerifyOTP setLogin={setLogin} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<PasswordReset />} />
            <Route path="/driveNuser" element={<FirstQuestion />} />
            <Route path="/firebase-messaging-sw.js" element={null} />
          </Routes>
        </div>
        <Footer />
      </UserSocketProvider>
    </div>
  )
}

export default App