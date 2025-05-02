const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { createApolloServer } = require('./graphql');
const { expressMiddleware } = require('@apollo/server/express4');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/bpm_soa', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connecté à MongoDB'))
.catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Modèles
const models = {
  Employe: require('./models/Employe'),
  Beneficiaire: require('./models/Beneficiaire'),
  Dossier: require('./models/Dossier'),
  Notification: require('./models/Notification'),
  CourrierConfirmation: require('./models/CourrierConfirmation'),
  CompagnieAssurance: require('./models/CompagnieAssurance'),
  ConseillerRH: require('./models/ConseillerRH')
};

// Configuration d'Apollo Server
const server = createApolloServer(models);

// Démarrage du serveur Apollo
async function startServer() {
  await server.start();
  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req }) => ({
      models
    })
  }));
}

startServer().catch(err => console.error('Erreur lors du démarrage du serveur:', err));

// Routes
app.get('/', (req, res) => {
  res.send('API BPM SOA');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
}); 