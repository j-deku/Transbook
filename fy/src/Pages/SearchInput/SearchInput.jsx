import React from 'react'
import './SearchInput.css'
import SearchAvailable from '../../components/SearchAvailable/SearchAvailable'

const SearchInput = () => {
  return (
    <div className='searchInput'>
    <h1>Search Your Rides</h1>
    <SearchAvailable/>
    </div>
  )
}

export default SearchInput
