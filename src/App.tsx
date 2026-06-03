import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import TopNav from "./components/TopNav";

import Homepage from "./pages/Homepage";
import Anzeigen from './pages/Anzeigen';
import AnzeigeDetail from './pages/AnzeigeDetail';
import AnzeigeForm from './pages/AnzeigeForm';
import MeineAnzeigen from './pages/MeineAnzeigen';
import MeineBewerbungen from "./pages/MeineBewerbungen";
import ProfilDetail from './pages/ProfilDetail';
import BewerbungenZurAnzeige from "./pages/BewerbungenZurAnzeige";
import Informationen from "./pages/Informationen";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Konto from "./pages/auth/Konto";
import Verifizieren from "./pages/auth/Verifizieren";
import PasswortVergessen from "./pages/auth/PasswortVergessen";
import PasswortNeu from "./pages/auth/PasswortNeu";
import Datenschutz from "./pages/Datenschutz";
import AGB from "./pages/AGB";
import Impressum from "./pages/Impressum";
import Bewertung from "./pages/Bewertung";
import { AuthProvider } from "./lib/AuthContext";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <IonReactRouter>
        <TopNav />
        <IonRouterOutlet>
            <Route exact path="/home">
              <Homepage />
            </Route>

            <Route exact path="/anzeigen">
              <Anzeigen />
            </Route>
            <Route exact path="/anzeigen/:id([a-zA-Z0-9]{15,})">
              <AnzeigeDetail />
            </Route>

            <Route exact path="/informationen">
              <Informationen />
            </Route>

            <Route exact path="/meine-anzeigen">
              <MeineAnzeigen />
            </Route>
            <Route exact path="/meine-anzeigen/neu">
              <AnzeigeForm />
            </Route>
            <Route exact path="/meine-anzeigen/:id([a-zA-Z0-9]{15,})/bearbeiten">
              <AnzeigeForm />
            </Route>
            <Route exact path="/meine-anzeigen/:id([a-zA-Z0-9]{15,})">
              <AnzeigeDetail />
            </Route>
            <Route exact path="/meine-bewerbungen">
              <MeineBewerbungen />
            </Route>
            <Route exact path="/meine-anzeigen/:id([a-zA-Z0-9]{15,})/bewerbungen">
              <BewerbungenZurAnzeige />
            </Route>

            <Route exact path="/konto">
              <Konto />
            </Route>
            <Route exact path="/login">
              <Login />
            </Route>
            <Route exact path="/registrieren">
              <Register />
            </Route>
            <Route exact path="/verifizieren">
              <Verifizieren />
            </Route>
            <Route exact path="/passwort-vergessen">
              <PasswortVergessen />
            </Route>
            <Route exact path="/passwort-neu">
              <PasswortNeu />
            </Route>

            <Route exact path="/bewertung/:bewerbungId/:ratedUserId/:ratedType">
              <Bewertung />
            </Route>

            <Route exact path="/datenschutz">
              <Datenschutz />
            </Route>
            <Route exact path="/agb">
              <AGB />
            </Route>
            <Route exact path="/impressum">
              <Impressum />
            </Route>

            <Route exact path="/">
              <Redirect to="/home" />
            </Route>
                      <Route exact path="/profil/:userId"><ProfilDetail /></Route>
            </IonRouterOutlet>
      </IonReactRouter>
    </AuthProvider>
  </IonApp>
);

export default App;
