import { parseCourse, parseModule } from "@lms/shared";
import { awsAiFoundationsModule, awsAiPractitionerCourse } from "./riseImportSample.js";
import { seedCourse, seedModule } from "./store.js";

const salesFundamentals = parseCourse({
  courseId: "sales-fundamentals",
  title: "Sales Fundamentals",
  description: "Core negotiation and sales skills.",
  // No overrides - this course fully inherits the site-wide default theme.
  theme: {},
});

const introToNegotiation = parseModule({
  moduleId: "intro-to-negotiation",
  courseId: "sales-fundamentals",
  status: "published",
  seed: {
    title: "Introduction to Negotiation",
    objective: "Learners understand the core principles of negotiation.",
    authorNotes: "Focus on real estate examples, keep tone conversational.",
  },
  lessons: [
    {
      lessonId: "l1",
      type: "text",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 1,
      content: {
        body: "Negotiation is the process by which two or more parties reach a joint agreement.",
      },
    },
    {
      lessonId: "l2",
      type: "video",
      schemaVersion: 1,
      source: "ai_generated",
      wordingStyle: "shortened",
      order: 2,
      content: {
        videoUrl: "https://example.com/videos/negotiation-basics.mp4",
        transcript: "In this video we cover the fundamentals of negotiation...",
        duration: 340,
      },
    },
    {
      lessonId: "l3",
      type: "quiz",
      schemaVersion: 1,
      source: "ai_generated",
      wordingStyle: "shortened",
      order: 3,
      content: {
        questions: [
          {
            prompt: "What does BATNA stand for?",
            options: [
              "Best Alternative To a Negotiated Agreement",
              "Basic Agreement Terms and Negotiation Approach",
              "Buyer's Assessment of Total Negotiated Amount",
            ],
            correctIndex: 0,
          },
        ],
      },
    },
    {
      lessonId: "l4",
      type: "practical",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 4,
      content: {
        instructions: "Role-play a negotiation scenario with a partner.",
        steps: ["Pick a scenario", "Negotiate for 10 minutes", "Debrief what worked"],
        submissionType: "text",
      },
    },
  ],
});

const onboardingBasics = parseCourse({
  courseId: "onboarding-basics",
  title: "New Hire Onboarding",
  description: "Company basics for new employees.",
  // Overrides accent color and font; backgroundColor still inherits the default.
  theme: { primaryColor: "#8a4b8f", fontFamily: "'Merriweather', Georgia, serif" },
});

const companyOverview = parseModule({
  moduleId: "company-overview",
  courseId: "onboarding-basics",
  status: "published",
  seed: {
    title: "Company Overview",
    objective: "New hires understand what the company does and how teams fit together.",
  },
  lessons: [
    {
      lessonId: "co-l1",
      type: "text",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 1,
      content: {
        body: "Welcome! This module covers our mission, the teams you'll work with, and where to go for help.",
      },
    },
  ],
});

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

export function seedSampleData(): void {
  seedCourse(salesFundamentals);
  seedModule(introToNegotiation);
  seedCourse(onboardingBasics);
  seedModule(companyOverview);
  seedCourse(projectManagementFundamentals);
  seedCourse(agileScrumInPractice);
  seedCourse(pythonProgrammingEssentials);
  seedCourse(awsAiPractitionerCourse);
  seedModule(awsAiFoundationsModule);
}
