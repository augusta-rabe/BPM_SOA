import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
  TextField,
  Button,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  IconButton,
  ListItemSecondaryAction,
  Tooltip,
  Card,
  CardContent,
  Snackbar
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { 
  GET_COMPAGNIES_ASSURANCE, 
  CREATE_COMPAGNIE_ASSURANCE, 
  UPDATE_COMPAGNIE_ASSURANCE, 
  DELETE_COMPAGNIE_ASSURANCE 
} from '../graphql/queries';
import AvisChangementBeneficiaire from '../components/AvisChangementBeneficiaire';
import { CompagnieAssurance } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

enum DialogMode {
  CREATE = 'CREATE',
  EDIT = 'EDIT'
}

const InterfaceCompagnieAssurance: React.FC = () => {
  const { id: compagnieId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>(DialogMode.CREATE);
  const [formValues, setFormValues] = useState({
    nom: '',
    email: ''
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [compagnieToDelete, setCompagnieToDelete] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const { loading, error, data, refetch } = useQuery(GET_COMPAGNIES_ASSURANCE);
  
  const [createCompagnieAssurance, { loading: creating }] = useMutation(CREATE_COMPAGNIE_ASSURANCE, {
    onCompleted: (data) => {
      setOpenDialog(false);
      refetch();
      setSnackbarMessage('Compagnie d\'assurance créée avec succès');
      setSnackbarOpen(true);
      
      // Rediriger vers la nouvelle compagnie créée
      if (data?.createCompagnieAssurance?.id) {
        navigate(`/compagnie-assurance/${data.createCompagnieAssurance.id}`);
      }
    },
    onError: (error) => {
      setErrorMessage(`Erreur lors de la création: ${error.message}`);
    }
  });

  const [updateCompagnieAssurance, { loading: updating }] = useMutation(UPDATE_COMPAGNIE_ASSURANCE, {
    onCompleted: () => {
      setOpenDialog(false);
      refetch();
      setSnackbarMessage('Compagnie d\'assurance mise à jour avec succès');
      setSnackbarOpen(true);
    },
    onError: (error) => {
      setErrorMessage(`Erreur lors de la mise à jour: ${error.message}`);
    }
  });

  const [deleteCompagnieAssurance, { loading: deleting }] = useMutation(DELETE_COMPAGNIE_ASSURANCE, {
    onCompleted: () => {
      setOpenDeleteDialog(false);
      refetch();
      setSnackbarMessage('Compagnie d\'assurance supprimée avec succès');
      setSnackbarOpen(true);
      
      if (compagnieId === compagnieToDelete) {
        // Si on supprime la compagnie active, rediriger vers la liste
        navigate('/compagnies-assurance');
      }
    },
    onError: (error) => {
      setErrorMessage(`Erreur lors de la suppression: ${error.message}`);
      setOpenDeleteDialog(false);
    }
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleDialogOpen = (mode: DialogMode, compagnie?: CompagnieAssurance) => {
    setDialogMode(mode);
    
    if (mode === DialogMode.CREATE) {
      setFormValues({
        nom: '',
        email: ''
      });
    } else if (mode === DialogMode.EDIT && compagnie) {
      setFormValues({
        nom: compagnie.nom || '',
        email: compagnie.email || ''
      });
    }
    
    setOpenDialog(true);
    setErrorMessage('');
  };
  
  const handleDialogClose = () => {
    setOpenDialog(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };
  
  const handleSubmit = async () => {
    if (!formValues.nom) {
      setErrorMessage('Le nom de la compagnie est requis');
      return;
    }

    if (!formValues.email) {
      setErrorMessage('L\'email de la compagnie est requis');
      return;
    }
    
    // Validation simple de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formValues.email)) {
      setErrorMessage('Veuillez entrer une adresse email valide');
      return;
    }
    
    try {
      if (dialogMode === DialogMode.CREATE) {
        await createCompagnieAssurance({
          variables: {
            input: formValues
          }
        });
      } else {
        await updateCompagnieAssurance({
          variables: {
            id: compagnieId,
            input: formValues
          }
        });
      }
    } catch (err) {
      // L'erreur est gérée dans onError
    }
  };
  
  const handleDeleteClick = (id: string) => {
    setCompagnieToDelete(id);
    setOpenDeleteDialog(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!compagnieToDelete) return;
    
    try {
      await deleteCompagnieAssurance({
        variables: {
          id: compagnieToDelete
        }
      });
    } catch (err) {
      // L'erreur est gérée dans onError
    }
  };
  
  const handleCompagnieSelect = (id: string) => {
    navigate(`/compagnie-assurance/${id}`);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Une erreur est survenue: {error.message}
        </Alert>
      </Container>
    );
  }

  // Si l'ID de la compagnie est fourni, utiliser celui-là, sinon prendre la première compagnie
  const compagnies = data?.compagniesAssurance || [];
  const compagnieActive = compagnieId 
    ? compagnies.find((c: any) => c.id === compagnieId) 
    : compagnies[0];

  if (!compagnieActive) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">
              Compagnies d'Assurance
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => handleDialogOpen(DialogMode.CREATE)}
            >
              Nouvelle Compagnie
            </Button>
          </Box>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Aucune compagnie d'assurance n'est enregistrée. Vous pouvez en ajouter une nouvelle.
          </Alert>
          
          <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
            <DialogTitle>Ajouter une nouvelle compagnie d'assurance</DialogTitle>
            <DialogContent>
              {errorMessage && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errorMessage}
                </Alert>
              )}
              <Box component="form" sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="nom"
                  label="Nom de la compagnie"
                  name="nom"
                  value={formValues.nom}
                  onChange={handleInputChange}
                  autoFocus
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email de la compagnie"
                  name="email"
                  type="email"
                  value={formValues.email}
                  onChange={handleInputChange}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose} color="inherit">Annuler</Button>
              <Button 
                onClick={handleSubmit} 
                color="primary" 
                variant="contained"
                disabled={creating}
              >
                {creating ? 'Création...' : 'Créer'}
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Container>
    );
  }

  return (
    <div className='container-fluid mt-5'>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, mb: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Compagnies
              </Typography>
              <IconButton sx={{ backgroundColor: 'primary.main', color: 'white', '&:hover': { backgroundColor: 'primary.dark' } }} onClick={() => handleDialogOpen(DialogMode.CREATE)}>
                <AddIcon />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <List>
              {compagnies.map((compagnie: CompagnieAssurance) => (
                <ListItem 
                  button 
                  key={compagnie.id}
                  selected={compagnie.id === compagnieActive.id}
                  onClick={() => handleCompagnieSelect(compagnie.id)}
                >
                  <ListItemText 
                    primary={compagnie.nom} 
                    secondary={compagnie.email}
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Supprimer">
                      <IconButton 
                        edge="end" 
                        aria-label="supprimer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(compagnie.id);
                        }}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, mb: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h4" gutterBottom>
                {compagnieActive.nom}
              </Typography>
              <IconButton 
                color="primary" 
                onClick={() => handleDialogOpen(DialogMode.EDIT, compagnieActive)}
                sx={{ backgroundColor: 'primary.main', color: 'white', '&:hover': { backgroundColor: 'primary.dark' } }}
              >
                <EditIcon />
              </IconButton>
            </Box>
            
            <Card sx={{ mb: 3 }} variant="outlined">
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <EmailIcon sx={{ mr: 1 }} color="action" />
                  <Typography variant="body1">
                    {compagnieActive.email}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
            
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="onglets compagnie">
                <Tab label="Avis de Changement" />
                <Tab label="Historique" />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              <AvisChangementBeneficiaire compagnieId={compagnieActive.id} />
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>
                Historique des changements
              </Typography>
              <Alert severity="info">
                Cette fonctionnalité sera disponible prochainement.
              </Alert>
            </TabPanel>            
          </Paper>
        </Grid>
      </Grid>
      
      {/* Modal de création/modification */}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === DialogMode.CREATE 
            ? 'Ajouter une nouvelle compagnie d\'assurance' 
            : 'Modifier la compagnie d\'assurance'}
        </DialogTitle>
        <DialogContent>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="nom"
              label="Nom de la compagnie"
              name="nom"
              value={formValues.nom}
              onChange={handleInputChange}
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email de la compagnie"
              name="email"
              type="email"
              value={formValues.email}
              onChange={handleInputChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="inherit">Annuler</Button>
          <Button 
            onClick={handleSubmit} 
            color="primary" 
            variant="contained"
            disabled={creating || updating}
          >
            {dialogMode === DialogMode.CREATE 
              ? (creating ? 'Création...' : 'Créer')
              : (updating ? 'Mise à jour...' : 'Mettre à jour')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer cette compagnie d'assurance ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">
            Annuler
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus disabled={deleting}>
            {deleting ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </div>
  );
};

export default InterfaceCompagnieAssurance; 