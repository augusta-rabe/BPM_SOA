import React, { useState } from 'react';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  InputAdornment,
  Fab,
  TablePagination
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon, Add as AddIcon } from '@mui/icons-material';
import {
  GET_CONSEILLERS_RH,
  CREATE_CONSEILLER_RH,
  UPDATE_CONSEILLER_RH,
  DELETE_CONSEILLER_RH,
  GET_CONSEILLER_RH
} from '../graphql/queries';

interface ConseillerRH {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  dossiers?: any[];
}

const GestionConseillersRH: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedConseiller, setSelectedConseiller] = useState<ConseillerRH | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    id: '',
    nom: '',
    prenom: '',
    email: '',
  });

  const { loading, error, data, refetch } = useQuery(GET_CONSEILLERS_RH, {
    fetchPolicy: 'network-only'
  });
  
  const [getConseillerDetails, { loading: loadingDetails }] = useLazyQuery(GET_CONSEILLER_RH, {
    onCompleted: (data) => {
      if (data?.conseillerRH?.dossiers && data.conseillerRH.dossiers.length > 0) {
        setErrorMessage(`Impossible de supprimer ce conseiller car il est lié à ${data.conseillerRH.dossiers.length} dossier(s).`);
      } else {
        // Si le conseiller n'a pas de dossiers, procéder à la suppression
        proceedWithDeletion();
      }
    },
    onError: (error) => {
      setErrorMessage(`Erreur lors de la vérification des dossiers : ${error.message}`);
    }
  });

  const [createConseillerRH, { loading: creating }] = useMutation(CREATE_CONSEILLER_RH, {
    onCompleted: () => {
      refetch();
      resetForm();
    },
    onError: (error) => {
      setErrorMessage(`Erreur lors de la création: ${error.message}`);
    }
  });

  const [updateConseillerRH, { loading: updating }] = useMutation(UPDATE_CONSEILLER_RH, {
    onCompleted: () => {
      refetch();
      resetForm();
    },
    onError: (error) => {
      setErrorMessage(`Erreur lors de la mise à jour: ${error.message}`);
    }
  });

  const [deleteConseillerRH, { loading: deleting }] = useMutation(DELETE_CONSEILLER_RH, {
    onError: (error) => {
      setErrorMessage(`Erreur lors de la suppression: ${error.message}`);
    }
  });

  const resetForm = () => {
    setFormData({
      id: '',
      nom: '',
      prenom: '',
      email: '',
    });
    setEditMode(false);
    setSelectedConseiller(null);
    setFormDialogOpen(false);
    setErrorMessage(null);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    try {
      if (editMode) {
        await updateConseillerRH({
          variables: {
            id: formData.id,
            input: {
              nom: formData.nom,
              prenom: formData.prenom,
              email: formData.email,
            }
          }
        });
      } else {
        await createConseillerRH({
          variables: {
            input: {
              nom: formData.nom,
              prenom: formData.prenom,
              email: formData.email,
            }
          }
        });
      }
    } catch (err: any) {
      console.error('Erreur lors de l\'opération:', err);
      if (err.message.includes('duplicate key') || err.message.includes('unique constraint')) {
        setErrorMessage("Un conseiller avec cet email existe déjà.");
      } else {
        setErrorMessage(`Erreur: ${err.message}`);
      }
    }
  };

  const handleEdit = (conseiller: ConseillerRH) => {
    setFormData({
      id: conseiller.id,
      nom: conseiller.nom,
      prenom: conseiller.prenom,
      email: conseiller.email,
    });
    setSelectedConseiller(conseiller);
    setEditMode(true);
    setFormDialogOpen(true);
    setErrorMessage(null);
  };

  const handleDeleteClick = (conseiller: ConseillerRH) => {
    setSelectedConseiller(conseiller);
    setDeleteDialogOpen(true);
    setErrorMessage(null);
  };

  const confirmDelete = async () => {
    setErrorMessage(null);
    if (selectedConseiller) {
      // Vérifier si le conseiller a des dossiers
      getConseillerDetails({
        variables: { id: selectedConseiller.id }
      });
    }
  };

  const proceedWithDeletion = async () => {
    if (selectedConseiller) {
      try {
        await deleteConseillerRH({
          variables: { id: selectedConseiller.id }
        });
        refetch();
        setDeleteDialogOpen(false);
        setSelectedConseiller(null);
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
      }
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </div>
  );
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error.message.includes('non-nullable field') 
          ? "Une erreur est survenue lors de la récupération des conseillers. Veuillez réessayer plus tard."
          : `Erreur: ${error.message}`}
      </Alert>
    );
  }

  const conseillers = data?.conseillersRH || [];
  
  const filteredConseillers = conseillers.filter((conseiller: ConseillerRH) => {
    return searchTerm === '' || 
      conseiller.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conseiller.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conseiller.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const paginatedConseillers = filteredConseillers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gestion des Conseillers RH
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">
            Liste des conseillers
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Rechercher"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditMode(false);
                resetForm();
                setFormDialogOpen(true);
              }}
            >
              Ajouter
            </Button>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Prénom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedConseillers.map((conseiller: ConseillerRH) => (
                <TableRow key={conseiller.id}>
                  <TableCell>{conseiller.nom}</TableCell>
                  <TableCell>{conseiller.prenom}</TableCell>
                  <TableCell>{conseiller.email}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(conseiller)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(conseiller)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedConseillers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Aucun conseiller trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredConseillers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page"
        />
      </Paper>

      <Dialog 
        open={formDialogOpen} 
        onClose={resetForm}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editMode ? 'Modifier un conseiller' : 'Ajouter un nouveau conseiller'}
          </DialogTitle>
          <DialogContent>
            {errorMessage && (
              <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                {errorMessage}
              </Alert>
            )}
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nom"
                  value={formData.nom}
                  onChange={(e) => handleChange('nom', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Prénom"
                  value={formData.prenom}
                  onChange={(e) => handleChange('prenom', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={resetForm}>Annuler</Button>
            <Button type="submit" variant="contained" disabled={creating || updating}>
              {editMode ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmation de suppression</DialogTitle>
        <DialogContent>
          {errorMessage ? (
            <Alert severity="warning" sx={{ mt: 1, mb: 1 }}>
              {errorMessage}
            </Alert>
          ) : (
            <DialogContentText>
              Êtes-vous sûr de vouloir supprimer le conseiller {selectedConseiller?.prenom} {selectedConseiller?.nom} ?
              Cette action est irréversible.
            </DialogContentText>
          )}
          {loadingDetails && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          {!errorMessage && (
            <Button onClick={confirmDelete} color="error" autoFocus disabled={loadingDetails}>
              Supprimer
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GestionConseillersRH;