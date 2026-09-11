import { Link } from "react-router-dom";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="breadcrumb-trail" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className="breadcrumb-trail-item">
            {!isLast && item.to ? (
              <Link to={item.to}>{item.label}</Link>
            ) : (
              <span className="breadcrumb-trail-current">{item.label}</span>
            )}
            {!isLast && (
              <span className="breadcrumb-trail-sep" aria-hidden="true">
                /
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
