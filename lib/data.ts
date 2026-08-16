// Single source of truth — all content derived from Zakariya Sayed's CV.

export const site = {
  name: "Zakariya Sayed",
  firstName: "Zakariya",
  lastName: "Sayed",
  role: "Digital Marketing & Business Operations",
  tagline:
    "I bridge marketing, operations and strategy — turning brand ambition into systems that ship, sell and scale.",
  email: "imzakiu@gmail.com",
  phone: "+91 8828485298",
  phoneHref: "+918828485298",
  location: "Mumbai, India",
  linkedin: "https://www.linkedin.com/in/zakariya-sayed-8b61941b2/",
  // Base path is empty except on GitHub Pages (served under /zzkii/).
  resume: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/resume.pdf`,
};

export const about = {
  years: "6+",
  intro:
    "A results-driven operator working at the intersection of digital marketing, business operations and e-commerce.",
  paragraphs: [
    "Over six years I've built brands from a blank page — standing up digital presence, running multi-platform campaigns, and owning the operational machinery behind them: procurement, vendor coordination, sales and customer support.",
    "Today I lead marketing as Marketing Manager at a manufacturing business, where strategy and the shop floor sit side by side. Before that, three years in client servicing and strategy at a marketing agency sharpened how I build brands and translate them into performance.",
    "I'm equally comfortable writing the content strategy and closing the purchase order. That range is deliberate — great marketing means nothing if the operation behind it can't deliver, and I've spent my career making sure both hold.",
    "A B.Com background and an MBA in Logistics, Materials & Supply Chain Management from DY Patil University give me a grounding in business, finance and operations that few marketers carry.",
  ],
  focus: [
    "Business Operations",
    "Digital Marketing",
    "Content Strategy",
    "Brand Building",
    "E-commerce",
    "Procurement",
    "Performance Marketing",
    "Client Servicing",
    "Business Growth",
  ],
};

export type Experience = {
  company: string;
  role: string;
  period: string;
  location: string;
  summary: string;
  achievements: string[];
};

export const experience: Experience[] = [
  {
    company: "Army Industries",
    role: "Marketing Manager",
    period: "Apr 2023 — Present",
    location: "Navi Mumbai, India",
    summary:
      "Leading marketing for an office-furniture manufacturer — owning the brand end-to-end while running the commercial engine behind it, from digital presence to e-commerce operations.",
    achievements: [
      "Own the company's marketing function — brand, digital presence and demand — as its sole Marketing Manager.",
      "Built the company's digital presence from scratch, including website, Google Business Profile and social media assets.",
      "Created the full product catalogue independently, including product photography and design from scratch.",
      "Manage customer inquiries, order processing and issue resolution through the Pepperfry marketplace.",
      "Handle purchase and sales operations, including vendor coordination, procurement and order fulfilment.",
    ],
  },
  {
    company: "DotSyndicate",
    role: "Client Servicing & Strategist",
    period: "Mar 2020 — Apr 2023",
    location: "Mumbai, India",
    summary:
      "Three years owning client relationships and content strategy across a portfolio of brands at a full-service marketing agency, balancing creative ambition with measurable performance.",
    achievements: [
      "Created and managed content across multiple social media platforms, maintaining a consistent brand voice at scale.",
      "Grew social media engagement by 40% through sharper audience targeting and content optimisation.",
      "Planned and executed influencer marketing campaigns end-to-end — identification, outreach, coordination, content approvals and performance tracking.",
      "Monitored social media performance and improved audience engagement through continuous optimisation.",
      "Maintained brand innovation and kept pace with the latest social trends while balancing each client's preferences and requirements.",
    ],
  },
];

export type SkillGroup = {
  category: string;
  index: string;
  skills: string[];
};

export const skills: SkillGroup[] = [
  {
    category: "Marketing",
    index: "01",
    skills: [
      "SEO",
      "SEM",
      "Google Ads",
      "Facebook Ads",
      "Email Marketing",
      "Performance Marketing",
    ],
  },
  {
    category: "Operations",
    index: "02",
    skills: [
      "Procurement",
      "Vendor Management",
      "E-commerce Management",
      "Customer Support",
      "Purchasing",
      "Sales Operations",
    ],
  },
  {
    category: "Content",
    index: "03",
    skills: ["Content Strategy", "Canva", "CapCut", "VN", "Product Photography"],
  },
  {
    category: "Analytics",
    index: "04",
    skills: ["Google Analytics", "Excel", "Campaign Reporting", "Audience Insights"],
  },
  {
    category: "Business",
    index: "05",
    skills: [
      "Account Planning",
      "Client Services",
      "Strategic Planning",
      "Brand Building",
      "Business Growth",
      "Marketplace Management",
    ],
  },
];

export type Project = {
  slug: string;
  title: string;
  discipline: string;
  year: string;
  description: string;
  tags: string[];
  deck?: string; // Canva share link (opens in Canva)
  deckEmbed?: string; // Canva /view?embed URL (renders inline)
};

export const projects: Project[] = [
  {
    slug: "brand-building",
    title: "Brand Building",
    discipline: "Identity & Strategy",
    year: "Ongoing",
    description:
      "Standing up brand identity, voice and digital presence from a blank page — the foundation every campaign is built on.",
    tags: ["Positioning", "Voice", "Launch"],
    deck: "https://canva.link/lk40dv9rmw5wckh",
    deckEmbed:
      "https://www.canva.com/design/DAHRFtMpclQ/FOD2oty0cAXwuW__Kq765A/view?embed",
  },
  {
    slug: "social-media-strategy",
    title: "Social Media Strategy",
    discipline: "Content & Community",
    year: "2022",
    description:
      "Full-funnel content systems across platforms, engineered for a 40% lift in audience engagement.",
    tags: ["Content", "Calendar", "Growth"],
    deck: "https://canva.link/2no1tibnimuqomh",
    deckEmbed:
      "https://www.canva.com/design/DAHRUlWI2ic/Csj2Io5eyWJ_ZUaOf_931Q/view?embed",
  },
  {
    slug: "operations-optimisation",
    title: "Operations Optimisation",
    discipline: "Business Operations",
    year: "2021",
    description:
      "Streamlining procurement, vendor coordination and fulfilment into a single, repeatable operating rhythm.",
    tags: ["Procurement", "Fulfilment", "Process"],
    deck: "https://canva.link/u5alt7z9r7xehew",
    deckEmbed:
      "https://www.canva.com/design/DAHRUwfkv1Q/-ZwC_RNyfn5J_N2yborAIw/view?embed",
  },
  {
    slug: "performance-marketing",
    title: "Performance Marketing",
    discipline: "Paid & Search",
    year: "2022",
    description:
      "Google and Meta campaigns tuned around audience targeting, measurement and cost-efficient acquisition.",
    tags: ["Google Ads", "Meta", "ROAS"],
    deck: "https://canva.link/n0js5nquwiddtwo",
    deckEmbed:
      "https://www.canva.com/design/DAHSBdEvwkU/6FMXtReSZdnpO2HC9KCupw/view?embed",
  },
  {
    slug: "marketplace-management",
    title: "Marketplace Management",
    discipline: "E-commerce",
    year: "2021",
    description:
      "End-to-end marketplace operations on Pepperfry — catalogue, orders, inquiries and issue resolution.",
    tags: ["Pepperfry", "Catalogue", "Support"],
    deck: "https://canva.link/qtgniqfteu4peih",
    deckEmbed:
      "https://www.canva.com/design/DAHRPUo0TxA/dPXEgar1BQERshVA5wNkuQ/view?embed",
  },
  {
    slug: "website-launch",
    title: "Website Launch",
    discipline: "Digital Presence",
    year: "2021",
    description:
      "Company website and Google Business Profile built from scratch to anchor a credible digital footprint.",
    tags: ["Web", "GBP", "SEO"],
  },
  {
    slug: "influencer-campaign",
    title: "Influencer Campaign",
    discipline: "Partnerships",
    year: "2022",
    description:
      "Influencer programmes run end-to-end — identification, outreach, approvals and performance tracking.",
    tags: ["Outreach", "Approvals", "Tracking"],
  },
  {
    slug: "product-photography",
    title: "Product Photography",
    discipline: "Content & Design",
    year: "2021",
    description:
      "A full product catalogue shot and designed independently — commerce-ready visuals at scale.",
    tags: ["Photography", "Catalogue", "Design"],
  },
];

export const getProject = (slug: string) =>
  projects.find((p) => p.slug === slug);

export type Education = {
  qualification: string;
  institution: string;
  year: string;
};

export const education: Education[] = [
  {
    qualification: "MBA — Logistics, Materials & Supply Chain Management",
    institution: "DY Patil University",
    year: "2023 — 2024",
  },
  {
    qualification: "B.Com — Business",
    institution: "K V Pendharkar College of Arts, Science & Commerce",
    year: "2019 — 2020",
  },
  {
    qualification: "HSC — Business / Commerce",
    institution: "R.D. & S.H. National College",
    year: "2016 — 2018",
  },
];

export const nav = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "Work", href: "#work" },
  { label: "Contact", href: "#contact" },
];
