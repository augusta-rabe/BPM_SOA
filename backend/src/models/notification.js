const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  dossier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dossier',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  compagnieAssurance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompagnieAssurance'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema); 