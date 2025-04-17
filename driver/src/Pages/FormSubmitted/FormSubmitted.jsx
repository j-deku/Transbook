import React from 'react'
import './FormSubmitted.css'

const FormSubmitted = () => {
  return (
    <div className='overlay'>
    <div className='form-submitted'>
    <h1>Success! ✅</h1><br/>
    <p><em>Thanks, your form has been submitted successfully, 

    <br/>Wait for further enquiries/approval of your registration in 2-3 days. <br/><br/>

    <br/><b>*</b> Please thoroughly check your email for your updates.</em></p>
    </div>
    </div>
  )
}

export default FormSubmitted