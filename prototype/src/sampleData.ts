import { parseCourse, parseModule, type Course, type Module } from "@lms/shared";

const salesFundamentals = parseCourse({
  courseId: "sales-fundamentals",
  title: "Sales Fundamentals",
  description: "Core negotiation and sales skills.",
  category: "Business",
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
  category: "Core",
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
    {
      lessonId: "co-l2",
      type: "diagram",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 2,
      content: {
        imageUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-images/grapefruit-slice-332-332.jpg",
      },
    },
  ],
});

const projectManagementFundamentals = parseCourse({
  courseId: "temp-project-management-fundamentals",
  title: "Project Management Fundamentals",
  description: "Plan, schedule & control projects from business case to closure.",
  category: "Core",
  theme: { primaryColor: "#0d0d0d" },
});

const projectFoundations = parseModule({
  moduleId: "project-foundations",
  courseId: "temp-project-management-fundamentals",
  status: "published",
  seed: {
    title: "Project Foundations",
    objective: "Roles, life cycles & the language of project delivery.",
  },
  lessons: [
    {
      lessonId: "pf-l1",
      type: "text",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 1,
      content: { body: "What a Project Really Is: a temporary effort with a defined start, end, and outcome." },
    },
    {
      lessonId: "pf-l2",
      type: "video",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 2,
      content: {
        videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        transcript: "Walkthrough of the five phases of a project life cycle.",
      },
    },
    {
      lessonId: "pf-l3",
      type: "quiz",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 3,
      content: {
        questions: [
          {
            prompt: "Foundations Check: which phase comes right after Planning?",
            options: ["Initiation", "Execution", "Closure"],
            correctIndex: 1,
          },
        ],
      },
    },
  ],
});

const planningAndScheduling = parseModule({
  moduleId: "planning-and-scheduling",
  courseId: "temp-project-management-fundamentals",
  status: "published",
  seed: {
    title: "Planning & Scheduling",
    objective: "Break work down and sequence it into a realistic schedule.",
  },
  lessons: [
    {
      lessonId: "ps-l1",
      type: "text",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 1,
      content: {
        body: "Building a Work Breakdown Structure: decompose the project into phases, deliverables, and work packages small enough to estimate and assign.",
      },
    },
    {
      lessonId: "ps-l2",
      type: "diagram",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 2,
      content: {
        imageUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-images/elephant-660-480.jpg",
      },
    },
    {
      lessonId: "ps-l3",
      type: "practical",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 3,
      content: {
        instructions: "Draft a WBS for Your Own Project. Allow around forty minutes; work in the template provided, then tick each step as you go.",
        steps: ["List the major phases", "Break each phase into deliverables", "Break deliverables into work packages"],
        submissionType: "file",
      },
    },
  ],
});

const agileScrumInPractice = parseCourse({
  courseId: "temp-agile-scrum-in-practice",
  title: "Agile & Scrum in Practice",
  description: "Run iterative delivery with sprints, backlogs & retrospectives.",
  category: "Core",
  theme: { primaryColor: "#2dd4bf" },
});

const agileFoundations = parseModule({
  moduleId: "agile-foundations",
  courseId: "temp-agile-scrum-in-practice",
  status: "published",
  seed: {
    title: "Agile Foundations",
    objective: "Understand the values behind agile delivery and how a sprint flows.",
  },
  lessons: [
    {
      lessonId: "af-l1",
      type: "text",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 1,
      content: { body: "What Is Agile? A mindset that favors iterative delivery, feedback, and adapting to change over rigid up-front planning." },
    },
    {
      lessonId: "af-l2",
      type: "video",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 2,
      content: {
        videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        transcript: "A two-minute overview of what happens inside a sprint, from planning to review.",
      },
    },
    {
      lessonId: "af-l3",
      type: "quiz",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 3,
      content: {
        questions: [
          {
            prompt: "Agile Basics Check: who owns the product backlog?",
            options: ["The Scrum Master", "The Product Owner", "The whole team equally"],
            correctIndex: 1,
          },
        ],
      },
    },
  ],
});

const pythonProgrammingEssentials = parseCourse({
  courseId: "temp-python-programming-essentials",
  title: "Python Programming Essentials",
  description: "Write, test & structure your first Python applications.",
  category: "Coding",
  theme: { primaryColor: "#c9920e" },
});

const gettingStartedWithPython = parseModule({
  moduleId: "getting-started-with-python",
  courseId: "temp-python-programming-essentials",
  status: "published",
  seed: {
    title: "Getting Started with Python",
    objective: "Set up your environment and write your first working script.",
  },
  lessons: [
    {
      lessonId: "py-l1",
      type: "text",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 1,
      content: { body: "Why Python? A readable syntax and a huge ecosystem make it a popular first language for beginners and experts alike." },
    },
    {
      lessonId: "py-l2",
      type: "practical",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 2,
      content: {
        instructions: "Write Your First Script: create a program that greets the user by name.",
        steps: ["Install Python", "Create hello.py", "Run it from the terminal"],
        submissionType: "file",
      },
    },
    {
      lessonId: "py-l3",
      type: "quiz",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 3,
      content: {
        questions: [
          {
            prompt: "Syntax Basics: which symbol starts a comment in Python?",
            options: ["//", "#", "--"],
            correctIndex: 1,
          },
        ],
      },
    },
  ],
});

const networkingInfrastructure = parseCourse({
  courseId: "temp-networking-infrastructure",
  title: "Networking & Infrastructure",
  description: "Understand how networks, servers & cloud services fit together.",
  category: "IT",
  theme: { primaryColor: "#c2185b" },
});

const networkingBasics = parseModule({
  moduleId: "networking-basics",
  courseId: "temp-networking-infrastructure",
  status: "published",
  seed: {
    title: "Networking Basics",
    objective: "See how data actually moves between devices on a network.",
  },
  lessons: [
    {
      lessonId: "net-l1",
      type: "text",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 1,
      content: { body: "How Data Travels: messages are broken into packets, addressed, routed across networks, and reassembled at the destination." },
    },
    {
      lessonId: "net-l2",
      type: "diagram",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 2,
      content: {
        imageUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-images/grapefruit-slice-332-332.jpg",
      },
    },
    {
      lessonId: "net-l3",
      type: "quiz",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 3,
      content: {
        questions: [
          {
            prompt: "Networking Fundamentals Check: what does a router primarily do?",
            options: ["Store files", "Direct traffic between networks", "Render web pages"],
            correctIndex: 1,
          },
        ],
      },
    },
  ],
});

const businessAnalysisFoundations = parseCourse({
  courseId: "temp-business-analysis-foundations",
  title: "Business Analysis Foundations",
  description: "Gather requirements & translate them into workable solutions.",
  category: "Business",
  theme: { primaryColor: "#6a3fd1" },
});

const requirementsGathering = parseModule({
  moduleId: "requirements-gathering",
  courseId: "temp-business-analysis-foundations",
  status: "published",
  seed: {
    title: "Requirements Gathering",
    objective: "Learn how to elicit and document what stakeholders actually need.",
  },
  lessons: [
    {
      lessonId: "ba-l1",
      type: "text",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 1,
      content: { body: "What Is Business Analysis? The practice of identifying business needs and finding solutions to business problems." },
    },
    {
      lessonId: "ba-l2",
      type: "video",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 2,
      content: {
        videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        transcript: "How to structure a stakeholder interview to surface real requirements, not assumptions.",
      },
    },
    {
      lessonId: "ba-l3",
      type: "practical",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 3,
      content: {
        instructions: "Draft a Requirements Document for a simple feature request.",
        steps: ["Interview a stakeholder", "List functional requirements", "List non-functional requirements"],
        submissionType: "file",
      },
    },
  ],
});

const cyberSecurityAwareness = parseCourse({
  courseId: "temp-cyber-security-awareness",
  title: "Cyber Security Awareness",
  description: "Recognise everyday threats & protect organisational data.",
  category: "IT",
  theme: { primaryColor: "#6b7280" },
});

const spottingThreats = parseModule({
  moduleId: "spotting-threats",
  courseId: "temp-cyber-security-awareness",
  status: "published",
  seed: {
    title: "Spotting Threats",
    objective: "Recognize the most common ways attackers try to get in.",
  },
  lessons: [
    {
      lessonId: "sec-l1",
      type: "text",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 1,
      content: { body: "Common Attack Types: phishing, malware, and social engineering account for the vast majority of breaches." },
    },
    {
      lessonId: "sec-l2",
      type: "quiz",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 2,
      content: {
        questions: [
          {
            prompt: "Phishing Awareness Check: what's the safest response to an unexpected urgent email asking for login details?",
            options: [
              "Reply with the details right away",
              "Click the link to check if it's real",
              "Verify through a separate, known channel first",
            ],
            correctIndex: 2,
          },
        ],
      },
    },
  ],
});

const protectingYourData = parseModule({
  moduleId: "protecting-your-data",
  courseId: "temp-cyber-security-awareness",
  status: "published",
  seed: {
    title: "Protecting Your Data",
    objective: "Build habits that keep your accounts and data secure day to day.",
  },
  lessons: [
    {
      lessonId: "sec-l3",
      type: "text",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 1,
      content: { body: "Password Hygiene: use a unique, long passphrase for every account, managed with a password manager." },
    },
    {
      lessonId: "sec-l4",
      type: "practical",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 2,
      content: {
        instructions: "Set Up Multi-Factor Authentication on one of your accounts.",
        steps: ["Open account security settings", "Enable an authenticator app", "Save your backup codes somewhere safe"],
        submissionType: "checklist",
      },
    },
  ],
});

export function seedCourses(): Course[] {
  return [
    salesFundamentals,
    onboardingBasics,
    projectManagementFundamentals,
    agileScrumInPractice,
    pythonProgrammingEssentials,
    networkingInfrastructure,
    businessAnalysisFoundations,
    cyberSecurityAwareness,
  ];
}

export function seedModules(): Module[] {
  return [
    introToNegotiation,
    companyOverview,
    projectFoundations,
    planningAndScheduling,
    agileFoundations,
    gettingStartedWithPython,
    networkingBasics,
    requirementsGathering,
    spottingThreats,
    protectingYourData,
  ];
}
