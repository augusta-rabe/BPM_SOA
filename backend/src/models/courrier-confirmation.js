const mongoose = require('mongoose');

const courrierConfirmationSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  contenu: {
    type: String,
    required: true
  },
  statut: {
    type: String,
    enum: ['GENERE', 'ENVOYE'],
    default: 'GENERE'
  },
  dossier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dossier',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CourrierConfirmation', courrierConfirmationSchema); 