import { parseCourse, parseModule } from "@lms/shared";

// Converted from a real Rise 360 export (SCORM package, runtime-data.js) as a
// worked example of what an automated Rise -> LMS import can produce. Only the
// course's first section converted here; most blocks mapped cleanly onto
// text/quiz lessons, one unsupported "sorting" exercise was dropped.
export const awsAiPractitionerCourse = parseCourse({
  "courseId": "aws-ai-practitioner",
  "title": "AWS Certified AI Practitioner: Foundations, Generative AI, and Real-World AWS Solutions",
  "description": "Imported from a Rise 360 export - converted automatically from the original course content.",
  "theme": {}
});

export const awsAiFoundationsModule = parseModule({
  "moduleId": "aws-ai-foundations",
  "courseId": "aws-ai-practitioner",
  "status": "published",
  "seed": {
    "title": "Foundations of Artificial Intelligence and Machine Learning",
    "objective": "Imported from Rise 360."
  },
  "lessons": [
    {
      "lessonId": "rise-nmfxhx1xpa9nskfbfxei1fdl",
      "schemaVersion": 1,
      "source": "ai_generated",
      "wordingStyle": "shortened",
      "order": 1,
      "type": "text",
      "content": {
        "body": "Why Understanding AI and ML Matters\n\nArtificial intelligence is transforming the way we live and work. From automating routine tasks to enabling entirely new products and services, AI is reshaping industries and redefining what’s possible for organizations of all sizes. Whether you’re a business leader, IT specialist, or product manager, understanding the foundations of AI and machine learning is critical for making informed decisions, driving innovation, and staying competitive in today’s fast-changing world."
      }
    },
    {
      "lessonId": "rise-bdav1te8te4pfe6sxwy3juan",
      "schemaVersion": 1,
      "source": "ai_generated",
      "wordingStyle": "shortened",
      "order": 2,
      "type": "text",
      "content": {
        "body": "By the end of this lesson, you will be able to:"
      }
    },
    {
      "lessonId": "rise-sxz5mpht2m7drgpyd01xj8qi",
      "schemaVersion": 1,
      "source": "ai_generated",
      "wordingStyle": "shortened",
      "order": 3,
      "type": "text",
      "content": {
        "body": "1. Define artificial intelligence and its scope.\n2. Distinguish between AI, machine learning, and deep learning.\n3. Differentiate between narrow AI and general AI.\n4. Recognize real-world applications of AI."
      }
    },
    {
      "lessonId": "rise-h3lbtnmiz2tcphal4a7blnlc",
      "schemaVersion": 1,
      "source": "ai_generated",
      "wordingStyle": "shortened",
      "order": 4,
      "type": "text",
      "content": {
        "body": "What Is Artificial Intelligence?\n\nArtificial intelligence (AI) refers to systems designed to perform tasks that would normally require human intelligence. These tasks include understanding language, recognizing images, making decisions, and solving problems. At its core, AI analyzes data, finds patterns, and uses those patterns to make predictions or decisions, often at a scale and speed far beyond human capability."
      }
    },
    {
      "lessonId": "rise-a37m2bdu7oiic50jy7yztjv2",
      "schemaVersion": 1,
      "source": "ai_generated",
      "wordingStyle": "shortened",
      "order": 5,
      "type": "text",
      "content": {
        "body": "AI Definition and Capabilities Flashcards\n\nReview each flashcard to reinforce your understanding of AI’s definition and capabilities."
      }
    },
    {
      "lessonId": "rise-zcny4kezpqagqk3og83rbyym",
      "schemaVersion": 1,
      "source": "ai_generated",
      "wordingStyle": "shortened",
      "order": 6,
      "type": "text",
      "content": {
        "body": "[Converted from a flip-card exercise - interactivity lost]\n\nQ: What is Artificial Intelligence?\nA: Systems designed to perform tasks that normally require human intelligence, such as understanding language or recognizing images.\n\nQ: Key capabilities of AI\nA: Language understanding, image recognition, decision-making, problem-solving.\n\nQ: AI enables...\nA: Analysis of data, pattern recognition, predictions, and automated decisions."
      }
    },
    {
      "lessonId": "rise-trbdx56fwghs2nbijhlgs4o5",
      "schemaVersion": 1,
      "source": "ai_generated",
      "wordingStyle": "shortened",
      "order": 7,
      "type": "text",
      "content": {
        "body": "AI is a broad field, but not all AI systems are created equal. Within AI, machine learning (ML) is a subset focused on systems that learn from data rather than being explicitly programmed. Deep learning (DL) is a further subset of machine learning that uses neural networks to process information and recognize complex patterns. Think of these as three nested circles: deep learning inside machine learning, inside artificial intelligence."
      }
    },
    {
      "lessonId": "rise-cmcyyji9nilew23vy6b3vjs4",
      "schemaVersion": 1,
      "source": "ai_generated",
      "wordingStyle": "shortened",
      "order": 8,
      "type": "text",
      "content": {
        "body": "Explore AI, ML, and DL\n\nExplore each section to see how AI, ML, and DL compare and where they are used."
      }
    },
    {
      "lessonId": "rise-98430a51-b8ad-45e3-8f76-3c7f975c857f",
      "schemaVersion": 1,
      "source": "ai_generated",
      "wordingStyle": "shortened",
      "order": 9,
      "type": "text",
      "content": {
        "body": "[Converted from an accordion - expand/collapse interactivity lost]\n\nArtificial Intelligence (AI)\nAI is the broadest category, covering any system that mimics human intelligence. This includes everything from rule-based systems to advanced learning algorithms.\n\n\n\nExamples: Chess-playing programs, basic chatbots, and modern recommendation engines all fall under AI.\n\nMachine Learning (ML)\nMachine learning is a subset of AI that enables systems to learn from data and improve over time without being explicitly programmed for every scenario.\n\n\n\nExamples: Email spam filters that adapt to new threats, or image classifiers that learn to recognize objects.\n\nDeep Learning (DL)\nDeep learning is a specialized area of machine learning that uses neural networks with many layers to process large amounts of data and identify intricate patterns.\n\n\n\nExamples: Voice assistants that understand natural speech, or systems that can identify faces in photos with high accuracy."
      }
    },
    {
      "lessonId": "rise-29eaf4e5-6a3d-4640-a618-194e7debe2a1",
      "schemaVersion": 1,
      "source": "ai_generated",
      "wordingStyle": "shortened",
      "order": 10,
      "type": "quiz",
      "content": {
        "questions": [
          {
            "prompt": "Which of the following best describes the relationship among AI, ML, and DL?",
            "options": [
              "Machine learning is a subset of artificial intelligence, and deep learning is a subset of machine learning",
              "Artificial intelligence is a subset of machine learning, and deep learning is a separate field",
              "Deep learning is the broadest category, with AI as a subset",
              "Machine learning and deep learning are unrelated to artificial intelligence"
            ],
            "correctIndex": 0
          }
        ]
      }
    },
    {
      "lessonId": "rise-oczxhb5x05jhw9ojybtfn4ya",
      "schemaVersion": 1,
      "source": "ai_generated",
      "wordingStyle": "shortened",
      "order": 11,
      "type": "text",
      "content": {
        "body": "Narrow AI vs. General AI\n\nNot all AI systems are the same. Narrow AI refers to systems designed for a specific task, such as recognizing faces or filtering spam emails. This is the type of AI in use today across industries. General AI, on the other hand, is a theoretical concept—an AI system that could perform any intellectual task a human can. General AI does not exist yet; all real-world AI is narrow AI, focused on specialized tasks."
      }
    },
    {
      "lessonId": "rise-l9369r6ye32actwkpcbhe7xu",
      "schemaVersion": 1,
      "source": "ai_generated",
      "wordingStyle": "shortened",
      "order": 12,
      "type": "text",
      "content": {
        "body": "Narrow AI vs. General AI Flashcards\n\nTest your recall of the differences between narrow AI and general AI with these flashcards."
      }
    },
    {
      "lessonId": "rise-hzsj1jjd6f8f9jo4l3bwrok6",
      "schemaVersion": 1,
      "source": "ai_generated",
      "wordingStyle": "shortened",
      "order": 13,
      "type": "text",
      "content": {
        "body": "[Converted from a flip-card exercise - interactivity lost]\n\nQ: Narrow AI\nA: Designed for a specific task (e.g., spam filter, voice assistant)\n\nQ: General AI\nA: A theoretical system that could perform any intellectual task a human can\n\nQ: Which type is in production today?\nA: Narrow AI"
      }
    },
    {
      "lessonId": "rise-b5caff04-9ff3-4397-8fc1-31a42ad23eae",
      "schemaVersion": 1,
      "source": "ai_generated",
      "wordingStyle": "shortened",
      "order": 14,
      "type": "quiz",
      "content": {
        "questions": [
          {
            "prompt": "Which best describes the AI used in today’s production systems?",
            "options": [
              "A. General AI, capable of any human task",
              "B. Narrow AI, focused on specific tasks",
              "C. AI that requires no data to operate",
              "D. AI that can learn any task instantly"
            ],
            "correctIndex": 1
          }
        ]
      }
    },
    {
      "lessonId": "rise-oskrsfj4xhc3wsb5dqgaaxyu",
      "schemaVersion": 1,
      "source": "ai_generated",
      "wordingStyle": "shortened",
      "order": 15,
      "type": "text",
      "content": {
        "body": "AI in the Real World\n\nAI is already part of our daily lives and business operations, often in ways we don’t even notice. From personalized shopping recommendations to fraud detection and smart home devices, AI is quietly powering many of the tools and services we rely on. Understanding these real-world applications helps connect the theory of AI to its practical value."
      }
    },
    {
      "lessonId": "rise-bb2shdsi1ba9jegapw6mwfx5",
      "schemaVersion": 1,
      "source": "ai_generated",
      "wordingStyle": "shortened",
      "order": 16,
      "type": "text",
      "content": {
        "body": "AI is utilized in a wide range of fields, each with its own unique applications and benefits. Below are some key categories and examples of how AI is being used today:"
      }
    },
    {
      "lessonId": "rise-nu9nplpq15inez77haxbi662",
      "schemaVersion": 1,
      "source": "ai_generated",
      "wordingStyle": "shortened",
      "order": 17,
      "type": "text",
      "content": {
        "body": "1. Consumer Applications: AI powers product recommendations, smart home devices, and voice assistants, making everyday life more convenient and personalized.\n2. Enterprise Solutions: Businesses use AI for fraud detection, process automation, and predictive analytics to improve efficiency and decision-making.\n3. Emerging Technologies: AI is at the core of innovations such as autonomous vehicles, healthcare diagnostics, and advanced robotics, driving progress in these cutting-edge fields."
      }
    },
    {
      "lessonId": "rise-fa2b5c13-64e6-4ac4-8631-25973d4bf11d",
      "schemaVersion": 1,
      "source": "ai_generated",
      "wordingStyle": "shortened",
      "order": 18,
      "type": "text",
      "content": {
        "body": "[Converted from an accordion - expand/collapse interactivity lost]\n\nProduct Recommendations\nAI analyzes your browsing and purchase history to suggest products you’re likely to want, making shopping more personalized and efficient.\n\n\n\nThis technology is used by major online retailers to increase sales and improve customer satisfaction.\n\nFraud Detection\nFinancial institutions use AI to monitor transactions for unusual patterns that may indicate fraud, helping to protect both businesses and consumers.\n\n\n\nAI systems can flag suspicious activity in real time, allowing for rapid response.\n\nVoice Assistants\nVoice assistants like Alexa or Siri use AI to understand spoken language and carry out tasks, from setting reminders to answering questions.\n\n\n\nThese systems rely on deep learning to continually improve their accuracy and usefulness.\n\nSmart Home Devices\nAI powers smart thermostats, lights, and security systems, enabling automation and remote control based on your habits and preferences.\n\n\n\nThese devices make homes more energy-efficient, secure, and convenient."
      }
    },
    {
      "lessonId": "rise-uuk6ggyzr1eu4qnoolo6h90a",
      "schemaVersion": 1,
      "source": "ai_generated",
      "wordingStyle": "shortened",
      "order": 19,
      "type": "text",
      "content": {
        "body": "Match AI Applications to Their Categories\n\nTest your ability to match AI applications to their categories. Drag each example to the correct group."
      }
    },
    {
      "lessonId": "rise-7088b6c0-ecf9-4fd5-a527-9f6278ff1109",
      "schemaVersion": 1,
      "source": "ai_generated",
      "wordingStyle": "shortened",
      "order": 20,
      "type": "text",
      "content": {
        "body": "AI is no longer just a buzzword—it's driving real change in how organizations operate and compete."
      }
    },
    {
      "lessonId": "rise-q4tt8xkedtue7041c0pjgn9w",
      "schemaVersion": 1,
      "source": "ai_generated",
      "wordingStyle": "shortened",
      "order": 21,
      "type": "text",
      "content": {
        "body": "In this lesson, you’ve learned what artificial intelligence is, how it relates to machine learning and deep learning, the difference between narrow and general AI, and how AI is already impacting the world around us. These foundational concepts are essential for anyone looking to make informed decisions about AI in their organization.\n\nNext, we’ll dive deeper into the three major paradigms of machine learning: supervised, unsupervised, and reinforcement learning. Understanding these will help you see how AI systems are trained and how they learn to solve different types of problems."
      }
    }
  ]
});
