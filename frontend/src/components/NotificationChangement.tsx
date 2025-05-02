import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Snackbar
} from '@mui/material';
import { CREATE_NOTIFICATION, GET_COMPAGNIES_ASSURANCE } from '../graphql/queries';

interface NotificationChangementProps {
  dossierId: string;
  onNotificationSent?: () => void;
}

const NotificationChangement: React.FC<NotificationChangementProps> = ({ dossierId, onNotificationSent }) => {
  const [message, setMessage] = useState('');
  const [compagnieAssuranceId, setCompagnieAssuranceId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);

  const { loading: loadingCompagnies, data: compagniesData } = useQuery(GET_COMPAGNIES_ASSURANCE);
  
  const [createNotification, { loading: creating }] = useMutation(CREATE_NOTIFICATION, {
    onCompleted: () => {
      setMessage('');
      setErrorMessage('');
      setSuccessMessage('Notification envoyée avec succès à la compagnie d\'assurance');
      setOpenSuccessSnackbar(true);
      if (onNotificationSent) {
        onNotificationSent();
      }
    },
    onError: (error) => {
      setErrorMessage(`Erreur lors de l'envoi de la notification: ${error.message}`);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setErrorMessage('Veuillez saisir un message de notification');
      return;
    }
    
    if (!compagnieAssuranceId) {
      setErrorMessage('Veuillez sélectionner une compagnie d\'assurance');
      return;
    }
    
    try {
      await createNotification({
        variables: {
          input: {
            dossierId,
            message: message.trim(),
            compagnieAssuranceId
          }
        }
      });
    } catch (err) {
      // L'erreur est gérée dans onError du useMutation
    }
  };

  const handleCloseSuccessSnackbar = () => {
    setOpenSuccessSnackbar(false);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Notification de Changement de Bénéficiaire
      </Typography>
      
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      
      <Snackbar
        open={openSuccessSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSuccessSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSuccessSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Message de notification"
              multiline
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              fullWidth
              required
              disabled={creating}
              placeholder="Détails du changement de bénéficiaire..."
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth required disabled={creating || loadingCompagnies}>
              <InputLabel id="compagnie-label">Compagnie d'assurance</InputLabel>
              <Select
                labelId="compagnie-label"
                value={compagnieAssuranceId}
                onChange={(e) => setCompagnieAssuranceId(e.target.value as string)}
                label="Compagnie d'assurance"
              >
                {loadingCompagnies ? (
                  <MenuItem value="" disabled>
                    Chargement...
                  </MenuItem>
                ) : (
                  compagniesData?.compagniesAssurance.map((compagnie: any) => (
                    <MenuItem key={compagnie.id} value={compagnie.id}>
                      {compagnie.nom}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={creating || loadingCompagnies}
              startIcon={creating && <CircularProgress size={20} color="inherit" />}
            >
              {creating ? 'Envoi en cours...' : 'Envoyer la notification'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default NotificationChangement; 