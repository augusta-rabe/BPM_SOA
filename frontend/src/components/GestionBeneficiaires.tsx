import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Card,
  CardContent,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  SelectChangeEvent,
  Snackbar
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { GET_DOSSIER, UPDATE_BENEFICIAIRE } from '../graphql/queries';

interface Beneficiaire {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  relationAvecEmploye: string;
}

interface GestionBeneficiairesProps {
  employeId: string;
  dossierId?: string;
  onBeneficiaireAdded?: (beneficiaireId: string) => void;
}

const GestionBeneficiaires: React.FC<GestionBeneficiairesProps> = ({ employeId, dossierId, onBeneficiaireAdded }) => {
  const [open, setOpen] = useState(false);
  const [currentBeneficiaire, setCurrentBeneficiaire] = useState<Partial<Beneficiaire> | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { loading, error, data, refetch } = useQuery(GET_DOSSIER, {
    variables: { id: dossierId },
    skip: !dossierId,
    fetchPolicy: 'network-only'
  });

  const [updateBeneficiaire, { loading: updating }] = useMutation(UPDATE_BENEFICIAIRE, {
    onCompleted: () => {
      setSuccessMessage("Bénéficiaire mis à jour avec succès");
      handleClose();
      refetch();
    },
    onError: (error) => {
      setErrorMessage(`Erreur: ${error.message}`);
    }
  });

  const handleOpen = (beneficiaire: Beneficiaire) => {
    // Filtrer le __typename lors de la définition du bénéficiaire courant
    const { __typename, ...beneficiaireData } = beneficiaire as any;
    setCurrentBeneficiaire({
      ...beneficiaireData,
      dateNaissance: new Date(beneficiaire.dateNaissance).toISOString().split('T')[0]
    });
    setFormErrors({});
    setErrorMessage(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentBeneficiaire(null);
    setFormErrors({});
    setErrorMessage(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<string>) => {
    const name = e.target.name as string;
    const value = e.target.value as string;
    
    // Supprime l'erreur de ce champ lors de la modification
    if (formErrors[name]) {
      const newErrors = { ...formErrors };
      delete newErrors[name];
      setFormErrors(newErrors);
    }
    
    setCurrentBeneficiaire(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!currentBeneficiaire?.nom) {
      errors.nom = "Le nom est requis";
    }
    
    if (!currentBeneficiaire?.prenom) {
      errors.prenom = "Le prénom est requis";
    }
    
    if (!currentBeneficiaire?.dateNaissance) {
      errors.dateNaissance = "La date de naissance est requise";
    } else {
      const date = new Date(currentBeneficiaire.dateNaissance);
      if (isNaN(date.getTime())) {
        errors.dateNaissance = "Date de naissance invalide";
      }
    }
    
    if (!currentBeneficiaire?.relationAvecEmploye) {
      errors.relationAvecEmploye = "La relation avec l'employé est requise";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!currentBeneficiaire) return;
    if (!validateForm()) return;

    try {
      if (currentBeneficiaire.id) {
        const { id, ...inputData } = currentBeneficiaire;
        await updateBeneficiaire({
          variables: { id, input: inputData }
        });
      }
    } catch (err) {
      // Erreurs gérées par onError dans useMutation
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">Erreur: {error.message}</Alert>;
  
  // N'afficher que le bénéficiaire lié au dossier sélectionné
  const beneficiaire = data?.dossier?.beneficiaire;
  
  if (!beneficiaire) {
    return <Alert severity="info">Aucun bénéficiaire trouvé pour ce dossier</Alert>;
  }

  return (
    <Box sx={{ mt: 3 }}>
      {errorMessage && (
        <Snackbar
          open={Boolean(errorMessage)}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
            {errorMessage}
          </Alert>
        </Snackbar>
      )}
      
      {successMessage && (
        <Snackbar
          open={Boolean(successMessage)}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        </Snackbar>
      )}
      
      <Card variant="outlined">
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h6" gutterBottom>Informations du bénéficiaire</Typography>
              <Typography variant="body1"><strong>Nom:</strong> {beneficiaire.nom}</Typography>
              <Typography variant="body1"><strong>Prénom:</strong> {beneficiaire.prenom}</Typography>
              <Typography variant="body1">
                <strong>Date de naissance:</strong> {new Date(beneficiaire.dateNaissance).toLocaleDateString()}
              </Typography>
              <Typography variant="body1">
                <strong>Relation:</strong> {
                  beneficiaire.relationAvecEmploye === 'CONJOINT' ? 'Conjoint(e)' :
                  beneficiaire.relationAvecEmploye === 'ENFANT' ? 'Enfant' :
                  beneficiaire.relationAvecEmploye === 'PARENT' ? 'Parent' : 'Autre'
                }
              </Typography>
            </Box>
            <IconButton 
              onClick={() => handleOpen(beneficiaire)} 
              color="primary"
              sx={{ backgroundColor: 'rgba(25, 118, 210, 0.1)', borderRadius: '50%' }}
            >
              <EditIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      {/* Modal de modification */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Modifier le bénéficiaire</DialogTitle>
        <DialogContent>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="nom"
                label="Nom"
                fullWidth
                value={currentBeneficiaire?.nom || ''}
                onChange={handleChange}
                required
                error={Boolean(formErrors.nom)}
                helperText={formErrors.nom}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="prenom"
                label="Prénom"
                fullWidth
                value={currentBeneficiaire?.prenom || ''}
                onChange={handleChange}
                required
                error={Boolean(formErrors.prenom)}
                helperText={formErrors.prenom}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="dateNaissance"
                label="Date de naissance"
                type="date"
                fullWidth
                value={currentBeneficiaire?.dateNaissance || ''}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
                error={Boolean(formErrors.dateNaissance)}
                helperText={formErrors.dateNaissance}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={Boolean(formErrors.relationAvecEmploye)}>
                <InputLabel id="relation-label">Relation</InputLabel>
                <Select
                  labelId="relation-label"
                  name="relationAvecEmploye"
                  value={currentBeneficiaire?.relationAvecEmploye || ''}
                  onChange={handleChange}
                  label="Relation"
                >
                  <MenuItem value="CONJOINT">Conjoint(e)</MenuItem>
                  <MenuItem value="ENFANT">Enfant</MenuItem>
                  <MenuItem value="PARENT">Parent</MenuItem>
                  <MenuItem value="AUTRE">Autre</MenuItem>
                </Select>
                {formErrors.relationAvecEmploye && (
                  <Typography variant="caption" color="error">
                    {formErrors.relationAvecEmploye}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">Annuler</Button>
          <Button 
            onClick={handleSubmit} 
            color="primary" 
            variant="contained"
            disabled={updating}
          >
            {updating ? 'Enregistrement...' : 'Modifier'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GestionBeneficiaires; 