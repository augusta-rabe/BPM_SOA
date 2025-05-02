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
  Fab
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon, Add as AddIcon } from '@mui/icons-material';
import { GET_EMPLOYES, GET_EMPLOYE, CREATE_EMPLOYE, UPDATE_EMPLOYE, DELETE_EMPLOYE } from '../graphql/queries';
import { Employe } from '../types';

const GestionEmployes: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedEmploye, setSelectedEmploye] = useState<Employe | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    nom: '',
    prenom: '',
    email: '',
  });

  const { loading, error, data, refetch } = useQuery(GET_EMPLOYES);
  const [getEmployeDetails, { loading: loadingDetails }] = useLazyQuery(GET_EMPLOYE, {
    onCompleted: (data) => {
      if (data?.employe?.dossiers && data.employe.dossiers.length > 0) {
        setErrorMessage(`Impossible de supprimer cet employé car il est lié à ${data.employe.dossiers.length} dossier(s).`);
      } else {
        // Si l'employé n'a pas de dossiers, procéder à la suppression
        proceedWithDeletion();
      }
    },
    onError: (error) => {
      setErrorMessage(`Erreur lors de la vérification des dossiers : ${error.message}`);
    }
  });
  
  const [createEmploye] = useMutation(CREATE_EMPLOYE);
  const [updateEmploye] = useMutation(UPDATE_EMPLOYE);
  const [deleteEmploye] = useMutation(DELETE_EMPLOYE, {
    onError: (error) => {
      setErrorMessage(`Erreur lors de la suppression : ${error.message}`);
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
    setSelectedEmploye(null);
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
        await updateEmploye({
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
        await createEmploye({
          variables: {
            input: {
              nom: formData.nom,
              prenom: formData.prenom,
              email: formData.email,
            }
          }
        });
      }
      refetch();
      resetForm();
    } catch (err: any) {
      console.error('Erreur lors de l\'opération:', err);
      if (err.message.includes('duplicate key') || err.message.includes('unique constraint')) {
        setErrorMessage("Un employé avec cet email existe déjà.");
      } else {
        setErrorMessage(`Erreur: ${err.message}`);
      }
    }
  };

  const handleEdit = (employe: Employe) => {
    setFormData({
      id: employe.id,
      nom: employe.nom,
      prenom: employe.prenom,
      email: employe.email,
    });
    setSelectedEmploye(employe);
    setEditMode(true);
    setFormDialogOpen(true);
    setErrorMessage(null);
  };

  const handleDeleteClick = (employe: Employe) => {
    setSelectedEmploye(employe);
    setDeleteDialogOpen(true);
    setErrorMessage(null);
  };

  const confirmDelete = async () => {
    setErrorMessage(null);
    if (selectedEmploye) {
      // Vérifier si l'employé a des dossiers
      getEmployeDetails({
        variables: { id: selectedEmploye.id }
      });
    }
  };

  const proceedWithDeletion = async () => {
    if (selectedEmploye) {
      try {
        await deleteEmploye({
          variables: { id: selectedEmploye.id }
        });
        refetch();
        setDeleteDialogOpen(false);
        setSelectedEmploye(null);
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
      }
    }
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
          ? "Une erreur est survenue lors de la récupération des employés. Veuillez réessayer plus tard."
          : `Erreur: ${error.message}`}
      </Alert>
    );
  }

  const employes = data?.employes || [];
  
  const filteredEmployes = employes.filter((employe: Employe) => {
    return searchTerm === '' || 
      employe.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employe.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employe.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gestion des Employés
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">
            Liste des employés
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
              {filteredEmployes.map((employe: Employe) => (
                <TableRow key={employe.id}>
                  <TableCell>{employe.nom}</TableCell>
                  <TableCell>{employe.prenom}</TableCell>
                  <TableCell>{employe.email}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(employe)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(employe)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredEmployes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Aucun employé trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog 
        open={formDialogOpen} 
        onClose={resetForm}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editMode ? 'Modifier un employé' : 'Ajouter un nouvel employé'}
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
            <Button type="submit" variant="contained">
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
              Êtes-vous sûr de vouloir supprimer l'employé {selectedEmploye?.prenom} {selectedEmploye?.nom} ?
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

export default GestionEmployes;