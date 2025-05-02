import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  Snackbar
} from '@mui/material';
import { CREATE_COURRIER_CONFIRMATION, GET_DOSSIER } from '../graphql/queries';

interface CourrierConfirmationProps {
  dossierId: string;
  beneficiaireId?: string;
  onCourrierSent?: () => void;
}

const CourrierConfirmation: React.FC<CourrierConfirmationProps> = ({ 
  dossierId, 
  beneficiaireId,
  onCourrierSent 
}) => {
  const [contenu, setContenu] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [contenuGenere, setContenuGenere] = useState(false);

  const { loading: loadingDossier, data: dossierData } = useQuery(GET_DOSSIER, {
    variables: { id: dossierId },
    skip: !dossierId
  });

  const [createCourrierConfirmation, { loading: creating }] = useMutation(CREATE_COURRIER_CONFIRMATION, {
    onCompleted: () => {
      setSuccessMessage('Courrier de confirmation envoyé avec succès');
      setOpenSuccessSnackbar(true);
      if (onCourrierSent) {
        onCourrierSent();
      }
    },
    onError: (error) => {
      setErrorMessage(`Erreur lors de l'envoi du courrier: ${error.message}`);
    }
  });

  useEffect(() => {
    if (dossierData?.dossier && !contenuGenere) {
      const dossier = dossierData.dossier;
      const employe = dossier.employe;
      const beneficiaire = dossier.beneficiaire;
      
      if (employe && beneficiaire) {
        const contenuTemplate = `
Cher/Chère ${employe.prenom} ${employe.nom},

Nous confirmons la mise à jour des informations concernant votre bénéficiaire dans notre système.

Détails du bénéficiaire :
- Nom : ${beneficiaire.nom}
- Prénom : ${beneficiaire.prenom}
- Date de naissance : ${new Date(beneficiaire.dateNaissance).toLocaleDateString()}
- Relation : ${beneficiaire.relationAvecEmploye}

Ce changement a été enregistré dans notre système et a été communiqué à votre compagnie d'assurance.

Si vous avez des questions ou si vous constatez une erreur dans les informations ci-dessus, veuillez nous contacter dans les plus brefs délais.

Cordialement,
Service des Ressources Humaines
`;
        setContenu(contenuTemplate);
        setContenuGenere(true);
      }
    }
  }, [dossierData, contenuGenere]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contenu.trim()) {
      setErrorMessage('Veuillez rédiger le contenu du courrier');
      return;
    }
    
    try {
      await createCourrierConfirmation({
        variables: {
          input: {
            dossierId,
            contenu: contenu.trim()
          }
        }
      });
    } catch (err) {
      // L'erreur est gérée dans onError du useMutation
    }
  };

  const handleContenuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContenu(e.target.value);
  };

  const handleCloseSuccessSnackbar = () => {
    setOpenSuccessSnackbar(false);
  };

  if (loadingDossier) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Courrier de Confirmation
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
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
              label="Contenu du courrier"
              multiline
              rows={10}
              value={contenu}
              onChange={handleContenuChange}
              fullWidth
              required
              disabled={creating}
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={creating || !contenu.trim()}
              startIcon={creating && <CircularProgress size={20} color="inherit" />}
            >
              {creating ? 'Envoi en cours...' : 'Envoyer le courrier de confirmation'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default CourrierConfirmation; 