import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth.js";

// Below the top-bar-menu-toggle breakpoint (see App.css), .top-bar-nav
// itself becomes the dropdown panel - same markup either way, just shown
// inline (desktop) or toggled open as an absolutely-positioned panel
// (mobile), so there's no separate mobile-only link list to keep in sync.
export function TopBar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!user) return null;

  return (
    <header className="top-bar" ref={containerRef}>
      <Link to="/" className="top-bar-brand">
        LMS
      </Link>
      <button
        type="button"
        className="top-bar-menu-toggle"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Menu"
        onClick={() => setOpen((o) => !o)}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <nav className={`top-bar-nav${open ? " is-open" : ""}`} onClick={() => setOpen(false)}>
        <Link to="/learning-paths">Learning Paths</Link>
        <Link to="/courses">Courses</Link>
        {(user.role === "admin" || user.role === "super_admin") && <Link to="/admin">Admin</Link>}
        {(user.role === "admin" || user.role === "super_admin") && <Link to="/admin/assignments">Assignments</Link>}
        {user.role === "super_admin" && <Link to="/admin/users">Users</Link>}
        <Link to="/account" className="top-bar-user">
          {user.name} &middot; {user.role}
        </Link>
        <button type="button" className="top-bar-logout" onClick={() => logout()}>
          Log out
        </button>
      </nav>
    </header>
  );
}
