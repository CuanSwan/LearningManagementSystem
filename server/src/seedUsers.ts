import { createUser, setUserAssignments, userExistsByEmail } from "./userStore.js";

const DEMO_USERS = [
  { email: "super@example.com", name: "Sam Superadmin", password: "SuperAdmin123!", role: "super_admin" as const },
  { email: "admin@example.com", name: "Alex Admin", password: "Admin123!", role: "admin" as const },
  { email: "student@example.com", name: "Sam Student", password: "Student123!", role: "student" as const },
  // One demo student per seeded learning path (see sampleData.ts), pre-assigned
  // so the assignment/access-control feature has something to demo out of the
  // box without an admin having to set it up by hand first.
  {
    email: "student-project-delivery@example.com",
    name: "Priya Delivery",
    password: "ProjectDelivery123!",
    role: "student" as const,
    assignedLearningPathIds: ["temp-project-delivery-track"],
  },
  {
    email: "student-it-foundations@example.com",
    name: "Ian Foundations",
    password: "ITFoundations123!",
    role: "student" as const,
    assignedLearningPathIds: ["temp-it-foundations-track"],
  },
];

/**
 * Demo accounts so the app is usable out of the box - a real deployment
 * would remove these and provision the first super_admin some other way.
 * Skips any account that already exists, so this is safe to run on every
 * startup now that data persists across restarts - an admin's later edits
 * (including to a demo student's assignments) are never overwritten by a
 * later run of this function.
 */
export async function seedUsers(): Promise<void> {
  for (const demoUser of DEMO_USERS) {
    if (await userExistsByEmail(demoUser.email)) continue;
    const { assignedLearningPathIds, ...input } = demoUser as typeof demoUser & { assignedLearningPathIds?: string[] };
    const user = await createUser(input);
    if (assignedLearningPathIds) {
      await setUserAssignments(user.userId, { assignedLearningPathIds, assignedCourseIds: [] });
    }
  }
}
