import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, ApolloError } from '@apollo/client';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Container,
  TextField,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { GET_DOSSIER, UPDATE_DOSSIER_STATUT, DELETE_DOSSIER, GET_CONSEILLERS_RH, UPDATE_DOSSIER_CONSEILLER } from '../graphql/queries';
import { StatutDossier } from '../types';
// import HistoriqueModifications from '../components/HistoriqueModifications';
import { useTheme } from '@mui/material/styles';
import { ArrowBack as ArrowBackIcon, Delete as DeleteIcon, Edit as EditIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { SelectChangeEvent } from '@mui/material';

interface Notification {
  id: string;
  message: string;
  date: string;
}

interface CourrierConfirmation {
  id: string;
  date: string;
  contenu: string;
}

interface ConseillerRH {
  id: string;
  nom: string;
  prenom: string;
  email: string;
}

interface Employe {
  id: string;
  nom: string;
  prenom: string;
  email: string;
}

interface Beneficiaire {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  relationAvecEmploye: string;
}

interface Dossier {
  id: string;
  dateCreation: string;
  statut: StatutDossier;
  employe: Employe;
  beneficiaire: Beneficiaire;
  conseillerRH: ConseillerRH | null;
  notifications?: Notification[];
  courrierConfirmation?: CourrierConfirmation;
}

const DossierDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newStatut, setNewStatut] = useState<StatutDossier | ''>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conseillerDialogOpen, setConseillerDialogOpen] = useState(false);
  const [selectedConseillerRHId, setSelectedConseillerRHId] = useState<string>('');
  const theme = useTheme();

  const { loading, error, data, refetch } = useQuery(GET_DOSSIER, {
    variables: { id },
    skip: !id
  });

  const { loading: loadingConseillers, data: conseillersData } = useQuery(GET_CONSEILLERS_RH);

  const [updateStatut, { loading: updating }] = useMutation(UPDATE_DOSSIER_STATUT);
  const [deleteDossier, { loading: deleting }] = useMutation(DELETE_DOSSIER);

  const [updateDossierConseiller, { loading: updatingConseiller }] = useMutation(UPDATE_DOSSIER_CONSEILLER, {
    onCompleted: () => {
      setConseillerDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour du conseiller RH:', error);
    }
  });

  const handleStatutChange = async (statut: StatutDossier) => {
    try {
      await updateStatut({
        variables: { id, statut },
        refetchQueries: [{ query: GET_DOSSIER, variables: { id } }],
      });
      setNewStatut('');
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteDossier({
        variables: { id }
      });
      navigate('/dossiers');
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
    setDeleteDialogOpen(false);
  };

  useEffect(() => {
    if (data?.dossier?.conseillerRH) {
      setSelectedConseillerRHId(data.dossier.conseillerRH.id);
    } else {
      setSelectedConseillerRHId('');
    }
  }, [data]);

  const handleConseillerChange = (event: SelectChangeEvent) => {
    setSelectedConseillerRHId(event.target.value);
  };

  const handleConseillerDialogOpen = () => {
    setConseillerDialogOpen(true);
  };

  const handleConseillerDialogClose = () => {
    if (data?.dossier?.conseillerRH) {
      setSelectedConseillerRHId(data.dossier.conseillerRH.id);
    } else {
      setSelectedConseillerRHId('');
    }
    setConseillerDialogOpen(false);
  };

  const handleConseillerSubmit = async () => {
    if (id) {
      try {
        await updateDossierConseiller({
          variables: {
            id,
            conseillerRHId: selectedConseillerRHId || null
          }
        });
      } catch (err) {
        console.error('Erreur lors de la mise à jour du conseiller:', err);
      }
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </div>
  );
  if (error) {
    const errorMessage = error.graphQLErrors?.[0]?.message || error.message;
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {errorMessage.includes('non-nullable field') 
          ? "Une erreur est survenue lors de la récupération des données. Veuillez réessayer plus tard."
          : `Erreur: ${errorMessage}`}
      </Alert>
    );
  }
  if (!data?.dossier) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Aucun dossier trouvé avec cet identifiant.
      </Alert>
    );
  }

  const { dossier } = data;
  console.log('Dossier data:', dossier);
  console.log('CourrierConfirmation:', dossier.courrierConfirmation);

  const getStatutColor = (statut: StatutDossier) => {
    switch (statut) {
      case StatutDossier.EN_ATTENTE:
        return 'warning';
      case StatutDossier.EN_COURS:
        return 'info';
      case StatutDossier.TERMINE:
        return 'success';
      case StatutDossier.ANNULE:
        return 'error';
      default:
        return 'default';
    }
  };

  const styles = {
    container: {
      padding: theme.spacing(3),
      [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1),
      },
    },
    paper: {
      padding: theme.spacing(3),
      marginBottom: theme.spacing(3),
      [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2),
      },
    },
    title: {
      marginBottom: theme.spacing(3),
      [theme.breakpoints.down('sm')]: {
        fontSize: '1.5rem',
        marginBottom: theme.spacing(2),
      },
    },
    sectionTitle: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(2),
    },
    gridItem: {
      [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1),
      },
    },
    button: {
      marginTop: theme.spacing(2),
      [theme.breakpoints.down('sm')]: {
        width: '100%',
      },
    },
    textField: {
      [theme.breakpoints.down('sm')]: {
        '& .MuiInputBase-root': {
          fontSize: '0.875rem',
        },
      },
    },
    card: {
      marginBottom: theme.spacing(2),
    },
    divider: {
      margin: `${theme.spacing(2)}px 0`,
    },
  };

  return (
    <Container maxWidth="lg" sx={styles.container}>
      <Paper sx={styles.paper}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={styles.title}>
            Détails du Dossier
          </Typography>
          <Chip
            label={dossier.statut}
            color={getStatutColor(dossier.statut as StatutDossier)}
          />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={styles.card}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informations du dossier
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="ID"
                      value={dossier.id}
                      InputProps={{ readOnly: true }}
                      sx={styles.textField}
                      margin="normal"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Date de Création"
                      value={new Date(dossier.dateCreation).toLocaleDateString()}
                      InputProps={{ readOnly: true }}
                      sx={styles.textField}
                      margin="normal"
                      size="small"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={styles.card}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Information de l'employé
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nom"
                      value={dossier.employe.nom}
                      InputProps={{ readOnly: true }}
                      sx={styles.textField}
                      margin="normal"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Prénom"
                      value={dossier.employe.prenom}
                      InputProps={{ readOnly: true }}
                      sx={styles.textField}
                      margin="normal"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={dossier.employe.email}
                      InputProps={{ readOnly: true }}
                      sx={styles.textField}
                      margin="normal"
                      size="small"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={styles.card}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Information du bénéficiaire
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nom"
                      value={dossier.beneficiaire.nom}
                      InputProps={{ readOnly: true }}
                      sx={styles.textField}
                      margin="normal"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Prénom"
                      value={dossier.beneficiaire.prenom}
                      InputProps={{ readOnly: true }}
                      sx={styles.textField}
                      margin="normal"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Date de naissance"
                      value={new Date(dossier.beneficiaire.dateNaissance).toLocaleDateString()}
                      InputProps={{ readOnly: true }}
                      sx={styles.textField}
                      margin="normal"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Relation avec l'employé"
                      value={dossier.beneficiaire.relationAvecEmploye}
                      InputProps={{ readOnly: true }}
                      sx={styles.textField}
                      margin="normal"
                      size="small"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={styles.card}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Conseiller RH
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small"
                    startIcon={<PersonAddIcon />}
                    onClick={handleConseillerDialogOpen}
                  >
                    {dossier.conseillerRH ? 'Changer' : 'Assigner'}
                  </Button>
                </Box>
                
                {dossier.conseillerRH ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Nom"
                        value={dossier.conseillerRH.nom}
                        InputProps={{ readOnly: true }}
                        sx={styles.textField}
                        margin="normal"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Prénom"
                        value={dossier.conseillerRH.prenom}
                        InputProps={{ readOnly: true }}
                        sx={styles.textField}
                        margin="normal"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={dossier.conseillerRH.email}
                        InputProps={{ readOnly: true }}
                        sx={styles.textField}
                        margin="normal"
                        size="small"
                      />
                    </Grid>
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Aucun conseiller RH assigné
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={styles.card}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Dernier courrier de confirmation de modification
                </Typography>
                {dossier.courrierConfirmation ? (
                  <>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Date: {new Date(dossier.courrierConfirmation.date).toLocaleDateString()}
                    </Typography>
                    <Box mt={2} p={2} sx={{ backgroundColor: '#f5f5f5', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
                      <Typography variant="body2">
                        {dossier.courrierConfirmation.contenu}
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Aucun courrier de confirmation n'a été envoyé pour ce dossier.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={styles.divider} />
            <Typography variant="h6" gutterBottom>
              Actions
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Nouveau Statut</InputLabel>
                <Select
                  value={newStatut}
                  onChange={(e) => setNewStatut(e.target.value as StatutDossier)}
                  label="Nouveau Statut"
                  size="small"
                >
                  {Object.values(StatutDossier).map((statut) => (
                    <MenuItem key={statut} value={statut}>
                      {statut}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Button
                variant="contained"
                color="primary"
                onClick={() => newStatut && handleStatutChange(newStatut)}
                disabled={!newStatut || updating}
              >
                {updating ? <CircularProgress size={20} className='mr-2' /> : <EditIcon className='mr-2' />}
                {updating ? 'Mise à jour...' : 'Mettre à jour'}
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                onClick={handleDeleteClick}
              >
                <DeleteIcon className='mr-2' />
                Supprimer le dossier
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/dossiers')}
              >
                <ArrowBackIcon className='mr-2' />
                Retour aux dossiers
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
      {/* {id && <HistoriqueModifications dossierId={id} />} */}
      
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmation de suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer ce dossier ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button onClick={confirmDelete} color="error" autoFocus>Supprimer</Button>
        </DialogActions>
      </Dialog>
      
      <Dialog
        open={conseillerDialogOpen}
        onClose={handleConseillerDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dossier.conseillerRH ? 'Changer le conseiller RH' : 'Assigner un conseiller RH'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {dossier.conseillerRH 
              ? 'Sélectionnez un nouveau conseiller RH pour ce dossier.' 
              : 'Sélectionnez un conseiller RH à assigner à ce dossier.'}
          </DialogContentText>
          
          {loadingConseillers ? (
            <Box display="flex" justifyContent="center" my={2}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel id="conseiller-select-label">Conseiller RH</InputLabel>
              <Select
                labelId="conseiller-select-label"
                value={selectedConseillerRHId}
                onChange={handleConseillerChange}
                label="Conseiller RH"
              >
                {!conseillersData?.conseillersRH?.length ? (
                  <MenuItem value="">
                    <em>Aucun conseiller disponible</em>
                  </MenuItem>
                ) : (
                  conseillersData.conseillersRH.map((conseiller: ConseillerRH) => (
                    <MenuItem key={conseiller.id} value={conseiller.id}>
                      {conseiller.prenom} {conseiller.nom} ({conseiller.email})
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConseillerDialogClose}>Annuler</Button>
          <Button 
            onClick={handleConseillerSubmit} 
            color="primary" 
            disabled={updatingConseiller}
          >
            {updatingConseiller ? 'Mise à jour...' : 'Confirmer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DossierDetails;