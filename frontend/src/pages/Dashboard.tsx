import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActionArea,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { 
  Folder as FolderIcon, 
  EditNote as EditNoteIcon,
  Business as BusinessIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { GET_DOSSIERS } from '../graphql/queries';
import { Dossier, StatutDossier } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [statistiques, setStatistiques] = useState({
    totalDossiers: 0,
    dossiersEnCours: 0,
    dossiersEnAttente: 0,
    dossiersTermines: 0,
    dossiersAnnules: 0
  });

  const { loading, error, data } = useQuery(GET_DOSSIERS);

  useEffect(() => {
    if (data?.dossiers) {
      const dossiers = data.dossiers;
      setStatistiques({
        totalDossiers: dossiers.length,
        dossiersEnCours: dossiers.filter((d: any) => d.statut === 'EN_COURS').length,
        dossiersEnAttente: dossiers.filter((d: any) => d.statut === 'EN_ATTENTE').length,
        dossiersTermines: dossiers.filter((d: any) => d.statut === 'TERMINE').length,
        dossiersAnnules: dossiers.filter((d: any) => d.statut === 'ANNULE').length
      });
    }
  }, [data]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        Erreur lors du chargement des données: {error.message}
      </Alert>
    );
  }

  const actions = [
    {
      title: 'Employés',
      description: 'Gérez les employés de l\'entreprise.',
      icon: <PeopleIcon fontSize="large" color="primary" />,
      path: '/employes'
    },
    {
      title: 'Gestion des Dossiers',
      description: 'Consultez et gérez tous les dossiers de changement de bénéficiaires.',
      icon: <FolderIcon fontSize="large" color="primary" />,
      path: '/dossiers'
    },
    {
      title: 'Mise à jour Bénéficiaire',
      description: 'Procédez à la mise à jour d\'un bénéficiaire conformément au processus BPM.',
      icon: <EditNoteIcon fontSize="large" color="primary" />,
      path: '/mise-a-jour-beneficiaire'
    },
    {
      title: 'Interface Compagnie d\'Assurance',
      description: 'Accédez à l\'interface réservée aux compagnies d\'assurance.',
      icon: <BusinessIcon fontSize="large" color="primary" />,
      path: '/compagnie-assurance'
    }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Tableau de Bord
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h5" color="primary">
              {statistiques.totalDossiers}
            </Typography>
            <Typography variant="body1">Total des dossiers</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center', height: '100%', bgcolor: '#e3f2fd' }}>
            <Typography variant="h5" color="primary">
              {statistiques.dossiersEnCours}
            </Typography>
            <Typography variant="body1">Dossiers en cours</Typography>
          </Paper>
        </Grid>        
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center', height: '100%', bgcolor: '#fff8e1' }}>
            <Typography variant="h5" color="warning.main">
              {statistiques.dossiersEnAttente}
            </Typography>
            <Typography variant="body1">Dossiers en attente</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center', height: '100%', bgcolor: '#e8f5e9' }}>
            <Typography variant="h5" color="success.main">
              {statistiques.dossiersTermines}
            </Typography>
            <Typography variant="body1">Dossiers terminés</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center', height: '100%', bgcolor: '#ffcdd2' }}>
            <Typography variant="h5" color="error.main">
              {statistiques.dossiersAnnules}
            </Typography>
            <Typography variant="body1">Dossiers annulés</Typography>
          </Paper>
        </Grid>
      </Grid>
      
      <Typography variant="h5" gutterBottom>
        Actions rapides
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        {actions.map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardActionArea onClick={() => navigate(action.path)} sx={{ flexGrow: 1 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    {action.icon}
                  </Box>
                  <Typography variant="h6" component="div" align="center" gutterBottom>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {action.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
              <CardActions>
                <Button size="small" color="primary" onClick={() => navigate(action.path)} fullWidth>
                  Accéder
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard; 