// Single source of truth — all content derived from Zakariya Sayed's CV.

export const site = {
  name: "Zakariya Sayed",
  firstName: "Zakariya",
  lastName: "Sayed",
  role: "Digital Marketing & Business Operations",
  tagline:
    "I bridge marketing, operations and strategy — turning brand ambition into systems that ship, sell and scale.",
  email: "imzakiii@icloud.com",
  phone: "+91 8828485298",
  phoneHref: "+918828485298",
  location: "Mumbai, India",
  linkedin: "https://www.linkedin.com/in/zakariya-sayed",
  resume: "/resume.pdf",
};

export const about = {
  years: "4+",
  intro:
    "A results-driven operator working at the intersection of digital marketing, business operations and e-commerce.",
  paragraphs: [
    "Over the past four years I've built brands from a blank page — standing up digital presence, running multi-platform campaigns, and owning the operational machinery behind them: procurement, vendor coordination, sales and customer support.",
    "I'm equally comfortable writing the content strategy and closing the purchase order. That range is deliberate — great marketing means nothing if the operation behind it can't deliver, and I've spent my career making sure both hold.",
    "A B.Com graduate and MBA candidate at DY Patil University, I pair a grounding in business and finance fundamentals with hands-on execution across the full commercial stack.",
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
    company: "Dot Syndicate",
    role: "Account Manager — Client Servicing & Content Strategist",
    period: "2022 — Present",
    location: "Mumbai, India",
    summary:
      "Owning client relationships and content strategy across a portfolio of brands, balancing creative ambition with measurable performance.",
    achievements: [
      "Created and managed content across multiple social media platforms, maintaining a consistent brand voice at scale.",
      "Monitored social media performance and improved audience engagement through continuous optimisation.",
      "Grew social media engagement by 40% through sharper audience targeting and content optimisation.",
      "Planned and executed influencer marketing campaigns end-to-end — identification, outreach, coordination, content approvals and performance tracking.",
      "Maintained brand innovation and kept pace with the latest social trends while balancing each client's preferences and requirements.",
    ],
  },
  {
    company: "Army Industries",
    role: "Business Operations & Digital Marketing Executive",
    period: "2021 — 2022",
    location: "Mumbai, India",
    summary:
      "Built the company's commercial engine from the ground up — from digital presence to end-to-end e-commerce operations.",
    achievements: [
      "Built the company's digital presence from scratch, including website, Google Business Profile and social media assets.",
      "Handled all purchase and sales operations, including vendor coordination, procurement and order fulfilment.",
      "Managed customer inquiries, order processing and issue resolution through the Pepperfry marketplace.",
      "Created the company's full product catalogue independently, including product photography and design from scratch.",
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
      "Brand Building",
      "Client Servicing",
      "Business Growth",
      "Marketplace Management",
    ],
  },
];

export type Project = {
  title: string;
  discipline: string;
  year: string;
  description: string;
  tags: string[];
};

export const projects: Project[] = [
  {
    title: "Brand Building",
    discipline: "Identity & Strategy",
    year: "Ongoing",
    description:
      "Standing up brand identity, voice and digital presence from a blank page — the foundation every campaign is built on.",
    tags: ["Positioning", "Voice", "Launch"],
  },
  {
    title: "Social Media Strategy",
    discipline: "Content & Community",
    year: "2022",
    description:
      "Full-funnel content systems across platforms, engineered for a 40% lift in audience engagement.",
    tags: ["Content", "Calendar", "Growth"],
  },
  {
    title: "Operations Optimisation",
    discipline: "Business Operations",
    year: "2021",
    description:
      "Streamlining procurement, vendor coordination and fulfilment into a single, repeatable operating rhythm.",
    tags: ["Procurement", "Fulfilment", "Process"],
  },
  {
    title: "Performance Marketing",
    discipline: "Paid & Search",
    year: "2022",
    description:
      "Google and Meta campaigns tuned around audience targeting, measurement and cost-efficient acquisition.",
    tags: ["Google Ads", "Meta", "ROAS"],
  },
  {
    title: "Marketplace Management",
    discipline: "E-commerce",
    year: "2021",
    description:
      "End-to-end marketplace operations on Pepperfry — catalogue, orders, inquiries and issue resolution.",
    tags: ["Pepperfry", "Catalogue", "Support"],
  },
  {
    title: "Website Launch",
    discipline: "Digital Presence",
    year: "2021",
    description:
      "Company website and Google Business Profile built from scratch to anchor a credible digital footprint.",
    tags: ["Web", "GBP", "SEO"],
  },
  {
    title: "Influencer Campaign",
    discipline: "Partnerships",
    year: "2022",
    description:
      "Influencer programmes run end-to-end — identification, outreach, approvals and performance tracking.",
    tags: ["Outreach", "Approvals", "Tracking"],
  },
  {
    title: "Product Photography",
    discipline: "Content & Design",
    year: "2021",
    description:
      "A full product catalogue shot and designed independently — commerce-ready visuals at scale.",
    tags: ["Photography", "Catalogue", "Design"],
  },
];

export type Education = {
  qualification: string;
  institution: string;
  year: string;
};

export const education: Education[] = [
  {
    qualification: "MBA",
    institution: "DY Patil University",
    year: "2023 — 2025",
  },
  {
    qualification: "B.Com",
    institution: "R.D. National College",
    year: "2021",
  },
  {
    qualification: "HSC — 12th",
    institution: "KV Pendarkar College, Mumbai University",
    year: "2018",
  },
  {
    qualification: "ICSE — 10th",
    institution: "Kohinoor International School",
    year: "2016",
  },
];

export const nav = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "Work", href: "#work" },
  { label: "Contact", href: "#contact" },
];
