export default function PageShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-bg font-body">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}