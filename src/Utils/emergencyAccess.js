export function generateEmergencyAccess(patientId, doctorId) {
  const createdAt = Date.now();
  const expiresAt = createdAt + 15 * 60 * 1000;
  return {
    patientId,
    doctorId,
    createdAt,
    expiresAt,
    scope: ["allergyHistory", "priorityFlags", "chiefComplaint"],
    status: "EMERGENCY_ACTIVE"
  };
}

export function isEmergencyAccessValid(session) {
  if (!session) return false;
  if (session.status !== "EMERGENCY_ACTIVE") return false;
  return Date.now() < session.expiresAt;
}
