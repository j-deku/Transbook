import React, { useEffect, useState, useContext, useCallback } from "react";
import { Box, Button, Dialog, DialogTitle, DialogActions } from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";

const MyRides = () => {
  const { url } = useContext(StoreContext);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [rideToDelete, setRideToDelete] = useState(null);

  const fetchRides = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${url}/api/driver/rides`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRides(
        data.rides.map((ride) => ({
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
    } catch (error) {
      console.error("Error fetching rides:", error);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  // Open confirmation dialog
  const confirmDelete = (id) => {
    setRideToDelete(id);
    setOpenDialog(true);
  };

  // Delete ride and update state
  const handleDelete = async () => {
    if (!rideToDelete) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${url}/api/driver/rides/${rideToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRides((prev) => prev.filter((r) => r.id !== rideToDelete));
    } catch (error) {
      console.error("Error deleting ride:", error);
    } finally {
      setOpenDialog(false);
      setRideToDelete(null);
    }
  };

  const columns = [
    { field: "pickup", headerName: "Pickup", flex: 1 },
    { field: "destination", headerName: "Destination", flex: 1 },
    { field: "date", headerName: "Date", width: 110 },
    { field: "time", headerName: "Time", width: 100 },
    {
      field: "price",
      headerName: "Price",
      width: 130,
      renderCell: ({ row }) => {
        const { price, currency } = row;
        if (price == null) return "";
        const formatted = parseFloat(price).toFixed(2);
        return currency ? `${currency} ${formatted}` : formatted;
      },
    },
    { field: "seats", headerName: "Seats", width: 100 },
    { field: "type", headerName: "Type", width: 120 },
    { field: "status", headerName: "Status", width: 120 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => window.location.href = `/driver/edit-ride/${params.id}`}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => confirmDelete(params.id)}
          showInMenu={false}
        />
      ],
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%', mt: 4 }}>
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

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyRides;