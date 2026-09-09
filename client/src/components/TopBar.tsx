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
        {(user.role === "admin" || user.role === "super_admin") && <Link to="/admin">Admin</Link>}
        {user.role === "super_admin" && <Link to="/admin/users">Users</Link>}
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
