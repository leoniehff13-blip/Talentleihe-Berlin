import { IonButton, IonIcon } from "@ionic/react";
import { chevronBack } from "ionicons/icons";
import { useHistory } from "react-router-dom";

interface Props {
  style?: React.CSSProperties;
}

const ZurueckButton: React.FC<Props> = ({ style }) => {
  const history = useHistory();
  return (
    <IonButton
      fill="clear"
      onClick={() => history.goBack()}
      style={{ marginLeft: -8, ...style }}
    >
      <IonIcon slot="start" icon={chevronBack} />
      Zurück
    </IonButton>
  );
};

export default ZurueckButton;
