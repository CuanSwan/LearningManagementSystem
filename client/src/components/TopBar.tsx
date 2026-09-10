import { Link } from "react-router-dom";
import { useAuth } from "../auth.js";
import { useDisplayPreference } from "../displayPreference.js";

export function TopBar() {
  const { user, logout } = useAuth();
  const { mode, choose } = useDisplayPreference();
  if (!user) return null;

  return (
    <header className="top-bar">
      <Link to="/" className="top-bar-brand">
        LMS
      </Link>
      <nav className="top-bar-nav">
        {(user.role === "admin" || user.role === "super_admin") && <Link to="/admin">Admin</Link>}
        {user.role === "super_admin" && <Link to="/admin/users">Users</Link>}
        <div className="display-toggle" role="group" aria-label="Lesson display">
          <button
            type="button"
            className={mode === "vertical" ? "active" : ""}
            onClick={() => choose("vertical")}
          >
            List
          </button>
          <button
            type="button"
            className={mode === "carousel" ? "active" : ""}
            onClick={() => choose("carousel")}
          >
            Carousel
          </button>
          <button
            type="button"
            className={mode === "accessible" ? "active" : ""}
            onClick={() => choose("accessible")}
          >
            Accessible
          </button>
        </div>
        <span className="top-bar-user">
          {user.name} &middot; {user.role}
        </span>
        <button type="button" onClick={() => logout()}>
          Log out
        </button>
      </nav>
    </header>
  );
}
