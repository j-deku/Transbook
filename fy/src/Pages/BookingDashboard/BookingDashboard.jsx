import { useState } from 'react';
import './BookingDashboard.css';
import BookSideBar from '../../components/BookSide/BookSideBar';
import BookSort from '../../components/BookSort/BookSort';
import SearchRides from '../../components/SearchRides/SearchRides';
import SearchArchive from '../../components/SearchArchive/SearchArchive';
import Bot from '../../components/Bot/Bot';
import SearchAvailable from '../../components/SearchAvailable/SearchAvailable';

const BookingDashboard = () => {
  const [sortOption, setSortOption] = useState("");
  const [filterOption, setFilterOption] = useState("all");

  return (
    <div className='booking-dashboard'>
    <SearchAvailable/>
      <h1>Pickup Your Rides</h1>
      <BookSideBar onFilterChange={setFilterOption} />
      <div className='booking-grid'>
        <div className='booking-main'>
        <SearchRides sortOption={sortOption} filterOption={filterOption} />
        <SearchArchive />
        </div>
        <div className='booking-sidebar'>
          <BookSort onSortChange={setSortOption} />
        </div>
      </div>
      <Bot />
    </div>
  );
};

export default BookingDashboard;