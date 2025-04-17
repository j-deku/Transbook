import React, { useState, useEffect, useContext } from "react";
import axiosInstance from "../../../axiosInstance";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./EarningReports.css";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const EarningReports = () => {
  const { url } = useContext(StoreContext);
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEarningsReport = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get(`${url}/api/driver/earnings-report`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setReport(response.data.report);
      } else {
        toast.error(response.data.message || "Failed to fetch earnings report");
      }
    } catch (error) {
      console.error("Error fetching earnings report:", error.response?.data || error.message);
      toast.error("Error fetching earnings report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarningsReport();
  }, []);

  // Prepare chart data (for a line chart)
  const chartData = {
    labels: report.map((item) => item._id),
    datasets: [
      {
        label: "Earnings ($)",
        data: report.map((item) => item.totalEarnings),
        borderColor: "#4caf50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        fill: true,
      },
      {
        label: "Rides",
        data: report.map((item) => item.rideCount),
        borderColor: "#2196f3",
        backgroundColor: "rgba(33, 150, 243, 0.2)",
        fill: true,
        yAxisID: "y1",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Earnings ($)" },
      },
      y1: {
        beginAtZero: true,
        position: "right",
        title: { display: true, text: "Number of Rides" },
        grid: { drawOnChartArea: false },
      },
    },
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Earnings Report - Last 30 Days" },
    },
  };

  return (
    <div className="earnings-report">
      <h2>Earnings Report</h2>
      {loading ? (
        <p>Loading report...</p>
      ) : report.length === 0 ? (
        <p>No earnings data available.</p>
      ) : (
        <>
          <div className="report-summary">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Earnings ($)</th>
                  <th>Rides</th>
                </tr>
              </thead>
              <tbody>
                {report.map((item, index) => (
                  <tr key={index}>
                    <td>{item._id}</td>
                    <td>${item.totalEarnings.toFixed(2)}</td>
                    <td>{item.rideCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="chart-container">
            <Line data={chartData} options={chartOptions} />
          </div>
        </>
      )}
    </div>
  );
};

export default EarningReports;
