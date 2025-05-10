import { useEffect, useState, useContext } from "react";
import axiosInstance from "../../../axiosInstance"; // points to baseURL
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { StoreContext } from "../../context/StoreContext";

export default function AdminCommission() {
  const { url } = useContext(StoreContext);
  const [ratePct, setRatePct] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load current rate on mount
  useEffect(() => {
    axiosInstance
      .get(`${url}/api/admin/commission`)
      .then(({ data }) => {
        setRatePct((data.rate * 100).toFixed(1));
      })
      .catch(() => {
        setError("Failed to load commission rate.");
      })
      .finally(() => setLoading(false));
  }, [url]);

  const handleSave = () => {
    const numeric = parseFloat(ratePct) / 100;
    if (isNaN(numeric) || numeric < 0 || numeric > 1) {
      setError("Enter a valid percentage between 0 and 100.");
      return;
    }
    setSaving(true);
    setError("");

    axiosInstance.post(
      `${url}/api/admin/commission`,
      { rate: numeric }
    ).then(() => {
      alert("Commission rate updated");
    }).catch(() => {
      setError("Update failed.");
    }).finally(() => setSaving(false));
  };

  if (loading) return <CircularProgress />;

  return (
    <Box height={350} sx={{ maxWidth: 400, placeSelf:"center", mx: 'auto', mt: 5, p: 3, boxShadow: 2, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Platform Commission Rate
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="Commission (%)"
        type="number"
        inputProps={{ min:0, max:100, step:0.1 }}
        value={ratePct}
        onChange={e => setRatePct(e.target.value)}
        fullWidth
        sx={{ my: 2 }}
      />
      <Button
        variant="contained"
        onClick={handleSave}
        disabled={saving}
        fullWidth
      >
        {saving ? <CircularProgress size={20} /> : "Update Rate"}
      </Button>
    </Box>
  );
}