import React from 'react'
import './LoadingPage.css'
import { Link } from 'react-router-dom'
const LoadingPage = () => {
  return (
    <div className='loadingPage'>
      <img src="/TT-logo.png" alt="Logo" />
      <div className='loading-text'>
        <p>l o a d i n g . . .</p>
      </div>
      <div className="footer-details">
        <p> &copy; Inc. J-Deku <br /><Link to={'https://github.com/j-deku/jerryDek.github.io'} target='_blank'><img  src="/to_do_icon2.png" alt="" /> </Link></p> 
      </div>
    </div>
  )
}

export default LoadingPage
