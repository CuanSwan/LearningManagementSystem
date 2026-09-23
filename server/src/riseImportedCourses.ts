// Real course content converted from a Rise 360 export via the tested
// convertRiseCourse() pipeline (see riseImport.ts / riseZip.ts), not
// hand-authored placeholder data like the other sample courses in
// sampleData.ts. Every lesson here is tagged source: "ai_generated" /
// wordingStyle: "shortened" because that is what the Rise importer always
// produces - see RISE_AUTHORSHIP in riseImport.ts.
import { parseCourse, parseModule, type Module } from "./schemas.js";

export const aiEngineeringCourse = parseCourse({
  "courseId": "rise-ai-engineering-foundations",
  "title": "AI Engineering Foundations: Building Real-World Intelligent Systems",
  "description": "Ready to step into one of the fastest-growing fields in tech? This course demystifies AI engineering and shows you how intelligent systems are designed, built, and deployed in the real world. Guided by practical examples—like Netflix recommendations and Google Maps rerouting—you’ll discover the essential skills and roles that power modern AI applications. Whether you’re new to programming or looking to upskill for a career in AI, you’ll gain the confidence and know-how to start building impactful AI solutions.",
  "theme": {},
  "status": "published"
});

export const aiEngineeringModules: Module[] = [
  parseModule({
    "moduleId": "rise-ai-engineering-foundations-welcome-to-the-ai-engineering-programme",
    "courseId": "rise-ai-engineering-foundations",
    "status": "published",
    "seed": {
      "title": "Welcome to the AI Engineering Programme",
      "objective": "Imported from Rise 360."
    },
    "lessons": [
      {
        "lessonId": "rise-t7e7twy6sv68hbv2iv346kt2",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 1,
        "type": "text",
        "content": {
          "body": "<h2>Welcome to the AI Engineering Programme</h2><p>Welcome to your journey into AI engineering! The world is experiencing an AI revolution, and you’re about to become a creator, not just a spectator. Whether you’re new to programming or looking to upskill, this course will equip you to build real AI systems that solve real problems. The skills you gain here are in high demand, and you’ll be ready to make a real impact in one of the fastest-growing fields in technology.</p>\n\n<p>In this lesson, you’ll get a clear overview of what to expect from the programme. Here’s what you’ll learn as you get started:</p>\n\n<ol><li>Programme Structure Overview</li><li>How You’ll Learn and Practise</li><li>Habits for Success</li><li>Where to Find Support</li></ol>\n\n<p>This programme is practical and portfolio-driven. You’ll build real projects, not just study theory.</p>\n\n<h3>Your AI Engineering Journey</h3><p>Explore the full path you’ll take through this programme. Each phase builds your skills and confidence, leading up to a professional portfolio and final assessment. Click each phase to see what you’ll cover and the projects you’ll build.</p>"
        }
      },
      {
        "lessonId": "rise-84806d91-f8f7-4db0-a495-accebee6af25",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 2,
        "type": "accordion",
        "content": {
          "sections": [
            {
              "title": "Phase 1: Foundation & Fundamentals",
              "body": "Start with the essentials—AI engineering basics, data fundamentals, Python programming, and the tools every AI engineer uses. You’ll build your first AI app using Python and Streamlit."
            },
            {
              "title": "Phase 2: Data Science & AI Techniques",
              "body": "Dive deeper into Python for data, master key libraries, and learn prompt engineering and retrieval-augmented generation (RAG). You’ll create a sentiment analysis app and a full-stack AI chatbot."
            },
            {
              "title": "Phase 3: Machine Learning & Professional Practice",
              "body": "Learn core machine learning concepts, tackle real-world challenges, and explore AI ethics. You’ll complete a machine learning project and finish with a final oral exam to showcase your skills."
            }
          ]
        }
      },
      {
        "lessonId": "rise-9bfcc786-d09b-4666-bf60-e2a382542c5d",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 3,
        "type": "accordion",
        "content": {
          "sections": [
            {
              "title": "Introduction to the Four-Stage Learning Method",
              "body": "This programme uses a proven four-stage approach to help you master AI engineering. Each stage builds on the last, guiding you from understanding to real-world application."
            },
            {
              "title": "Mastery Through Practice",
              "body": "By following this method, you’ll develop true mastery—step by step, with plenty of support along the way."
            },
            {
              "title": "Learn Concepts",
              "body": "Get clear explanations of how AI works and why it matters. Understanding the 'why' helps you solve real problems, not just follow tutorials."
            },
            {
              "title": "See Examples",
              "body": "Watch demonstrations and walk through real code. See how experienced developers approach challenges and make decisions."
            },
            {
              "title": "Practise Skills",
              "body": "Complete hands-on exercises to build your confidence. Move from 'I think I understand' to 'I know I can do this.'"
            },
            {
              "title": "Build Projects",
              "body": "Create real, portfolio-worthy projects that show employers what you can do. Each project is a chance to apply your skills and solve real problems."
            }
          ]
        }
      },
      {
        "lessonId": "rise-cxnxade7krya5a3hj2ducqco",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 4,
        "type": "text",
        "content": {
          "body": "<h2>Which Stage is This?</h2><p>Test your understanding of the four-stage learning method. Sort each activity into the correct stage to see how different tasks fit into your learning journey.</p>"
        }
      },
      {
        "lessonId": "rise-6029e351-7450-40af-b4de-75ef58ce6a8d",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 5,
        "type": "matching",
        "content": {
          "pairs": [
            {
              "prompt": "Typing out code in Jupyter",
              "match": "Practise Skills"
            },
            {
              "prompt": "Watching a code demo",
              "match": "See Examples"
            },
            {
              "prompt": "Building a chatbot project",
              "match": "Build Projects"
            },
            {
              "prompt": "Answering quiz questions",
              "match": "Learn Concepts"
            }
          ]
        }
      },
      {
        "lessonId": "rise-y12rw8wi99edg6l8a9j21tw6",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 6,
        "type": "text",
        "content": {
          "body": "<h2>Success Habits for AI Engineering Learners</h2><p>Developing the right habits will help you get the most out of this programme. Expand each tip to see practical advice for staying on track and building your skills.</p>"
        }
      },
      {
        "lessonId": "rise-64f4280f-5f53-426b-9f6d-f65526789dcb",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 7,
        "type": "accordion",
        "content": {
          "sections": [
            {
              "title": "Be Consistent",
              "body": "Regular, focused study sessions—even just 30 minutes a day—are more effective than occasional long marathons. Consistency helps your brain absorb and retain new information.\n\n\n\nSet a routine that fits your life and stick to it. Progress comes from steady effort, not perfection."
            },
            {
              "title": "Type the Code Yourself",
              "body": "Don’t just watch or copy code—write it out yourself. Making mistakes and fixing them is how real learning happens.\n\n\n\nEach time you type code, you deepen your understanding and build problem-solving skills."
            },
            {
              "title": "Experiment and Break Things",
              "body": "Once your code works, try changing things to see what happens. Tweak variables, use different approaches, and don’t be afraid to make mistakes.\n\n\n\nEvery error is a learning opportunity. The best developers have learned from thousands of small experiments."
            },
            {
              "title": "Build Your Portfolio from Day One",
              "body": "Add all your code and projects to GitHub right from the start. Employers want to see what you can do, not just hear about it.\n\n\n\nYour portfolio is your proof of skill—start building it now and keep adding to it as you learn."
            },
            {
              "title": "Ask for Help When Stuck",
              "body": "Use mentor support, forums, and the AI Tutorbot whenever you need guidance. Don’t struggle alone—asking for help is a sign of strength, not weakness.\n\n\n\nEvery expert was once a beginner who kept showing up and asking questions. You can do this."
            }
          ]
        }
      },
      {
        "lessonId": "rise-r31jn8am08h9lbe6oe5rrvr8",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 8,
        "type": "text",
        "content": {
          "body": "<h2>Where to Find Support</h2><p>Support is always available to help you succeed. Expand each tab to learn about the different resources and how to use them.</p>"
        }
      },
      {
        "lessonId": "rise-ab624965-889e-4299-bf41-141c2925a398",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 9,
        "type": "accordion",
        "content": {
          "sections": [
            {
              "title": "Mentor Support",
              "body": "Mentors are experienced professionals ready to answer your questions and guide you through challenges. You can reach out for help with technical issues, project feedback, or general advice.\n\n\n\nContact mentors via email or the course platform whenever you’re stuck. They’re here to help you move forward and build confidence."
            },
            {
              "title": "Course Library",
              "body": "The course library is your go-to resource for structured lessons, reference materials, and extra practice. It’s available 24/7, so you can learn at your own pace.\n\n\n\nUse the library to review concepts, find examples, and deepen your understanding of key topics whenever you need a refresher."
            },
            {
              "title": "AI Tutorbot",
              "body": "The AI Tutorbot is trained on the course syllabus and can provide instant answers to your questions. It’s available any time you need quick help or clarification.\n\n\n\nUse the Tutorbot for on-the-spot support, troubleshooting, or to get explanations of tricky concepts as you work through lessons."
            },
            {
              "title": "Technical Help",
              "body": "If you have issues with logging in, accessing materials, or using course tools, the technical support team is ready to assist. They can help resolve account or platform problems quickly.\n\n\n\nContact technical support by phone or email during business hours for prompt assistance with any technical difficulties."
            },
            {
              "title": "Special Educational Needs",
              "body": "If you have a learning difficulty or special educational needs, tailored support is available. The team will work with you to ensure you have the accommodations you need.\n\n\n\nLet the support team know about your needs early, so they can provide the right resources and adjustments for your learning experience."
            },
            {
              "title": "Personal Circumstances",
              "body": "If personal, medical, or professional circumstances affect your learning, reach out for help. The support team can offer flexible solutions to keep you on track.\n\n\n\nDon’t hesitate to share your situation—support is confidential and designed to help you succeed, whatever your circumstances."
            }
          ]
        }
      },
      {
        "lessonId": "rise-331faeac-8b21-474a-9e43-fddeb67ba5d5",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 10,
        "type": "text",
        "content": {
          "body": "<p>You’re never alone on this journey. Every expert started as a beginner—support is always here when you need it.</p>"
        }
      },
      {
        "lessonId": "rise-30c37248-18f2-4d47-b189-42d092ab9b3c",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 11,
        "type": "quiz",
        "content": {
          "questions": [
            {
              "prompt": "Which stage of the learning method involves creating your own AI project?",
              "options": [
                "Learn Concepts",
                "See Examples",
                "Practise Skills",
                "Build Projects"
              ],
              "correctIndex": 3
            }
          ]
        }
      }
    ]
  }),
  parseModule({
    "moduleId": "rise-ai-engineering-foundations-ai-fundamentals-what-ai-is-and-how-it-works",
    "courseId": "rise-ai-engineering-foundations",
    "status": "published",
    "seed": {
      "title": "AI Fundamentals: What AI Is and How It Works",
      "objective": "Imported from Rise 360."
    },
    "lessons": [
      {
        "lessonId": "rise-f7j1mmv2k3ojfkrg1ntx1qwe",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 1,
        "type": "text",
        "content": {
          "body": "<h2>Why AI Matters Today</h2><p>Artificial intelligence is transforming the way we live, work, and interact with the world. From the shows we watch to the routes we drive and the products we buy, AI is quietly shaping our daily experiences. Understanding how AI works isn’t just for tech experts—it’s essential for anyone who wants to help shape the future, not just watch it unfold.</p>\n\n<p>In this lesson, you’ll gain a clear understanding of what AI really is and how it operates in the real world. By the end, you’ll be able to recognise AI systems around you and understand the basics of how they’re built.</p>\n\n<ol><li>Define artificial intelligence in plain terms.</li><li>Apply the input–process–output model to real-world AI systems.</li><li>Recognise AI in everyday examples.</li><li>Identify the core building blocks of AI systems.</li><li>Understand the high-level lifecycle of building an AI system.</li></ol>\n\n<h3>What Is Artificial Intelligence?</h3><p>Forget the science fiction robots—artificial intelligence is all about teaching computers to recognise patterns in data and make decisions based on those patterns. At its core, AI is about using data and algorithms to mimic certain aspects of human thinking, but at a scale and speed that humans can’t match. Most AI systems aren’t trying to become conscious or sentient—they’re designed to solve specific, practical problems.</p>\n\n<h3>AI – Common Misconceptions vs. Reality</h3><p>Review each flashcard to separate the myths from the facts about AI.</p>"
        }
      },
      {
        "lessonId": "rise-kvv2jjrruvpw3qti88jisrj2",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 2,
        "type": "flashcard",
        "content": {
          "cards": [
            {
              "front": "AI is about sentient robots",
              "back": "AI is actually about recognising patterns in data, not creating human-like consciousness."
            },
            {
              "front": "AI always means superhuman intelligence",
              "back": "Most AI systems are narrow and specialised, not all-powerful or general-purpose."
            },
            {
              "front": "AI is only for scientists",
              "back": "AI is used in everyday apps and tools, not just in research labs."
            },
            {
              "front": "AI systems are infallible",
              "back": "AI can make mistakes and relies on the quality of its data and design."
            },
            {
              "front": "AI will replace all jobs",
              "back": "AI often augments human work, creating new roles and opportunities."
            }
          ]
        }
      },
      {
        "lessonId": "rise-ulqe710vcr1tata1zq5mxex2",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 3,
        "type": "text",
        "content": {
          "body": "<h2>The Input–Process–Output Model</h2><p>Nearly every AI system can be understood using a simple model: input, process, and output. First, data comes in as input. Next, the system uses algorithms to analyse the data and recognise patterns—this is the process. Finally, the system produces an output, such as a recommendation, prediction, or action. This mental model is the foundation for understanding how AI works in practice.</p>\n\n<h3>Visualising Input–Process–Output</h3><p>The input–process–output model in AI systems works as follows:</p><ul><li><strong>Input:</strong> This refers to the data that enters the system, such as user behaviour, sensor readings, or search queries. For example, your recent purchases on Amazon.</li><li><strong>Process:</strong> The algorithm analyses the input data to find patterns or make decisions. For instance, the system compares your purchases to millions of others to find similarities.</li><li><strong>Output:</strong> This is the result or action produced by the system. For example, Amazon suggests products you might also like.</li></ul>\n\n<p>AI is already powering many things you use every day—even if you don’t notice it.</p>\n\n<h3>AI in Action—Everyday Examples</h3><p>Expand each tab to see how AI is used in familiar apps and services, following the input–process–output model.</p>"
        }
      },
      {
        "lessonId": "rise-64625681-5e5b-4fff-bdc5-cffb2cbeb640",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 4,
        "type": "accordion",
        "content": {
          "sections": [
            {
              "title": "Netflix",
              "body": "Netflix collects data on what you watch, how long you watch, and what you skip. This viewing history is the input for its recommendation system.\n\n\n\nThe process involves analysing your habits and comparing them to millions of other users. The output is a set of personalised suggestions for what to watch next."
            },
            {
              "title": "Google Maps",
              "body": "Google Maps gathers real-time GPS data, traffic reports, and user feedback as input. This information is constantly updated from millions of devices.\n\n\n\nThe process uses algorithms to analyse traffic patterns and predict delays. The output is a real-time route update, helping you avoid congestion and reach your destination faster."
            },
            {
              "title": "Amazon",
              "body": "Amazon tracks your shopping behaviour, including what you view, add to your basket, and purchase. This input data is used to understand your preferences.\n\n\n\nThe process involves a predictive model that finds patterns in your shopping habits. The output is the familiar \"Customers also bought\" recommendations you see while browsing."
            },
            {
              "title": "Tesla",
              "body": "Tesla vehicles use cameras, radar, and other sensors to collect input data from the environment. This includes information about nearby cars, pedestrians, and road conditions.\n\n\n\nThe process combines all this sensor data using advanced algorithms to make driving decisions. The output is the car’s actions, such as steering, braking, or changing lanes autonomously."
            },
            {
              "title": "Google Search",
              "body": "When you type a query into Google, your search keywords become the input. Google also considers your location and previous searches.\n\n\n\nThe process uses intent analysis to understand what you really mean, not just the words you typed. The output is a list of relevant search results tailored to your needs."
            }
          ]
        }
      },
      {
        "lessonId": "rise-n0kqlv0hxlvrnhxornbzp74q",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 5,
        "type": "text",
        "content": {
          "body": "<h2>Match the Data to the AI System</h2><p>Sort each type of input data into the correct AI system. This will help you see how different kinds of information power different AI applications.</p>"
        }
      },
      {
        "lessonId": "rise-6f705f3b-6fe0-4aa9-aa81-d35989d1ed28",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 6,
        "type": "matching",
        "content": {
          "pairs": [
            {
              "prompt": "Camera & sensor data",
              "match": "Tesla"
            },
            {
              "prompt": "Viewing history",
              "match": "Netflix"
            },
            {
              "prompt": "Shopping basket",
              "match": "Amazon"
            },
            {
              "prompt": "Live GPS locations",
              "match": "Google Maps"
            }
          ]
        }
      },
      {
        "lessonId": "rise-d8fb6e5e-ef56-4d2c-86b0-64c0cfe8d42f",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 7,
        "type": "quiz",
        "content": {
          "questions": [
            {
              "prompt": "A supermarket app reroutes a delivery driver in real time. What is the input, and what is the output?",
              "options": [
                "Input: driver’s location; Output: new route",
                "Input: shopping list; Output: delivery time",
                "Input: product prices; Output: payment receipt",
                "Input: weather forecast; Output: store opening hours"
              ],
              "correctIndex": 0
            }
          ]
        }
      },
      {
        "lessonId": "rise-apg1q6el6lfzbw1k8soum644",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 8,
        "type": "text",
        "content": {
          "body": "<h2>The Building Blocks of AI Systems</h2><p>Every AI system is built from four essential components: data, algorithms, computational power, and models. You can think of these like the parts of a kitchen: data is the raw ingredients, algorithms are the recipes, computational power is the kitchen itself, and the model is the trained chef who prepares the final dish. Each part is crucial for creating effective AI solutions.</p>"
        }
      },
      {
        "lessonId": "rise-e16b97c7-897a-4702-bbd1-fbc5701e9393",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 9,
        "type": "accordion",
        "content": {
          "sections": [
            {
              "title": "Introduction to the Four Building Blocks of AI",
              "body": "AI systems are built from four key components, each playing a unique role in how the system learns and makes decisions."
            },
            {
              "title": "Summary: Bringing It All Together",
              "body": "All four building blocks must work together for an AI system to function effectively—just like a great meal depends on ingredients, a recipe, a kitchen, and a skilled chef."
            },
            {
              "title": "Data – The Raw Ingredients",
              "body": "AI needs lots of high-quality data to learn from, just as a chef needs good ingredients to cook a great meal."
            },
            {
              "title": "Algorithms – The Recipe",
              "body": "Algorithms are the step-by-step instructions that help the system find patterns in the data, like a recipe guides a chef through making a dish."
            },
            {
              "title": "Computational Power – The Kitchen",
              "body": "Powerful hardware is needed to process large amounts of data quickly, just as a well-equipped kitchen is needed to prepare complex meals."
            },
            {
              "title": "Model – The Trained Chef",
              "body": "The model is the end result: a system that has learned from data and can now make predictions or decisions, like a chef who knows how to prepare a signature dish."
            }
          ]
        }
      },
      {
        "lessonId": "rise-84f024cc-7f87-4fe6-8300-bde4cd9853be",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 10,
        "type": "quiz",
        "content": {
          "questions": [
            {
              "prompt": "Which building block of AI is most like a recipe?",
              "options": [
                "Data",
                "Algorithm",
                "Computational power",
                "Model"
              ],
              "correctIndex": 1
            }
          ]
        }
      },
      {
        "lessonId": "rise-7a95bba0-d0a9-4cf7-8cd7-9d5569ef2017",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 11,
        "type": "text",
        "content": {
          "body": "<p>Demand for AI engineering roles has grown over 340% in the past five years, across every industry.</p>\n\n<h2>How an AI System Gets Built—Start to Finish</h2><p>Building an AI system is like running a factory that manufactures intelligent decisions instead of physical products. Each stage in the process is essential for creating a robust, reliable system that delivers real value. Understanding this lifecycle will help you see how all the pieces fit together in practice.</p>\n\n<h3>The AI System Development Lifecycle</h3><p>Explore each step in the AI development process to see how an idea becomes a working system.</p>"
        }
      },
      {
        "lessonId": "rise-7c9f0f64-4764-4ca4-92d3-0d6f27d024af",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 12,
        "type": "accordion",
        "content": {
          "sections": [
            {
              "title": "Step 1: Identify Data Needs",
              "body": "Determine what data is required, including both real-time inputs and historical information, to solve the problem at hand."
            },
            {
              "title": "Step 2: Clean & Prepare Data",
              "body": "Organise, clean, and format the data to ensure it’s accurate and ready for use by the AI system."
            },
            {
              "title": "Step 3: Choose & Train a Model",
              "body": "Select the right model and use the data to teach it how to recognise patterns and make decisions."
            },
            {
              "title": "Step 4: Fine-Tune & Optimise",
              "body": "Adjust the model’s settings and parameters to improve its performance and accuracy."
            },
            {
              "title": "Step 5: Test & Validate",
              "body": "Check the system’s accuracy, speed, fairness, and reliability using real-world and edge-case scenarios."
            },
            {
              "title": "Step 6: Deploy & Integrate",
              "body": "Launch the AI system into its real environment and connect it with other systems or applications."
            },
            {
              "title": "Step 7: Monitor & Maintain",
              "body": "Continuously track the system’s performance, watch for data drift, and retrain or update as needed to keep it effective."
            }
          ]
        }
      },
      {
        "lessonId": "rise-263c5430-fcf9-4f70-ae81-27c646406977",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 13,
        "type": "quiz",
        "content": {
          "questions": [
            {
              "prompt": "A bank’s fraud-detection system starts missing new types of fraud six months after launch. Which lifecycle step is failing, and what should the team do?",
              "options": [
                "Clean & Prepare Data – collect more data",
                "Monitor & Maintain – retrain the model",
                "Deploy & Integrate – update the app",
                "Test & Validate – run more tests"
              ],
              "correctIndex": 1
            }
          ]
        }
      },
      {
        "lessonId": "rise-a474d548-4bd0-435f-8304-a7f37d884294",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 14,
        "type": "text",
        "content": {
          "body": "<p>AI systems aren’t built by one person—they rely on collaboration between data scientists, engineers, domain experts, and more.</p>"
        }
      }
    ]
  }),
  parseModule({
    "moduleId": "rise-ai-engineering-foundations-what-is-ai-engineering",
    "courseId": "rise-ai-engineering-foundations",
    "status": "published",
    "seed": {
      "title": "What Is AI Engineering?",
      "objective": "Imported from Rise 360."
    },
    "lessons": [
      {
        "lessonId": "rise-zl56q7sed3l6fyxtdhfghwy5",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 1,
        "type": "text",
        "content": {
          "body": "<h2>Why Engineering Matters in AI</h2><p>AI breakthroughs in research are only the beginning. It’s the engineering that transforms these discoveries into reliable, scalable, and valuable products that millions of people use every day. AI engineering bridges the gap between cutting-edge research and real-world impact, ensuring that AI systems are not just impressive in theory, but actually work in practice.</p>\n\n<p>In this lesson, you’ll gain a clear understanding of what makes AI engineering unique and essential. You’ll explore the main responsibilities of AI engineers and see how their work brings AI to life in real-world systems.</p>\n\n<ol><li>Distinguish AI engineering from AI research</li><li>Summarise the core responsibilities of AI engineers</li><li>Explore the four pillars of AI engineering</li><li>Apply real-world examples to each area</li></ol>\n\n<p>Having a great AI model is only 20% of the solution. The other 80% is engineering it to actually work.</p>\n\n<p>AI research focuses on inventing and improving new models and algorithms, often in academic or laboratory settings. These researchers push the boundaries of what’s possible, creating the engines that power AI. In contrast, AI engineering is about making those engines work in the real world—ensuring they are reliable, efficient, and scalable for millions of users.</p><p>Think of it like this: researchers invent the engine, but engineers build the car that people actually drive. AI engineers take the latest breakthroughs and turn them into practical, robust systems that solve real problems, from powering recommendation engines to enabling real-time language translation.</p>\n\n<h3>AI Engineering vs. AI Research – Key Differences</h3><p>Review each flashcard to see how responsibilities and skills differ between AI research and AI engineering. This will help you quickly spot the distinction in real-world scenarios.</p>"
        }
      },
      {
        "lessonId": "rise-fpj64o5hucjq0yv4667f8x3w",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 2,
        "type": "flashcard",
        "content": {
          "cards": [
            {
              "front": "Publishing a new algorithm",
              "back": "AI Research – Creating and sharing novel models or techniques, usually in academic or lab settings."
            },
            {
              "front": "Scaling a model to millions",
              "back": "AI Engineering – Making AI models work reliably and efficiently for large numbers of users."
            },
            {
              "front": "Designing experiments for accuracy",
              "back": "AI Research – Testing and validating new algorithms to improve their performance."
            },
            {
              "front": "Building monitoring systems",
              "back": "AI Engineering – Creating tools to track AI system performance and catch failures in production."
            },
            {
              "front": "Fine-tuning a model for business",
              "back": "AI Engineering – Adapting existing models to meet specific organisational needs and objectives."
            }
          ]
        }
      },
      {
        "lessonId": "rise-bz0wor4zuyosgi7qymt0y3lq",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 3,
        "type": "text",
        "content": {
          "body": "<h2>What Does an AI Engineer Actually Do?</h2><p>AI engineers work across four core areas that bring AI systems to life: system design and architecture, model development and integration, data pipeline management, and end-to-end solution building. Most AI engineers spend their time moving between these pillars, ensuring that AI is not just smart, but also practical, scalable, and robust in real-world products.</p>\n\n<h3>The Four Pillars of AI Engineering</h3><p>Expand each tab to explore the main areas of AI engineering, each illustrated with a real-world example. See how these pillars work together to turn research into products millions rely on.</p>"
        }
      },
      {
        "lessonId": "rise-6e940068-cae9-4620-96c2-1553afe20961",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 4,
        "type": "accordion",
        "content": {
          "sections": [
            {
              "title": "System Design & Architecture",
              "body": "System design and architecture is about figuring out how all the parts of an AI system fit together. For example, Spotify’s recommendation engine serves over 400 million users, requiring a complex system with multiple models, data pipelines, and infrastructure that can handle huge amounts of traffic.\n\n\n\nAI engineers design these systems to be reliable and scalable, ensuring that recommendations are delivered instantly and accurately, even as user numbers grow. Their work ensures the system can integrate new features and models without breaking."
            },
            {
              "title": "Model Development & Integration",
              "body": "Model development and integration involves taking AI models from research and making them work in real-world applications. Instagram’s content moderation, for instance, relies on integrating models that can process vast amounts of user-generated content quickly and accurately.\n\n\n\nEngineers adapt, fine-tune, and connect these models to the rest of the system, ensuring they perform well under real-world conditions and can be updated as needed to handle new types of data or threats."
            },
            {
              "title": "Data Pipeline Management",
              "body": "Data pipeline management is about building and maintaining the systems that collect, clean, and deliver data to AI models. Google Maps, for example, uses real-time traffic data from millions of devices, requiring robust pipelines to ensure the data is accurate and up to date.\n\n\n\nAI engineers create these pipelines so that models always have the right data at the right time, enabling features like live rerouting and traffic predictions that users depend on every day."
            },
            {
              "title": "End-to-End Solution Building",
              "body": "End-to-end solution building brings together all the pillars to deliver a complete product. Netflix’s recommendation system is a prime example: engineers collect viewing data, test algorithms, build infrastructure, and integrate everything into the app millions use daily.\n\n\n\nThis holistic approach ensures the AI system is not just a collection of parts, but a seamless, reliable experience for users, with constant monitoring and updates to keep it performing at its best."
            }
          ]
        }
      },
      {
        "lessonId": "rise-o5065288s75y3cptinpokcjh",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 5,
        "type": "text",
        "content": {
          "body": "<h2>Skills and Knowledge Every AI Engineer Needs</h2><p>AI engineering is a multidisciplinary field. Expand each section to see what you’ll need to know to succeed as an AI engineer.</p>"
        }
      },
      {
        "lessonId": "rise-4a3faeca-1d3d-4442-ae22-1af00cf31d9e",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 6,
        "type": "accordion",
        "content": {
          "sections": [
            {
              "title": "Software Engineering",
              "body": "AI engineers need strong programming skills, a solid grasp of system architecture, and experience with APIs and deployment. These skills allow them to build, integrate, and maintain complex AI systems.\n\n\n\nUnderstanding how to design scalable, maintainable software is essential for bringing AI models into real-world products."
            },
            {
              "title": "Machine Learning & Model Use",
              "body": "While AI engineers don’t usually invent new models, they must understand how to select, adapt, and integrate existing ones. This includes fine-tuning, prompt engineering, and evaluating model performance.\n\n\n\nKnowing how to use foundation models and adapt them for specific tasks is a key part of the job."
            },
            {
              "title": "Data Engineering",
              "body": "Managing data pipelines is crucial. AI engineers collect, clean, and process data to ensure models have what they need to perform well.\n\n\n\nSkills in data engineering help ensure the reliability and accuracy of AI-driven features."
            },
            {
              "title": "Critical Thinking & Problem Solving",
              "body": "AI engineers must identify real-world needs, troubleshoot issues, and optimise systems for performance and reliability.\n\n\n\nStrong problem-solving skills help them adapt to new challenges and deliver robust solutions."
            },
            {
              "title": "Monitoring & Maintenance",
              "body": "Building systems to monitor AI performance, detect errors, and handle data drift is vital. AI systems need ongoing attention to stay effective.\n\n\n\nEngineers must be proactive in maintaining and updating systems as data and requirements change."
            }
          ]
        }
      },
      {
        "lessonId": "rise-6f808318-2cfa-4e48-8f51-5f8718a2473b",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 7,
        "type": "text",
        "content": {
          "body": "<p>Every recommendation you see on Netflix is the result of an entire engineered system—not just a single AI model.</p>\n\n<p>[Converted from a multi-select knowledge check - interactivity lost]</p>\n\n<p>Read each scenario and select which pillar of AI engineering it best fits.\n\n1. Ensuring an AI system updates recommendations instantly for millions of users\n2. Building a pipeline to clean and validate incoming sensor data\n3. Integrating a new language model into a customer support chatbot\n4. Bringing together data collection, model testing, and app integration for a streaming service</p>\n\n<p>Correct: 1. System Design &amp; Architecture; 2. Data Pipeline Management; 3. Model Development &amp; Integration; 4. End-to-End Solution Building</p>\n\n<h2>Research or Engineering? – Real-World Tasks</h2><p>Sort each task into the correct category. This will help you practise distinguishing between AI research and AI engineering in practical scenarios.</p>"
        }
      },
      {
        "lessonId": "rise-9024ffc5-ef65-4929-bc49-495fc6d99338",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 8,
        "type": "matching",
        "content": {
          "pairs": [
            {
              "prompt": "Developing a new transformer algorithm",
              "match": "AI Research"
            },
            {
              "prompt": "Writing a paper on neural network optimisation",
              "match": "AI Research"
            },
            {
              "prompt": "Deploying a model to handle millions of requests",
              "match": "AI Engineering"
            },
            {
              "prompt": "Building monitoring dashboards for model performance",
              "match": "AI Engineering"
            },
            {
              "prompt": "Fine-tuning a model for a specific business use case",
              "match": "AI Engineering"
            }
          ]
        }
      },
      {
        "lessonId": "rise-852334c5-3a4d-4dd3-ba06-5da14d0eaa16",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 9,
        "type": "quiz",
        "content": {
          "questions": [
            {
              "prompt": "What is the main difference between AI research and AI engineering?",
              "options": [
                "Research focuses on building products, engineering on publishing papers",
                "Research invents new models, engineering makes them work in real-world systems",
                "Engineering is only about data, research is about software",
                "Engineering and research are the same"
              ],
              "correctIndex": 1
            }
          ]
        }
      },
      {
        "lessonId": "rise-rc9jxh32yl7hi4dbieifgtjg",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 10,
        "type": "text",
        "content": {
          "body": "<p>In the next lesson, you’ll explore the different roles that contribute to building AI systems—like ML engineers, AI engineers, software engineers, and data engineers—and see how they work together to turn ideas into working products. Get ready to discover how these roles collaborate to bring AI to life.</p>"
        }
      }
    ]
  }),
  parseModule({
    "moduleId": "rise-ai-engineering-foundations-fields-of-work-in-ai-engineering",
    "courseId": "rise-ai-engineering-foundations",
    "status": "published",
    "seed": {
      "title": "Fields of Work in AI Engineering",
      "objective": "Imported from Rise 360."
    },
    "lessons": [
      {
        "lessonId": "rise-zf7pvcjzjf0uk6tf0cjtlhce",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 1,
        "type": "text",
        "content": {
          "body": "<h2>The Many Hats in AI Engineering</h2><p>Building an AI system is never a solo mission. Just as a smart car factory relies on a team of designers, engineers, and supply chain experts to bring a vehicle to life, AI projects require a diverse set of specialists working together. Each role brings unique expertise to the table, ensuring that AI systems are not only intelligent but also reliable, scalable, and ready for the real world.</p><p>In this lesson, you’ll discover how these different roles fit together, why collaboration is essential, and how you might find your place in the AI engineering ecosystem.</p>\n\n<p>In this lesson, you’ll gain a clear understanding of the different roles that make up an AI engineering team. By the end, you’ll be able to identify who does what, how they work together, and why each role matters.</p>\n\n<ol><li>Identify Key AI Roles</li><li>Describe Role Responsibilities</li><li>Understand Role Collaboration</li><li>Explore Real-World Examples</li></ol>\n\n<p>Think of building an AI application like running a Smart Car Factory.</p>\n\n<h3>Meet the Key Roles in AI Engineering</h3><p>Expand each tab to explore the main roles involved in building AI systems. Each role is essential, with its own responsibilities, challenges, and real-world examples.</p><p>See how the Smart Car Factory analogy helps make sense of each specialist’s contribution to the AI project.</p>"
        }
      },
      {
        "lessonId": "rise-67a2e2a5-6104-4097-b0bc-48175cb13e4d",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 2,
        "type": "accordion",
        "content": {
          "sections": [
            {
              "title": "Machine Learning Engineer / Data Scientist",
              "body": "In the Smart Car Factory, this role is like the R&D lab—experimenting with new designs and technologies before anything goes into production. Machine learning engineers and data scientists focus on researching, prototyping, and testing new AI models and algorithms.\n\n\n\nThey ask questions like, “What if we try a different neural network architecture?” or “Can we improve accuracy with more data?” For example, in the AlphaFold project, machine learning engineers developed breakthrough models to predict protein structures, pushing the boundaries of what AI can achieve."
            },
            {
              "title": "AI Engineer",
              "body": "The AI engineer is the production floor manager—taking the prototypes from the R&D lab and turning them into reliable, scalable products. They are responsible for integrating models into real-world systems, ensuring everything works smoothly and efficiently.\n\n\n\nFor instance, after AlphaFold’s model was developed, AI engineers worked to deploy it at scale, making sure it could deliver results quickly and reliably to scientists worldwide. They bridge the gap between research and practical application."
            },
            {
              "title": "Software Engineer",
              "body": "Software engineers are the infrastructure team—building and maintaining the systems that host and support AI applications. They ensure the underlying software is robust, secure, and able to handle millions of users.\n\n\n\nIn an e-commerce search system, software engineers design the user interface, manage databases, and create the APIs that connect AI models to the rest of the application. They focus on making the whole system work, not just the AI component."
            },
            {
              "title": "Data Engineer",
              "body": "Data engineers are the supply chain experts—sourcing, cleaning, and organising the raw materials (data) that power AI systems. They design and maintain data pipelines, ensuring high-quality data flows smoothly into the system.\n\n\n\nFor example, in a retail inventory project, data engineers combined sales data from thousands of stores, weather information, and social media trends to provide the clean, organised data needed for accurate AI predictions."
            }
          ]
        }
      },
      {
        "lessonId": "rise-vplv75nemlpwvd0ezt0v9pym",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 3,
        "type": "text",
        "content": {
          "body": "<h2>What Each Role Does (and Doesn’t Do)</h2><p>Expand each section to see what each role focuses on—and what they typically don’t handle. Understanding these boundaries helps clarify how teams work together and where responsibilities lie.</p>"
        }
      },
      {
        "lessonId": "rise-290247a8-eaf3-45d0-b5cd-9d4dc4415e37",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 4,
        "type": "accordion",
        "content": {
          "sections": [
            {
              "title": "Machine Learning Engineer / Data Scientist",
              "body": "Main tasks: Prototyping models, experimenting with algorithms, analysing data, and testing accuracy. They focus on research, model development, and proof-of-concept work.\n\n\n\nUsually not responsible for: Building production-ready apps, managing large-scale data pipelines, or deploying models to live systems. They often hand off their work to AI engineers or software engineers for production.\n\n\n\nInteraction: Collaborate closely with data engineers for data preparation and with AI engineers to transition models into production."
            },
            {
              "title": "AI Engineer",
              "body": "Main tasks: Integrating models into production systems, optimising performance, monitoring reliability, and ensuring scalability. They turn research into real-world solutions.\n\n\n\nUsually not responsible for: Inventing new algorithms from scratch or designing the user interface. They focus on making existing models work in practical settings.\n\n\n\nInteraction: Work with machine learning engineers to understand model limitations, and with software engineers to deploy and maintain systems."
            },
            {
              "title": "Software Engineer",
              "body": "Main tasks: Building application infrastructure, designing user interfaces, managing databases, and creating APIs. They ensure the entire system is robust and user-friendly.\n\n\n\nUsually not responsible for: Developing AI models or managing raw data. Their focus is on the software ecosystem, not the intelligence itself.\n\n\n\nInteraction: Collaborate with AI engineers to integrate models and with data engineers to ensure data flows correctly through the system."
            },
            {
              "title": "Data Engineer",
              "body": "Main tasks: Sourcing, cleaning, and organising data; designing data pipelines; and ensuring data quality and availability. They provide the essential raw material for AI systems.\n\n\n\nUsually not responsible for: Building or deploying AI models, or designing application features. Their expertise is in data, not algorithms or user interfaces.\n\n\n\nInteraction: Work with machine learning engineers to deliver clean data for model training and with AI engineers to maintain data pipelines in production."
            }
          ]
        }
      },
      {
        "lessonId": "rise-cw99wnodskzl168nfkuzvm0s",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 5,
        "type": "text",
        "content": {
          "body": "<h2>Who Would Handle This?</h2><p>Review each flashcard to see which role would typically handle the task described. This will help you remember the boundaries between roles in real AI projects.</p>"
        }
      },
      {
        "lessonId": "rise-x483jkjk9puk1wemqmipr709",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 6,
        "type": "flashcard",
        "content": {
          "cards": [
            {
              "front": "Cleaning and merging sales data",
              "back": "Data Engineer – They specialise in sourcing, cleaning, and organising data from multiple sources for use in AI systems."
            },
            {
              "front": "Designing a new neural network",
              "back": "Machine Learning Engineer – They experiment with and prototype new model architectures to improve AI performance."
            },
            {
              "front": "Building a web dashboard for users",
              "back": "Software Engineer – They create user interfaces and application features that allow people to interact with AI systems."
            },
            {
              "front": "Deploying a model to the cloud",
              "back": "AI Engineer – They integrate and deploy AI models into production environments, ensuring reliability and scalability."
            }
          ]
        }
      },
      {
        "lessonId": "rise-z5jl1swkxec23au5lfzcivgm",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 7,
        "type": "text",
        "content": {
          "body": "<h2>Who Does What? – Sorting AI Project Tasks</h2><p>Sort each task into the correct role. This activity will challenge you to apply what you’ve learned about the boundaries and responsibilities of each specialist in an AI project.</p>"
        }
      },
      {
        "lessonId": "rise-dde56e44-8981-48ab-a0ef-d143add8dae0",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 8,
        "type": "matching",
        "content": {
          "pairs": [
            {
              "prompt": "Builds and tests a fraud detection algorithm",
              "match": "Machine Learning Engineer/Data Scientist"
            },
            {
              "prompt": "Integrates an AI model into a web app",
              "match": "AI Engineer"
            },
            {
              "prompt": "Ensures real-time data flows into the system",
              "match": "Data Engineer"
            },
            {
              "prompt": "Monitors model performance in production",
              "match": "AI Engineer"
            },
            {
              "prompt": "Designs the login system for an app",
              "match": "Software Engineer"
            }
          ]
        }
      },
      {
        "lessonId": "rise-c5md2bnt0fctepelcktgl86l",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 9,
        "type": "text",
        "content": {
          "body": "<h2>Roles in the AI Project Pipeline</h2><p>The AI project pipeline involves several roles working together throughout the project lifecycle:</p><ul><li><strong>Data Engineer:</strong> Responsible for sourcing, cleaning, and organizing data to prepare it for analysis and model training.</li><li><strong>Machine Learning Engineer/Data Scientist:</strong> Experiments with algorithms and builds and tests models using the prepared data.</li><li><strong>AI Engineer:</strong> Integrates models into production systems, optimizes their performance, and ensures reliability, often collaborating with other roles.</li><li><strong>Software Engineer:</strong> Develops the application infrastructure, user interfaces, and connections that allow the AI system to interact with users and other software.</li></ul>\n\n<h3>What Collaboration Looks Like in Practice</h3><p>Expand each section to see how collaboration happens at different stages of an AI project. Real teamwork is essential for success, with each role contributing their expertise at the right time.</p>"
        }
      },
      {
        "lessonId": "rise-748d1220-9824-44ff-b0e5-580909dfedad",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 10,
        "type": "accordion",
        "content": {
          "sections": [
            {
              "title": "Project Kick-off",
              "body": "At the start, all roles come together to define project goals, requirements, and success criteria. Data engineers assess data availability, ML engineers outline modelling approaches, AI engineers plan integration, and software engineers design system architecture.\n\n\n\nExample: In a fraud detection project, the team agrees on what data is needed, how the model will be used, and how results will be delivered to users."
            },
            {
              "title": "Model Development",
              "body": "Data engineers and ML engineers work closely to prepare and analyse data, build models, and test their performance. Feedback loops are common as data is refined and models are improved.\n\n\n\nExample: For a customer service chatbot, data engineers provide conversation logs, while ML engineers develop and test language models."
            },
            {
              "title": "Deployment",
              "body": "AI engineers and software engineers collaborate to integrate the trained model into the application, ensuring it runs efficiently and reliably for users. They handle scaling, monitoring, and troubleshooting.\n\n\n\nExample: When deploying a medical image analysis tool, AI engineers ensure the model works with hospital systems, while software engineers build the user interface for doctors."
            },
            {
              "title": "Monitoring & Maintenance",
              "body": "All roles contribute to ongoing monitoring, troubleshooting, and improvement. Data engineers watch for data quality issues, ML engineers track model accuracy, AI engineers manage system reliability, and software engineers maintain the application.\n\n\n\nExample: In a recommendation system, the team regularly reviews performance metrics and updates models or data pipelines as needed."
            }
          ]
        }
      },
      {
        "lessonId": "rise-ccf67428-5da0-42c3-bea5-4f9993fb99d8",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 11,
        "type": "quiz",
        "content": {
          "questions": [
            {
              "prompt": "A hospital wants to build an AI system that analyses X-rays. Which role would be most responsible for each of these stages?\n\n1. Collecting and cleaning the image data\n2. Developing the image recognition model\n3. Integrating the model into the hospital’s system\n4. Ensuring the app runs reliably for doctors",
              "options": [
                "A. Data Engineer, Machine Learning Engineer, AI Engineer, Software Engineer",
                "B. Machine Learning Engineer, Data Engineer, Software Engineer, AI Engineer",
                "C. Data Engineer, AI Engineer, Machine Learning Engineer, Software Engineer",
                "D. Software Engineer, Data Engineer, AI Engineer, Machine Learning Engineer"
              ],
              "correctIndex": 0
            }
          ]
        }
      },
      {
        "lessonId": "rise-405fd84a-7022-4559-accd-7a3a5cfb92a4",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 12,
        "type": "text",
        "content": {
          "body": "<p>AI engineering is a young, evolving field—sometimes you’ll specialise, sometimes you’ll wear several hats.</p>"
        }
      },
      {
        "lessonId": "rise-69d254a9-4938-4f51-8995-a102a32844af",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 13,
        "type": "quiz",
        "content": {
          "questions": [
            {
              "prompt": "Which of the following best describes the main responsibility of an AI engineer?",
              "options": [
                "Inventing new machine learning algorithms",
                "Integrating and deploying AI models into production systems",
                "Designing user interfaces for AI applications",
                "Cleaning and preparing raw data for model training"
              ],
              "correctIndex": 1
            }
          ]
        }
      },
      {
        "lessonId": "rise-fdvw6ysh6fo2ct63qovri7bu",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 14,
        "type": "text",
        "content": {
          "body": "<h2>What’s Next? – AI Engineering Techniques</h2><p>Next, you’ll explore the practical techniques that AI engineers use every day—prompt engineering, fine-tuning, and retrieval-augmented generation (RAG)—and the tools that power real AI systems. Get ready to dive into the hands-on skills that turn AI concepts into working solutions.</p>"
        }
      }
    ]
  }),
  parseModule({
    "moduleId": "rise-ai-engineering-foundations-ai-engineering-techniques-prompt-engineering-fine-tuning-and",
    "courseId": "rise-ai-engineering-foundations",
    "status": "published",
    "seed": {
      "title": "AI Engineering Techniques: Prompt Engineering, Fine-Tuning, and RAG",
      "objective": "Imported from Rise 360."
    },
    "lessons": [
      {
        "lessonId": "rise-t08fz18qvqa3whs8219f4xnm",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 1,
        "type": "text",
        "content": {
          "body": "<h2>Why Practical Techniques Matter in AI Engineering</h2><p>AI engineering isn’t just about using powerful models—it’s about adapting them to solve real business problems. Techniques like prompt engineering, fine-tuning, and retrieval-augmented generation (RAG) are the tools that turn generic AI into tailored, high-impact solutions. Mastering these skills is essential for anyone who wants to build AI systems that actually work in the real world.</p>\n\n<p>In this lesson, you'll explore the core practical techniques that every AI engineer needs. These methods are the foundation for building, adapting, and deploying intelligent systems that meet specific needs.</p>\n\n<ol><li>Define Key Techniques</li><li>Compare Strengths and Limitations</li><li>Real-World Examples</li><li>Essential Tools and Technologies</li></ol>\n\n<p>All AI engineers are ultimately prompt engineers too.</p>\n\n<p>Prompt engineering is the practice of crafting clear, effective instructions for AI models—especially large language models—to control their responses and outputs. It goes far beyond simply asking questions. Effective prompt engineering involves structuring requests, providing context, and anticipating how the model might interpret or even be manipulated by prompts. This skill is crucial for getting reliable, high-quality results from AI in real applications.</p>\n\n<h3>How Prompt Engineering Works</h3><p>User input and hidden instructions are combined and sent to a language model, which then generates an output.</p><ul><li><strong>User Prompt:</strong> These are the visible instructions or questions provided by the user.</li><li><strong>System Prompt:</strong> These are hidden instructions added by the developer to guide the model’s behavior or format.</li><li><strong>Combined Prompt:</strong> Both the user and system prompts are merged before being sent to the language model.</li><li><strong>LLM Output:</strong> The model processes the combined prompt and generates a response based on all instructions.</li></ul>\n\n<h3>Creative Techniques in Prompt Engineering</h3><p>Expand each section to learn about advanced prompt engineering methods. These sub-techniques help you get more precise, reliable, and secure results from AI models.</p>"
        }
      },
      {
        "lessonId": "rise-2dbfeb54-6823-4925-9f2f-704aeec34ac7",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 2,
        "type": "accordion",
        "content": {
          "sections": [
            {
              "title": "Few-shot Learning",
              "body": "Provide the model with a few examples of the task you want it to perform. This helps guide its responses and improves accuracy, especially for specialised or nuanced tasks."
            },
            {
              "title": "Chain-of-Thought Prompting",
              "body": "Ask the model to reason step-by-step, breaking down complex problems into smaller parts. This leads to more logical and well-structured answers."
            },
            {
              "title": "Role Prompting",
              "body": "Assign the model a specific perspective, role, or level of expertise. For example, you can instruct it to act as a medical expert or a helpful tutor to shape its responses."
            },
            {
              "title": "Prompt Defence",
              "body": "Use techniques like input validation and output filtering to prevent prompt injection or malicious manipulation. Secure prompts help protect your system from unintended behaviour."
            }
          ]
        }
      },
      {
        "lessonId": "rise-m8p1z45ukpi82g8hbjebrx0y",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 3,
        "type": "text",
        "content": {
          "body": "<h2>Prompt Engineering in Different Applications</h2><p>Explore each tab to see how prompt engineering adapts to different real-world domains. Each example highlights how prompts are tailored for specific tasks and users.</p>"
        }
      },
      {
        "lessonId": "rise-569ed264-28ea-49e2-81bc-7f53da904b90",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 4,
        "type": "accordion",
        "content": {
          "sections": [
            {
              "title": "Customer Service Chatbot",
              "body": "Prompts are designed to be empathetic and solution-focused, guiding the AI to respond politely and helpfully. The system prompt may also give the model access to company policies or FAQs to ensure accurate answers.\n\n\n\nFor example, a prompt might instruct the AI to always apologise for inconvenience and offer step-by-step solutions, referencing the latest company knowledge base."
            },
            {
              "title": "Medical Data Classification",
              "body": "System prompts process patient data and instruct the model to identify specific features or conditions. These prompts ensure the AI follows strict guidelines for diagnosis or data handling.\n\n\n\nFor instance, a prompt could direct the model to analyse blood test results and flag any abnormal values according to medical standards, keeping user data confidential."
            },
            {
              "title": "Code Generation Tool",
              "body": "Prompts specify the technical requirements for code output, such as language, style, or constraints. The system prompt may enforce best practices or coding standards.\n\n\n\nFor example, a prompt might require the AI to generate Python code that follows PEP8 guidelines and includes comments explaining each function."
            },
            {
              "title": "Education/Tutoring",
              "body": "Prompts guide the AI’s teaching style, level of detail, and reference materials. The system prompt may connect the model to a specific curriculum or textbook.\n\n\n\nFor instance, a prompt could instruct the AI to explain algebra concepts using simple analogies and provide practice questions tailored to the student’s level."
            }
          ]
        }
      },
      {
        "lessonId": "rise-b2b2f80e-aa4a-4f2c-b9f0-48265c0698f5",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 5,
        "type": "quiz",
        "content": {
          "questions": [
            {
              "prompt": "Which part of the following example is the system prompt?\n\nExample: \nSystem prompt: \"Always answer as a friendly tutor.\"\nUser prompt: \"Explain how photosynthesis works.\"",
              "options": [
                "A) \"Explain how photosynthesis works.\"",
                "B) \"Always answer as a friendly tutor.\"",
                "C) Both are system prompts",
                "D) Both are user prompts"
              ],
              "correctIndex": 1
            }
          ]
        }
      },
      {
        "lessonId": "rise-eljxvjzc0092vzgntb2sfhpt",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 6,
        "type": "text",
        "content": {
          "body": "<h2>What Is Fine-Tuning?</h2><p>Fine-tuning is the process of taking a pretrained AI model and further training it on a specific, labelled dataset to specialise its abilities for a particular task or domain. Think of it like a general physician who trains further to become a cardiologist—fine-tuning adapts a broad model to excel in a focused area.</p>"
        }
      },
      {
        "lessonId": "rise-5645a797-ed90-4150-b5aa-bd321f0f1439",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 7,
        "type": "accordion",
        "content": {
          "sections": [
            {
              "title": "Introduction to Fine-Tuning Steps",
              "body": "Fine-tuning is the process of adapting a pre-trained model to a specific task or domain. This involves several key steps to ensure the model performs well on your unique data."
            },
            {
              "title": "Summary of Fine-Tuning",
              "body": "Fine-tuning is a careful, iterative process that adapts a general model to a specialised task, requiring both technical skill and ongoing evaluation."
            },
            {
              "title": "Curate a Labelled Dataset",
              "body": "Gather and clean a dataset with clear input-output pairs that represent your specific task or domain. Quality and relevance are crucial at this stage."
            },
            {
              "title": "Set Hyperparameters",
              "body": "Adjust settings like learning rate, batch size, and number of training epochs. These control how quickly and carefully the model adapts to your data."
            },
            {
              "title": "Train at a Low Learning Rate",
              "body": "Continue training the model using your dataset, but at a gentle pace. This helps the model learn new patterns without forgetting its original strengths."
            },
            {
              "title": "Evaluate & Monitor",
              "body": "Use evaluation metrics to check the model’s performance. Watch for overfitting, bias, or catastrophic forgetting, and adjust as needed to ensure reliable results."
            }
          ]
        }
      },
      {
        "lessonId": "rise-3c56de0b-cf9c-4d42-b466-8c2e152a0e9f",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 8,
        "type": "text",
        "content": {
          "body": "<p>Garbage in, garbage out: the quality of your training data determines the quality of your fine-tuned model.</p>\n\n<h2>Fine-Tuning in Practice – Use Cases &amp; Challenges</h2><p>Expand each section to see where fine-tuning excels and what challenges you might face. Each domain has its own requirements and risks.</p>"
        }
      },
      {
        "lessonId": "rise-71043ace-47b6-48c8-8679-04241fdccb0d",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 9,
        "type": "accordion",
        "content": {
          "sections": [
            {
              "title": "Healthcare",
              "body": "Fine-tuning can adapt models to understand medical terminology, diagnose conditions, or generate clinical reports. Data must be accurate, well-labelled, and privacy-protected."
            },
            {
              "title": "Customer Service",
              "body": "Models can be fine-tuned to reflect a company’s brand voice, product knowledge, and support history. This ensures consistent, on-brand responses across all interactions."
            },
            {
              "title": "Legal Applications",
              "body": "Fine-tuning on case law, contracts, or legal briefs enables models to assist with document review, research, or drafting. Data quality and bias control are especially important here."
            },
            {
              "title": "Software Development",
              "body": "Custom code assistants can be created by fine-tuning on a company’s codebase and internal frameworks. This helps the AI understand specific coding standards and best practices."
            },
            {
              "title": "Risks",
              "body": "Common challenges include overfitting (model memorises training data), catastrophic forgetting (losing general abilities), bias amplification, and high computational costs. Careful monitoring and evaluation are essential."
            }
          ]
        }
      },
      {
        "lessonId": "rise-234f2c49-5720-4932-8a33-64e3cb57868d",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 10,
        "type": "quiz",
        "content": {
          "questions": [
            {
              "prompt": "You want an AI to use highly specialised legal terminology consistently across thousands of documents. Which technique is best?",
              "options": [
                "Prompt engineering",
                "Fine-tuning",
                "RAG",
                "Manual editing"
              ],
              "correctIndex": 1
            }
          ]
        }
      },
      {
        "lessonId": "rise-wz2s6zidkc7y90cfg2opyuz6",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 11,
        "type": "text",
        "content": {
          "body": "<h2>What Is Retrieval-Augmented Generation (RAG)?</h2><p>Retrieval-augmented generation (RAG) is a technique that gives an AI model access to an external knowledge base at the moment it generates a response. This allows the model to provide up-to-date, context-specific answers that go beyond its original training data.</p>"
        }
      },
      {
        "lessonId": "rise-6b8f818d-2fe9-4d79-8bd8-588ba670e281",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 12,
        "type": "accordion",
        "content": {
          "sections": [
            {
              "title": "Introduction to How RAG Works",
              "body": "This lesson explains the step-by-step process of Retrieval-Augmented Generation (RAG), a method that enhances AI responses by combining information retrieval with language model generation."
            },
            {
              "title": "Summary of RAG Process",
              "body": "RAG enables AI systems to deliver accurate, up-to-date answers by combining model knowledge with real-time information retrieval."
            },
            {
              "title": "Query Embedding",
              "body": "The user’s question is converted into a mathematical representation (embedding) that captures its meaning."
            },
            {
              "title": "Document Retrieval",
              "body": "The system searches a knowledge base for the most relevant documents or passages using similarity search."
            },
            {
              "title": "Combine with Query",
              "body": "The retrieved information is added to the prompt, giving the model extra context for its answer."
            },
            {
              "title": "Model Generation",
              "body": "The AI model uses both the original prompt and the retrieved context to generate a tailored, often cited, response."
            }
          ]
        }
      },
      {
        "lessonId": "rise-k4z4btu1drq9t4negbf4wds9",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 13,
        "type": "text",
        "content": {
          "body": "<h2>RAG in Real-World Applications</h2><p>Expand each tab to see how RAG is used across different industries. Each example shows how external knowledge bases enhance AI responses.</p>"
        }
      },
      {
        "lessonId": "rise-e90c7162-a55e-43aa-b0be-807c24b1bfaf",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 14,
        "type": "accordion",
        "content": {
          "sections": [
            {
              "title": "Customer Support",
              "body": "RAG systems can answer detailed product or policy questions by searching company documentation and providing precise, up-to-date answers. This ensures customers get the most relevant information, even as products change.\n\n\n\nFor example, a support bot might retrieve the latest warranty policy or troubleshooting guide before responding to a customer query."
            },
            {
              "title": "Healthcare",
              "body": "Doctors and clinicians can use RAG-powered systems to access the latest research papers, treatment guidelines, or patient records. This helps ensure medical advice is based on the most current evidence.\n\n\n\nFor instance, a physician might ask about a rare condition, and the system retrieves recent studies or protocols to inform the answer."
            },
            {
              "title": "Legal Research",
              "body": "Lawyers can use RAG to search and cite relevant case law, contracts, or regulations in real time. This supports more accurate and transparent legal research.\n\n\n\nFor example, a legal assistant tool might pull up the most relevant precedent or statute when drafting a brief."
            },
            {
              "title": "Enterprise Knowledge Management",
              "body": "Companies can deploy RAG systems to search internal wikis, policies, and documentation, making it easy for employees to find accurate answers quickly.\n\n\n\nFor instance, staff can query HR policies or technical manuals and receive responses with direct citations to the source documents."
            }
          ]
        }
      },
      {
        "lessonId": "rise-zs5tqctlk5clqgr87dmwccs0",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 15,
        "type": "text",
        "content": {
          "body": "<h2>RAG – Strengths, Challenges, and Best Practices</h2><p>Expand each section to learn about the benefits and complexities of RAG systems. Understanding these factors helps you build more effective solutions.</p>"
        }
      },
      {
        "lessonId": "rise-e57322ae-19fe-42c9-9451-4daec6874cfa",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 16,
        "type": "accordion",
        "content": {
          "sections": [
            {
              "title": "Strengths",
              "body": "RAG offers flexibility, transparency through citations, and easy updates to the knowledge base. It’s ideal for domains where information changes frequently or source verification is important."
            },
            {
              "title": "Challenges",
              "body": "Retrieval accuracy is critical—if the wrong documents are found, answers will be poor. RAG can also add latency and is limited by the model’s context window and retrieval costs."
            },
            {
              "title": "Best Practices",
              "body": "Maintain a clean, well-organised knowledge base. Use semantic caching and chunking strategies to optimise retrieval and performance. Always provide clear citations for transparency."
            }
          ]
        }
      },
      {
        "lessonId": "rise-co0cudfoz1851sk0xifkmckr",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 17,
        "type": "text",
        "content": {
          "body": "<h2>When to Use Prompt Engineering, Fine-Tuning, or RAG?</h2><p>Compare these three techniques across key criteria to help you choose the right approach for your project. Expand each tab to see the details.</p>"
        }
      },
      {
        "lessonId": "rise-b29bd7b7-888e-4297-8c67-a742dcae4daf",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 18,
        "type": "accordion",
        "content": {
          "sections": [
            {
              "title": "Prompt Engineering",
              "body": "Speed to Set Up: Fast—no model retraining needed.\n\n\n\nCost: Low for small-scale use, but can become expensive at scale.\n\n\n\nBest Used When: You need quick results or want to prototype ideas.\n\n\n\nLimitations: Less control over consistency and depth.\n\n\n\nExample Use Cases: Chatbots, creative writing, rapid prototyping."
            },
            {
              "title": "Fine-Tuning",
              "body": "Speed to Set Up: Slower—requires data preparation and training.\n\n\n\nCost: Higher due to compute and data needs.\n\n\n\nBest Used When: You need consistent, specialised behaviour or terminology.\n\n\n\nLimitations: Requires quality data and careful monitoring.\n\n\n\nExample Use Cases: Medical diagnosis, legal document review, brand-specific assistants."
            },
            {
              "title": "RAG",
              "body": "Speed to Set Up: Moderate—requires knowledge base setup.\n\n\n\nCost: Variable, depends on retrieval and storage.\n\n\n\nBest Used When: Information changes often or source transparency is needed.\n\n\n\nLimitations: Retrieval quality and latency can be issues.\n\n\n\nExample Use Cases: Customer support, research tools, enterprise search."
            }
          ]
        }
      },
      {
        "lessonId": "rise-e1jeemi7em6k80r2lytoc1ev",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 19,
        "type": "text",
        "content": {
          "body": "<h2>Which Technique? – Scenario Sorting</h2><p>Sort each scenario into the best-fit technique. Consider the requirements and context for each situation.</p>"
        }
      },
      {
        "lessonId": "rise-ec5b5e4d-710d-4fe7-a3a3-1432f881108e",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 20,
        "type": "matching",
        "content": {
          "pairs": [
            {
              "prompt": "The company’s documentation changes weekly",
              "match": "RAG"
            },
            {
              "prompt": "You need the AI to write consistently in your brand’s tone",
              "match": "Fine-Tuning"
            },
            {
              "prompt": "You’re prototyping a quick solution for a hackathon",
              "match": "Prompt Engineering"
            },
            {
              "prompt": "The AI must cite sources for every answer",
              "match": "RAG"
            },
            {
              "prompt": "You want to adapt a model for medical diagnosis",
              "match": "Fine-Tuning"
            }
          ]
        }
      },
      {
        "lessonId": "rise-wab4z4niwx72v83ijppp99u4",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 21,
        "type": "text",
        "content": {
          "body": "<h2>The AI Engineer’s Toolkit – Core Tools &amp; Technologies</h2><p>To apply these techniques, AI engineers rely on a range of tools and technologies. Python is the industry standard, but you’ll also need to know about machine learning libraries, data management tools, and deployment technologies. Building a strong foundation in these areas will help you succeed in real-world AI projects.</p>\n\n<h3>Tool Categories Every AI Engineer Should Know</h3><p>Expand each section to see the core tools and technologies in each category. Familiarity with these tools will help you build, adapt, and deploy AI systems effectively.</p>"
        }
      },
      {
        "lessonId": "rise-96a6d0b3-4c1f-4846-a82b-61175f266865",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 22,
        "type": "accordion",
        "content": {
          "sections": [
            {
              "title": "Languages & Core Libraries",
              "body": "Python is essential for AI development, supported by libraries like NumPy and Pandas for data manipulation. JavaScript and TypeScript are important for building user interfaces and web applications."
            },
            {
              "title": "ML & AI-Specific Tools",
              "body": "Frameworks like PyTorch and TensorFlow are used for model training and deployment. Hugging Face provides access to pretrained models, while LangChain and vector databases (Pinecone, Chroma) support advanced applications like RAG."
            },
            {
              "title": "Data & Databases",
              "body": "SQL and NoSQL databases (like MongoDB) are used for storing and querying data. Big-data tools such as Spark and data lakes help manage large, complex datasets."
            },
            {
              "title": "Deployment & Web",
              "body": "APIs and REST frameworks connect AI models to applications. Cloud platforms (AWS, Azure) and container tools like Docker are used for deploying and scaling AI systems."
            }
          ]
        }
      },
      {
        "lessonId": "rise-kp9a555jji8e1wx6b0oywdtd",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 23,
        "type": "text",
        "content": {
          "body": "<h2>Tool Recognition Practice</h2><p>Review each flashcard to test your knowledge of common AI engineering tools and their uses.</p>"
        }
      },
      {
        "lessonId": "rise-r1lmqh5l1qloehbjib0b7ee3",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 24,
        "type": "flashcard",
        "content": {
          "cards": [
            {
              "front": "Pandas",
              "back": "A Python library for data manipulation and analysis."
            },
            {
              "front": "Docker",
              "back": "A tool for packaging and deploying applications in isolated containers."
            },
            {
              "front": "FastAPI",
              "back": "A Python framework for building fast, scalable APIs."
            },
            {
              "front": "Pinecone",
              "back": "A vector database used for similarity search in RAG systems."
            },
            {
              "front": "Jupyter Notebook",
              "back": "An interactive environment for writing and running code, often used for experimentation."
            },
            {
              "front": "PyTorch",
              "back": "A popular deep learning framework for building and training AI models."
            }
          ]
        }
      },
      {
        "lessonId": "rise-5cb69fcd-4610-40ee-bbb4-6255d3d63c12",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 25,
        "type": "quiz",
        "content": {
          "questions": [
            {
              "prompt": "Match each tool to its correct category.",
              "options": [
                "A) Pandas – Languages & Core Libraries; B) Docker – Deployment & Web; C) Pinecone – ML & AI-Specific Tools; D) Spark – Data & Databases",
                "A) Pandas – ML & AI-Specific Tools; B) Docker – Data & Databases; C) Pinecone – Deployment & Web; D) Spark – Languages & Core Libraries",
                "A) Pandas – Data & Databases; B) Docker – ML & AI-Specific Tools; C) Pinecone – Languages & Core Libraries; D) Spark – Deployment & Web"
              ],
              "correctIndex": 0
            }
          ]
        }
      },
      {
        "lessonId": "rise-61ad67a8-32d1-4ed5-be95-d903dad40745",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 26,
        "type": "text",
        "content": {
          "body": "<p>You don’t need to master everything at once—Python is the one to prioritise.</p>"
        }
      },
      {
        "lessonId": "rise-7f5968d8-c31c-44a9-a1c7-fd378e890720",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 27,
        "type": "quiz",
        "content": {
          "questions": [
            {
              "prompt": "Which technique is best for providing up-to-date answers from a changing knowledge base?",
              "options": [
                "Prompt engineering",
                "Fine-tuning",
                "RAG",
                "Manual coding"
              ],
              "correctIndex": 2
            }
          ]
        }
      },
      {
        "lessonId": "rise-ywz1rd4qv2b468cy8c09oob9",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 28,
        "type": "text",
        "content": {
          "body": "<h2>What’s Next? – Foundation Models &amp; Training Data</h2><p>Next, you’ll explore how foundation models are built, how they differ from task-specific models, and why training data is the bedrock of every intelligent system. Get ready to dive deeper into the core of modern AI.</p>"
        }
      }
    ]
  }),
  parseModule({
    "moduleId": "rise-ai-engineering-foundations-understanding-foundation-models-and-training-data",
    "courseId": "rise-ai-engineering-foundations",
    "status": "published",
    "seed": {
      "title": "Understanding Foundation Models and Training Data",
      "objective": "Imported from Rise 360."
    },
    "lessons": [
      {
        "lessonId": "rise-w9759zn8ocrnqj8hp6vyn9vp",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 1,
        "type": "text",
        "content": {
          "body": "<h2>The New Era of AI—Why Foundation Models Matter</h2><p>We are living through a major shift in artificial intelligence. Foundation models have transformed what AI can do, moving us from narrow, single-purpose systems to broad, adaptable intelligence. These models are the engines behind today’s most powerful AI applications, making it possible to build systems that can understand language, generate creative content, and solve a wide range of problems—all from a single starting point.</p><p>This new era means that, as an AI engineer, you’re no longer limited to building models for just one task at a time. Instead, you can leverage these versatile models as the backbone for countless applications, unlocking new possibilities for innovation and impact.</p>\n\n<p>In this lesson, you’ll explore the building blocks of modern AI and the crucial role of data in shaping intelligent systems. By the end, you’ll have a clear understanding of what foundation models are, how they differ from traditional models, and why data quality is so important.</p>\n\n<ol><li>Define Foundation Models</li><li>Compare with Traditional Models</li><li>Understand the Role of Training Data</li><li>Explain Why Data Quality Matters</li></ol>\n\n<p>Foundation models are the starting point for almost every modern AI application.</p>\n\n<p>A foundation model is a large-scale AI model trained on vast and varied datasets, designed to handle a wide range of tasks rather than just one. These models learn general patterns from huge amounts of data, making them flexible and adaptable for many different applications. Well-known examples include GPT, Claude, Gemini, and BERT—each serving as a base for everything from chatbots to advanced analytics.</p><p>Unlike traditional models, which are built for a single, specific purpose, foundation models can be fine-tuned or prompted to perform new tasks, making them the backbone of today’s AI systems.</p>\n\n<h3>Foundation Model or Task-Specific Model?</h3><p>Review each flashcard to decide whether the example describes a foundation model or a traditional, task-specific model. Flip to see the answer and a brief explanation.</p>"
        }
      },
      {
        "lessonId": "rise-j3gb0u52e91aduj9s433pwwc",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 2,
        "type": "flashcard",
        "content": {
          "cards": [
            {
              "front": "Classifies emails as spam",
              "back": "Task-Specific Model – Built for a single job, like filtering spam emails."
            },
            {
              "front": "Writes poems and answers questions",
              "back": "Foundation Model – Can perform many tasks, from writing to answering questions."
            },
            {
              "front": "Detects fraudulent transactions",
              "back": "Task-Specific Model – Designed and trained for one specific use case."
            },
            {
              "front": "Used as a base for many apps",
              "back": "Foundation Model – Serves as a flexible starting point for various applications."
            }
          ]
        }
      },
      {
        "lessonId": "rise-y84hixu6oj712envsk9e8mnj",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 3,
        "type": "text",
        "content": {
          "body": "<h2>Foundation Model vs. Traditional Model—Side-by-Side</h2><p>Expand each tab to compare the main features and uses of traditional task-specific models and foundation models.</p>"
        }
      },
      {
        "lessonId": "rise-269e5956-c75d-47d3-91e1-c0cb9ae694b3",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 4,
        "type": "accordion",
        "content": {
          "sections": [
            {
              "title": "Traditional Model",
              "body": "Traditional models are built from scratch to solve a single, well-defined problem. They are trained on carefully selected data for that specific task, such as classifying images of cats and dogs or detecting credit card fraud.\n\n\n\nThese models are limited in scope and cannot easily be reused for other tasks. If you want to solve a new problem, you need to build and train a new model from the ground up."
            },
            {
              "title": "Foundation Model",
              "body": "Foundation models are trained on massive, diverse datasets to learn general patterns about language, images, or other data types. They are designed to be adaptable, so you can use them as a base for many different applications.\n\n\n\nInstead of starting from scratch, you can fine-tune or prompt a foundation model to handle new tasks, making them much more versatile and efficient for modern AI engineering."
            }
          ]
        }
      },
      {
        "lessonId": "rise-lw64g3d4zs1hxfc8dzkypy5v",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 5,
        "type": "text",
        "content": {
          "body": "<h2>The Two Main Stages of an AI Engineer's Work with Foundation Models</h2><p>The work of an AI engineer with foundation models involves two main stages. First, the engineer selects and adapts a foundation model using methods such as prompt engineering or fine-tuning. This step customizes the model’s behavior for specific needs.</p><p>Second, the adapted model is integrated into a real system so it can provide value in practical situations. Both stages are crucial for creating effective AI solutions.</p>\n\n<p>You don’t need to build a foundation model from scratch—but you do need to know how to adapt and deploy one.</p>\n\n<h3>Why Training Data Is the Foundation’s Foundation</h3><p>Every AI model, no matter how advanced, is only as good as the data it learns from. Training data is the raw material that shapes what a model can understand, predict, or create. Just as people learn from the information and experiences they’re exposed to, AI models learn from the digital data they’re trained on.</p><p>Understanding the types and quality of training data is crucial for any AI engineer, because it directly determines what your models can (and can’t) do.</p>\n\n<h3>Types of Training Data—What Models Learn From</h3><p>Expand each section to see the main types of data used to train AI models.</p>"
        }
      },
      {
        "lessonId": "rise-287f626b-2c80-4a8a-aab3-078c888dcb6e",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 6,
        "type": "accordion",
        "content": {
          "sections": [
            {
              "title": "Text Data",
              "body": "Text data includes books, articles, websites, and other written material. Language models like GPT are trained on billions of words to learn grammar, facts, and how people communicate.\n\n\n\nThis type of data enables models to answer questions, summarise documents, and generate creative writing."
            },
            {
              "title": "Image Data",
              "body": "Image data consists of photographs, scans, X-rays, and other visual information. Computer vision models use these images to learn how to recognise objects, classify diseases, or interpret scenes.\n\n\n\nHigh-quality, labelled images are essential for tasks like medical diagnosis or automated inspection."
            },
            {
              "title": "Audio Data",
              "body": "Audio data includes speech recordings, sounds, and music. Models trained on audio can transcribe speech, recognise speakers, or even compose music.\n\n\n\nSpeech recognition systems rely on large datasets of spoken language to function accurately."
            },
            {
              "title": "Structured Data",
              "body": "Structured data comes from tables, databases, and spreadsheets. It’s used for tasks like predicting sales, detecting fraud, or recommending products.\n\n\n\nModels trained on structured data can find patterns in numbers and categories, supporting business intelligence and analytics."
            }
          ]
        }
      },
      {
        "lessonId": "rise-azy17psov5barra0441yu977",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 7,
        "type": "text",
        "content": {
          "body": "<h2>Data in Action—Real-World Examples</h2><p>Explore each tab to see how different types of data power real AI systems.</p>"
        }
      },
      {
        "lessonId": "rise-b8314853-6df4-4b7e-b7af-37b0fe3cc0ac",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 8,
        "type": "accordion",
        "content": {
          "sections": [
            {
              "title": "X-ray Classification",
              "body": "Medical AI systems are trained on thousands of labelled X-ray images to detect diseases like pneumonia or cancer. Each image is paired with a diagnosis, allowing the model to learn what healthy and unhealthy scans look like.\n\n\n\nWith enough diverse and high-quality images, these models can help doctors spot conditions quickly and accurately."
            },
            {
              "title": "Sentiment Analysis",
              "body": "Social media sentiment analysis uses millions of posts labelled as positive, negative, or neutral. The model learns to detect the tone and emotion behind text, helping companies understand public opinion.\n\n\n\nThis approach is widely used in marketing, politics, and customer service to track trends and respond to feedback."
            },
            {
              "title": "Fraud Detection",
              "body": "Fraud detection models are trained on large datasets of financial transactions, some of which are labelled as fraudulent. By learning the patterns that distinguish normal from suspicious activity, the model can flag potential fraud in real time.\n\n\n\nContinuous updates with new data help these systems stay effective as fraud tactics evolve."
            },
            {
              "title": "Language Generation",
              "body": "Language models like GPT are trained on billions of text samples, from books to websites. This enables them to predict the next word in a sentence, answer questions, or generate creative content.\n\n\n\nThe sheer scale and variety of training data make these models capable of handling a wide range of language tasks."
            }
          ]
        }
      },
      {
        "lessonId": "rise-79256c3f-fc22-4b4b-bedb-c94b5e5e8772",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 9,
        "type": "accordion",
        "content": {
          "sections": [
            {
              "title": "Introduction",
              "body": "Training data is the starting point for every AI model. Here’s how raw data becomes a working intelligent system."
            },
            {
              "title": "Summary",
              "body": "Every step in this process affects the final model’s capabilities. High-quality data and careful preparation are key to building reliable AI systems."
            },
            {
              "title": "Collect Data",
              "body": "Gather large, relevant datasets from sources like websites, sensors, or databases. The more diverse and representative the data, the better the model can learn."
            },
            {
              "title": "Label & Clean Data",
              "body": "Organise and label the data so the model knows what to learn. Remove errors, duplicates, and irrelevant information to ensure accuracy."
            },
            {
              "title": "Train the Model",
              "body": "Feed the cleaned, labelled data into the model. The model uses this information to adjust its internal settings and learn patterns."
            },
            {
              "title": "Evaluate & Iterate",
              "body": "Test the model’s performance on new data. Refine the process by collecting more data or adjusting training methods until the model meets your goals."
            }
          ]
        }
      },
      {
        "lessonId": "rise-07272892-c78b-42b2-8ff8-063962737489",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 10,
        "type": "text",
        "content": {
          "body": "<p>Garbage in, garbage out: model quality depends on data quality.</p>\n\n<h2>Data Quality—What Can Go Wrong?</h2><p>Expand each section to learn about common data quality challenges in AI projects.</p>"
        }
      },
      {
        "lessonId": "rise-dfee8f44-9b27-48b5-ae9f-0370a94a8501",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 11,
        "type": "accordion",
        "content": {
          "sections": [
            {
              "title": "Bias",
              "body": "If the training data contains stereotypes or imbalances, the model will learn and amplify these biases. This can lead to unfair or discriminatory outcomes.\n\n\n\nCareful data selection and review are needed to minimise bias and ensure fairness."
            },
            {
              "title": "Noise & Errors",
              "body": "Messy, incorrect, or inconsistent data can confuse the model and reduce accuracy. Errors in labelling or formatting can lead to unpredictable results.\n\n\n\nCleaning and validating data is essential before training any model."
            },
            {
              "title": "Insufficient Diversity",
              "body": "If the data only covers a narrow range of cases, the model may not generalise well to new situations. This limits its usefulness in the real world.\n\n\n\nDiverse data helps models perform reliably across different users and scenarios."
            },
            {
              "title": "Outdated Data",
              "body": "Models trained on old or irrelevant data may fail to recognise new trends, products, or threats. This is especially risky in fast-changing fields.\n\n\n\nRegular updates and retraining help keep models accurate and relevant."
            }
          ]
        }
      },
      {
        "lessonId": "rise-zl9674nhag51rwypymci9hl9",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 12,
        "type": "text",
        "content": {
          "body": "<h2>Spot the Data Quality Problem</h2><p>Review each flashcard to identify the underlying data quality issue in each scenario. Flip to see the answer and explanation.</p>"
        }
      },
      {
        "lessonId": "rise-o3yy8swlhzq2zstuyhm2eu5e",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 13,
        "type": "flashcard",
        "content": {
          "cards": [
            {
              "front": "Always recommends same product",
              "back": "Insufficient Diversity – The model hasn’t seen enough variety in the training data."
            },
            {
              "front": "AI makes offensive comments",
              "back": "Bias – The training data included biased or inappropriate examples."
            },
            {
              "front": "Fails to recognise new diseases",
              "back": "Outdated Data – The model wasn’t trained on recent cases."
            },
            {
              "front": "Predictions are inconsistent",
              "back": "Noise & Errors – Messy or incorrect data is confusing the model."
            }
          ]
        }
      },
      {
        "lessonId": "rise-p6ik5qmzt4sqjo0mktnl7zz9",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 14,
        "type": "text",
        "content": {
          "body": "<h2>Adapting Foundation Models—Prompting and Fine-Tuning</h2><p>Foundation models are rarely used exactly as they come. To make them work for your specific needs, you’ll typically adapt them using two main techniques: prompt engineering and fine-tuning. Prompt engineering means giving the model clear, structured instructions to guide its output. Fine-tuning involves training the model further on your own labelled data, so it learns to specialise in your domain or task.</p><p>By mastering these adaptation methods, you can unlock the full potential of foundation models for any application you want to build.</p>\n\n<h3>How Foundation Models Are Used in Practice</h3><p>Explore each tab to see how engineers adapt foundation models for real-world applications.</p>"
        }
      },
      {
        "lessonId": "rise-f7af5dd3-8f10-4f6e-bc6e-fa0847266d25",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 15,
        "type": "accordion",
        "content": {
          "sections": [
            {
              "title": "Prompt Engineering",
              "body": "Prompt engineering involves crafting specific instructions or examples to guide the model’s responses. For example, you might tell a language model to \"summarise this article in three sentences\" or \"answer as a customer service agent.\"\n\n\n\nThis approach is quick and flexible, allowing you to adapt the model’s behaviour without retraining it."
            },
            {
              "title": "Fine-Tuning",
              "body": "Fine-tuning means training the foundation model on a smaller, specialised dataset relevant to your task. For instance, you might fine-tune a model on your company’s customer emails so it learns your unique terminology and style.\n\n\n\nThis method is more resource-intensive but can deliver highly customised results for specific needs."
            },
            {
              "title": "Combined Approaches",
              "body": "Many real-world systems use both prompt engineering and fine-tuning together. For example, a legal research assistant might be fine-tuned on legal documents and then prompted with specific case questions.\n\n\n\nCombining both methods gives you greater control and precision, especially for complex or sensitive applications."
            }
          ]
        }
      },
      {
        "lessonId": "rise-7edc2d4e-4ac0-4f42-b33b-43748948f8a1",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 16,
        "type": "quiz",
        "content": {
          "questions": [
            {
              "prompt": "You need an AI that can answer questions, summarise documents, and generate creative text. Which type of model should you use?",
              "options": [
                "Task-specific model",
                "Foundation model",
                "Rule-based system",
                "Simple classifier"
              ],
              "correctIndex": 1
            }
          ]
        }
      },
      {
        "lessonId": "rise-4aa24a6b-5319-4bd1-980d-5c656051c989",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 17,
        "type": "quiz",
        "content": {
          "questions": [
            {
              "prompt": "A hospital’s X-ray model misses a new disease that wasn’t present in the training data. What is the most likely data quality issue?",
              "options": [
                "Bias",
                "Outdated data",
                "Noise & errors",
                "Insufficient diversity"
              ],
              "correctIndex": 1
            }
          ]
        }
      },
      {
        "lessonId": "rise-d5ac6a7a-d2af-42e3-aa31-bbc50e38e9b1",
        "schemaVersion": 1,
        "source": "ai_generated",
        "wordingStyle": "shortened",
        "order": 18,
        "type": "quiz",
        "content": {
          "questions": [
            {
              "prompt": "You want an AI to use your company’s unique terminology and style. Should you use prompt engineering, fine-tuning, or both?",
              "options": [
                "Prompt engineering",
                "Fine-tuning",
                "Both",
                "Neither"
              ],
              "correctIndex": 2
            }
          ]
        }
      }
    ]
  }),
];
