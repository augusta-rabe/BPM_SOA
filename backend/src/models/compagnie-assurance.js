const mongoose = require('mongoose');

const compagnieAssuranceSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CompagnieAssurance', compagnieAssuranceSchema); 