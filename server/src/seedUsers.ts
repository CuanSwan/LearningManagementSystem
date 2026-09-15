import { createUser, userExistsByEmail } from "./userStore.js";

const DEMO_USERS = [
  { email: "super@example.com", name: "Sam Superadmin", password: "SuperAdmin123!", role: "super_admin" as const },
  { email: "admin@example.com", name: "Alex Admin", password: "Admin123!", role: "admin" as const },
  { email: "student@example.com", name: "Sam Student", password: "Student123!", role: "student" as const },
];

/**
 * Demo accounts so the app is usable out of the box - a real deployment
 * would remove these and provision the first super_admin some other way.
 * Skips any account that already exists, so this is safe to run on every
 * startup now that data persists across restarts.
 */
export async function seedUsers(): Promise<void> {
  for (const demoUser of DEMO_USERS) {
    if (await userExistsByEmail(demoUser.email)) continue;
    await createUser(demoUser);
  }
}
