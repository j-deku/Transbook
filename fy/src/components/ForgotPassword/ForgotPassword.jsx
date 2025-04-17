import { useContext, useState } from "react";
import axios from "axios";
import "./ForgotPassword.css";
import { useNavigate } from 'react-router-dom'
import { FaArrowCircleLeft } from 'react-icons/fa'
import { StoreContext } from "../../context/StoreContext";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { url } = useContext(StoreContext);
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${url}/api/user/forgot-password`, { email });
      setMessage(res.data.message);
    } catch (error) {
      setMessage("Error: " + (error.response?.data.message || "Something went wrong"));
    }

    setLoading(false);
  };

  return (
    <div className="overlay">
      <FaArrowCircleLeft style={{width:40, height:40, float:"left", margin:40, cursor:"pointer"}} onClick={()=>navigate('/')}/>
      <div className="container">
        <h2>Forgot Password</h2>
        <p>Enter your email to receive a password reset link.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            className="input-field"
            placeholder="Enter your admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        {message && <p className="message" style={{fontWeight:"bold", color:"green"}}>{message}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;