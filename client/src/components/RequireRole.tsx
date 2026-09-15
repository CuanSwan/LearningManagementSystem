import type { UserRole } from "../types.js";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth.js";

export function RequireRole({ roles }: { roles: UserRole[] }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
