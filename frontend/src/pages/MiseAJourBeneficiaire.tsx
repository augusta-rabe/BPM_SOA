import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import {
  Container,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { 
  GET_DOSSIER, 
  CREATE_DOSSIER, 
  UPDATE_DOSSIER_STATUT,
  GET_DOSSIERS,
  GET_CONSEILLERS_RH,
  UPDATE_DOSSIER_CONSEILLER
} from '../graphql/queries';
import GestionBeneficiaires from '../components/GestionBeneficiaires';
import NotificationChangement from '../components/NotificationChangement';
import CourrierConfirmation from '../components/CourrierConfirmation';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const etapes = [
  'Information personnelle',
  'Sélection du bénéficiaire',
  'Notification de changement',
  'Courrier de confirmation'
];

const MiseAJourBeneficiaire: React.FC = () => {
  const { id: dossierId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [etapeActive, setEtapeActive] = useState(0);
  const [selectedBeneficiaireId, setSelectedBeneficiaireId] = useState<string | null>(null);
  const [nouveauDossierId, setNouveauDossierId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedEmployeId, setSelectedEmployeId] = useState<string | null>(null);
  const [selectedConseillerRHId, setSelectedConseillerRHId] = useState<string | null>(null);
  const [conseillerDialogOpen, setConseillerDialogOpen] = useState(false);

  // Charger le dossier existant si dossierId est fourni
  const { loading, error, data, refetch } = useQuery(GET_DOSSIER, {
    variables: { id: dossierId },
    skip: !dossierId
  });
  
  // Récupérer la liste des dossiers pour sélectionner un employé
  const { loading: loadingDossiers, data: dossiersData } = useQuery(GET_DOSSIERS);

  // Récupérer la liste des conseillers RH
  const { loading: loadingConseillers, data: conseillersData } = useQuery(GET_CONSEILLERS_RH);

  const [createDossier, { loading: creating }] = useMutation(CREATE_DOSSIER, {
    onCompleted: (data) => {
      if (data?.createDossier?.id) {
        // Mettre à jour l'ID du dossier et passer à l'étape suivante
        setNouveauDossierId(data.createDossier.id);
        setEtapeActive(1); // Passer directement à l'étape de sélection du bénéficiaire
      }
    },
    onError: (error) => {
      setErrorMessage(`Erreur lors de la création du dossier: ${error.message}`);
    }
  });
  const [updateStatut, { loading: updating }] = useMutation(UPDATE_DOSSIER_STATUT);
  
  const [updateDossierConseiller, { loading: updatingConseiller }] = useMutation(UPDATE_DOSSIER_CONSEILLER, {
    onCompleted: () => {
      refetch();
    },
    onError: (error) => {
      setErrorMessage(`Erreur lors de l'assignation du conseiller: ${error.message}`);
    }
  });

  // ID du dossier à utiliser (existant ou nouveau)
  const dossierCourantId = dossierId || nouveauDossierId;

  // Si le dossier est chargé, récupérer l'employé et le bénéficiaire actuel
  useEffect(() => {
    if (data?.dossier) {
      // Si le dossier existe déjà, on utilise son bénéficiaire
      setSelectedBeneficiaireId(data.dossier.beneficiaire?.id || null);
      // Si le dossier a un conseiller RH, on l'utilise
      if (data.dossier.conseillerRH) {
        setSelectedConseillerRHId(data.dossier.conseillerRH.id);
      }
    }
  }, [data]);

  const handleNext = async () => {
    try {
      if (etapeActive === 0 && !dossierCourantId) {
        // À l'étape 0, si pas de dossier existant, on en crée un
        if (!data?.dossier?.employe?.id && !selectedEmployeId) {
          setErrorMessage("Impossible de créer un dossier sans employé");
          return;
        }

        const employeId = data?.dossier?.employe?.id || selectedEmployeId;
        
        if (!employeId) {
          setErrorMessage("Aucun employé sélectionné");
          return;
        }

        // Créer le dossier avec l'employé et éventuellement le conseiller RH
        const input: any = {
          employeId,
          statut: 'EN_COURS'
        };

        // Si un conseiller RH est sélectionné, l'inclure dans la création du dossier
        if (selectedConseillerRHId) {
          input.conseillerRHId = selectedConseillerRHId;
        }

        await createDossier({
          variables: { input }
        });
        return; // La fonction onCompleted gérera le passage à l'étape suivante
      } 
      else if (etapeActive === 1 && !selectedBeneficiaireId) {
        setErrorMessage("Veuillez sélectionner ou créer un bénéficiaire avant de continuer");
        return;
      }
      else if (etapeActive === 3) {
        // À la dernière étape, finaliser le dossier
        await updateStatut({
          variables: {
            id: dossierCourantId,
            statut: 'TERMINE'
          }
        });
        
        // Rediriger vers la liste des dossiers
        navigate('/dossiers');
        return;
      }

      // Passer à l'étape suivante
      setEtapeActive((prev) => prev + 1);
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(`Erreur: ${err.message}`);
    }
  };

  const handleBack = () => {
    setEtapeActive((prev) => prev - 1);
    setErrorMessage(null);
  };

  const handleBeneficiaireSelected = (beneficiaireId: string) => {
    setSelectedBeneficiaireId(beneficiaireId);
  };
  
  const handleEmployeSelected = (event: SelectChangeEvent<string>) => {
    setSelectedEmployeId(event.target.value);
  };

  const handleConseillerRHSelected = (event: SelectChangeEvent<string>) => {
    setSelectedConseillerRHId(event.target.value);
    
    // Si un dossier existe déjà, mettre à jour son conseiller RH
    if (dossierCourantId) {
      updateDossierConseiller({
        variables: {
          id: dossierCourantId,
          conseillerRHId: event.target.value
        }
      });
    }
  };

  const handleEmployeDossierSelected = (dossierId: string) => {
    navigate(`/mise-a-jour-beneficiaire/${dossierId}`);
  };

  if (loading || loadingDossiers || loadingConseillers) {
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

  // Extraction des employés uniques à partir des dossiers
  const employes = dossiersData?.dossiers 
    ? Array.from(new Map(dossiersData.dossiers.map((dossier: any) => [dossier.employe.id, dossier.employe])).values())
    : [];

  // Liste des conseillers RH
  const conseillers = conseillersData?.conseillersRH || [];

  // Créer une liste des dossiers groupés par employé
  const dossiersByEmploye = dossiersData?.dossiers
    ? dossiersData.dossiers.reduce((acc: any, dossier: any) => {
        const employeId = dossier.employe.id;
        if (!acc[employeId]) {
          acc[employeId] = [];
        }
        acc[employeId].push(dossier);
        return acc;
      }, {})
    : {};

  // Si aucun dossier ou employé n'est trouvé
  if (!dossierId && !data?.dossier?.employe) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Mise à jour du bénéficiaire
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Veuillez sélectionner un employé pour commencer le processus de mise à jour de bénéficiaire.
          </Alert>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="employe-select-label">Sélectionner un employé</InputLabel>
                <Select
                  labelId="employe-select-label"
                  id="employe-select"
                  value={selectedEmployeId || ''}
                  onChange={handleEmployeSelected}
                  label="Sélectionner un employé"
                >
                  {!employes?.length ? (
                    <MenuItem value="">
                      <em>Aucun employé disponible</em>
                    </MenuItem>
                  ) : (
                    employes.map((employe: any) => (
                      <MenuItem key={employe.id} value={employe.id}>
                        {employe.prenom} {employe.nom} ({employe.email})
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Dossiers existants de l'employé :
          </Typography>
          <Grid container spacing={2}>
            {selectedEmployeId && dossiersByEmploye[selectedEmployeId] ? 
              dossiersByEmploye[selectedEmployeId].map((dossier: any) => (
                <Grid item xs={12} sm={6} md={4} key={dossier.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Dossier #{dossier.id.substring(0, 12)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Bénéficiaire: {dossier.beneficiaire.prenom.charAt(0).toUpperCase() + dossier.beneficiaire.prenom.slice(1)} {dossier.beneficiaire.nom.charAt(0).toUpperCase() + dossier.beneficiaire.nom.slice(1)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Statut: {dossier.statut}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Date: {new Date(dossier.dateCreation).toLocaleDateString()}
                      </Typography>
                      <Button 
                        variant="outlined" 
                        sx={{ mt: 2 }}
                        onClick={() => handleEmployeDossierSelected(dossier.id)}
                        fullWidth
                      >
                        Sélectionner
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))
              : 
              <Grid item xs={12}>
                {selectedEmployeId ? (
                  <Alert severity="info">
                    Aucun dossier existant pour cet employé.
                  </Alert>
                ) : (
                  <Alert severity="info">
                    Sélectionnez un employé pour voir ses dossiers.
                  </Alert>
                )}
              </Grid>
            }
          </Grid>
        </Paper>
      </Container>
    );
  }

  const employe = data?.dossier?.employe;
  const conseillerRH = data?.dossier?.conseillerRH;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Mise à jour du bénéficiaire
        </Typography>
                
        <Stepper activeStep={etapeActive} sx={{ mb: 4 }}>
          {etapes.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {employe && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Employé: {employe.prenom} {employe.nom}
            </Typography>
            <Typography variant="body1">
              Email: {employe.email}
            </Typography>
          </Box>
        )}
        
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ mb: 2 }}>
          {etapeActive === 0 && (
            <Box>              
              <Box mt={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Conseiller RH
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small"
                    startIcon={<PersonAddIcon />}
                    onClick={() => setConseillerDialogOpen(true)}
                  >
                    {conseillerRH ? 'Changer' : 'Assigner'}
                  </Button>
                </Box>
                
                {conseillerRH ? (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Conseiller RH actuel : {conseillerRH.prenom} {conseillerRH.nom} ({conseillerRH.email})
                  </Alert>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Aucun conseiller RH assigné
                  </Typography>
                )}
                
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="body1" paragraph>
                  Vérifiez les informations personnelles de l'employé et/ou du conseiller RH ci-dessus avant de passer à l'étape suivante.
                </Typography>
              </Box>

              {/* Dialogue pour changer de conseiller RH */}
              <Dialog
                open={conseillerDialogOpen}
                onClose={() => setConseillerDialogOpen(false)}
                maxWidth="sm"
                fullWidth
              >
                <DialogTitle>
                  {conseillerRH ? 'Changer le conseiller RH' : 'Assigner un conseiller RH'}
                </DialogTitle>
                <DialogContent>
                  <DialogContentText sx={{ mb: 2 }}>
                    {conseillerRH 
                      ? 'Sélectionnez un nouveau conseiller RH pour ce dossier.' 
                      : 'Sélectionnez un conseiller RH à assigner à ce dossier.'}
                  </DialogContentText>
                  
                  {loadingConseillers ? (
                    <Box display="flex" justifyContent="center" my={2}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    <FormControl fullWidth sx={{ mt: 1 }}>
                      <InputLabel id="conseiller-select-dialog-label">Conseiller RH</InputLabel>
                      <Select
                        labelId="conseiller-select-dialog-label"
                        value={selectedConseillerRHId || ''}
                        onChange={handleConseillerRHSelected}
                        label="Conseiller RH"
                      >
                        {!(conseillers && conseillers.length > 0) ? (
                            <MenuItem value="">
                              <em>Aucun conseiller disponible</em>
                            </MenuItem>
                          ) : (
                            conseillers.map((conseiller: any) => (
                              <MenuItem key={conseiller.id} value={conseiller.id}>
                                {conseiller.prenom} {conseiller.nom} ({conseiller.email})
                              </MenuItem>
                            ))
                          )};
                      </Select>
                    </FormControl>
                  )}
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setConseillerDialogOpen(false)}>Annuler</Button>
                  <Button 
                    onClick={() => {
                      if (dossierCourantId) {
                        updateDossierConseiller({
                          variables: {
                            id: dossierCourantId,
                            conseillerRHId: selectedConseillerRHId || null
                          }
                        });
                      }
                      setConseillerDialogOpen(false);
                    }}
                    color="primary" 
                    disabled={updatingConseiller}
                  >
                    {updatingConseiller ? 'Mise à jour...' : 'Confirmer'}
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>
          )}

          {etapeActive === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Sélection du bénéficiaire
              </Typography>
              {employe && (
                <GestionBeneficiaires 
                  employeId={employe.id} 
                  dossierId={dossierCourantId || undefined}
                  onBeneficiaireAdded={handleBeneficiaireSelected}
                />
              )}
            </Box>
          )}

          {etapeActive === 2 && dossierCourantId && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Notification du changement
              </Typography>
              <NotificationChangement 
                dossierId={dossierCourantId}
                onNotificationSent={() => setEtapeActive(3)}
              />
            </Box>
          )}

          {etapeActive === 3 && dossierCourantId && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Courrier de confirmation
              </Typography>
              <CourrierConfirmation 
                dossierId={dossierCourantId}
                beneficiaireId={selectedBeneficiaireId || undefined}
              />
            </Box>
          )}
        </Box>

        <Grid container spacing={2} justifyContent="flex-end">
          <Grid item>
            <Button
              disabled={etapeActive === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Retour
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={creating || updating}
            >
              {etapeActive === etapes.length - 1 ? 'Terminer' : 'Suivant'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default MiseAJourBeneficiaire; 