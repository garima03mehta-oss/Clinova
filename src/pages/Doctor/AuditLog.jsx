import { getAuditLog } from "../../utils/auditLog";

export default function AuditLog() {
  const events = getAuditLog();
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Audit Log</h1>
      <p style={{ fontSize: "12px", color: "gray" }}>Record of all sensitive data access events.</p>
      {events.length === 0 && <p>No events recorded yet.</p>}
      {events.map((e, i) => (
        <p key={i}>
          {new Date(e.when).toLocaleString()} — {e.who} — {e.what} — {e.why} — {e.result}
        </p>
      ))}
    </div>
  );
}