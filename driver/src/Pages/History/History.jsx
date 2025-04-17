import React from 'react'
import './History.css'
import RideHistory from '../../components/RideHistory/RideHistory'

const History = () => {
  return (
    <div className='history'>
          <RideHistory/>
          <hr style={{marginTop:50}}/>
    </div>
  )
}

export default History