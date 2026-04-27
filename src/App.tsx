import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { briefcaseOutline, listOutline, personOutline } from "ionicons/icons";

import Lehrstellen from "./pages/Lehrstellen";
import LehrstelleDetail from "./pages/LehrstelleDetail";
import LehrstelleForm from "./pages/LehrstelleForm";
import MeineLehrstellen from "./pages/MeineLehrstellen";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Konto from "./pages/auth/Konto";
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
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/lehrstellen">
              <Lehrstellen />
            </Route>
            <Route exact path="/lehrstellen/:id">
              <LehrstelleDetail />
            </Route>

            <Route exact path="/meine-lehrstellen">
              <MeineLehrstellen />
            </Route>
            <Route exact path="/meine-lehrstellen/neu">
              <LehrstelleForm />
            </Route>
            <Route exact path="/meine-lehrstellen/:id/bearbeiten">
              <LehrstelleForm />
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

            <Route exact path="/">
              <Redirect to="/lehrstellen" />
            </Route>
          </IonRouterOutlet>

          <IonTabBar slot="bottom">
            <IonTabButton tab="lehrstellen" href="/lehrstellen">
              <IonIcon icon={listOutline} />
              <IonLabel>Lehrstellen</IonLabel>
            </IonTabButton>
            <IonTabButton tab="meine-lehrstellen" href="/meine-lehrstellen">
              <IonIcon icon={briefcaseOutline} />
              <IonLabel>Meine</IonLabel>
            </IonTabButton>
            <IonTabButton tab="konto" href="/konto">
              <IonIcon icon={personOutline} />
              <IonLabel>Konto</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </AuthProvider>
  </IonApp>
);

export default App;
