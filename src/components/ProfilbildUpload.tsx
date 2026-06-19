import { useState } from "react";
import { ID, Permission, Role } from "appwrite";
import { IonIcon, IonSpinner, IonText, useIonAlert } from "@ionic/react";
import { personCircleOutline, cameraOutline, trashOutline } from "ionicons/icons";
import { storage, BUCKET_AVATARS } from "../lib/appwrite";
import { useAuth } from "../lib/AuthContext";
import { translateError } from "../lib/errors";

interface Props {
  fileId: string | null;
  onChange: (fileId: string | null) => void;
}

export function getAvatarUrl(fileId: string): string {
  const endpoint = (
    (import.meta.env.VITE_APPWRITE_ENDPOINT as string) ??
    "https://fra.cloud.appwrite.io/v1"
  ).replace(/\/+$/, "");
  const project = (import.meta.env.VITE_APPWRITE_PROJECT_ID as string) ?? "";
  return `${endpoint}/storage/buckets/avatars/files/${fileId}/view?project=${project}`;
}

const INPUT_ID = "profilbild-file-input";

const ProfilbildUpload: React.FC<Props> = ({ fileId, onChange }) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [presentAlert] = useIonAlert();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!user) {
      presentAlert({ header: "Fehler", message: "Nicht eingeloggt.", buttons: ["OK"] });
      return;
    }
    if (!file.type.startsWith("image/")) {
      presentAlert({ header: "Fehler", message: "Nur Bilder erlaubt (JPEG, PNG, WebP).", buttons: ["OK"] });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      presentAlert({ header: "Fehler", message: "Maximale Dateigröße: 5 MB.", buttons: ["OK"] });
      return;
    }

    setUploading(true);
    try {
      if (fileId) {
        try { await storage.deleteFile(BUCKET_AVATARS, fileId); } catch { /* ignorieren */ }
      }
      const uploaded = await storage.createFile(
        BUCKET_AVATARS,
        ID.unique(),
        file,
        [
          Permission.read(Role.any()),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id)),
        ]
      );
      onChange(uploaded.$id);
    } catch (err) {
      presentAlert({
        header: "Upload fehlgeschlagen",
        message: translateError(err),
        buttons: ["OK"],
      });
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove(e: React.MouseEvent) {
    e.preventDefault();
    if (!fileId) return;
    setUploading(true);
    try {
      await storage.deleteFile(BUCKET_AVATARS, fileId);
      onChange(null);
    } catch (err) {
      presentAlert({ header: "Fehler", message: translateError(err), buttons: ["OK"] });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0 8px" }}>
      {/*
       * Verstecktes file-input.
       * label[htmlFor] öffnet den nativen Dateidialog – kein .click() nötig.
       */}
      <input
        id={INPUT_ID}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        disabled={uploading}
        onChange={handleFileChange}
      />

      {/* Avatar-Kreis als label */}
      <label
        htmlFor={INPUT_ID}
        style={{
          width: 96,
          height: 96,
          borderRadius: "50%",
          overflow: "hidden",
          background: "var(--ion-color-light-shade)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
          cursor: uploading ? "default" : "pointer",
          border: "2px solid var(--ion-color-light)",
          pointerEvents: uploading ? "none" : "auto",
        }}
      >
        {uploading ? (
          <IonSpinner name="crescent" />
        ) : fileId ? (
          <img
            src={getAvatarUrl(fileId)}
            alt="Profilbild"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <IonIcon
            icon={personCircleOutline}
            style={{ fontSize: 72, color: "var(--ion-color-medium)" }}
          />
        )}
      </label>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <label
          htmlFor={INPUT_ID}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 16px",
            borderRadius: 8,
            border: "1px solid var(--ion-color-primary)",
            color: "var(--ion-color-primary)",
            fontSize: 14,
            fontWeight: 500,
            cursor: uploading ? "default" : "pointer",
            opacity: uploading ? 0.5 : 1,
            pointerEvents: uploading ? "none" : "auto",
            userSelect: "none",
          }}
        >
          <IonIcon icon={cameraOutline} style={{ fontSize: 16 }} />
          {fileId ? "Bild ändern" : "Bild hochladen"}
        </label>

        {fileId && !uploading && (
          <button
            type="button"
            onClick={handleRemove}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: 8,
              border: "1px solid var(--ion-color-danger)",
              background: "transparent",
              color: "var(--ion-color-danger)",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <IonIcon icon={trashOutline} style={{ fontSize: 16 }} />
          </button>
        )}
      </div>

      <IonText color="medium">
        <p style={{ margin: "8px 0 0", fontSize: 12, textAlign: "center" }}>
          Auf Kreis oder Button tippen zum Hochladen
        </p>
      </IonText>
    </div>
  );
};

export default ProfilbildUpload;
