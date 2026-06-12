import { IonButton } from "@ionic/react";
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
      style={{ color: "#47BCC2", fontWeight: 700, fontSize: "0.9rem", ...style }}
    >
      ← Zurück
    </IonButton>
  );
};

export default ZurueckButton;
