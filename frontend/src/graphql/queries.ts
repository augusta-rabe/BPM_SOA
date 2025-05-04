import { gql } from '@apollo/client';

export const GET_DOSSIERS = gql`
  query GetDossiers {
    dossiers {
      id
      dateCreation
      statut
      employe {
        id
        nom
        prenom
        email
      }
      beneficiaire {
        id
        nom
        prenom
        dateNaissance
        relationAvecEmploye
      }
      conseillerRH {
        id
        nom
        prenom
        email
      }
    }
  }
`;

export const GET_DOSSIER = gql`
  query GetDossier($id: ID!) {
    dossier(id: $id) {
      id
      statut
      dateCreation
      employe {
        id
        nom
        prenom
        email
        beneficiaires: dossiers {
          beneficiaire {
            id
            nom
            prenom
            dateNaissance
            relationAvecEmploye
          }
        }
      }
      beneficiaire {
        id
        nom
        prenom
        dateNaissance
        relationAvecEmploye
      }
      conseillerRH {
        id
        nom
        prenom
        email
      }
      notifications {
        id
        message
        date
      }
      courrierConfirmation {
        id
        date
        contenu
      }
    }
  }
`;

export const GET_BENEFICIAIRES_BY_EMPLOYE = gql`
  query GetBeneficiairesByEmploye($employeId: ID!) {
    beneficiairesByEmploye(employeId: $employeId) {
      id
      nom
      prenom
      dateNaissance
      relationAvecEmploye
    }
  }
`;

export const GET_EMPLOYES = gql`
  query GetEmployes {
    employes {
      id
      nom
      prenom
      email
    }
  }
`;

export const GET_EMPLOYE = gql`
  query GetEmploye($id: ID!) {
    employe(id: $id) {
      id
      nom
      prenom
      email
      dossiers {
        id
        dateCreation
        statut
      }
    }
  }
`;

export const CREATE_EMPLOYE = gql`
  mutation CreateEmploye($input: EmployeInput!) {
    createEmploye(input: $input) {
      id
      nom
      prenom
      email
    }
  }
`;

export const UPDATE_EMPLOYE = gql`
  mutation UpdateEmploye($id: ID!, $input: UpdateEmployeInput!) {
    updateEmploye(id: $id, input: $input) {
      id
      nom
      prenom
      email
    }
  }
`;

export const DELETE_EMPLOYE = gql`
  mutation DeleteEmploye($id: ID!) {
    deleteEmploye(id: $id)
  }
`;

export const CREATE_BENEFICIAIRE = gql`
  mutation CreateBeneficiaire($input: BeneficiaireInput!) {
    createBeneficiaire(input: $input) {
      id
      nom
      prenom
      dateNaissance
      relationAvecEmploye
    }
  }
`;

export const UPDATE_BENEFICIAIRE = gql`
  mutation UpdateBeneficiaire($id: ID!, $input: UpdateBeneficiaireInput!) {
    updateBeneficiaire(id: $id, input: $input) {
      id
      nom
      prenom
      dateNaissance
      relationAvecEmploye
    }
  }
`;

export const DELETE_BENEFICIAIRE = gql`
  mutation DeleteBeneficiaire($id: ID!) {
    deleteBeneficiaire(id: $id)
  }
`;

export const CREATE_DOSSIER = gql`
  mutation CreateDossier($input: DossierInput!) {
    createDossier(input: $input) {
      id
      dateCreation
      statut
      employe {
        id
        nom
        prenom
      }
      beneficiaire {
        id
        nom
        prenom
      }
      conseillerRH {
        id
        nom
        prenom
      }
    }
  }
`;

export const UPDATE_DOSSIER_STATUT = gql`
  mutation UpdateDossierStatut($id: ID!, $statut: String!) {
    updateDossierStatut(id: $id, statut: $statut) {
      id
      statut
    }
  }
`;

export const DELETE_DOSSIER = gql`
  mutation DeleteDossier($id: ID!) {
    deleteDossier(id: $id)
  }
`;

// Cette requête n'est pas disponible dans le backend actuellement
/*
export const GET_HISTORIQUE_MODIFICATIONS = gql`
  query GetHistoriqueModifications($dossierId: ID!) {
    historiqueModifications(dossierId: $dossierId) {
      id
      type
      date
      utilisateur {
        id
        nom
        prenom
      }
      details {
        ancienneValeur
        nouvelleValeur
        champModifie
        commentaire
      }
    }
  }
`;
*/

export const CREATE_NOTIFICATION = gql`
  mutation CreateNotification($input: CreateNotificationInput!) {
    createNotification(input: $input) {
      id
      message
      date
      dossier {
        id
      }
      compagnieAssurance {
        id
        nom
      }
    }
  }
`;

export const CREATE_COURRIER_CONFIRMATION = gql`
  mutation CreateCourrierConfirmation($input: CreateCourrierConfirmationInput!) {
    createCourrierConfirmation(input: $input) {
      id
      contenu
      date
      dossier {
        id
      }
    }
  }
`;

export const GET_COMPAGNIES_ASSURANCE = gql`
  query GetCompagniesAssurance {
    compagniesAssurance {
      id
      nom
      email
    }
  }
`;

export const GET_NOTIFICATIONS_BY_COMPAGNIE = gql`
  query GetNotificationsByCompagnie($compagnieId: ID!) {
    notificationsByCompagnie(compagnieId: $compagnieId) {
      id
      message
      date
      dossier {
        id
      }
    }
  }
`;

export const CREATE_COMPAGNIE_ASSURANCE = gql`
  mutation CreateCompagnieAssurance($input: CreateCompagnieAssuranceInput!) {
    createCompagnieAssurance(input: $input) {
      id
      nom
      email
    }
  }
`;

export const UPDATE_COMPAGNIE_ASSURANCE = gql`
  mutation UpdateCompagnieAssurance($id: ID!, $input: UpdateCompagnieAssuranceInput!) {
    updateCompagnieAssurance(id: $id, input: $input) {
      id
      nom
      email
    }
  }
`;

export const DELETE_COMPAGNIE_ASSURANCE = gql`
  mutation DeleteCompagnieAssurance($id: ID!) {
    deleteCompagnieAssurance(id: $id)
  }
`;

export const GET_CONSEILLERS_RH = gql`
  query GetConseillersRH {
    conseillersRH {
      id
      nom
      prenom
      email
    }
  }
`;

export const GET_CONSEILLER_RH = gql`
  query GetConseillerRH($id: ID!) {
    conseillerRH(id: $id) {
      id
      nom
      prenom
      email
      dossiers {
        id
        dateCreation
        statut
      }
    }
  }
`;

export const CREATE_CONSEILLER_RH = gql`
  mutation CreateConseillerRH($input: CreateConseillerRHInput!) {
    createConseillerRH(input: $input) {
      id
      nom
      prenom
      email
    }
  }
`;

export const UPDATE_CONSEILLER_RH = gql`
  mutation UpdateConseillerRH($id: ID!, $input: UpdateConseillerRHInput!) {
    updateConseillerRH(id: $id, input: $input) {
      id
      nom
      prenom
      email
    }
  }
`;

export const DELETE_CONSEILLER_RH = gql`
  mutation DeleteConseillerRH($id: ID!) {
    deleteConseillerRH(id: $id)
  }
`;

export const UPDATE_DOSSIER_CONSEILLER = gql`
  mutation UpdateDossierConseiller($id: ID!, $conseillerRHId: ID!) {
    updateDossier(id: $id, input: { conseillerRHId: $conseillerRHId }) {
      id
      conseillerRH {
        id
        nom
        prenom
      }
    }
  }
`; 