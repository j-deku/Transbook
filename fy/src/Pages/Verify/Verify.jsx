import react, { useContext, useEffect } from 'react'
import './Verify.css'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext';
import axiosInstance from '../../../axiosInstance';


const Verify = () => {

    const [searchParams,setSearchParams] = useSearchParams();
    const success = searchParams.get("success")
    const bookingId = searchParams.get("bookingId")
    const {url} = useContext(StoreContext);
    const navigate = useNavigate();

    const verifyPayment = async () =>{
        const response = await axiosInstance.post(url+"/api/booking/verify",{success,bookingId});
        if(response.data.success){
            navigate("/myBookings");
        }else{
            navigate("/");
        }
    }

    useEffect(()=>{
        verifyPayment();
    })
  return (
    <div className='verify'>
        <div className="spinner">

        </div>
    </div>
  )
}

export default Verify
