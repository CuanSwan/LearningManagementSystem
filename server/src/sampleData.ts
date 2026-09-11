import { parseCourse } from "@lms/shared";
import { seedCourse } from "./store.js";

// Temporary demo courses for previewing the course-category label on the
// catalog grid - no modules, just enough to see the category/color styling.
const projectManagementFundamentals = parseCourse({
  courseId: "temp-project-management-fundamentals",
  title: "Project Management Fundamentals",
  description: "Plan, schedule & control projects from business case to closure.",
  category: "Core",
  theme: { primaryColor: "#0d0d0d" },
});

const agileScrumInPractice = parseCourse({
  courseId: "temp-agile-scrum-in-practice",
  title: "Agile & Scrum in Practice",
  description: "Run iterative delivery with sprints, backlogs & retrospectives.",
  category: "Core",
  theme: { primaryColor: "#2dd4bf" },
});

const pythonProgrammingEssentials = parseCourse({
  courseId: "temp-python-programming-essentials",
  title: "Python Programming Essentials",
  description: "Write, test & structure your first Python applications.",
  category: "Coding",
  theme: { primaryColor: "#c9920e" },
});

const networkingInfrastructure = parseCourse({
  courseId: "temp-networking-infrastructure",
  title: "Networking & Infrastructure",
  description: "Understand how networks, servers & cloud services fit together.",
  category: "IT",
  theme: { primaryColor: "#c2185b" },
});

const businessAnalysisFoundations = parseCourse({
  courseId: "temp-business-analysis-foundations",
  title: "Business Analysis Foundations",
  description: "Gather requirements & translate them into workable solutions.",
  category: "Business",
  theme: { primaryColor: "#6a3fd1" },
});

const cyberSecurityAwareness = parseCourse({
  courseId: "temp-cyber-security-awareness",
  title: "Cyber Security Awareness",
  description: "Recognise everyday threats & protect organisational data.",
  category: "IT",
  theme: { primaryColor: "#6b7280" },
});

export function seedSampleData(): void {
  seedCourse(projectManagementFundamentals);
  seedCourse(agileScrumInPractice);
  seedCourse(pythonProgrammingEssentials);
  seedCourse(networkingInfrastructure);
  seedCourse(businessAnalysisFoundations);
  seedCourse(cyberSecurityAwareness);
}
