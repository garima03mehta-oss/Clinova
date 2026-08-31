import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../firebase/config";
import { logAccessEvent } from "../../utils/auditLog";

export default function PatientQueue() {
  const [patients, setPatients] = useState([]);
  useEffect(() => {
    const fetchAuthorizedPatients = async () => {
      const doctorId = auth.currentUser?.uid;
      if (!doctorId) return;
      const q = query(
        collection(db, "accessRequests"),
        where("doctorId", "==", doctorId),
        where("status", "==", "ACTIVE")
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPatients(results);
      logAccessEvent({
        who: doctorId,
        what: "PATIENT_QUEUE_VIEWED",
        why: "Doctor opened patient queue",
        result: "ALLOWED"
      });
    };
    fetchAuthorizedPatients();
  }, []);
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Patient Queue</h1>
      <p style={{ fontSize: "12px", color: "gray" }}>Showing patients who granted you active access.</p>
      {patients.length === 0 && <p>No active patient access sessions.</p>}
      {patients.map((p) => <p key={p.id}>{p.patientName || "Unnamed"} — access active</p>)}
    </div>
  );
}