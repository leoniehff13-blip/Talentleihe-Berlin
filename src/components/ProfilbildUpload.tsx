import { useRef, useState } from "react";
import { ID, Permission, Role } from "appwrite";
import { IonIcon, IonSpinner, IonText } from "@ionic/react";
import { personCircleOutline, cameraOutline, trashOutline } from "ionicons/icons";
import { storage, BUCKET_AVATARS } from "../lib/appwrite";
import { useAuth } from "../lib/AuthContext";
import { translateError } from "../lib/errors";

interface Props {
  fileId: string | null;
  onChange: (fileId: string | null) => void;
}

export function getAvatarUrl(fileId: string): string {
  const endpoint = (import.meta.env.VITE_APPWRITE_ENDPOINT as string ?? "https://fra.cloud.appwrite.io/v1").replace(/\/+$/, "");
  const project = import.meta.env.VITE_APPWRITE_PROJECT_ID as string ?? "";
  return `${endpoint}/storage/buckets/avatars/files/${fileId}/view?project=${project}`;
}

const ProfilbildUpload: React.FC<Props> = ({ fileId, onChange }) => {
  const { user } = useAuth();
  const inputId = "profilbild-upload-input";
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      setError("Nur Bilder erlaubt (JPEG, PNG, WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Maximale Dateigröße: 5 MB.");
      return;
    }
    setUploading(true);
    setError(null);
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
      setError(translateError(err));
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
      setError(translateError(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0 8px" }}>
      {/* Verstecktes File-Input – wird über label gesteuert */}
      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={handleFileChange}
        disabled={uploading}
      />

      {/* Avatar-Kreis als label → nativer Browser-Dateidialog */}
      <label
        htmlFor={inputId}
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

      {/* Buttons */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <label
          htmlFor={inputId}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 8,
            border: "1px solid var(--ion-color-primary)",
            color: "var(--ion-color-primary)",
            fontSize: 14,
            cursor: uploading ? "default" : "pointer",
            opacity: uploading ? 0.5 : 1,
          }}
        >
          <IonIcon icon={cameraOutline} style={{ fontSize: 16 }} />
          {fileId ? "Bild ändern" : "Bild hochladen"}
        </label>

        {fileId && (
          <button
            onClick={handleRemove}
            disabled={uploading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 34,
              height: 34,
              borderRadius: 8,
              border: "1px solid var(--ion-color-danger)",
              background: "transparent",
              color: "var(--ion-color-danger)",
              cursor: "pointer",
              opacity: uploading ? 0.5 : 1,
            }}
          >
            <IonIcon icon={trashOutline} style={{ fontSize: 16 }} />
          </button>
        )}
      </div>

      {error && (
        <IonText color="danger">
          <p style={{ margin: "8px 0 0", fontSize: 13 }}>{error}</p>
        </IonText>
      )}
    </div>
  );
};

export default ProfilbildUpload;
