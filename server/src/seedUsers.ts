import { createUser } from "./userStore.js";

/**
 * Demo accounts so the app is usable out of the box - a real deployment
 * would remove these and provision the first super_admin some other way.
 */
export function seedUsers(): void {
  createUser({ email: "super@example.com", name: "Sam Superadmin", password: "SuperAdmin123!", role: "super_admin" });
  createUser({ email: "admin@example.com", name: "Alex Admin", password: "Admin123!", role: "admin" });
  createUser({ email: "student@example.com", name: "Sam Student", password: "Student123!", role: "student" });
}
