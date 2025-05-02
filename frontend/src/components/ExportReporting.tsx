import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';

interface ExportReportingProps {
  onExport: (format: string, dateDebut: string, dateFin: string) => Promise<void>;
}

const ExportReporting: React.FC<ExportReportingProps> = ({ onExport }) => {
  const [format, setFormat] = useState('pdf');
  const [dateDebut, setDateDebut] = useState<Date | null>(null);
  const [dateFin, setDateFin] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    if (!dateDebut || !dateFin) {
      setError('Veuillez sélectionner une période');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onExport(format, dateDebut.toISOString(), dateFin.toISOString());
    } catch (err) {
      setError('Erreur lors de l\'export');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getFormatIcon = () => {
    switch (format) {
      case 'pdf':
        return <PictureAsPdfIcon />;
      case 'excel':
        return <DescriptionIcon />;
      default:
        return <DownloadIcon />;
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Export et Reporting
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            select
            label="Format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            <MenuItem value="pdf">PDF</MenuItem>
            <MenuItem value="excel">Excel</MenuItem>
          </TextField>
        </Grid>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid item xs={12} sm={4}>
            <DatePicker
              label="Date début"
              value={dateDebut}
              onChange={setDateDebut}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <DatePicker
              label="Date fin"
              value={dateFin}
              onChange={setDateFin}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
        </LocalizationProvider>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={getFormatIcon()}
              onClick={handleExport}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Exporter'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ExportReporting;