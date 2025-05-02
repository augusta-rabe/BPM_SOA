const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { GraphQLScalarType, Kind } = require('graphql');
const typeDefs = require('./types');

// Scalar pour le type Date
const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value) {
    return value instanceof Date ? value.getTime() : null;
  },
  parseValue(value) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10));
    }
    return null;
  },
});

// Resolvers de base
const resolvers = {
  Date: dateScalar,
  
  Query: {
    employe: async (_, { id }, { models }) => {
      return await models.Employe.findById(id);
    },
    employes: async (_, __, { models }) => {
      return await models.Employe.find({});
    },
    employeByEmail: async (_, { email }, { models }) => {
      return await models.Employe.findOne({ email });
    },
    conseillerRH: async (_, { id }, { models }) => {
      return await models.ConseillerRH.findById(id);
    },
    conseillersRH: async (_, __, { models }) => {
      return await models.ConseillerRH.find({});
    },
    beneficiaire: async (_, { id }, { models }) => {
      return await models.Beneficiaire.findById(id);
    },
    beneficiaires: async (_, __, { models }) => {
      return await models.Beneficiaire.find({});
    },
    dossier: async (_, { id }, { models }) => {
      return await models.Dossier.findById(id);
    },
    dossiers: async (_, __, { models }) => {
      return await models.Dossier.find({});
    },
    notification: async (_, { id }, { models }) => {
      return await models.Notification.findById(id);
    },
    notifications: async (_, __, { models }) => {
      return await models.Notification.find({});
    },
    courrierConfirmation: async (_, { id }, { models }) => {
      return await models.CourrierConfirmation.findById(id);
    },
    courriersConfirmation: async (_, __, { models }) => {
      return await models.CourrierConfirmation.find({});
    },
    compagnieAssurance: async (_, { id }, { models }) => {
      return await models.CompagnieAssurance.findById(id);
    },
    compagniesAssurance: async (_, __, { models }) => {
      return await models.CompagnieAssurance.find({});
    },
    notificationsByCompagnie: async (_, { compagnieId }, { models }) => {
      return await models.Notification.find({ compagnieAssurance: compagnieId }).sort({ date: -1 });
    },
    beneficiairesByEmploye: async (_, { employeId }, { models }) => {
      // Trouver tous les dossiers associés à l'employé
      const dossiers = await models.Dossier.find({ employe: employeId });
      
      // Extraire les IDs de bénéficiaires uniques
      const beneficiaireIds = [...new Set(dossiers.map(dossier => dossier.beneficiaire))];
      
      // Récupérer tous les bénéficiaires correspondants
      return await models.Beneficiaire.find({ _id: { $in: beneficiaireIds } });
    }
  },

  Mutation: {
    createEmploye: async (_, { input }, { models }) => {
      return await models.Employe.create(input);
    },
    updateEmploye: async (_, { id, input }, { models }) => {
      return await models.Employe.findByIdAndUpdate(id, input, { new: true });
    },
    deleteEmploye: async (_, { id }, { models }) => {
      await models.Employe.findByIdAndDelete(id);
      return true;
    },

    createBeneficiaire: async (_, { input }, { models }) => {
      try {
        const beneficiaireInput = {
          ...input,
          dateNaissance: new Date(input.dateNaissance)
        };
        
        // Validation
        if (!beneficiaireInput.nom || !beneficiaireInput.prenom) {
          throw new Error("Le nom et le prénom du bénéficiaire sont requis");
        }
        
        if (!beneficiaireInput.dateNaissance || isNaN(beneficiaireInput.dateNaissance.getTime())) {
          throw new Error("La date de naissance est invalide");
        }
        
        // Vérifier que la relation est valide
        const relationsValides = ['CONJOINT', 'ENFANT', 'PARENT', 'AUTRE'];
        if (!relationsValides.includes(beneficiaireInput.relationAvecEmploye)) {
          throw new Error("La relation avec l'employé est invalide");
        }
        
        return await models.Beneficiaire.create(beneficiaireInput);
      } catch (error) {
        console.error("Erreur lors de la création du bénéficiaire:", error);
        throw new Error(`Erreur lors de la création du bénéficiaire: ${error.message}`);
      }
    },
    updateBeneficiaire: async (_, { id, input }, { models }) => {
      try {
        // Vérifier si le bénéficiaire existe
        const beneficiaireExiste = await models.Beneficiaire.findById(id);
        if (!beneficiaireExiste) {
          throw new Error("Bénéficiaire non trouvé");
        }
        
        const updateData = { ...input };
        
        // Validation de la date si présente
        if (input.dateNaissance) {
          const date = new Date(input.dateNaissance);
          if (isNaN(date.getTime())) {
            throw new Error("La date de naissance est invalide");
          }
          updateData.dateNaissance = date;
        }
        
        // Validation de la relation si présente
        if (input.relationAvecEmploye) {
          const relationsValides = ['CONJOINT', 'ENFANT', 'PARENT', 'AUTRE'];
          if (!relationsValides.includes(input.relationAvecEmploye)) {
            throw new Error("La relation avec l'employé est invalide");
          }
        }
        
        return await models.Beneficiaire.findByIdAndUpdate(id, updateData, { new: true });
      } catch (error) {
        console.error("Erreur lors de la mise à jour du bénéficiaire:", error);
        throw new Error(`Erreur lors de la mise à jour du bénéficiaire: ${error.message}`);
      }
    },
    deleteBeneficiaire: async (_, { id }, { models }) => {
      try {
        // Vérifier si le bénéficiaire existe
        const beneficiaire = await models.Beneficiaire.findById(id);
        if (!beneficiaire) {
          throw new Error("Bénéficiaire non trouvé");
        }
        
        // Vérifier si le bénéficiaire est associé à des dossiers
        const dossiersAssocies = await models.Dossier.find({ beneficiaire: id });
        if (dossiersAssocies.length > 0) {
          throw new Error("Impossible de supprimer ce bénéficiaire car il est associé à un ou plusieurs dossiers");
        }
        
        await models.Beneficiaire.findByIdAndDelete(id);
        return true;
      } catch (error) {
        console.error("Erreur lors de la suppression du bénéficiaire:", error);
        throw new Error(`Erreur lors de la suppression du bénéficiaire: ${error.message}`);
      }
    },

    createDossier: async (_, { input }, { models }) => {
      const { employeId, beneficiaireId, conseillerRHId, statut } = input;
      return await models.Dossier.create({
        employe: employeId,
        beneficiaire: beneficiaireId,
        conseillerRH: conseillerRHId,
        statut: statut || 'EN_ATTENTE'
      });
    },
    updateDossier: async (_, { id, input }, { models }) => {
      const updateData = {};
      if (input.employeId) updateData.employe = input.employeId;
      if (input.beneficiaireId) updateData.beneficiaire = input.beneficiaireId;
      if (input.conseillerRHId) updateData.conseillerRH = input.conseillerRHId;
      if (input.statut) updateData.statut = input.statut;
      
      return await models.Dossier.findByIdAndUpdate(id, updateData, { new: true });
    },
    updateDossierStatut: async (_, { id, statut }, { models }) => {
      return await models.Dossier.findByIdAndUpdate(id, { statut }, { new: true });
    },
    deleteDossier: async (_, { id }, { models }) => {
      await models.Dossier.findByIdAndDelete(id);
      return true;
    },

    createConseillerRH: async (_, { input }, { models }) => {
      return await models.ConseillerRH.create(input);
    },
    updateConseillerRH: async (_, { id, input }, { models }) => {
      return await models.ConseillerRH.findByIdAndUpdate(id, input, { new: true });
    },
    deleteConseillerRH: async (_, { id }, { models }) => {
      await models.ConseillerRH.findByIdAndDelete(id);
      return true;
    },

    createNotification: async (_, { input }, { models }) => {
      const { dossierId, message, compagnieAssuranceId } = input;
      const notificationData = {
        dossier: dossierId,
        message,
        compagnieAssurance: compagnieAssuranceId
      };
      return await models.Notification.create(notificationData);
    },
    updateNotification: async (_, { id, input }, { models }) => {
      const updateData = {};
      if (input.message) updateData.message = input.message;
      if (input.compagnieAssuranceId) updateData.compagnieAssurance = input.compagnieAssuranceId;
      return await models.Notification.findByIdAndUpdate(id, updateData, { new: true });
    },
    deleteNotification: async (_, { id }, { models }) => {
      await models.Notification.findByIdAndDelete(id);
      return true;
    },

    createCourrierConfirmation: async (_, { input }, { models }) => {
      const { dossierId, contenu } = input;
      return await models.CourrierConfirmation.create({
        dossier: dossierId,
        contenu
      });
    },
    updateCourrierConfirmation: async (_, { id, input }, { models }) => {
      return await models.CourrierConfirmation.findByIdAndUpdate(id, { contenu: input.contenu }, { new: true });
    },
    deleteCourrierConfirmation: async (_, { id }, { models }) => {
      await models.CourrierConfirmation.findByIdAndDelete(id);
      return true;
    },

    createCompagnieAssurance: async (_, { input }, { models }) => {
      return await models.CompagnieAssurance.create(input);
    },
    updateCompagnieAssurance: async (_, { id, input }, { models }) => {
      return await models.CompagnieAssurance.findByIdAndUpdate(id, input, { new: true });
    },
    deleteCompagnieAssurance: async (_, { id }, { models }) => {
      await models.CompagnieAssurance.findByIdAndDelete(id);
      return true;
    }
  },

  Employe: {
    dossiers: async (parent, _, { models }) => {
      return await models.Dossier.find({ employe: parent.id });
    }
  },
  
  ConseillerRH: {
    dossiers: async (parent, _, { models }) => {
      return await models.Dossier.find({ conseillerRH: parent.id });
    }
  },

  Beneficiaire: {
    dossiers: async (parent, _, { models }) => {
      return await models.Dossier.find({ beneficiaire: parent.id });
    }
  },
  
  Dossier: {
    employe: async (parent, _, { models }) => {
      return await models.Employe.findById(parent.employe);
    },
    beneficiaire: async (parent, _, { models }) => {
      return await models.Beneficiaire.findById(parent.beneficiaire);
    },
    conseillerRH: async (parent, _, { models }) => {
      return parent.conseillerRH ? await models.ConseillerRH.findById(parent.conseillerRH) : null;
    },
    notifications: async (parent, _, { models }) => {
      return await models.Notification.find({ dossier: parent.id });
    },
    courrierConfirmation: async (parent, _, { models }) => {
      return await models.CourrierConfirmation.findOne({ dossier: parent.id });
    }
  },

  Notification: {
    dossier: async (parent, _, { models }) => {
      return await models.Dossier.findById(parent.dossier);
    },
    compagnieAssurance: async (parent, _, { models }) => {
      return parent.compagnieAssurance ? await models.CompagnieAssurance.findById(parent.compagnieAssurance) : null;
    }
  },

  CourrierConfirmation: {
    dossier: async (parent, _, { models }) => {
      return await models.Dossier.findById(parent.dossier);
    }
  },

  CompagnieAssurance: {
    notifications: async (parent, _, { models }) => {
      return await models.Notification.find({ compagnieAssurance: parent.id });
    }
  }
};

// Configuration du serveur Apollo
const createApolloServer = (models) => {
  return new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => ({
      models
    })
  });
};

module.exports = { createApolloServer };