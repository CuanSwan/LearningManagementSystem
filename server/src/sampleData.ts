import { parseCourse, parseLearningPath, parseModule, type Module } from "./schemas.js";
import { seedCourse, seedLearningPath, seedModule } from "./store.js";
import { aiEngineeringCourse, aiEngineeringModules } from "./riseImportedCourses.js";

// Temporary demo courses for previewing the course-category label on the
// catalog grid - no modules, just enough to see the category/color styling.
const projectManagementFundamentals = parseCourse({
  courseId: "temp-project-management-fundamentals",
  title: "Project Management Fundamentals",
  description: "Plan, schedule & control projects from business case to closure.",
  category: "Core",
  theme: { primaryColor: "#0d0d0d" },
  status: "published",
});

const agileScrumInPractice = parseCourse({
  courseId: "temp-agile-scrum-in-practice",
  title: "Agile & Scrum in Practice",
  description: "Run iterative delivery with sprints, backlogs & retrospectives.",
  category: "Core",
  theme: { primaryColor: "#2dd4bf" },
  status: "published",
});

const pythonProgrammingEssentials = parseCourse({
  courseId: "temp-python-programming-essentials",
  title: "Python Programming Essentials",
  description: "Write, test & structure your first Python applications.",
  category: "Coding",
  theme: { primaryColor: "#c9920e" },
  status: "published",
});

const networkingInfrastructure = parseCourse({
  courseId: "temp-networking-infrastructure",
  title: "Networking & Infrastructure",
  description: "Understand how networks, servers & cloud services fit together.",
  category: "IT",
  theme: { primaryColor: "#c2185b" },
  status: "published",
});

const businessAnalysisFoundations = parseCourse({
  courseId: "temp-business-analysis-foundations",
  title: "Business Analysis Foundations",
  description: "Gather requirements & translate them into workable solutions.",
  category: "Business",
  theme: { primaryColor: "#6a3fd1" },
  status: "published",
});

const cyberSecurityAwareness = parseCourse({
  courseId: "temp-cyber-security-awareness",
  title: "Cyber Security Awareness",
  description: "Recognise everyday threats & protect organisational data.",
  category: "IT",
  theme: { primaryColor: "#6b7280" },
  status: "published",
});

const sampleModules: Module[] = [
  parseModule({
    moduleId: "temp-pm-lifecycle-basics",
    courseId: projectManagementFundamentals.courseId,
    status: "published",
    seed: {
      title: "Project Lifecycle Basics",
      objective: "Understand the phases of a project from initiation to closure.",
    },
    lessons: [
      {
        lessonId: "pm-lifecycle-intro",
        schemaVersion: 1,
        source: "human",
        wordingStyle: "official",
        order: 1,
        type: "text",
        content: {
          body: "Every project moves through five phases: initiation, planning, execution, monitoring & controlling, and closure. Understanding where you are in this lifecycle tells you what decisions are still open and what's already locked in.",
        },
      },
      {
        lessonId: "pm-lifecycle-video",
        schemaVersion: 1,
        source: "human",
        wordingStyle: "official",
        order: 2,
        type: "video",
        content: {
          videoUrl: "https://www.youtube.com/embed/YMz1I9kb15w",
          transcript: "A walkthrough of the five project lifecycle phases with real-world examples.",
          duration: 420,
        },
      },
      {
        lessonId: "pm-lifecycle-quiz",
        schemaVersion: 1,
        source: "human",
        wordingStyle: "official",
        order: 3,
        type: "quiz",
        content: {
          questions: [
            {
              prompt: "Which phase comes immediately after planning?",
              options: ["Initiation", "Execution", "Closure"],
              correctIndex: 1,
            },
            {
              prompt: "Monitoring & controlling happens...",
              options: ["Only at the end", "Alongside execution", "Before initiation"],
              correctIndex: 1,
            },
          ],
        },
      },
    ],
  }),
  parseModule({
    moduleId: "temp-pm-scheduling-budgeting",
    courseId: projectManagementFundamentals.courseId,
    status: "published",
    seed: {
      title: "Scheduling & Budgeting",
      objective: "Build a realistic project schedule and budget.",
    },
    lessons: [
      {
        lessonId: "pm-scheduling-intro",
        schemaVersion: 1,
        source: "human",
        wordingStyle: "official",
        order: 1,
        type: "text",
        content: {
          body: "A schedule is only as good as the estimates behind it. Break work into tasks small enough to estimate confidently, then sequence them by dependency, not by wishful thinking.",
        },
      },
      {
        lessonId: "pm-scheduling-diagram",
        schemaVersion: 1,
        source: "human",
        wordingStyle: "official",
        order: 2,
        type: "diagram",
        content: {
          imageUrl: "https://picsum.photos/seed/pm-gantt/800/450",
        },
      },
      {
        lessonId: "pm-scheduling-practical",
        schemaVersion: 1,
        source: "human",
        wordingStyle: "official",
        order: 3,
        type: "practical",
        content: {
          instructions: "Build a simple schedule for a project you know well (work, study, or personal).",
          steps: [
            "List every task needed to finish the project",
            "Estimate each task's duration",
            "Sequence tasks by dependency",
            "Identify the critical path",
          ],
          submissionType: "checklist",
        },
      },
    ],
  }),
  parseModule({
    moduleId: "temp-agile-scrum-fundamentals",
    courseId: agileScrumInPractice.courseId,
    status: "published",
    seed: {
      title: "Scrum Fundamentals",
      objective: "Learn the roles, events, and artifacts that make up Scrum.",
    },
    lessons: [
      {
        lessonId: "agile-fundamentals-intro",
        schemaVersion: 1,
        source: "human",
        wordingStyle: "official",
        order: 1,
        type: "text",
        content: {
          body: "Scrum defines three roles (Product Owner, Scrum Master, Developers), five events (Sprint, Sprint Planning, Daily Scrum, Sprint Review, Sprint Retrospective), and three artifacts (Product Backlog, Sprint Backlog, Increment).",
        },
      },
      {
        lessonId: "agile-fundamentals-video",
        schemaVersion: 1,
        source: "human",
        wordingStyle: "official",
        order: 2,
        type: "video",
        content: {
          videoUrl: "https://www.youtube.com/embed/9TycLR0TqFA",
          transcript: "An overview of Scrum roles, events, and artifacts.",
          duration: 360,
        },
      },
      {
        lessonId: "agile-fundamentals-quiz",
        schemaVersion: 1,
        source: "human",
        wordingStyle: "official",
        order: 3,
        type: "quiz",
        content: {
          questions: [
            {
              prompt: "Who owns the Product Backlog?",
              options: ["Scrum Master", "Product Owner", "The whole team"],
              correctIndex: 1,
            },
          ],
        },
      },
    ],
  }),
  parseModule({
    moduleId: "temp-agile-running-a-sprint",
    courseId: agileScrumInPractice.courseId,
    status: "published",
    seed: {
      title: "Running a Sprint",
      objective: "Practice planning, running, and reviewing a sprint.",
    },
    lessons: [
      {
        lessonId: "agile-sprint-intro",
        schemaVersion: 1,
        source: "human",
        wordingStyle: "official",
        order: 1,
        type: "text",
        content: {
          body: "A sprint is a fixed time-box, usually one to four weeks, during which a Scrum team turns backlog items into a done increment. Nothing changes the sprint goal once it's set.",
        },
      },
      {
        lessonId: "agile-sprint-practical",
        schemaVersion: 1,
        source: "human",
        wordingStyle: "official",
        order: 2,
        type: "practical",
        content: {
          instructions: "Plan a one-week sprint for a small personal or team project.",
          steps: [
            "Write a sprint goal in one sentence",
            "Pull backlog items that serve that goal",
            "Break items into tasks under a day each",
            "Hold a 15-minute daily check-in for the week",
          ],
          submissionType: "text",
        },
      },
    ],
  }),
  parseModule({
    moduleId: "temp-python-getting-started",
    courseId: pythonProgrammingEssentials.courseId,
    status: "published",
    seed: {
      title: "Getting Started with Python",
      objective: "Write and run your first Python scripts.",
    },
    lessons: [
      {
        lessonId: "python-getting-started-intro",
        schemaVersion: 1,
        source: "human",
        wordingStyle: "official",
        order: 1,
        type: "text",
        content: {
          body: "Python code is executed top to bottom, line by line. Variables don't need a declared type - `x = 5` is enough. Indentation isn't a style choice, it's how Python knows where a block starts and ends.",
        },
      },
      {
        lessonId: "python-getting-started-quiz",
        schemaVersion: 1,
        source: "human",
        wordingStyle: "official",
        order: 2,
        type: "quiz",
        content: {
          questions: [
            {
              prompt: "What does `print(2 + 3)` output?",
              options: ["23", "5", "Error"],
              correctIndex: 1,
            },
          ],
        },
      },
      {
        lessonId: "python-getting-started-practical",
        schemaVersion: 1,
        source: "human",
        wordingStyle: "official",
        order: 3,
        type: "practical",
        content: {
          instructions: "Write a script that greets the user by name.",
          steps: [
            "Ask for the user's name with input()",
            "Print a greeting that includes their name",
            "Run the script and confirm the output",
          ],
          submissionType: "file",
        },
      },
    ],
  }),
  parseModule({
    moduleId: "temp-networking-core-concepts",
    courseId: networkingInfrastructure.courseId,
    status: "published",
    seed: {
      title: "Core Networking Concepts",
      objective: "Understand IP addressing, DNS, and how requests travel across a network.",
    },
    lessons: [
      {
        lessonId: "networking-core-intro",
        schemaVersion: 1,
        source: "human",
        wordingStyle: "official",
        order: 1,
        type: "text",
        content: {
          body: "Every device on a network needs an IP address to be reachable. DNS translates human-readable domain names into those addresses so you don't have to remember numbers.",
        },
      },
      {
        lessonId: "networking-core-diagram",
        schemaVersion: 1,
        source: "human",
        wordingStyle: "official",
        order: 2,
        type: "diagram",
        content: {
          imageUrl: "https://picsum.photos/seed/networking-topology/800/450",
        },
      },
    ],
  }),
  parseModule({
    moduleId: "temp-cyber-everyday-threats",
    courseId: cyberSecurityAwareness.courseId,
    status: "published",
    seed: {
      title: "Recognising Everyday Threats",
      objective: "Spot phishing, social engineering, and weak-password risks before they cause harm.",
    },
    lessons: [
      {
        lessonId: "cyber-threats-intro",
        schemaVersion: 1,
        source: "human",
        wordingStyle: "official",
        order: 1,
        type: "text",
        content: {
          body: "Most breaches don't start with clever hacking - they start with a convincing email, a reused password, or a link clicked without a second thought. Awareness is the first line of defence.",
        },
      },
      {
        lessonId: "cyber-threats-quiz",
        schemaVersion: 1,
        source: "human",
        wordingStyle: "official",
        order: 2,
        type: "quiz",
        content: {
          questions: [
            {
              prompt: "You get an urgent email asking you to reset your password via a link. What should you do first?",
              options: [
                "Click the link immediately, it's urgent",
                "Check the sender's address and go to the site directly instead of clicking",
                "Reply with your current password to confirm identity",
              ],
              correctIndex: 1,
            },
          ],
        },
      },
    ],
  }),
  parseModule({
    moduleId: "temp-ba-gathering-requirements",
    courseId: businessAnalysisFoundations.courseId,
    status: "published",
    seed: {
      title: "Gathering Requirements",
      objective: "Learn techniques for eliciting clear, testable requirements from stakeholders.",
    },
    lessons: [
      {
        lessonId: "ba-requirements-intro",
        schemaVersion: 1,
        source: "human",
        wordingStyle: "official",
        order: 1,
        type: "text",
        content: {
          body: "Stakeholders describe problems, not solutions - it's the analyst's job to turn 'this takes too long' into a specific, testable requirement. Interviews, workshops, and observation are the three core elicitation techniques.",
        },
      },
      {
        lessonId: "ba-requirements-practical",
        schemaVersion: 1,
        source: "human",
        wordingStyle: "official",
        order: 2,
        type: "practical",
        content: {
          instructions: "Turn a vague complaint into a testable requirement.",
          steps: [
            "Pick a vague complaint (e.g. 'the process is slow')",
            "Ask 'why' three times to find the root cause",
            "Write one requirement with a measurable success condition",
          ],
          submissionType: "text",
        },
      },
    ],
  }),
];

const projectDeliveryTrack = parseLearningPath({
  pathId: "temp-project-delivery-track",
  title: "Project Delivery Track",
  description: "Plan and run projects, then layer in iterative Agile delivery.",
  courseIds: [projectManagementFundamentals.courseId, agileScrumInPractice.courseId],
});

const itFoundationsTrack = parseLearningPath({
  pathId: "temp-it-foundations-track",
  title: "IT Foundations Track",
  description: "Understand core infrastructure, then how to keep it secure.",
  courseIds: [networkingInfrastructure.courseId, cyberSecurityAwareness.courseId],
});

export async function seedSampleData(): Promise<void> {
  // seedCourse/seedModule/seedLearningPath only create a record the first
  // time it's seen, so re-running this on every startup is safe: it fills in
  // anything missing without clobbering admin edits made to a course/module
  // that already exists from a previous seed.
  await Promise.all([
    seedCourse(projectManagementFundamentals),
    seedCourse(agileScrumInPractice),
    seedCourse(pythonProgrammingEssentials),
    seedCourse(networkingInfrastructure),
    seedCourse(businessAnalysisFoundations),
    seedCourse(cyberSecurityAwareness),
    seedCourse(aiEngineeringCourse),
  ]);

  await Promise.all([...sampleModules, ...aiEngineeringModules].map(seedModule));

  await Promise.all([seedLearningPath(projectDeliveryTrack), seedLearningPath(itFoundationsTrack)]);
}
