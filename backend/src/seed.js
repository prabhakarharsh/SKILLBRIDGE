import { getDB, generateId, nowISO } from "./db.js";

const COLLEGE_DOMAIN = "@skillbridge.edu";

const USER_SEEDS = [
  { name: "Alex Morgan", branch: "Computer Science", year: 3, skills: ["React", "TypeScript", "Node.js", "CSS", "Tailwind"], availability: "now", bio: "Full-stack dev passionate about clean UI and performance. Love helping with React patterns!", rating: 4.8, credits: 12 },
  { name: "Sarah Kim", branch: "Design", year: 2, skills: ["Figma", "UI/UX", "HTML", "CSS", "Illustrator"], availability: "this-week", bio: "Product designer turning coffee into interfaces. Figma expert, design systems enthusiast.", rating: 4.6, credits: 8 },
  { name: "Raj Patel", branch: "Computer Science", year: 4, skills: ["Python", "Machine Learning", "Pandas", "DSA", "PyTorch"], availability: "busy", bio: "ML researcher & competitive programmer. Happy to help with algorithms or model training.", rating: 4.9, credits: 15 },
  { name: "Priya Sharma", branch: "ECE", year: 3, skills: ["React", "CSS", "Video Editing", "Premiere", "TypeScript"], availability: "now", bio: "Frontend dev + content creator. Can help with React, animations, or video editing for projects.", rating: 4.4, credits: 6 },
  { name: "Kevin Liu", branch: "Computer Science", year: 2, skills: ["Node.js", "Express", "MongoDB", "DSA", "JavaScript"], availability: "this-week", bio: "Backend focused, love building APIs. Also good with data structures & interview prep.", rating: 4.2, credits: 4 },
  { name: "Maya Rodriguez", branch: "Design", year: 4, skills: ["Figma", "Illustrator", "UI/UX", "HTML", "CSS"], availability: "now", bio: "Senior design student, design system contributor. Portfolio reviews & UI feedback welcome!", rating: 4.7, credits: 10 },
  { name: "Arjun Thakur", branch: "Computer Science", year: 3, skills: ["Python", "Django", "React", "Docker", "PostgreSQL"], availability: "this-month", bio: "Full-stack with Python/React. Can help with deployment, databases, or architecture.", rating: 4.5, credits: 7 },
  { name: "Nina Wang", branch: "Computer Science", year: 2, skills: ["CSS", "Tailwind", "React", "TypeScript", "Testing"], availability: "now", bio: "Frontend enthusiast, CSS nerd. Flexbox/Grid, animations, component libraries - ask away!", rating: 4.3, credits: 5 },
  { name: "Omar Hassan", branch: "ECE", year: 4, skills: ["Machine Learning", "PyTorch", "Python", "DSA", "TensorFlow"], availability: "busy", bio: "Deep learning focus. Research in CV/NLP. Limited availability but quality help when free.", rating: 4.8, credits: 14 },
  { name: "Lisa Chen", branch: "Design", year: 3, skills: ["Figma", "Video Editing", "After Effects", "Premiere", "UI/UX"], availability: "this-week", bio: "Motion designer & video editor. Great for promo videos, UI animations, prototype videos.", rating: 4.1, credits: 3 },
  { name: "Dev Patel", branch: "Computer Science", year: 4, skills: ["Node.js", "GraphQL", "PostgreSQL", "DSA", "TypeScript"], availability: "now", bio: "Backend architect, GraphQL expert. System design, database optimization, API design.", rating: 4.6, credits: 11 },
  { name: "Emma Kowalski", branch: "Computer Science", year: 2, skills: ["React", "CSS", "Testing", "Storybook", "TypeScript"], availability: "this-month", bio: "Component library builder. Testing strategies, Storybook, design tokens - frontend infra!", rating: 4.4, credits: 4 },
];

function getRandomBadges(rating) {
  const badges = [];
  if (rating >= 4.7) badges.push("Quality Work");
  if (rating >= 4.5) badges.push("Reliable");
  if (Math.random() > 0.5) badges.push("Fast Responder");
  if (Math.random() > 0.7) badges.push("Great Mentor");
  return badges.slice(0, 3);
}

export function seedData() {
  const db = getDB();
  if (db.users.length > 0) return;

  const users = USER_SEEDS.map((seed) => {
    const email = `${seed.name.toLowerCase().replace(" ", ".")}${COLLEGE_DOMAIN}`;
    return {
      id: generateId("user"),
      email,
      name: seed.name,
      branch: seed.branch,
      year: seed.year,
      skills: seed.skills,
      availability: seed.availability,
      bio: seed.bio,
      avatar: "",
      rating: seed.rating,
      credits: seed.credits,
      trustBadges: getRandomBadges(seed.rating),
      isVerified: true,
      createdAt: nowISO(),
    };
  });

  db.users = users;

  db.needs = [
    {
      id: generateId("need"),
      authorId: users[0].id,
      mode: "learn",
      title: "30 mins help with CSS Flexbox/Grid layouts",
      description: "Struggling with complex responsive layouts using Flexbox and Grid. Need someone to walk through best practices and debug my current approach.",
      requiredSkills: ["CSS", "Tailwind"],
      duration: 30,
      status: "open",
      createdAt: nowISO(),
    },
    {
      id: generateId("need"),
      authorId: users[1].id,
      mode: "learn",
      title: "React useEffect cleanup patterns",
      description: "Keep getting memory leaks with useEffect. Need help understanding cleanup functions, dependency arrays, and avoiding stale closures.",
      requiredSkills: ["React", "TypeScript"],
      duration: 20,
      status: "open",
      createdAt: nowISO(),
    },
    {
      id: generateId("need"),
      authorId: users[2].id,
      mode: "buddy",
      title: "Need UI + Frontend for portfolio site",
      description: "Building a personal portfolio to showcase ML projects. Have the backend/models ready, need a designer and frontend dev to create a polished, performant site.",
      requiredSkills: ["Figma", "React", "CSS", "TypeScript"],
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      rolesNeeded: [
        { id: generateId("role"), title: "UI/UX Designer", skills: ["Figma", "UI/UX"], description: "Design system, mockups, prototypes" },
        { id: generateId("role"), title: "Frontend Developer", skills: ["React", "TypeScript", "CSS"], description: "Implement designs, animations, deployment" },
      ],
      status: "open",
      createdAt: nowISO(),
    },
    {
      id: generateId("need"),
      authorId: users[4].id,
      mode: "buddy",
      title: "ML model deployment help - Docker + AWS",
      description: "Trained a PyTorch model for image classification. Need help containerizing with Docker and deploying to AWS (ECS/Lambda). Backend API also needed.",
      requiredSkills: ["Python", "Docker", "Machine Learning", "AWS"],
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      rolesNeeded: [
        { id: generateId("role"), title: "ML Engineer", skills: ["Python", "PyTorch", "Docker"], description: "Model optimization, containerization" },
        { id: generateId("role"), title: "Cloud/Backend Dev", skills: ["AWS", "Node.js", "Docker"], description: "API deployment, infrastructure" },
      ],
      status: "open",
      createdAt: nowISO(),
    },
  ];

  db.rewards = [
    { id: "canteen-credit", name: "Canteen Credit", description: "₹100 canteen voucher for snacks or meals", cost: 5, icon: "🍔", category: "food" },
    { id: "faculty-cert", name: "Faculty Certificate", description: "Official certificate signed by faculty advisor", cost: 10, icon: "📜", category: "academic" },
    { id: "workshop-priority", name: "Workshop Priority Access", description: "Early registration for campus workshops & tech talks", cost: 8, icon: "🎓", category: "academic" },
    { id: "fest-perks", name: "Tech Fest Perks", description: "VIP pass + merchandise for annual tech fest", cost: 15, icon: "🎪", category: "event" },
    { id: "mentor-badge", name: "Mentor Recognition", description: "Featured on campus mentor wall + LinkedIn shoutout", cost: 20, icon: "⭐", category: "priority" },
  ];

  console.log("✅ Mock data seeded:", db.users.length, "users,", db.needs.length, "needs");
}
