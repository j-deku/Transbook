import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";
import "./DriverProfile.css";
import axiosInstance from "../../../axiosInstance";

const DriverProfile = () => {
  const { url } = useContext(StoreContext);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    availability: true, // Optional field if you support availability
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get(`${url}/api/driver/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setProfile(response.data.driver);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setAvatarFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(profile).forEach((key) => {
      formData.append(key, profile[key]);
    });
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.put(`${url}/api/driver/profile`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        toast.success("Profile updated successfully");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="driver-profile">
      <h3>Update Your Profile</h3>
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label>Name</label>
          <input type="text" name="name" value={profile.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={profile.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input type="text" name="phone" value={profile.phone} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Availability</label>
          <select name="availability" value={profile.availability} onChange={handleChange}>
            <option value={true}>Available</option>
            <option value={false}>Unavailable</option>
          </select>
        </div>
        <div className="form-group">
          <label>Update Avatar (optional)</label>
          <input type="file" name="avatar" onChange={handleFileChange} accept="image/*" />
        </div>
        <button type="submit" className="btn-update">Update Profile</button>
      </form>
    </div>
  );
};

export default DriverProfile;
