import { collection, addDoc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase/config";

export async function logAccessEvent({ who, what, when = Date.now(), why, result }) {
  await addDoc(collection(db, "auditLogs"), { who, what, when, why, result });
}

export async function fetchAuditLog() {
  const q = query(collection(db, "auditLogs"), orderBy("when", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data());
}