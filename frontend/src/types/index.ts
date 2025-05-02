export enum StatutDossier {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE',
  ANNULE = 'ANNULE'
}

export enum TypeNotification {
  CHANGEMENT = 'CHANGEMENT',
  VALIDATION = 'VALIDATION',
  CONFIRMATION = 'CONFIRMATION'
}

export enum StatutCourrier {
  GENERE = 'GENERE',
  ENVOYE = 'ENVOYE'
}

export enum TypeModification {
  CREATION = 'CREATION',
  MODIFICATION_STATUT = 'MODIFICATION_STATUT',
  MODIFICATION_EMPLOYE = 'MODIFICATION_EMPLOYE',
  MODIFICATION_BENEFICIAIRE = 'MODIFICATION_BENEFICIAIRE',
  MODIFICATION_CONSEILLER = 'MODIFICATION_CONSEILLER',
  AJOUT_DOCUMENT = 'AJOUT_DOCUMENT',
  COMMENTAIRE = 'COMMENTAIRE'
}

export interface Employe {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  dossiers?: Dossier[];
}

export interface ConseillerRH {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  dossiers?: Dossier[];
}

export interface Beneficiaire {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance: Date;
  relationAvecEmploye: string;
  dossiers?: Dossier[];
}

export interface Dossier {
  id: string;
  dateCreation: Date;
  statut: string;
  employe: Employe;
  beneficiaire: Beneficiaire;
  conseillerRH?: ConseillerRH;
  notifications?: Notification[];
  courrierConfirmation?: CourrierConfirmation;
}

export interface Notification {
  id: string;
  message: string;
  date: Date;
  dossier: Dossier;
  compagnieAssurance?: CompagnieAssurance;
}

export interface CourrierConfirmation {
  id: string;
  date: Date;
  contenu: string;
  dossier: Dossier;
}

export interface CompagnieAssurance {
  id: string;
  nom: string;
  email: string;
  notifications?: Notification[];
}

export interface HistoriqueModification {
  id: string;
  dossierId: string;
  type: TypeModification;
  date: string;
  utilisateur: {
    id: string;
    nom: string;
    prenom: string;
  };
  details: {
    ancienneValeur?: string;
    nouvelleValeur?: string;
    champModifie?: string;
    commentaire?: string;
  };
}

export interface FiltresRecherche {
  statut?: string;
  dateDebut?: string;
  dateFin?: string;
  employeNom?: string;
  employePrenom?: string;
  beneficiaireNom?: string;
  beneficiairePrenom?: string;
  conseillerNom?: string;
  conseillerPrenom?: string;
} 