import { useContext, useEffect, useState } from "react";
import "./Lists.css";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import axiosInstance from "../../../axiosInstance";

const Lists = () => {
  const [list, setList] = useState([]);

  const {url} = useContext(StoreContext)

  const fetchList = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get(`/api/admin/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });      
      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error("Error fetching ride list");
      }
    } catch (error) {
      console.error("Error fetching ride list:", error);
      toast.error("Error fetching ride list");
    }
  };

  const removeRide = async (rideId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.post(`/api/admin/remove`, { id: rideId}, {headers:{ "Authorization": `Bearer ${token}` }});
      if (response.data.success) {
        toast.success(response.data.message);
        fetchList();
      } else {
        toast.error("Failed to remove ride");
      }
    } catch (error) {
      console.error("Error removing ride:", error);
      toast.error("Error removing ride");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="list add flex-col">
      <h1>All Ride Lists</h1>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Driver</b>
          <b>Ride</b>
          <b>Pickup</b>
          <b>Destination</b>
          <b>Time</b>
          <b>Price ($)</b>
          <b>Date</b>
          <b>Passengers</b>
          <b>Action</b>
        </div>
        {list.map((ride, index) => (
          <div key={index} className="list-table-format">
            <img 
              src={ride.imageUrl || assets.placeholder} 
              alt="Ride" 
              className="ride-image"
            /> 
            <p>{ride.type}</p>
            <p>{ride.pickup}</p>
            <p>{ride.destination}</p>
            <p>{ride.selectedTime}</p>
            <p>{ride.price}</p>
            <p>{new Date(ride.selectedDate).toLocaleDateString()}</p>
            <p>{ride.passengers}</p>
            <p onClick={() => removeRide(ride._id)} className="cursor">
              <img src={assets.trash} alt="delete" />
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Lists;
