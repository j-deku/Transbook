import React, { useState } from 'react'
import './FirstQuestion.css'
import {Navigate} from 'react-router-dom'
const FirstQuestion = () => {
        const submitAnswer1 = (event) =>{
            event.preventDefault();
            localStorage.setItem("dr", "Driver");
            window.location.href = 'http://localhost:5175';
        }
        const submitAnswer2 = (event) =>{
            event.preventDefault();
            localStorage.setItem("Tr", "traveller");
            window.location.href = '/';
        }
  return (
    <div className='overlay'>
    <form>
      <div className='form-question'>
        <h3>Answer the following questions to proceed</h3>
        <h1>Are you a driver or a traveller</h1>
        <button type='submit' onClick={submitAnswer1}>I'm  a Driver</button>
        <button type='submit' onClick={submitAnswer2}>I'm a traveller</button>
      </div>
    </form>
    </div>
  )
}

export default FirstQuestion
