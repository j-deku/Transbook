import React, { useEffect, useState, useContext, useCallback } from "react";
import { Box, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";

export default function MyRides() {
  const { url } = useContext(StoreContext);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  // Fetch the driver’s rides from backend
  const fetchRides = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const resp = await axios.get(`${url}/api/driver/rides`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("🚀 rides from server:", resp.data.rides);
      setRides(
        resp.data.rides.map((ride) => ({
          id: ride._id,
          pickup: ride.pickup,
          destination: ride.destination,
          date: ride.selectedDate,
          time: ride.selectedTime,
          price: ride.price,
          currency: ride.currency,
          seats: ride.passengers,
          type: ride.type,
          status: ride.status,
        }))
      );
    } catch (err) {
      console.error("Error fetching rides:", err);
    } finally {
      setLoading(false);
    }
  }, [url]);

  // Initial load & refresh after creation
  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  // Define columns for the grid
  const columns = [
    { field: "pickup", headerName: "Pickup", flex: 1 },
    { field: "destination", headerName: "Destination", flex: 1 },
    { field: "date", headerName: "Date", width: 110 },
    { field: "time", headerName: "Time", width: 100 },
    {
      field: "price",
      headerName: "Price",
      width: 130,
      renderCell: (params) => {
        const { price, currency } = params.row;
        if (price == null) return "";
        // Always show price, prefix with currency if available
        const formattedPrice = parseFloat(price).toFixed(2);
        return currency
          ? `${currency} ${formattedPrice}`
          : formattedPrice;
      },
    },
    { field: "seats", headerName: "Seats", width: 100 },
    { field: "type", headerName: "Type", width: 120 },
    { field: "status", headerName: "Status", width: 120 },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      renderCell: ({ row }) => (
        <Button
          size="small"
          onClick={() => window.location.href = `/driver/edit-ride/${row.id}`}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ height: 600, width: "100%", mt: 4 }}>
      <DataGrid
        rows={rides}
        columns={columns}
        loading={loading}
        pageSize={pageSize}
        rowsPerPageOptions={[5, 10, 20]}
        onPageSizeChange={(newSize) => setPageSize(newSize)}
        pagination
        disableSelectionOnClick
      />
    </Box>
  );
}
