// Dashboard.jsx
import { useContext, useEffect, useState } from "react";
import { Box, Grid, Card, CardContent, Typography, useTheme } from "@mui/material";
import { StoreContext } from "../../context/StoreContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import axiosInstance from "../../../axiosInstance";

const Dashboard = () => {
  const { url } = useContext(StoreContext);
  const theme = useTheme();

  // State for overall dashboard statistics
  const [stats, setStats] = useState({
    totalRides: 0,
    totalBookings: 0,
    totalUsers: 0,
    totalRevenue: 0,
    totalDrivers: 0,
  });

  // State for the line chart: Monthly Revenue
  const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);

  // State for the pie chart: Booking Status Distribution
  const [bookingStatusData, setBookingStatusData] = useState([]);

  // State for the bar chart: Monthly Bookings
  const [monthlyBookingsData, setMonthlyBookingsData] = useState([]);

  // Fetch overall dashboard statistics
  useEffect(() => {
    const token = localStorage.getItem("token");
    axiosInstance
      .get(`/api/admin/stats`, { withCredentials: true, headers: {
          Authorization: `Bearer ${token}`,
        }, 
      })
      .then((response) => {
        if (response.data.success && response.data.stats) {
          setStats(response.data.stats);
        } else {
          console.error("API did not return success:", response.data);
        }
      })
      .catch((error) => console.error("Error fetching stats:", error));
  }, [url]);

  // Fetch monthly revenue data for the line chart
  useEffect(() => {
    const token = localStorage.getItem("token");
    axiosInstance
      .get(`/api/admin/monthly-revenue`, { withCredentials: true, headers: {
        Authorization: `Bearer ${token}`,
      }, })
      .then((response) => {
        if (response.data.success && response.data.data) {
          // Convert numeric month to a short month label (e.g., 1 => "Jan")
          const dataWithLabels = response.data.data.map((item) => ({
            month: new Date(0, item.month - 1).toLocaleString("default", { month: "short" }),
            revenue: item.revenue,
          }));
          setMonthlyRevenueData(dataWithLabels);
        } else {
          console.error("API did not return success for monthly revenue:", response.data);
        }
      })
      .catch((error) => console.error("Error fetching monthly revenue:", error));
  }, [url]);

  // Fetch booking status distribution for the pie chart
  useEffect(() => {
    const token = localStorage.getItem("token");
    axiosInstance
      .get(`/api/admin/booking-status`, { withCredentials: true, headers: {
        Authorization: `Bearer ${token}`,
      },})
      .then((response) => {
        if (response.data.success && response.data.data) {
          setBookingStatusData(response.data.data);
        } else {
          console.error("API did not return success for booking status:", response.data);
        }
      })
      .catch((error) => console.error("Error fetching booking status:", error));
  }, [url]);

  // Fetch monthly bookings for the bar chart
  useEffect(() => {
    const token = localStorage.getItem("token");
    axiosInstance
      .get(`/api/admin/monthly-bookings`, { withCredentials: true, headers: {
        Authorization: `Bearer ${token}`,
      }, })
      .then((response) => {
        if (response.data.success && response.data.data) {
          // Convert numeric month to a short month label
          const dataWithLabels = response.data.data.map((item) => ({
            month: new Date(0, item.month - 1).toLocaleString("default", { month: "short" }),
            bookings: item.bookings,
          }));
          setMonthlyBookingsData(dataWithLabels);
        } else {
          console.error("API did not return success for monthly bookings:", response.data);
        }
      })
      .catch((error) => console.error("Error fetching monthly bookings:", error));
  }, [url]);

  // Colors for the pie chart slices
  const pieColors = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.error.main,
    theme.palette.warning.main,
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      {/* Metrics Cards */}
      <Grid container spacing={3}>
        {/* Total Rides Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              backgroundColor: theme.palette.primary.light,
              color: theme.palette.primary.contrastText,
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Rides
              </Typography>
              <Typography variant="h4">{stats.totalRides}</Typography>
            </CardContent>
          </Card>
        </Grid>

         {/* Total Driver Card */}
         <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              backgroundColor: theme.palette.primary.dark,
              color: theme.palette.primary.contrastText,
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Drivers
              </Typography>
              <Typography variant="h4">{stats.totalDrivers || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Total Bookings Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              backgroundColor: theme.palette.secondary.light,
              color: theme.palette.secondary.contrastText,
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Bookings
              </Typography>
              <Typography variant="h4">{stats.totalBookings}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Users Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              backgroundColor: theme.palette.info.light,
              color: theme.palette.info.contrastText,
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4">{stats.totalUsers}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              backgroundColor: theme.palette.success.light,
              color: theme.palette.success.contrastText,
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue
              </Typography>
              <Typography variant="h4">
                $
                {typeof stats.totalRevenue === "number"
                  ? stats.totalRevenue.toFixed(2)
                  : "0.00"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Line Chart: Monthly Revenue */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Monthly Revenue (Line Chart)
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyRevenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke={theme.palette.success.main} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* Pie Chart: Booking Status Distribution */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Booking Status Distribution (Pie Chart)
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={bookingStatusData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill={theme.palette.primary.main}
              label
            >
              {bookingStatusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>

      {/* Bar Chart: Monthly Bookings */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Monthly Bookings (Bar Chart)
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyBookingsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="bookings" fill={theme.palette.secondary.main} />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Recent Activity Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Recent Activity
        </Typography>
        <Typography variant="body1" color="text.secondary">
          (Recent activity logs and system updates will be displayed here.)
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;
