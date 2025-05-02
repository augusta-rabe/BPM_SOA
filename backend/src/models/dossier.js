const mongoose = require('mongoose');

const dossierSchema = new mongoose.Schema({
  dateCreation: {
    type: Date,
    default: Date.now
  },
  statut: {
    type: String,
    required: true,
    enum: ['EN_ATTENTE', 'EN_COURS', 'TERMINE', 'ANNULE'],
    default: 'EN_ATTENTE'
  },
  employe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employe',
    required: true
  },
  beneficiaire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Beneficiaire',
    required: true
  },
  conseillerRH: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConseillerRH'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Dossier', dossierSchema); 