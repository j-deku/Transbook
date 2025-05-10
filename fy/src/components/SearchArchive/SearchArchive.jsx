// SearchArchive.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Card,
  CardContent,
} from "@mui/material";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const SearchArchive = () => {
  const [archives, setArchives] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("searchArchives");
    if (stored) {
      try {
        const all = JSON.parse(stored);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcoming = all.filter(({ selectedDate }) => {
          const d = new Date(selectedDate);
          d.setHours(0, 0, 0, 0);
          return d >= today;
        });
        setArchives(upcoming);
      } catch (err) {
        console.error("Error reading archives", err);
      }
    }
  }, []);

  const handleClick = (archive) => {
    navigate("/searchRides", { state: archive });
  };

  if (!archives.length) {
    return (
      <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2, textAlign: 'center' }}>
        <CardContent>
          <Typography variant="h6" color="textSecondary">
            You have no recent searches.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <hr style={{ borderBottom: '1px solid #ccc', marginBottom: '16px' }} />
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Your Recent Searches
      </Typography>
      <List>
        {archives.map((archive, i) => (
          <React.Fragment key={i}>
            <ListItemButton onClick={() => handleClick(archive)}>
              <ListItemText
                primary={
                  <Typography variant="subtitle1">
                    {archive.pickup} &rarr; {archive.destination}
                  </Typography>
                }
                secondary={
                  <>
                    <AccessTimeIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                    {new Date(archive.selectedDate).toLocaleDateString()}
                    {' — '} 
                    <LocationOnIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                    {archive.passengers} Passenger{archive.passengers > 1 ? 's' : ''}
                  </>
                }
              />
            </ListItemButton>
            {i < archives.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Box>
    <Box sx={{ textAlign: 'center', mt: 2 }}>
      <Typography variant="body2" color="textSecondary">
        Click on a search to view details or modify it.
      </Typography>
    </Box>
    <hr style={{ borderBottom: '1px solid #ccc', marginTop: '16px' }} />
    </>
  );
};

export default SearchArchive;
