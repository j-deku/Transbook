import React, { useRef, useState } from 'react';
import './Services.css';
import { FaArrowRight } from 'react-icons/fa';
import {Link, useNavigate} from 'react-router-dom'
const Services = () => {
  const cardsContainerRef = useRef(null);
  const navigate = useNavigate();

  const scrollLeft = () => {
    cardsContainerRef.current.scrollBy({
      left: -300, 
      behavior: 'smooth',
    });
  };

  const scrollRight = () => {
    cardsContainerRef.current.scrollBy({
      left: 300, 
      behavior: 'smooth',
    });
  };

  const PlaceLille = () => {
    const searchData = { pickup:"Ho", destination:"Anloga", selectedDate:"2/1/2025", passengers:1};
    localStorage.setItem('searchData', JSON.stringify(searchData));
    navigate('/searchRides', { state: searchData });  };

  return (
    <div className="service">
      <h1>Our Top Services</h1>
      <hr style={{ width: '50%', height: '2px', placeSelf: 'center', margin: '30px' }} />

      {/* Scroll Buttons */}
      <div className="scroll-buttons">
        <button onClick={scrollLeft} className="scroll-button left">
        ❮
        </button>
        <button onClick={scrollRight} className="scroll-button right">
        ❯
        </button> 
      </div>

      {/* Cards */}
      <div className="cards" ref={cardsContainerRef}>
        <div className="card">
        <Link onClick={PlaceLille}>
          <div className="image-overlay">
            <img src="https://res.cloudinary.com/dtlewbcwr/image/upload/v1738578932/lille-city_k4asyx.jpg" alt="places" />
          </div>
          </Link>
          <p>London <FaArrowRight /> Lille</p>
          <hr style={{ height: '2px' }} />
          <p>$27.00</p>
          <p>To London from Paris - Roissy CDG Airport</p>
          <button onClick={PlaceLille}>
            <FaArrowRight />
          </button>
        </div>

        <div className="card">
        <Link to='/book'>
          <div className="image-overlay">
            <img src="https://res.cloudinary.com/dtlewbcwr/image/upload/v1738578932/london_edn57a.jpg" alt="places" />
          </div>
          </Link>
          <p>Paris <FaArrowRight /> London</p>
          <hr style={{ height: '2px' }} />
          <p>$28.00</p>
          <p>To London from Paris - Roissy CDG Airport</p>
          <button onClick={()=>navigate('/book')}>
            <FaArrowRight />
          </button>
        </div>

        <div className="card">
        <Link to='/book'>
          <div className="image-overlay">
            <img src="https://res.cloudinary.com/dtlewbcwr/image/upload/v1738578923/france_sei3ot.jpg" alt="places" />
          </div>
          </Link>
          <p>Lille <FaArrowRight /> Paris</p>
          <hr style={{ height: '2px' }} />
          <p>$30.00</p>
          <p>To Paris from Lille - Cantonment Airport</p>
          <button onClick={()=>navigate('/book')}>
            <FaArrowRight />
          </button>
        </div>

        <div className="card">
        <Link to='/book'>
          <div className="image-overlay">
            <img src="https://res.cloudinary.com/dtlewbcwr/image/upload/v1738578933/london1_k7xwcl.jpg" alt="places" />
          </div>
          </Link>
          <p>Lille <FaArrowRight /> London</p>
          <hr style={{ height: '2px' }} />
          <p>$25.00</p>
          <p>To London from Lille - International Airport</p>
          <button onClick={()=>navigate('/book')}>
            <FaArrowRight />
          </button>
        </div>

        <div className="card">
        <Link to='/book'>
          <div className="image-overlay">
            <img src="https://res.cloudinary.com/dtlewbcwr/image/upload/v1738578930/lille_ckz1ay.jpg" alt="places" />
          </div>
          </Link>
          <p>Paris <FaArrowRight /> Lille</p>
          <hr style={{ height: '2px' }} />
          <p>$32.00</p>
          <p>To Lille from Paris - Roissy CDG Airport</p>
          <button onClick={()=>navigate('/book')}>
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Services;
