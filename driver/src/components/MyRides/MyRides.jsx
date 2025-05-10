// src/pages/driver/MyRides.jsx
import React, { useEffect, useState, useContext, useCallback } from "react";
import { Box, Button, Dialog, DialogTitle, DialogActions, Typography } from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { StoreContext } from "../../context/StoreContext";

const MyRides = () => {
  const { url } = useContext(StoreContext);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [rideToDelete, setRideToDelete] = useState(null);
  const navigate = useNavigate();

  const fetchRides = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${url}/api/driver/rides`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRides(
        data.rides.map(r => ({
          id: r._id,
          pickup: r.pickup,
          destination: r.destination,
          time: r.selectedTime,
        }))
      );
    } catch (error) {
      console.error("Error fetching rides:", error);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => { fetchRides(); }, [fetchRides]);

  const confirmDelete = id => { setRideToDelete(id); setOpenDialog(true); };
  const handleDelete = async () => {
    if (!rideToDelete) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${url}/api/driver/rides/${rideToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRides(prev => prev.filter(r => r.id !== rideToDelete));
    } catch (error) {
      console.error("Error deleting ride:", error);
    } finally {
      setOpenDialog(false);
      setRideToDelete(null);
    }
  };

  const columns = [
    {
      field: "route",
      headerName: "Route",
      flex: 1.5,
      sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', whiteSpace: 'normal', lineHeight: 1.4 }}>
          <Typography variant="body2">{row.pickup}</Typography>
          <Typography variant="body2" sx={{ fontWeight: 'fontWeightMedium', color: 'text.secondary' }}>
            → {row.destination}
          </Typography>
        </Box>
      ),
    },
    { field: "time", headerName: "Time", width: 110 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      getActions: ({ id }) => [
        <GridActionsCellItem
          key="view"
          icon={<Button onClick={() => navigate(`/ride-details/${id}`)} variant="text">View</Button>}
          label="View Details"
          showInMenu={false}
        />,
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Edit"
          onClick={() => navigate(`/edit-ride/${id}`)}
          showInMenu={false}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => confirmDelete(id)}
          showInMenu={false}
        />
      ],
    },
  ];

  return (
    <Box sx={{ height: 500, width: '100%', mt: 4 }}>
      <DataGrid
        rows={rides}
        columns={columns}
        loading={loading}
        pageSize={pageSize}
        rowsPerPageOptions={[5, 10]}
        onPageSizeChange={setPageSize}
        pagination
        disableSelectionOnClick
        rowHeight={64}
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

