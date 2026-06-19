import { useRef, useState } from "react";
import { ID, Permission, Role } from "appwrite";
import { IonButton, IonIcon, IonSpinner, IonText } from "@ionic/react";
import { personCircleOutline, cameraOutline, trashOutline } from "ionicons/icons";
import { storage, BUCKET_AVATARS } from "../lib/appwrite";
import { useAuth } from "../lib/AuthContext";
import { translateError } from "../lib/errors";

interface Props {
  fileId: string | null;
  onChange: (fileId: string | null) => void;
}

export function getAvatarUrl(fileId: string): string {
  return storage.getFilePreview(BUCKET_AVATARS, fileId, 200, 200).toString();
}

const ProfilbildUpload: React.FC<Props> = ({ fileId, onChange }) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
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
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0 4px" }}>
      {/* Avatar-Kreis */}
      <div
        role="button"
        onClick={() => !uploading && fileInputRef.current?.click()}
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
          position: "relative",
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
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        <IonButton
          size="small"
          fill="outline"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <IonIcon slot="start" icon={cameraOutline} />
          {fileId ? "Bild ändern" : "Bild hochladen"}
        </IonButton>
        {fileId && (
          <IonButton
            size="small"
            fill="outline"
            color="danger"
            disabled={uploading}
            onClick={handleRemove}
          >
            <IonIcon slot="icon-only" icon={trashOutline} />
          </IonButton>
        )}
      </div>

      {error && (
        <IonText color="danger">
          <p style={{ margin: "6px 0 0", fontSize: 13 }}>{error}</p>
        </IonText>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ProfilbildUpload;
