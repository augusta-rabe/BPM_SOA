const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { createApolloServer } = require('./graphql');
const { expressMiddleware } = require('@apollo/server/express4');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bpm_soa', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connecté à MongoDB'))
.catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Importation des modèles
const models = require('./models');

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

  // Routes
  app.get('/', (req, res) => {
    res.json({ message: 'API BPM SOA - Bienvenue' });
  });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
    console.log(`GraphQL disponible sur http://localhost:${PORT}/graphql`);
  });
}

startServer().catch(err => {
  console.error('Erreur lors du démarrage du serveur:', err);
  process.exit(1);
}); 