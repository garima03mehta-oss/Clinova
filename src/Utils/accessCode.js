export function generateAccessCode(scope, durationMinutes = 60) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const createdAt = Date.now();
  const expiresAt = createdAt + durationMinutes * 60 * 1000;
  return { code, scope, createdAt, expiresAt, status: "PENDING" };
}

export function authorizeAccess(accessRequest, doctorId) {
  if (!accessRequest) return { authorized: false, reason: "No access request found" };
  if (accessRequest.status === "REVOKED") return { authorized: false, reason: "Access has been revoked" };
  if (Date.now() >= accessRequest.expiresAt) return { authorized: false, reason: "Access code expired" };
  return { authorized: true, session: { ...accessRequest, doctorId, status: "ACTIVE" } };
}

export function isAccessValid(session) {
  if (!session) return false;
  if (session.status !== "ACTIVE") return false;
  return Date.now() < session.expiresAt;
}