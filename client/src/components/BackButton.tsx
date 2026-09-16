import { Link } from "react-router-dom";

// A dedicated, visually prominent way back to the parent page - the
// breadcrumb trail already links there, but it's small print easy to miss
// mid-lesson. This always points at a fixed parent route rather than
// browser history, so it works the same whether the student navigated here
// normally or landed directly on the URL.
export function BackButton({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="back-button">
      &larr; {label}
    </Link>
  );
}
