export default function PageSection({ children, className = "" }) {
  return (
    <div className={`px-3 px-md-4 ${className}`}>
      {children}
    </div>
  );
}
