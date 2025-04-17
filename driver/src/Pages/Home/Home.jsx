import React from 'react'
import './Home.css'
import CurrentRideOverview from '../../components/CurrentRideOverView/CurrentRideOverview'
import EarningsSummary from '../../components/EarningsSummary/EarningsSummary'
import PerformanceMetrics from '../../components/PerformanceMetrics/PerformanceMetrics'
import Header from '../../components/Header/Header'
import RideRequestModal from '../../components/RideRequestModal/RideRequestModal'
import CurrentRideApproved from '../../components/CurrentRideApproved/CurrentRideApproved'
import MyRides from '../../components/MyRides/MyRides'

const Home = () => {
  return (
    <div>
      <Header/>
      <hr/>
      <CurrentRideApproved/>
      <hr/>
      <MyRides/>
      <h2 className='home-heading'>Current Ride Overview</h2>
      <CurrentRideOverview/>
      <RideRequestModal/>
      <EarningsSummary/>
      <PerformanceMetrics/>
    </div>
  )
}

export default Home
