import { Link } from "react-router-dom";
import { useAuth } from "../auth.js";

export function TopBar() {
  const { user, logout } = useAuth();
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
