import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import client from './apollo/client';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ListeDossiers from './pages/ListeDossiers';
import DossierDetails from './pages/DossierDetails';
import MiseAJourBeneficiaire from './pages/MiseAJourBeneficiaire';
import InterfaceCompagnieAssurance from './pages/InterfaceCompagnieAssurance';
import GestionEmployes from './pages/GestionEmployes';
import GestionConseillersRH from './pages/GestionConseillersRH';
import './App.css';

// Thème personnalisé
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dossiers" element={<ListeDossiers />} />
              <Route path="/dossier/:id" element={<DossierDetails />} />
              <Route path="/mise-a-jour-beneficiaire" element={<MiseAJourBeneficiaire />} />
              <Route path="/mise-a-jour-beneficiaire/:id" element={<MiseAJourBeneficiaire />} />
              <Route path="/compagnies-assurance" element={<InterfaceCompagnieAssurance />} />
              <Route path="/compagnie-assurance/:id" element={<InterfaceCompagnieAssurance />} />
              <Route path="/employes" element={<GestionEmployes />} />
              <Route path="/conseillers-rh" element={<GestionConseillersRH />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </ApolloProvider>
  );
};

export default App;
