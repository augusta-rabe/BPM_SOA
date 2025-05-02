const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Employe {
    id: ID!
    nom: String!
    prenom: String!
    email: String!
    dossiers: [Dossier]
  }

  type Beneficiaire {
    id: ID!
    nom: String!
    prenom: String!
    dateNaissance: Date!
    relationAvecEmploye: String!
    dossiers: [Dossier]
  }

  type Dossier {
    id: ID!
    employe: Employe!
    beneficiaire: Beneficiaire!
    conseillerRH: ConseillerRH
    statut: String!
    dateCreation: Date
    notifications: [Notification]
    courrierConfirmation: CourrierConfirmation
  }

  type Notification {
    id: ID!
    dossier: Dossier!
    message: String!
    date: Date!
    compagnieAssurance: CompagnieAssurance
  }

  type CourrierConfirmation {
    id: ID!
    dossier: Dossier!
    date: Date!
    contenu: String!
  }

  type CompagnieAssurance {
    id: ID!
    nom: String!
    email: String!
    notifications: [Notification]
  }

  type ConseillerRH {
    id: ID!
    nom: String!
    prenom: String!
    email: String!
    dossiers: [Dossier]
  }

  scalar Date

  type Query {
    employe(id: ID!): Employe
    employes: [Employe]
    employeByEmail(email: String!): Employe
    beneficiaire(id: ID!): Beneficiaire
    beneficiaires: [Beneficiaire]
    beneficiairesByEmploye(employeId: ID!): [Beneficiaire]
    dossier(id: ID!): Dossier
    dossiers: [Dossier]
    notification(id: ID!): Notification
    notifications: [Notification]
    notificationsByCompagnie(compagnieId: ID!): [Notification]
    courrierConfirmation(id: ID!): CourrierConfirmation
    courriersConfirmation: [CourrierConfirmation]
    compagnieAssurance(id: ID!): CompagnieAssurance
    compagniesAssurance: [CompagnieAssurance]
    conseillerRH(id: ID!): ConseillerRH
    conseillersRH: [ConseillerRH]
  }

  type Mutation {
    createEmploye(input: EmployeInput!): Employe
    updateEmploye(id: ID!, input: UpdateEmployeInput!): Employe
    deleteEmploye(id: ID!): Boolean
    createBeneficiaire(input: BeneficiaireInput!): Beneficiaire
    updateBeneficiaire(id: ID!, input: UpdateBeneficiaireInput!): Beneficiaire
    deleteBeneficiaire(id: ID!): Boolean
    createDossier(input: DossierInput!): Dossier
    updateDossier(id: ID!, input: UpdateDossierInput!): Dossier
    updateDossierStatut(id: ID!, statut: String!): Dossier
    deleteDossier(id: ID!): Boolean
    createNotification(input: CreateNotificationInput!): Notification
    updateNotification(id: ID!, input: UpdateNotificationInput!): Notification
    deleteNotification(id: ID!): Boolean
    createCourrierConfirmation(input: CreateCourrierConfirmationInput!): CourrierConfirmation
    updateCourrierConfirmation(id: ID!, input: UpdateCourrierConfirmationInput!): CourrierConfirmation
    deleteCourrierConfirmation(id: ID!): Boolean
    createCompagnieAssurance(input: CreateCompagnieAssuranceInput!): CompagnieAssurance
    updateCompagnieAssurance(id: ID!, input: UpdateCompagnieAssuranceInput!): CompagnieAssurance
    deleteCompagnieAssurance(id: ID!): Boolean
    createConseillerRH(input: CreateConseillerRHInput!): ConseillerRH
    updateConseillerRH(id: ID!, input: UpdateConseillerRHInput!): ConseillerRH
    deleteConseillerRH(id: ID!): Boolean
  }

  input EmployeInput {
    nom: String!
    prenom: String!
    email: String!
  }

  input UpdateEmployeInput {
    nom: String
    prenom: String
    email: String
  }

  input BeneficiaireInput {
    nom: String!
    prenom: String!
    dateNaissance: Date!
    relationAvecEmploye: String!
  }

  input UpdateBeneficiaireInput {
    nom: String
    prenom: String
    dateNaissance: Date
    relationAvecEmploye: String
  }

  input DossierInput {
    employeId: ID!
    beneficiaireId: ID!
    conseillerRHId: ID
    statut: String!
  }

  input UpdateDossierInput {
    employeId: ID
    beneficiaireId: ID
    conseillerRHId: ID
    statut: String
  }

  input CreateNotificationInput {
    dossierId: ID!
    message: String!
    compagnieAssuranceId: ID
  }

  input UpdateNotificationInput {
    message: String
    compagnieAssuranceId: ID
  }

  input CreateCourrierConfirmationInput {
    dossierId: ID!
    contenu: String!
  }

  input UpdateCourrierConfirmationInput {
    contenu: String
  }

  input CreateCompagnieAssuranceInput {
    nom: String!
    email: String!
  }

  input UpdateCompagnieAssuranceInput {
    nom: String
    email: String
  }

  input CreateConseillerRHInput {
    nom: String!
    prenom: String!
    email: String!
  }

  input UpdateConseillerRHInput {
    nom: String
    prenom: String
    email: String
  }
`;

module.exports = typeDefs;