const auditEvents = [];

export function logAccessEvent({ who, what, when = Date.now(), why, result }) {
  const entry = { who, what, when, why, result };
  auditEvents.push(entry);
  return entry;
}

export function getAuditLog() {
  return auditEvents;
}