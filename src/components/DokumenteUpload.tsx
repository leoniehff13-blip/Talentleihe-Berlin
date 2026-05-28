import { useState, useEffect, useRef, useCallback } from "react";
import { ID, Permission, Role, Query } from "appwrite";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonText,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonCheckbox,
} from "@ionic/react";
import {
  cloudUploadOutline,
  documentOutline,
  trashOutline,
  downloadOutline,
} from "ionicons/icons";
import {
  databases,
  storage,
  DB_LEHRSTELLEN,
  COL_DOKUMENTE,
  BUCKET_DOKUMENTE,
  type Dokument,
} from "../lib/appwrite";
import { useAuth } from "../lib/AuthContext";

interface Props {
  /** "manage" = Profil-Verwaltung (Upload + Löschen)
   *  "select" = Bewerbungs-Modal (Checkboxen zum Anhängen) */
  mode?: "manage" | "select";
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

const DokumenteUpload: React.FC<Props> = ({
  mode = "manage",
  selectedIds = [],
  onSelectionChange,
}) => {
  const { user } = useAuth();
  const [dokumente, setDokumente] = useState<Dokument[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const res = await databases.listDocuments<Dokument>(
        DB_LEHRSTELLEN,
        COL_DOKUMENTE,
        [
          Query.equal("user_id", user.$id),
          Query.orderDesc("$createdAt"),
          Query.limit(20),
        ]
      );
      setDokumente(res.documents);
    } catch {
      // silent
    } finally {
      setLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    setError(null);
    try {
      const fileId = ID.unique();
      await storage.createFile(
        BUCKET_DOKUMENTE,
        fileId,
        file,
        [
          Permission.read(Role.users()),
          Permission.delete(Role.user(user.$id)),
        ]
      );
      await databases.createDocument(
        DB_LEHRSTELLEN,
        COL_DOKUMENTE,
        ID.unique(),
        {
          user_id: user.$id,
          file_id: fileId,
          filename: file.name,
          size: file.size,
          mime_type: file.type || "",
        },
        [
          Permission.read(Role.users()),
          Permission.delete(Role.user(user.$id)),
        ]
      );
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(dok: Dokument) {
    setError(null);
    try {
      await storage.deleteFile(BUCKET_DOKUMENTE, dok.file_id);
    } catch {
      // Datei evtl. schon weg
    }
    try {
      await databases.deleteDocument(DB_LEHRSTELLEN, COL_DOKUMENTE, dok.$id);
      setDokumente((prev) => prev.filter((d) => d.$id !== dok.$id));
      if (onSelectionChange) {
        onSelectionChange(selectedIds.filter((id) => id !== dok.file_id));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  function toggleSelect(fileId: string) {
    if (!onSelectionChange) return;
    if (selectedIds.includes(fileId)) {
      onSelectionChange(selectedIds.filter((id) => id !== fileId));
    } else {
      onSelectionChange([...selectedIds, fileId]);
    }
  }

  // ---- SELECT-Modus (innerhalb des Bewerbungs-Modals) ----
  if (mode === "select") {
    return (
      <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #e8ecf4" }}>
        <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1E367A", marginBottom: 8 }}>
          Bewerbungsunterlagen anhängen
        </p>
        {!loaded ? (
          <IonSpinner name="crescent" />
        ) : dokumente.length === 0 ? (
          <IonText color="medium">
            <p style={{ fontSize: "0.85rem", margin: 0 }}>
              Noch keine Dokumente vorhanden – lade sie im Konto hoch.
            </p>
          </IonText>
        ) : (
          <IonList lines="full" style={{ margin: "0 -16px" }}>
            {dokumente.map((dok) => (
              <IonItem key={dok.$id}>
                <IonCheckbox
                  slot="start"
                  checked={selectedIds.includes(dok.file_id)}
                  onIonChange={() => toggleSelect(dok.file_id)}
                />
                <IonIcon
                  icon={documentOutline}
                  color="primary"
                  style={{ marginRight: 10, fontSize: "1.2rem" }}
                />
                <IonLabel>
                  <h3 style={{ fontSize: "0.88rem" }}>{dok.filename}</h3>
                  <IonNote style={{ fontSize: "0.76rem" }}>
                    {formatSize(dok.size)}
                  </IonNote>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        )}
      </div>
    );
  }

  // ---- MANAGE-Modus (Konto-Seite) ----
  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Bewerbungsunterlagen</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        {!loaded && (
          <div style={{ display: "flex", justifyContent: "center", padding: 12 }}>
            <IonSpinner name="crescent" />
          </div>
        )}

        {loaded && dokumente.length === 0 && (
          <IonText color="medium">
            <p style={{ margin: "0 0 12px" }}>
              Noch keine Dokumente hochgeladen. Füge hier deinen Lebenslauf,
              Zeugnisse oder andere Unterlagen hinzu.
            </p>
          </IonText>
        )}

        {dokumente.length > 0 && (
          <IonList lines="full" style={{ margin: "0 -16px 8px" }}>
            {dokumente.map((dok) => (
              <IonItem key={dok.$id}>
                <IonIcon
                  icon={documentOutline}
                  slot="start"
                  color="primary"
                />
                <IonLabel>
                  <h3>{dok.filename}</h3>
                  <IonNote>{formatSize(dok.size)}</IonNote>
                </IonLabel>
                <IonButton
                  fill="clear"
                  slot="end"
                  href={storage.getFileDownload(BUCKET_DOKUMENTE, dok.file_id).toString()}
                  target="_blank"
                >
                  <IonIcon slot="icon-only" icon={downloadOutline} />
                </IonButton>
                <IonButton
                  fill="clear"
                  color="danger"
                  slot="end"
                  onClick={() => handleDelete(dok)}
                >
                  <IonIcon slot="icon-only" icon={trashOutline} />
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        )}

        {error && (
          <IonText color="danger">
            <p style={{ fontSize: "0.85rem", marginTop: 8 }}>{error}</p>
          </IonText>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          style={{ display: "none" }}
          onChange={handleUpload}
        />
        <IonButton
          expand="block"
          fill="outline"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          style={{ marginTop: 4 }}
        >
          <IonIcon slot="start" icon={cloudUploadOutline} />
          {uploading ? "Wird hochgeladen…" : "Dokument hochladen"}
        </IonButton>
      </IonCardContent>
    </IonCard>
  );
};

export default DokumenteUpload;
