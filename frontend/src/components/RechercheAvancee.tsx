import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  IconButton,
  Collapse,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { StatutDossier, FiltresRecherche } from '../types';

interface RechercheAvanceeProps {
  onRecherche: (filtres: FiltresRecherche) => void;
}

const RechercheAvancee: React.FC<RechercheAvanceeProps> = ({ onRecherche }) => {
  const [expanded, setExpanded] = useState(false);
  const [filtres, setFiltres] = useState<FiltresRecherche>({});

  const handleChange = (field: keyof FiltresRecherche, value: string | Date | null) => {
    setFiltres(prev => ({
      ...prev,
      [field]: value instanceof Date ? value.toISOString() : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRecherche(filtres);
  };

  const handleReset = () => {
    setFiltres({});
    onRecherche({});
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Recherche avancée</Typography>
        <IconButton onClick={() => setExpanded(!expanded)}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  select
                  label="Statut"
                  value={filtres.statut || ''}
                  onChange={(e) => handleChange('statut', e.target.value)}
                >
                  {Object.values(StatutDossier).map((statut) => (
                    <MenuItem key={statut} value={statut}>
                      {statut}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Date début"
                  value={filtres.dateDebut ? new Date(filtres.dateDebut) : null}
                  onChange={(date) => handleChange('dateDebut', date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Date fin"
                  value={filtres.dateFin ? new Date(filtres.dateFin) : null}
                  onChange={(date) => handleChange('dateFin', date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Nom employé"
                  value={filtres.employeNom || ''}
                  onChange={(e) => handleChange('employeNom', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Prénom employé"
                  value={filtres.employePrenom || ''}
                  onChange={(e) => handleChange('employePrenom', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Nom bénéficiaire"
                  value={filtres.beneficiaireNom || ''}
                  onChange={(e) => handleChange('beneficiaireNom', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Prénom bénéficiaire"
                  value={filtres.beneficiairePrenom || ''}
                  onChange={(e) => handleChange('beneficiairePrenom', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Nom conseiller"
                  value={filtres.conseillerNom || ''}
                  onChange={(e) => handleChange('conseillerNom', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Prénom conseiller"
                  value={filtres.conseillerPrenom || ''}
                  onChange={(e) => handleChange('conseillerPrenom', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button variant="outlined" onClick={handleReset}>
                    Réinitialiser
                  </Button>
                  <Button type="submit" variant="contained">
                    Rechercher
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </LocalizationProvider>
      </Collapse>
    </Paper>
  );
};

export default RechercheAvancee;