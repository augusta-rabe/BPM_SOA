const mongoose = require('mongoose');

const employeSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  prenom: {
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

// Création du modèle
const Employe = mongoose.model('Employe', employeSchema);

// Vérification que le modèle a les méthodes Mongoose
if (!Employe.findById) {
  throw new Error('Le modèle Employe n\'a pas la méthode findById');
}

module.exports = Employe; 