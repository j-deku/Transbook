import React, { useEffect, useState } from "react";
import "./Header.css";
import { Link } from "react-router-dom";

const Header = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState({});
  const [fade, setFade] = useState(true); // Controls fade effect

  const slides = [
    {
      url: "/bus2.jpg",
      title: "Welcome to Transport booking platform",
      description: "Experience comfort and reliability for all your journeys.",
      gradient: "radial-gradient(circle at bottom left, rgba(12, 62, 75, 0.92) 40%, rgba(11, 59, 71, 0.92) 50%, transparent 80%)",
    },
    {
      url: "/driver2.jpg",
      title: "Book Your Ride, Get Your Receipt",
      description: "Book your ride, get your receipt, and enjoy the convenience of seamless travel bookings. Secure your transport and receive your travel receipt instantly.",
      gradient: "radial-gradient(circle at bottom left, rgba(0,0,0,0.92) 40%, rgba(0,0,0,0.7)50%, transparent 80%)",
    },
    {
      url: "/taxi.jpg",
      title: "Plan Ahead, Travel Better",
      description: "Secure your seat today and enjoy a hassle-free trip.",
      gradient: "radial-gradient(circle at bottom left, rgba(11, 39, 75, 0.94) 40%, rgba(22, 65, 105, 0.6)50%, transparent 80%)",
    },
    {
      url: "/traveler4.jpg",
      title: "Journey to Your Destination",
      description: "Quick and convenient transport booking at your fingertips.",
      gradient: "radial-gradient(circle at bottom left, rgba(0,0,0,0.92) 40%, rgba(0,0,0,0.6)50%, transparent 80%)",
    },
    {
      url: "/travelers.jpg",
      title: "Plan Ahead, Travel Better",
      description: "Secure your seat today and enjoy a hassle-free trip.",
      gradient: "radial-gradient(circle at bottom left, rgba(0,0,0,0.92) 40%, rgba(0,0,0,0.7)50%, transparent 70%)",
    },
  ];

  // **Preload images** to prevent flickering and blank slides
  useEffect(() => {
    slides.forEach(({ url }) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        setLoadedImages((prev) => ({ ...prev, [url]: true }));
      };
      img.onerror = (error) => {
        console.error(`Error loading image: ${url}`, error);
      };
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
        setFade(true);
      }, 300); // Short delay for fade-out effect
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex(index);
      setFade(true);
    }, 300);
  };

  const currentSlide = slides[currentIndex];

  return (
    <div
      className={`header ${fade ? "fade-in" : "fade-out"}`}
      style={{
        backgroundImage: loadedImages[currentSlide.url]
          ? `${currentSlide.gradient}, url(${currentSlide.url})`
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        transition: "opacity 0.8s ease-in-out",
      }}
    >
      <div className="header-content">
        <h2>{currentSlide.title}</h2>
        <Link to="/searchRides">
          <button>
            <div className="arrow"></div> Book Now
          </button>
        </Link>
        <p>{currentSlide.description}</p>
      </div>

      <button className="prev-btn" onClick={() => goToSlide((currentIndex - 1 + slides.length) % slides.length)}>
        ❮
      </button>
      <button className="next-btn" onClick={() => goToSlide((currentIndex + 1) % slides.length)}>
        ❯
      </button>

      <div className="dots">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`dot ${currentIndex === index ? "active" : ""}`}
            onClick={() => goToSlide(index)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default Header;
