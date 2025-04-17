import { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./EarningsSummary.css";
import axiosInstance from "../../../axiosInstance";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const EarningsSummary = () => {
  const { url } = useContext(StoreContext);
  const [earnings, setEarnings] = useState({ today: 0, week: 0, month: 0 });
  const [loading, setLoading] = useState(true);

  const fetchEarnings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get(`${url}/api/driver/earnings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setEarnings(response.data.earnings);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching earnings:", error.response?.data || error.message);
      toast.error("Failed to fetch earnings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  // Prepare data for the chart
  const data = {
    labels: ["Today", "Week", "Month"],
    datasets: [
      {
        label: "Earnings ($)",
        data: [earnings.today, earnings.week, earnings.month],
        backgroundColor: ["#4caf50", "#2196f3", "#ff9800"],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Earnings Summary",
      },
    },
  };

  if (loading) {
    return <p>Loading earnings...</p>;
  }

  return (
    <div className="earnings-summary">
      <h2>Earnings Summary</h2>
      <div className="earnings-details">
        <p><strong>Today's Earnings:</strong> ${earnings.today.toFixed(2)}</p>
        <p><strong>This Week's Earnings:</strong> ${earnings.week.toFixed(2)}</p>
        <p><strong>This Month's Earnings:</strong> ${earnings.month.toFixed(2)}</p>
      </div>
      <div className="earnings-chart">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default EarningsSummary;