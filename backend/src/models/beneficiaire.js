const mongoose = require('mongoose');

const beneficiaireSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  prenom: {
    type: String,
    required: true
  },
  dateNaissance: {
    type: Date,
    required: true
  },
  relationAvecEmploye: {
    type: String,
    required: true,
    enum: ['CONJOINT', 'ENFANT', 'PARENT', 'AUTRE']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Beneficiaire', beneficiaireSchema); 