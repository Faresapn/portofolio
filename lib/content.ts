// Every fact on the site lives here. Source: CV_Faresa_AIEngineer_2026.pdf
// plus the live Vercel builds listed under `projects`.

import type { CSSProperties } from 'react';

/** Clip-label colours, the way an edit suite tags clips. Defined in globals.css. */
export type Hue = 'teal' | 'blue' | 'violet' | 'rose' | 'amber' | 'green' | 'signal';

/** Inline style that hands a hue to a component as --c (light), --c-deep, --c-tint. */
export const hue = (h: Hue) =>
  ({
    ['--c' as string]: `var(--${h})`,
    ['--c-deep' as string]: `var(--${h}-deep)`,
    ['--c-tint' as string]: `var(--${h}-tint)`,
  }) as CSSProperties;

export const profile = {
  name: 'Faresa Prasetyo Nugroho',
  first: 'Faresa',
  role: 'AI & Frontend Engineer',
  city: 'Jakarta, Indonesia',
  email: 'faresaprasetyon@gmail.com',
  linkedin: 'https://www.linkedin.com/in/faresaprasetyo/',
  github: 'https://github.com/Faresapn',
  cv: '/cv/Faresa-Prasetyo-Nugroho-CV.pdf',
  paper: 'https://jurnal.uts.ac.id/JINTEKS/article/view/4919',
  current: 'AI & Frontend Engineer at Kerja Web3',
};

export const about = {
  // Rendered with the highlighted phrases coloured to match the cards below.
  intro: [
    { text: 'I’m a software engineer in Jakarta with more than three years of professional experience. I started in ' },
    { text: 'Android', hue: 'green' as Hue },
    { text: ', building Kotlin apps on clean architecture. Today I build ' },
    { text: 'AI agents and automation', hue: 'teal' as Hue },
    { text: ', and ' },
    { text: 'websites that move with your scroll', hue: 'amber' as Hue },
    { text: '.' },
  ],
  capabilities: [
    {
      hue: 'teal' as Hue,
      no: 'A',
      title: 'AI agents & automation',
      body: 'Autonomous agents that trade, run ads, post to social media and audit websites for security. n8n pipelines that turn one text prompt into finished images and videos.',
      tools: ['Python', 'LLM integration', 'n8n', 'Docker', 'Webhooks'],
    },
    {
      hue: 'amber' as Hue,
      no: 'B',
      title: 'Frontend & motion',
      body: 'Websites where scrolling drives the story: film that plays frame by frame, 3D products you can turn, smooth motion throughout. Built in Next.js with GSAP and Lenis.',
      tools: ['Next.js', 'GSAP', 'Lenis', 'Three.js'],
    },
    {
      hue: 'green' as Hue,
      no: 'C',
      title: 'Android engineering',
      body: 'Production apps in Kotlin and Java for attendance, point of sale, news, healthcare and AR shopping, on MVVM and Clean Architecture.',
      tools: ['Kotlin', 'MVVM', 'Coroutines', 'Retrofit'],
    },
  ],
  facts: [
    { value: '3+', label: 'years of professional software engineering', hue: 'blue' as Hue },
    { value: '4', label: 'AI agents deployed at Kerja Web3', hue: 'teal' as Hue },
    { value: '6', label: 'live websites in this portfolio', hue: 'amber' as Hue },
    { value: '1', label: 'research paper published in JINTEKS', hue: 'violet' as Hue },
  ],
};

export type Build = {
  label: string;
  slug: string; // preview file name in /public/previews
  url: string;
  embeddable: boolean; // false when the site sends X-Frame-Options
};

export type Project = {
  id: string;
  hue: Hue;
  title: string;
  kind: string;
  year: string;
  summary: string;
  detail: string;
  role: string;
  stack: string[];
  builds: Build[];
};

export const projects: Project[] = [
  {
    id: 'cliffline',
    hue: 'teal',
    title: 'Cliffline House',
    kind: 'Luxury villa website · PT. SIP',
    year: '2026',
    summary:
      'A guided tour of a cliffside villa in Uluwatu. As you scroll, the camera moves from the exterior into the living room, the dining room and out to the pool.',
    detail:
      'Each room is a full-screen film that plays frame by frame with your scroll. Phones get a lighter set of frames so it stays smooth.',
    role: 'Front-end & motion development',
    stack: ['Vite', 'GSAP ScrollTrigger', 'Lenis', 'Canvas'],
    builds: [{ label: 'Live', slug: 'cliffline', url: 'https://cliffline-house.vercel.app', embeddable: true }],
  },
  {
    id: 'sipfx',
    hue: 'blue',
    title: 'SIP FX',
    kind: 'Forex broker website',
    year: '2026',
    summary:
      '“Follow the Sun” tells one trading day in four chapters: Sydney, Tokyo, London and New York. Each chapter is a film that plays as you scroll, under a trading-terminal overlay with a live GMT clock.',
    detail:
      'All four chapters come from one config file, so a new session can be added without touching the animation code.',
    role: 'Front-end & motion development',
    stack: ['Vite', 'GSAP ScrollTrigger', 'Lenis', 'Three.js'],
    builds: [{ label: 'Live', slug: 'sipfx', url: 'https://sipfx.vercel.app', embeddable: false }],
  },
  {
    id: 'jagaterra',
    hue: 'amber',
    title: 'Jagaterra',
    kind: 'Premium beef shop website',
    year: '2026',
    summary:
      'Home page for a grass-fed beef butcher delivering across Jabodetabek. A calm looping farm scene hands over to a film that plays as you scroll, then a rotating 3D gallery of cuts.',
    detail:
      'The film plays straight from HD video instead of image frames, encoded so scrolling back and forth stays smooth.',
    role: 'Front-end & motion development',
    stack: ['Next.js', 'GSAP ScrollTrigger', 'Framer Motion', 'Tailwind CSS'],
    builds: [{ label: 'Live', slug: 'jagaterra', url: 'https://jagaterra.vercel.app', embeddable: true }],
  },
  {
    id: 'sapi',
    hue: 'rose',
    title: 'Pompa Si Sapi',
    kind: 'Playful campaign page · Jagaterra',
    year: '2026',
    summary:
      'A small game for the same shop: pump the cow five times and it bursts into beef cuts. Every cut is clickable and links straight to the product on Shopee.',
    detail: 'The page stays locked until the cow pops, so every visitor sees the joke before the products.',
    role: 'Front-end & interaction development',
    stack: ['Next.js', 'GSAP', 'Framer Motion', 'Tailwind CSS'],
    builds: [{ label: 'Live', slug: 'sapi', url: 'https://jagaterameledak.vercel.app', embeddable: true }],
  },
  {
    id: 'laufee',
    hue: 'violet',
    title: 'Laufee',
    kind: 'Shampoo product launch page',
    year: '2026',
    summary:
      'Landing page for an anti-dandruff shampoo. The bottle and its ingredients animate as you scroll, ending in a swipeable deck of product variants.',
    detail: 'Built in two versions — GSAP with Lenis, and Lenis alone. Switch between them below to compare.',
    role: 'Front-end & motion development',
    stack: ['Next.js', 'Lenis', 'GSAP', 'Framer Motion'],
    builds: [
      { label: 'GSAP + Lenis', slug: 'laufee', url: 'https://newshampoo.vercel.app', embeddable: true },
      { label: 'Lenis only', slug: 'laufee-lenis', url: 'https://lenisshampoo.vercel.app', embeddable: true },
    ],
  },
  {
    id: 'felaufee',
    hue: 'green',
    title: 'Felaufee 3D',
    kind: '3D product showcase',
    year: '2026',
    summary:
      'An interactive 3D shampoo bottle. Scroll to lift and unscrew the pump, spin the bottle a full 360°, then seal it again.',
    detail: 'A real 3D model rendered in the browser with Three.js, with every movement tied to your scroll position.',
    role: '3D & front-end development',
    stack: ['Three.js', 'GSAP ScrollTrigger', 'Vite'],
    builds: [{ label: 'Live', slug: 'felaufee', url: 'https://3dsampo.vercel.app', embeddable: true }],
  },
];

export const pipeline = {
  meta: 'Personal project · n8n · 2026',
  title: 'Content automation pipeline',
  description: 'Turns a text prompt into a finished promo video for affiliate marketing, with no manual steps.',
  infra: 'Self-hosted on Docker, behind a custom domain.',
  result: 'Manual content work cut to almost zero.',
  nodes: [
    { key: 'webhook', name: 'Trigger', hue: 'blue' as Hue, log: 'a webhook starts the run' },
    { key: 'prompt', name: 'Prompt', hue: 'violet' as Hue, log: 'text prompt plus product context' },
    { key: 'image', name: 'Image AI', hue: 'rose' as Hue, log: 'AI generates the product images' },
    { key: 'video', name: 'Video AI', hue: 'amber' as Hue, log: 'images become a short promo video' },
    { key: 'drive', name: 'Drive', hue: 'green' as Hue, log: 'every file saved to Google Drive' },
    { key: 'publish', name: 'Affiliate', hue: 'teal' as Hue, log: 'ready for affiliate campaigns' },
  ],
};

export const agents = {
  hermes: {
    meta: 'At Kerja Web3 · 2026',
    title: 'Hermes AI agents',
    intro: 'Four agents I engineered and deployed for the company.',
    cards: [
      { code: 'hermes/trade', title: 'Trading agent', hue: 'green' as Hue, body: 'Watches the market in real time and detects trading signals.' },
      { code: 'hermes/ads', title: 'Ads agent', hue: 'amber' as Hue, body: 'Runs and manages advertising campaigns automatically.' },
      { code: 'hermes/tweet', title: 'Social agent', hue: 'blue' as Hue, body: 'Writes and schedules posts for social media.' },
      { code: 'hermes/audit', title: 'Security audit agent', hue: 'rose' as Hue, body: 'Scans client web apps for vulnerabilities and writes the security report.' },
    ],
  },
  openclaw: {
    meta: 'Personal project · 2026',
    title: 'OpenClaw assistant',
    intro: 'My own AI agent for crypto markets and daily routines.',
    watch: ['BTC', 'ETH', 'SOL', 'BNB'],
    points: [
      'Price alerts across several coins and trading platforms.',
      'Spots possible entry and exit points from technical indicators.',
      'Reminders and alarms that keep my daily schedule on track.',
    ],
  },
};

export type Clip = {
  id: string;
  track: 'work' | 'study' | 'research' | 'lab';
  label: string; // short label on the timeline clip
  title: string;
  org: string;
  from: string; // YYYY-MM
  to: string | null; // null = present
  when: string;
  where: string;
  points: string[];
  link?: { href: string; label: string };
};

export const clips: Clip[] = [
  {
    id: 'ontrucks', track: 'work', label: 'On Trucks',
    title: 'Android Developer (Intern)', org: 'On Trucks',
    from: '2019-12', to: '2020-03', when: 'Dec 2019 — Mar 2020', where: 'Jakarta',
    points: [
      'Connected an inventory management app to its REST APIs with Retrofit, including error handling.',
      'Debugging, testing and performance work inside a Scrum team.',
    ],
  },
  {
    id: 'komerce', track: 'work', label: 'Komerce',
    title: 'Android Developer', org: 'Komerce',
    from: '2020-06', to: '2020-10', when: 'Jun — Oct 2020', where: 'Purbalingga',
    points: [
      'Built an employee attendance app in native Android with real-time updates.',
      'Shipped check-in and check-out, location-based validation and automatic data storage.',
    ],
  },
  {
    id: 'agree', track: 'work', label: 'Agree · Telkom',
    title: 'Android Developer', org: 'Agree (Telkom Indonesia)',
    from: '2020-11', to: '2021-04', when: 'Nov 2020 — Apr 2021', where: 'Jakarta',
    points: [
      'Built a management app for fishermen and farmers to track operations and finances (Kotlin, MVVM).',
      'Delivered five features end to end, all merged to production within the sprint.',
      'Worked RxJava and Kotlin Coroutines into Telkom’s existing codebase.',
    ],
  },
  {
    id: 'klikdokter', track: 'work', label: 'Klik Dokter',
    title: 'Android Developer', org: 'Klik Dokter',
    from: '2021-05', to: '2021-10', when: 'May — Oct 2021', where: 'Jakarta',
    points: [
      'Migrated six to seven modules of the health app from Java to Kotlin within sprint deadlines.',
      'Integrated REST APIs with Retrofit across the full development cycle in Scrum.',
    ],
  },
  {
    id: 'freelance', track: 'work', label: 'Freelance — Android & web',
    title: 'Android & Web Developer', org: 'Freelance',
    from: '2021-10', to: '2026-05', when: 'Oct 2021 — May 2026', where: 'Yogyakarta',
    points: [
      'Android apps in production for news, attendance tracking, point of sale and AR shopping.',
      'Company websites with custom animation for Resa Variasi, Ryga Adventure and Batik Tiara.',
      'MVVM, Retrofit, Kotlin Coroutines and LiveData across every Android codebase.',
    ],
  },
  {
    id: 'kerjaweb3', track: 'work', label: 'Kerja Web3',
    title: 'AI & Frontend Engineer', org: 'Kerja Web3',
    from: '2026-06', to: null, when: 'Jun 2026 — today', where: 'Tangerang, Banten · on-site',
    points: [
      'Engineered and deployed the Hermes AI agents for trading signals, ad campaigns and social posting.',
      'Built a security audit agent that scans client web apps and writes the assessment report.',
      'Develops client websites in Next.js with GSAP and Lenis for smooth, animated scrolling.',
      'Owns delivery from business requirement to deployment.',
    ],
  },
  {
    id: 'uty', track: 'study', label: 'Informatics — UTY',
    title: 'Bachelor of Informatics', org: 'Universitas Teknologi Yogyakarta',
    from: '2021-09', to: '2025-08', when: '2021 — 2025', where: 'Yogyakarta · GPA 3.54 / 4.00',
    points: ['Completed alongside freelance Android and web work.'],
  },
  {
    id: 'ar', track: 'research', label: 'E-Commerce AR',
    title: 'Lead Researcher & Developer', org: 'E-Commerce AR — published in JINTEKS',
    from: '2023-01', to: '2024-12', when: '2023 — 2024', where: 'Research project',
    points: [
      'A mobile shop where buyers place 3D products in their own room with augmented reality before checkout.',
      'Built with a waterfall process and evaluated with black-box and white-box testing.',
      'Findings published in JINTEKS (Jurnal Informatika Teknologi dan Sains).',
    ],
    link: { href: 'https://jurnal.uts.ac.id/JINTEKS/article/view/4919', label: 'Read the paper' },
  },
  {
    id: 'lab', track: 'lab', label: 'n8n · OpenClaw',
    title: 'AI agents & automation', org: 'Side projects',
    from: '2026-01', to: '2026-09', when: '2026', where: 'Self-hosted',
    points: [
      'An n8n pipeline that turns text prompts into AI images, then promo videos, saved to Drive for affiliate campaigns.',
      'OpenClaw, a personal agent for crypto price alerts, trading signals and daily routines.',
    ],
  },
];

export const tracks: { key: Clip['track']; code: string; name: string; hue: Hue }[] = [
  { key: 'work', code: 'V1', name: 'Work', hue: 'amber' },
  { key: 'study', code: 'A1', name: 'Education', hue: 'blue' },
  { key: 'research', code: 'A2', name: 'Research', hue: 'violet' },
  { key: 'lab', code: 'A3', name: 'Side projects', hue: 'teal' },
];

export const toolkit: { group: string; hue: Hue; items: string[] }[] = [
  { group: 'AI & ML', hue: 'teal', items: ['Python', 'Machine learning (scikit-learn)', 'Deep learning fundamentals', 'Prompt engineering', 'LLM integration'] },
  { group: 'AI agents', hue: 'blue', items: ['Hermes AI Agent', 'OpenClaw AI Agent', 'AI image generation', 'AI video generation'] },
  { group: 'Automation', hue: 'violet', items: ['n8n', 'API orchestration', 'Webhooks', 'Event-driven pipelines', 'Google Drive API', 'Docker'] },
  { group: 'Frontend & motion', hue: 'amber', items: ['Next.js', 'GSAP', 'Lenis', 'Three.js', 'Framer Motion', 'Tailwind CSS', 'Vite', 'HTML', 'CSS'] },
  { group: 'Android', hue: 'green', items: ['Android SDK', 'Jetpack', 'MVVM', 'ViewModel', 'LiveData', 'Kotlin Coroutines', 'RxJava', 'Retrofit', 'Dagger / Koin'] },
  { group: 'Languages', hue: 'rose', items: ['Kotlin', 'Java', 'Python', 'TypeScript', 'C#', 'HTML', 'CSS'] },
  { group: 'Tools', hue: 'teal', items: ['Git', 'GitHub', 'Figma', 'Postman', 'Android Studio', 'Docker'] },
  { group: 'Ways of working', hue: 'amber', items: ['Agile', 'Scrum', 'SDLC', 'Sprint planning', 'Code review'] },
];

export const certificates = [
  'Belajar Dasar AI',
  'Memulai Pemrograman dengan Python',
  'Belajar Machine Learning untuk Pemula',
  'Belajar Fundamental Deep Learning',
];

/** Chapters in page order. `hue` colours the chapter on the scrubber. */
export const chapters: { id: string; label: string; hue: Hue }[] = [
  { id: 'top', label: 'Intro', hue: 'signal' },
  { id: 'about', label: 'About', hue: 'green' },
  { id: 'work', label: 'Work', hue: 'amber' },
  { id: 'systems', label: 'AI Systems', hue: 'teal' },
  { id: 'path', label: 'Experience', hue: 'violet' },
  { id: 'toolkit', label: 'Skills', hue: 'blue' },
  { id: 'contact', label: 'Contact', hue: 'signal' },
];
