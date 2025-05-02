import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Alert,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Autocomplete,
} from '@mui/material';
import { Delete as DeleteIcon, Visibility as VisibilityIcon, Add as AddIcon } from '@mui/icons-material';
import { 
  GET_DOSSIERS, 
  DELETE_DOSSIER, 
  CREATE_DOSSIER, 
  CREATE_EMPLOYE, 
  CREATE_BENEFICIAIRE,
  GET_EMPLOYES 
} from '../graphql/queries';
import { StatutDossier, Dossier, Employe } from '../types';

const ListeDossiers: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatutDossier | 'TOUS'>('TOUS');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedDossier, setSelectedDossier] = useState<Dossier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [selectedEmploye, setSelectedEmploye] = useState<Employe | null>(null);
  
  const [formData, setFormData] = useState({
    employe: {
      nom: '',
      prenom: '',
      email: '',
    },
    beneficiaire: {
      nom: '',
      prenom: '',
      dateNaissance: '',
      relationAvecEmploye: '',
    },
  });

  const { loading: loadingDossiers, error: errorDossiers, data, refetch } = useQuery(GET_DOSSIERS);
  const { data: employesData, loading: employesLoading } = useQuery(GET_EMPLOYES);
  const [deleteDossier] = useMutation(DELETE_DOSSIER);
  const [createDossier] = useMutation(CREATE_DOSSIER);
  const [createEmploye] = useMutation(CREATE_EMPLOYE);
  const [createBeneficiaire] = useMutation(CREATE_BENEFICIAIRE);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (dossier: Dossier) => {
    setSelectedDossier(dossier);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedDossier) {
      try {
        await deleteDossier({
          variables: { id: selectedDossier.id }
        });
        refetch();
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
      }
    }
    setDeleteDialogOpen(false);
    setSelectedDossier(null);
  };

  const resetForm = () => {
    setFormData({
      employe: {
        nom: '',
        prenom: '',
        email: '',
      },
      beneficiaire: {
        nom: '',
        prenom: '',
        dateNaissance: '',
        relationAvecEmploye: '',
      },
    });
    setMode('existing');
    setSelectedEmploye(null);
    setError(null);
  };

  const handleOpenCreateDialog = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    resetForm();
  };

  const handleChange = (field: string, value: string) => {
    const [section, name] = field.split('.');
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [name]: value,
      },
    }));
  };

  const handleEmployeSelect = (employe: Employe | null) => {
    setSelectedEmploye(employe);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation des champs requis pour le bénéficiaire
      if (!formData.beneficiaire.nom || !formData.beneficiaire.prenom || !formData.beneficiaire.dateNaissance || !formData.beneficiaire.relationAvecEmploye) {
        setError("Veuillez remplir tous les champs obligatoires du bénéficiaire");
        setLoading(false);
        return;
      }

      let employeId;

      if (mode === 'existing') {
        // Utilisation d'un employé existant
        if (!selectedEmploye) {
          setError("Veuillez sélectionner un employé");
          setLoading(false);
          return;
        }
        employeId = selectedEmploye.id;
      } else {
        // Création d'un nouvel employé
        if (!formData.employe.nom || !formData.employe.prenom || !formData.employe.email) {
          setError("Veuillez remplir tous les champs obligatoires de l'employé");
          setLoading(false);
          return;
        }

        // Validation du format d'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.employe.email)) {
          setError("Veuillez entrer une adresse email valide");
          setLoading(false);
          return;
        }

        // Création de l'employé
        const { data: employeData } = await createEmploye({
          variables: {
            input: formData.employe
          }
        });

        if (!employeData?.createEmploye) {
          throw new Error("Erreur lors de la création de l'employé");
        }

        employeId = employeData.createEmploye.id;
      }

      // Création du bénéficiaire
      const { data: beneficiaireData } = await createBeneficiaire({
        variables: {
          input: {
            ...formData.beneficiaire,
            dateNaissance: new Date(formData.beneficiaire.dateNaissance).toISOString()
          }
        }
      });

      if (!beneficiaireData?.createBeneficiaire) {
        throw new Error("Erreur lors de la création du bénéficiaire");
      }

      // Création du dossier
      const { data: dossierData } = await createDossier({
        variables: {
          input: {
            employeId: employeId,
            beneficiaireId: beneficiaireData.createBeneficiaire.id,
            statut: StatutDossier.EN_ATTENTE
          }
        }
      });

      if (dossierData?.createDossier) {
        handleCloseCreateDialog();
        refetch();
        navigate(`/dossiers`);
      } else {
        throw new Error("Erreur lors de la création du dossier");
      }
    } catch (err: any) {
      console.error('Erreur détaillée:', err);
      if (err.message.includes('duplicate key error')) {
        setError("Un employé avec cet email existe déjà. Veuillez utiliser un email différent.");
      } else if (err.message.includes('network error')) {
        setError("Erreur de connexion au serveur. Veuillez vérifier votre connexion internet.");
      } else {
        setError(`Une erreur est survenue : ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatutColor = (statut: string) => {
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

  if (loadingDossiers) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </div>
  );
  if (errorDossiers) {
    const errorMessage = errorDossiers.graphQLErrors?.[0]?.message || errorDossiers.message;
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {errorMessage.includes('non-nullable field') 
          ? "Une erreur est survenue lors de la récupération des dossiers. Veuillez réessayer plus tard."
          : `Erreur: ${errorMessage}`}
      </Alert>
    );
  }

  const dossiers = data?.dossiers || [];
  const employes = employesData?.employes || [];
  
  const filteredDossiers = dossiers.filter((dossier: Dossier) => {
    const matchesSearch = searchTerm === '' || 
      dossier.employe.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dossier.employe.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dossier.beneficiaire.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dossier.beneficiaire.prenom.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'TOUS' || dossier.statut === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const dossiersFiltres = filteredDossiers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Liste des dossiers</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Nouveau dossier
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          label="Rechercher"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Statut</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatutDossier | 'TOUS')}
            label="Statut"
          >
            <MenuItem value="TOUS">Tous les statuts</MenuItem>
            <MenuItem value={StatutDossier.EN_ATTENTE}>En attente</MenuItem>
            <MenuItem value={StatutDossier.EN_COURS}>En cours</MenuItem>
            <MenuItem value={StatutDossier.TERMINE}>Validé</MenuItem>
            <MenuItem value={StatutDossier.ANNULE}>Rejeté</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ color: 'primary.main' }}>
              <TableCell>Identifiant</TableCell>
              <TableCell>Employé</TableCell>
              <TableCell>Bénéficiaire</TableCell>
              <TableCell>Date de création</TableCell>
              <TableCell>Conseiller RH</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dossiersFiltres.map((dossier: Dossier) => (
              <TableRow
                key={dossier.id}
                hover
              >
                <TableCell>{dossier.id}</TableCell>
                <TableCell>
                  {dossier.employe.nom} {dossier.employe.prenom}
                </TableCell>
                <TableCell>
                  {dossier.beneficiaire.nom} {dossier.beneficiaire.prenom}
                </TableCell>
                <TableCell>
                  {new Date(dossier.dateCreation).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {dossier.conseillerRH
                    ? `${dossier.conseillerRH.nom} ${dossier.conseillerRH.prenom}`
                    : '-'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={dossier.statut}
                    color={getStatutColor(dossier.statut)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    component={Link}
                    to={`/dossier/${dossier.id}`}
                    size="small"
                    color="primary"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => handleDeleteClick(dossier)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {dossiersFiltres.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Aucun dossier trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredDossiers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page"
        />
      </TableContainer>

      {/* Modal de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmation de suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer le dossier pour {selectedDossier?.employe.prenom} {selectedDossier?.employe.nom} ?
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button onClick={confirmDelete} color="error" autoFocus>Supprimer</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de création de dossier */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Nouveau dossier</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleCreateSubmit}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Informations de l'employé
                </Typography>
                <FormControl component="fieldset" sx={{ mb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item>
                      <Button 
                        variant={mode === 'existing' ? "contained" : "outlined"}
                        onClick={() => setMode('existing')}
                      >
                        Sélectionner un employé existant
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button 
                        variant={mode === 'new' ? "contained" : "outlined"}
                        onClick={() => setMode('new')}
                      >
                        Ajouter un nouvel employé
                      </Button>
                    </Grid>
                  </Grid>
                </FormControl>
              </Grid>

              {mode === 'existing' ? (
                <Grid item xs={12}>
                  {employesLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Autocomplete
                      id="employe-select"
                      options={employes}
                      getOptionLabel={(option: Employe) => `${option.prenom} ${option.nom} (${option.email})`}
                      value={selectedEmploye}
                      onChange={(_, newValue) => handleEmployeSelect(newValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Sélectionner un employé"
                          fullWidth
                          required
                          error={!selectedEmploye}
                          helperText={!selectedEmploye ? "Veuillez sélectionner un employé" : ""}
                        />
                      )}
                    />
                  )}
                </Grid>
              ) : (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nom"
                      value={formData.employe.nom}
                      onChange={(e) => handleChange('employe.nom', e.target.value)}
                      required
                      error={!formData.employe.nom && formData.employe.nom !== ''}
                      helperText={!formData.employe.nom && formData.employe.nom !== '' ? "Le nom est requis" : ""}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Prénom"
                      value={formData.employe.prenom}
                      onChange={(e) => handleChange('employe.prenom', e.target.value)}
                      required
                      error={!formData.employe.prenom && formData.employe.prenom !== ''}
                      helperText={!formData.employe.prenom && formData.employe.prenom !== '' ? "Le prénom est requis" : ""}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.employe.email}
                      onChange={(e) => handleChange('employe.email', e.target.value)}
                      required
                      error={!formData.employe.email && formData.employe.email !== ''}
                      helperText={!formData.employe.email && formData.employe.email !== '' ? "L'email est requis" : ""}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Informations du bénéficiaire
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nom"
                  value={formData.beneficiaire.nom}
                  onChange={(e) => handleChange('beneficiaire.nom', e.target.value)}
                  required
                  error={!formData.beneficiaire.nom && formData.beneficiaire.nom !== ''}
                  helperText={!formData.beneficiaire.nom && formData.beneficiaire.nom !== '' ? "Le nom est requis" : ""}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Prénom"
                  value={formData.beneficiaire.prenom}
                  onChange={(e) => handleChange('beneficiaire.prenom', e.target.value)}
                  required
                  error={!formData.beneficiaire.prenom && formData.beneficiaire.prenom !== ''}
                  helperText={!formData.beneficiaire.prenom && formData.beneficiaire.prenom !== '' ? "Le prénom est requis" : ""}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date de naissance"
                  type="date"
                  value={formData.beneficiaire.dateNaissance}
                  onChange={(e) => handleChange('beneficiaire.dateNaissance', e.target.value)}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  error={!formData.beneficiaire.dateNaissance && formData.beneficiaire.dateNaissance !== ''}
                  helperText={!formData.beneficiaire.dateNaissance && formData.beneficiaire.dateNaissance !== '' ? "La date de naissance est requise" : ""}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Relation</InputLabel>
                  <Select
                    value={formData.beneficiaire.relationAvecEmploye}
                    onChange={(e) => handleChange('beneficiaire.relationAvecEmploye', e.target.value)}
                    label="Relation"
                    error={!formData.beneficiaire.relationAvecEmploye && formData.beneficiaire.relationAvecEmploye !== ''}
                  >
                    <MenuItem value="CONJOINT">Conjoint(e)</MenuItem>
                    <MenuItem value="ENFANT">Enfant</MenuItem>
                    <MenuItem value="PARENT">Parent</MenuItem>
                    <MenuItem value="AUTRE">Autre</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <DialogActions sx={{ mt: 3 }}>
              <Button onClick={handleCloseCreateDialog}>Annuler</Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? 'Création en cours...' : 'Créer dossier'}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ListeDossiers;