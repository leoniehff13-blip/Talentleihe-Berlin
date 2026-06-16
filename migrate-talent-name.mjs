import * as sdk from "node-appwrite";

const c = new sdk.Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("6a0ad52d001a8c4fd7f5")
  .setKey(process.env.APPWRITE_API_KEY);
const db = new sdk.Databases(c);

const anzeigen = await db.listDocuments("lehrstellen", "apprenticeships", [
  sdk.Query.equal("type", "talent_angebot"),
  sdk.Query.isNull("talent_name"),
  sdk.Query.limit(100),
]);
console.log(anzeigen.total + " Anzeigen ohne talent_name");

for (const a of anzeigen.documents) {
  if (!a.owner_id) {
    await db.updateDocument("lehrstellen", "apprenticeships", a.$id, { talent_name: "Testnutzer" });
    console.log("✅", a.$id, "→ Testnutzer");
    continue;
  }
  const profiles = await db.listDocuments("lehrstellen", "profiles", [
    sdk.Query.equal("user_id", a.owner_id),
    sdk.Query.limit(1),
  ]);
  if (profiles.documents.length === 0) {
    console.log("⚠️ kein Profil für", a.$id);
    continue;
  }
  const p = profiles.documents[0];
  const name = [p.vorname, p.name].filter(Boolean).join(" ");
  await db.updateDocument("lehrstellen", "apprenticeships", a.$id, { talent_name: name });
  console.log("✅", a.$id, "→", name);
}
console.log("Fertig.");
