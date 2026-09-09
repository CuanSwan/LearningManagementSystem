import { useEffect, useState, type FormEvent } from "react";
import type { User, UserRole } from "@lms/shared";
import { createUser, listUsers, setUserRole } from "../api.js";

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("admin");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listUsers().then(setUsers);
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const created = await createUser({ name, email, password, role });
      setUsers((prev) => [...prev, created]);
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create user.");
    }
  }

  async function handleRoleChange(userId: string, newRole: UserRole) {
    const updated = await setUserRole(userId, newRole);
    setUsers((prev) => prev.map((u) => (u.userId === userId ? updated : u)));
  }

  return (
    <main>
      <h1>Users</h1>
      <p>Manage who can sign in as an admin or super admin. Anyone can self-register as a student.</p>

      <ul className="user-list">
        {users.map((u) => (
          <li key={u.userId} className="user-list-item">
            <div>
              <strong>{u.name}</strong>
              <span className="module-status"> {u.email}</span>
            </div>
            <select value={u.role} onChange={(e) => handleRoleChange(u.userId, e.target.value as UserRole)}>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super admin</option>
            </select>
          </li>
        ))}
      </ul>

      <form className="course-form" onSubmit={handleCreate}>
        <h2>Create an admin or super admin account</h2>
        <label className="field">
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="field">
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="field">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>
        <label className="field">
          Role
          <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
            <option value="admin">Admin</option>
            <option value="super_admin">Super admin</option>
          </select>
        </label>
        {error && <p className="import-error">{error}</p>}
        <button type="submit">Create user</button>
      </form>
    </main>
  );
}
