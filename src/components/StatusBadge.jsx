export default function StatusBadge({ status, label }) {
  const styles = {
    DRAFT: "bg-orange-50 text-warning border-warning",
    VERIFIED: "bg-green-50 text-success border-success",
    ACTIVE: "bg-primary-light text-primary border-primary",
    PENDING: "bg-gray-50 text-text-muted border-gray-300",
    EMERGENCY: "bg-red-50 text-danger border-danger",
    REVOKED: "bg-gray-100 text-gray-500 border-gray-300"
  };
  return (
    <span className={`inline-block px-3 py-1 rounded-full border text-xs font-mono tracking-wide ${styles[status] || styles.PENDING}`}>
      {label || status}
    </span>
  );
}