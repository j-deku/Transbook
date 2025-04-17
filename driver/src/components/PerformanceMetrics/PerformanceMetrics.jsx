import { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";
import "./PerformanceMetrics.css";
import axiosInstance from "../../../axiosInstance";

const PerformanceMetrics = () => {
  const { url } = useContext(StoreContext);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get(`${url}/api/driver/performance-metrics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setMetrics(response.data.metrics);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching performance metrics:", error.response?.data || error.message);
      toast.error("Failed to fetch performance metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return <p>Loading performance metrics...</p>;
  }

  return (
    <div className="performance-metrics">
      <h2>Performance Metrics</h2>
      {metrics ? (
        <div className="metrics-details">
          <p>
            <strong>Total Completed Rides:</strong> {metrics.totalCompleted}
          </p>
          <p>
            <strong>Average Fare per Ride:</strong> ${metrics.averageFare.toFixed(2)}
          </p>
          <p>
            <strong>Average Ride Duration:</strong>{" "}
            {metrics.averageDuration !== null
              ? `${metrics.averageDuration.toFixed(2)} minutes`
              : "N/A"}
          </p>
        </div>
      ) : (
        <p>No performance data available.</p>
      )}
    </div>
  );
};

export default PerformanceMetrics;