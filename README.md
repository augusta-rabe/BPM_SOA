# Système de Mise à Jour de Bénéficiaire - Projet BPM/SOA

## Description du Projet

Ce projet implémente un système complet de gestion des demandes de mise à jour de bénéficiaires pour les employés d'une organisation. Le système est conçu selon une approche BPM (Business Process Management) et une architecture SOA (Service-Oriented Architecture) pour faciliter la maintenance et l'évolutivité du processus métier.

### Contexte

Dans de nombreuses organisations, la mise à jour des informations de bénéficiaires (pour les assurances, les prestations sociales, etc.) est un processus administratif souvent complexe et chronophage. Ce système vise à digitaliser et automatiser ce processus pour :
- Réduire les erreurs administratives
- Accélérer le traitement des demandes
- Améliorer la traçabilité des modifications
- Faciliter la communication entre employés, RH et compagnies d'assurance

### Objectif

Permettre aux employés d'initier et de suivre des demandes de modification de bénéficiaires, aux conseillers RH de traiter ces demandes de manière efficace, et d'assurer une communication fluide et sécurisée avec les compagnies d'assurance concernées.

## Fonctionnalités Principales

- **Authentification sécurisée** pour les employés et conseillers RH avec gestion des rôles et permissions
- **Interface intuitive** pour soumettre et suivre des demandes de mise à jour de bénéficiaire
- **Formulaires structurés** pour la saisie des informations personnelles et des bénéficiaires
- **Système de validation** des informations saisies avec vérification de cohérence
- **Notifications automatiques** aux différentes parties prenantes à chaque étape du processus
- **Tableau de bord personnalisé** pour les conseillers RH gérant les demandes en cours
- **API d'intégration** avec les systèmes des compagnies d'assurance
- **Gestion de documents** pour joindre et vérifier des pièces justificatives
- **Historique des modifications** pour l'audit, la conformité et la traçabilité
- **Interface responsive** adaptée à tous les appareils (desktop, tablette, mobile)
- **Système de rappels** pour les actions en attente
- **Rapports d'audit** pour la conformité réglementaire

## Flux de Travail Principal

1. **Initiation** : L'employé s'authentifie et initie une demande de mise à jour de bénéficiaire
2. **Saisie d'informations** : L'employé remplit ses informations personnelles et celles du nouveau bénéficiaire
3. **Validation** : Le système valide les informations saisies (format, cohérence, complétude)
4. **Traitement RH** : Un conseiller RH reçoit la demande, l'examine et la valide
5. **Communication** : Le système notifie la compagnie d'assurance du changement
6. **Confirmation** : Un courrier de confirmation est généré et envoyé à l'employé
7. **Archivage** : La demande est archivée avec son historique complet pour référence future

## Architecture du Projet

Le projet est organisé selon une architecture moderne, modulaire et orientée services :

```
├── backend/                # Application backend
│   ├── src/                # Code source
│   │   ├── api/            # Points d'entrée API
│   │   ├── controllers/    # Contrôleurs
│   │   ├── models/         # Modèles de données
│   │   ├── services/       # Services métiers
│   │   └── utils/          # Utilitaires
│   ├── tests/              # Tests unitaires et d'intégration
│   └── README.md           # Documentation API
├── frontend/               # Application frontend
│   ├── public/             # Assets publics
│   ├── src/                # Code source
│   │   ├── components/     # Composants réutilisables
│   │   ├── pages/          # Pages de l'application
│   │   ├── services/       # Services d'API
│   │   └── utils/          # Utilitaires
│   └── tests/              # Tests frontend
├── Artefact/               # Documentation
│   ├── product-backlog.csv # Backlog produit
│   └── sprint-backlog.csv  # Backlog sprint
├── Diagrammes/             # Diagrammes 
│   ├── BPM                 # Image du diagramme BPM
│   └── Class               # Diagramme de classes
├── bpm/                    # Modèles de processus BPM
└── README.md               # Documentation générale
```

## Modèle de Données

Notre système repose sur un modèle de données robuste comprenant les entités principales suivantes :

### Utilisateurs
- **Employé** : Informations de base, données professionnelles, historique des demandes
- **Conseiller RH** : Profil, spécialité, dossiers assignés

### Demandes
- Métadonnées (date, statut, historique des modifications)
- Lien vers l'employé initiateur
- Informations du bénéficiaire
- Documents associés
- Journal des actions

### Bénéficiaires
- Informations personnelles
- Relation avec l'employé
- Coordonnées
- Pourcentage d'allocation (si applicable)

### Notifications
- Types variés (email, système, SMS)
- Statut (envoyé, lu, action requise)
- Contenu personnalisé
- Destinataires

### Documents
- Pièces justificatives
- Formulaires générés
- Confirmations reçues

## Technologies Utilisées

### Backend
- **Langage** : Node.js avec Express
- **API** : GraphQL pour une communication flexible
- **Base de données** : MongoDB avec Mongoose
- **Authentification** : JWT (JSON Web Tokens) avec rotation
- **Validation** : Joi pour la validation des données
- **Documentation API** : Swagger/OpenAPI

### Frontend
- **Framework** : React.js avec hooks
- **UI Components** : Material-UI pour une interface moderne
- **State Management** : Redux avec redux-toolkit
- **Formulaires** : Formik avec Yup pour la validation
- **Notifications** : Socket.io pour les mises à jour en temps réel

### Architecture BPM/SOA
- **Moteur de workflow** : Camunda BPM
- **Modélisation BPMN** : Camunda Modeler
- **Services** : Microservices REST dédiés par domaine
- **Messagerie** : RabbitMQ pour la communication asynchrone

### DevOps
- **Gestion de Version** : Git avec GitHub Flow
- **CI/CD** : GitHub Actions pour l'intégration et le déploiement continus
- **Qualité de Code** : ESLint, Prettier, SonarQube
- **Tests** : Jest, React Testing Library, Cypress pour les tests E2E
- **Containerisation** : Docker avec Docker Compose
- **Monitoring** : Prometheus et Grafana

## Installation et Démarrage

### Prérequis
- Node.js (v14 ou supérieur)
- MongoDB (v4.4 ou supérieur)
- npm ou yarn
- Docker et Docker Compose (optionnel, pour l'environnement de développement isolé)

### Installation
1. Cloner le dépôt:
   ```bash
   git clone https://github.com/augusta-rabe/BPM_SOA.git
   cd BPM_SOA
   ```

2. Installer les dépendances du backend:
   ```bash
   cd backend
   npm install
   ```

3. Installer les dépendances du frontend:
   ```bash
   cd ../frontend
   npm install
   ```

4. Configurer les variables d'environnement:
   - Créer un fichier `.env` dans le dossier backend à partir du modèle `.env.example`
   - Configurer les variables requises (MongoDB URI, JWT Secret, SMTP pour emails, etc.)

### Démarrage avec Docker (recommandé)
```bash
docker-compose up -d
```

### Démarrage manuel
1. Lancer le backend:
   ```bash
   cd backend
   npm start
   ```

2. Lancer le frontend:
   ```bash
   cd frontend
   npm start
   ```

3. Accéder à l'application via:
- **Frontend** :
   ```bash
    http://localhost:3000
   ```
- **Backend** :
   ```bash
    http://localhost:4000/graphql
   ```
## Méthodologie de Développement

Ce projet est développé selon une approche Agile Scrum avec:
- Sprints de 2 semaines avec capacité d'équipe mesurée
- Product Backlog et Sprint Backlog bien définis et priorisés
- Réunions quotidiennes (Daily Scrum) pour synchronisation
- Revues de sprint et rétrospectives pour amélioration continue
- Estimations en points de complexité (product backlog) et heures (sprint backlog)
- Tests automatisés à tous les niveaux (unitaires, intégration, E2E)

## Roadmap du Projet

### Sprint 1 (en cours)
- Mise en place des fondations du système (authentification, interface de base)
- Implémentation du flux principal de demande de mise à jour
- Configuration de l'infrastructure de base

### Prochains Sprints
- Intégration avec les systèmes d'assurance
- Dashboard avancé pour les conseillers RH
- Système de communication bidirectionnelle RH-Employé
- Historique des modifications et rapports d'audit
- Optimisations de performance et UX

## Contributeurs

- [Votre nom]
- [Noms des membres de l'équipe]
