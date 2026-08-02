// Case-study content for the Work detail pages.
//
// HOW TO EDIT (no code knowledge needed):
// • Each project below is keyed by its slug (see lib/data.ts).
// • `meta` fills the header (role / scope / tools / client).
// • `content` is an ordered list of blocks rendered top-to-bottom.
//   Add, remove or reorder blocks freely. Block types:
//     { type: "lead", text }                     large intro paragraph
//     { type: "heading", text }                  section heading
//     { type: "paragraph", text }                body text
//     { type: "list", items: ["a", "b"] }        bulleted list
//     { type: "quote", text, cite? }             pull quote
//     { type: "stats", items: [{ value, label }] } an infographic row
//     { type: "image", src?, alt?, caption?, ratio? }  image (drop files in
//         public/work/ and set src: "/work/your-file.jpg"; omit src for a
//         styled placeholder). ratio e.g. "16/9", "4/3", "1/1".
//     { type: "gallery", images: [{ src?, alt? }, ...] }  2-up image grid
//     { type: "embed", url, caption? }           paste an Instagram or
//         YouTube link — it renders inline automatically.

export type Block =
  | { type: "lead"; text: string }
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string; cite?: string }
  | { type: "stats"; items: { value: string; label: string }[] }
  | {
      type: "image";
      src?: string;
      alt?: string;
      caption?: string;
      ratio?: string;
    }
  | { type: "gallery"; images: { src?: string; alt?: string }[] }
  | { type: "embed"; url: string; caption?: string };

export type CaseStudy = {
  meta: {
    role: string;
    scope: string;
    tools: string;
    client?: string;
  };
  intro: string; // one-line under the title
  content: Block[];
};

// NOTE: The copy below is placeholder written from the CV — replace with the
// real details. The Instagram/YouTube links are examples; swap for Zakariya's.
export const caseStudies: Record<string, CaseStudy> = {
  "brand-building": {
    meta: {
      role: "Brand & Strategy Lead",
      scope: "Identity, voice, launch",
      tools: "Canva, Google Workspace",
      client: "Army Industries",
    },
    intro:
      "Building a brand from a blank page — identity, voice and a digital presence that could carry every campaign that followed.",
    content: [
      {
        type: "lead",
        text: "A brand is not a logo — it's the sum of every touchpoint. This project started with nothing but a product and a name, and ended with a coherent identity a customer could recognise across a website, a marketplace listing and a social feed.",
      },
      {
        type: "heading",
        text: "The starting point",
      },
      {
        type: "paragraph",
        text: "The company had a strong product but no consistent presence. Messaging changed from one channel to the next, visuals were inconsistent, and there was no clear sense of who the brand was speaking to. Before any campaign could work, the foundation had to be built.",
      },
      {
        type: "stats",
        items: [
          { value: "0→1", label: "Identity built from scratch" },
          { value: "3", label: "Channels unified" },
          { value: "1", label: "Consistent brand voice" },
        ],
      },
      {
        type: "heading",
        text: "What I did",
      },
      {
        type: "list",
        items: [
          "Defined the brand positioning, tone of voice and core messaging pillars.",
          "Created a lightweight visual system — colour, type and layout rules — usable by a one-person team.",
          "Rolled the identity across the website, Google Business Profile and social assets.",
          "Documented the system so it stays consistent as the brand grows.",
        ],
      },
      {
        type: "image",
        alt: "Brand identity system",
        caption: "Brand identity — colour, type and layout system.",
        ratio: "16/9",
      },
      {
        type: "quote",
        text: "Great marketing means nothing if the operation behind it can't deliver — so the brand had to be as practical as it was polished.",
      },
    ],
  },

  "social-media-strategy": {
    meta: {
      role: "Content & Community Strategist",
      scope: "Strategy, calendar, production",
      tools: "Canva, CapCut, VN, Meta Suite",
      client: "DotSyndicate",
    },
    intro:
      "A full-funnel content system across platforms — engineered for a measurable lift in engagement.",
    content: [
      {
        type: "lead",
        text: "Consistency beats intensity. Instead of chasing one viral post, the goal was a repeatable content system: the right formats, on the right cadence, aimed at the right audience — and measured every step.",
      },
      {
        type: "stats",
        items: [
          { value: "+40%", label: "Audience engagement" },
          { value: "Multi", label: "Platforms managed" },
          { value: "Weekly", label: "Content cadence" },
        ],
      },
      {
        type: "heading",
        text: "Approach",
      },
      {
        type: "paragraph",
        text: "I mapped the audience, defined content pillars, and built a calendar that balanced reach, engagement and conversion formats. Production stayed lean — short-form video, carousels and stories — so output was sustainable without a large team.",
      },
      {
        type: "image",
        alt: "Short-form content sample",
        caption: "Short-form content from the calendar.",
        ratio: "16/9",
      },
      {
        type: "heading",
        text: "A sample post",
      },
      {
        // Paste a real Instagram post/reel link here to embed it inline.
        type: "embed",
        url: "https://www.instagram.com/p/C1oQ2y3r4bV/",
        caption: "A sample post from the campaign.",
      },
      {
        type: "list",
        items: [
          "Audience targeting sharpened around the highest-intent segments.",
          "Content optimised continuously against performance data.",
          "Brand voice kept consistent while adapting to each client's needs.",
        ],
      },
    ],
  },

  "operations-optimisation": {
    meta: {
      role: "Business Operations",
      scope: "Procurement, fulfilment, process",
      tools: "Excel, vendor tools",
      client: "Army Industries",
    },
    intro:
      "Turning scattered procurement, vendor coordination and fulfilment into one repeatable operating rhythm.",
    content: [
      {
        type: "lead",
        text: "Marketing brings demand; operations decide whether you can meet it. This project focused on the unglamorous machinery — purchasing, vendors and fulfilment — and made it dependable.",
      },
      {
        type: "heading",
        text: "The problem",
      },
      {
        type: "paragraph",
        text: "Purchasing, vendor communication and order fulfilment lived in separate, informal processes. That worked at low volume but created delays and errors as orders grew.",
      },
      {
        type: "stats",
        items: [
          { value: "1", label: "Unified operating rhythm" },
          { value: "End-to-end", label: "Procurement → fulfilment" },
          { value: "Fewer", label: "Errors & delays" },
        ],
      },
      {
        type: "list",
        items: [
          "Standardised the purchase-to-fulfilment workflow into clear steps.",
          "Coordinated vendors on a single, predictable cadence.",
          "Tightened order fulfilment so nothing fell through the cracks.",
        ],
      },
      {
        type: "image",
        alt: "Operations workflow",
        caption: "The procurement-to-fulfilment operating flow.",
        ratio: "16/9",
      },
    ],
  },

  "performance-marketing": {
    meta: {
      role: "Performance Marketer",
      scope: "Paid search & social",
      tools: "Google Ads, Meta Ads, GA",
      client: "DotSyndicate",
    },
    intro:
      "Google and Meta campaigns tuned around audience targeting, measurement and cost-efficient acquisition.",
    content: [
      {
        type: "lead",
        text: "Paid media is a measurement game. The work was less about big budgets and more about disciplined targeting, clean tracking and constant iteration toward a lower cost per result.",
      },
      {
        type: "stats",
        items: [
          { value: "Google + Meta", label: "Channels" },
          { value: "↓ CPA", label: "Cost-efficient acquisition" },
          { value: "Data-led", label: "Optimisation" },
        ],
      },
      {
        type: "heading",
        text: "How it worked",
      },
      {
        type: "list",
        items: [
          "Structured campaigns around clear audience segments and intent.",
          "Set up measurement so every rupee could be traced to a result.",
          "Iterated creative and targeting against performance, not opinion.",
        ],
      },
      {
        type: "quote",
        text: "Targeting and measurement do the heavy lifting — the budget just amplifies whatever the data already proves.",
      },
    ],
  },

  "marketplace-management": {
    meta: {
      role: "E-commerce Manager",
      scope: "Catalogue, orders, support",
      tools: "Pepperfry Seller, Excel",
      client: "Army Industries",
    },
    intro:
      "End-to-end marketplace operations on Pepperfry — catalogue, orders, inquiries and issue resolution.",
    content: [
      {
        type: "lead",
        text: "A marketplace is a storefront, a support desk and a logistics operation at once. I owned all three for the company's Pepperfry presence.",
      },
      {
        type: "stats",
        items: [
          { value: "Full", label: "Catalogue ownership" },
          { value: "Orders", label: "Processed end-to-end" },
          { value: "Issues", label: "Resolved directly" },
        ],
      },
      {
        type: "list",
        items: [
          "Built and maintained the full product catalogue on the marketplace.",
          "Processed orders and coordinated fulfilment.",
          "Handled customer inquiries and resolved issues to protect ratings.",
        ],
      },
      {
        type: "image",
        alt: "Marketplace listings",
        caption: "Marketplace catalogue and listings.",
        ratio: "16/9",
      },
    ],
  },

  "website-launch": {
    meta: {
      role: "Digital Presence Lead",
      scope: "Website & Google Business Profile",
      tools: "Web builder, GBP, SEO basics",
      client: "Army Industries",
    },
    intro:
      "A company website and Google Business Profile built from scratch to anchor a credible digital footprint.",
    content: [
      {
        type: "lead",
        text: "Before a customer buys, they check if you're real. A clean website and a complete Google Business Profile turned an unknown into a credible business.",
      },
      {
        type: "list",
        items: [
          "Built the company website from scratch.",
          "Set up and optimised the Google Business Profile for local discovery.",
          "Laid basic SEO foundations so the brand could be found.",
        ],
      },
      {
        type: "stats",
        items: [
          { value: "0→1", label: "Website launched" },
          { value: "GBP", label: "Profile live & optimised" },
          { value: "Findable", label: "On search & maps" },
        ],
      },
      {
        type: "image",
        alt: "Website launch",
        caption: "Company website and Google Business Profile.",
        ratio: "16/9",
      },
    ],
  },

  "influencer-campaign": {
    meta: {
      role: "Partnerships & Campaigns",
      scope: "Identification → tracking",
      tools: "Meta, outreach, tracking sheets",
      client: "DotSyndicate",
    },
    intro:
      "Influencer programmes run end-to-end — identification, outreach, approvals and performance tracking.",
    content: [
      {
        type: "lead",
        text: "Influencer marketing lives or dies on the details between the brief and the post. I ran the whole chain — from finding the right creators to tracking what the collaboration actually delivered.",
      },
      {
        type: "heading",
        text: "End-to-end ownership",
      },
      {
        type: "list",
        items: [
          "Identified creators aligned to the brand and audience.",
          "Handled outreach, negotiation and coordination.",
          "Managed content approvals to keep quality and brand-safety high.",
          "Tracked campaign performance to prove impact.",
        ],
      },
      {
        // Paste a real Instagram reel/post link here to embed it inline.
        type: "embed",
        url: "https://www.instagram.com/reel/C2aB3cD4eF/",
        caption: "A collaboration reel.",
      },
      {
        type: "stats",
        items: [
          { value: "End-to-end", label: "Campaign ownership" },
          { value: "Brand-safe", label: "Approvals managed" },
          { value: "Tracked", label: "Performance measured" },
        ],
      },
    ],
  },

  "product-photography": {
    meta: {
      role: "Content & Design",
      scope: "Photography & catalogue design",
      tools: "Camera, Canva",
      client: "Army Industries",
    },
    intro:
      "A full product catalogue shot and designed independently — commerce-ready visuals at scale.",
    content: [
      {
        type: "lead",
        text: "Good product photography sells before a word is read. I shot and designed the company's entire catalogue independently — no studio, no agency.",
      },
      {
        type: "gallery",
        images: [
          { alt: "Product shot 1" },
          { alt: "Product shot 2" },
          { alt: "Product shot 3" },
          { alt: "Product shot 4" },
        ],
      },
      {
        type: "list",
        items: [
          "Produced the full product catalogue independently.",
          "Handled both photography and design end-to-end.",
          "Delivered commerce-ready visuals for web and marketplace.",
        ],
      },
    ],
  },
};

export const getCaseStudy = (slug: string): CaseStudy | undefined =>
  caseStudies[slug];
