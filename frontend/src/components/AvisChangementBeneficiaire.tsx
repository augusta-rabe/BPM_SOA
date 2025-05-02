import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import { GET_NOTIFICATIONS_BY_COMPAGNIE, GET_DOSSIER } from '../graphql/queries';
import { Email as EmailIcon, Print as PrintIcon } from '@mui/icons-material';

interface AvisChangementBeneficiaireProps {
  compagnieId: string;
}

const AvisChangementBeneficiaire: React.FC<AvisChangementBeneficiaireProps> = ({ compagnieId }) => {
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dossierDetails, setDossierDetails] = useState<any>(null);
  const [loadingDossier, setLoadingDossier] = useState(false);

  const { loading, error, data, refetch } = useQuery(GET_NOTIFICATIONS_BY_COMPAGNIE, {
    variables: { compagnieId },
    fetchPolicy: 'network-only'
  });

  const { loading: loadingDossierQuery, data: dossierData } = useQuery(GET_DOSSIER, {
    variables: { id: selectedNotification?.dossier?.id || '' },
    skip: !selectedNotification?.dossier?.id,
    onCompleted: (data) => {
      if (data?.dossier) {
        setDossierDetails(data.dossier);
      }
    }
  });

  useEffect(() => {
    if (selectedNotification?.dossier?.id) {
      setLoadingDossier(loadingDossierQuery);
    }
  }, [loadingDossierQuery, selectedNotification]);

  const handleOpenDetails = (notification: any) => {
    setSelectedNotification(notification);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handlePrintAvis = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const employe = dossierDetails?.employe;
    const beneficiaire = dossierDetails?.beneficiaire;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Avis de Changement de Bénéficiaire</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; color: #303f9f; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 20px; }
          .section h3 { border-bottom: 1px solid #ccc; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; }
          table, th, td { border: 1px solid #ccc; }
          th, td { padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .footer { margin-top: 50px; text-align: center; font-size: 0.9em; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Avis de Changement de Bénéficiaire</h1>
          <p>Date: ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="section">
          <h3>Détails de la Notification</h3>
          <p><strong>Date:</strong> ${new Date(selectedNotification?.date).toLocaleString()}</p>
          <p><strong>Message:</strong> ${selectedNotification?.message}</p>
        </div>

        <div class="section">
          <h3>Employé</h3>
          <p><strong>Nom:</strong> ${employe?.nom || ''}</p>
          <p><strong>Prénom:</strong> ${employe?.prenom || ''}</p>
          <p><strong>Email:</strong> ${employe?.email || ''}</p>
        </div>

        <div class="section">
          <h3>Bénéficiaire</h3>
          <table>
            <tr>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Date de naissance</th>
              <th>Relation</th>
            </tr>
            <tr>
              <td>${beneficiaire?.nom || ''}</td>
              <td>${beneficiaire?.prenom || ''}</td>
              <td>${beneficiaire ? new Date(beneficiaire.dateNaissance).toLocaleDateString() : ''}</td>
              <td>${beneficiaire?.relationAvecEmploye || ''}</td>
            </tr>
          </table>
        </div>

        <div class="footer">
          <p>Ce document est un avis officiel de changement de bénéficiaire.</p>
          <p>© ${new Date().getFullYear()} Service RH - Tous droits réservés</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        Erreur: {error.message}
      </Alert>
    );
  }

  const notifications = data?.notificationsByCompagnie || [];

  return (
    <Box sx={{ mt: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Avis de Changement de Bénéficiaire
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        {notifications.length === 0 ? (
          <Alert severity="info">
            Aucun avis de changement de bénéficiaire disponible
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Dossier</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notifications.map((notification: any) => (
                  <TableRow key={notification.id}>
                    <TableCell>{new Date(notification.date).toLocaleString()}</TableCell>
                    <TableCell>
                      {notification.message.length > 50
                        ? `${notification.message.substring(0, 50)}...`
                        : notification.message}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`Dossier #${notification.dossier.id.substring(0, 8)}`} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => handleOpenDetails(notification)}
                        variant="outlined"
                      >
                        Détails
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Détails de l'Avis de Changement
        </DialogTitle>
        <DialogContent dividers>
          {loadingDossier ? (
            <Box display="flex" justifyContent="center" my={2}>
              <CircularProgress />
            </Box>
          ) : (
            dossierDetails && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Notification
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Date:</strong> {new Date(selectedNotification?.date).toLocaleString()}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Message:</strong> {selectedNotification?.message}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" gutterBottom>
                    Employé
                  </Typography>
                  <Typography variant="body1">
                    <strong>Nom:</strong> {dossierDetails.employe.nom}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Prénom:</strong> {dossierDetails.employe.prenom}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Email:</strong> {dossierDetails.employe.email}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" gutterBottom>
                    Bénéficiaire
                  </Typography>
                  <Typography variant="body1">
                    <strong>Nom:</strong> {dossierDetails.beneficiaire.nom}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Prénom:</strong> {dossierDetails.beneficiaire.prenom}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Date de naissance:</strong> {new Date(dossierDetails.beneficiaire.dateNaissance).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Relation:</strong> {dossierDetails.beneficiaire.relationAvecEmploye}
                  </Typography>
                </Grid>
              </Grid>
            )
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            color="inherit"
          >
            Fermer
          </Button>
          <Button
            startIcon={<EmailIcon />}
            color="primary"
            onClick={() => {/* TODO: Implémenter l'envoi d'email */}}
            disabled={loadingDossier || !dossierDetails}
          >
            Envoyer par email
          </Button>
          <Button
            startIcon={<PrintIcon />}
            variant="contained"
            color="primary"
            onClick={handlePrintAvis}
            disabled={loadingDossier || !dossierDetails}
          >
            Imprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AvisChangementBeneficiaire; 