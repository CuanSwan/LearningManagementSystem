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
        <Link to="/learning-paths">Learning Paths</Link>
        <Link to="/courses">Courses</Link>
        {(user.role === "admin" || user.role === "super_admin") && <Link to="/admin">Admin</Link>}
        {(user.role === "admin" || user.role === "super_admin") && <Link to="/admin/assignments">Assignments</Link>}
        {user.role === "super_admin" && <Link to="/admin/users">Users</Link>}
        <div className="display-toggle-group">
          <span className="top-bar-label">Reading Mode</span>
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
        </div>
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
