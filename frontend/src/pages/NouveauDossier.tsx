import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CREATE_DOSSIER, CREATE_EMPLOYE, CREATE_BENEFICIAIRE, GET_EMPLOYES } from '../graphql/queries';
import { StatutDossier, Employe } from '../types';

const NouveauDossier: React.FC = () => {
  const navigate = useNavigate();
  const [createDossier] = useMutation(CREATE_DOSSIER);
  const [createEmploye] = useMutation(CREATE_EMPLOYE);
  const [createBeneficiaire] = useMutation(CREATE_BENEFICIAIRE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { data: employesData, loading: employesLoading } = useQuery(GET_EMPLOYES);

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

  const handleSubmit = async (e: React.FormEvent) => {
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
        navigate(`/dossier/${dossierData.createDossier.id}`);
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

  if (loading || employesLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </div>
  );

  const employes = employesData?.employes || [];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Nouveau dossier
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
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

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? 'Création en cours...' : 'Créer dossier'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default NouveauDossier; 