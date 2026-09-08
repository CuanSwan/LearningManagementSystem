import { parseModule, type Module } from "@lms/shared";

const raw = {
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
      order: 4,
      content: {
        instructions: "Role-play a negotiation scenario with a partner.",
        steps: ["Pick a scenario", "Negotiate for 10 minutes", "Debrief what worked"],
        submissionType: "text",
      },
    },
  ],
} satisfies unknown;

export const sampleModule: Module = parseModule(raw);
