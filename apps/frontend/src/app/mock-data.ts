// ─────────────────────────────────────────────────────────────────────────────
// ONET-based skill axes per domain
// Scores are 0-5 (mapped from ONET importance scale 1-5)
// ─────────────────────────────────────────────────────────────────────────────

export type SkillDomain = 'it' | 'data' | 'product' | 'design' | 'finance' | 'hr';

export interface SkillAxis { key: string; label: string; }

export const SKILL_AXES: Record<SkillDomain, SkillAxis[]> = {
  it: [
    { key: 'programming',      label: 'Programming' },
    { key: 'systems_analysis', label: 'Systems Analysis' },
    { key: 'databases',        label: 'Databases' },
    { key: 'security',         label: 'Security' },
    { key: 'cloud',            label: 'Cloud & Infra' },
    { key: 'version_control',  label: 'Version Control' },
    { key: 'testing',          label: 'Testing & QA' },
    { key: 'networking',       label: 'Networking' },
  ],
  data: [
    { key: 'statistics',       label: 'Statistics' },
    { key: 'machine_learning', label: 'Machine Learning' },
    { key: 'data_wrangling',   label: 'Data Wrangling' },
    { key: 'visualisation',    label: 'Visualisation' },
    { key: 'programming',      label: 'Programming' },
    { key: 'databases',        label: 'Databases' },
    { key: 'domain_knowledge', label: 'Domain Knowledge' },
  ],
  product: [
    { key: 'roadmapping',       label: 'Roadmapping' },
    { key: 'stakeholder_mgmt',  label: 'Stakeholder Mgmt' },
    { key: 'user_research',     label: 'User Research' },
    { key: 'prioritisation',    label: 'Prioritisation' },
    { key: 'analytics',         label: 'Analytics' },
    { key: 'agile',             label: 'Agile / Scrum' },
    { key: 'technical_writing', label: 'Tech Writing' },
  ],
  design: [
    { key: 'ux_research',    label: 'UX Research' },
    { key: 'interaction',    label: 'Interaction Design' },
    { key: 'visual_design',  label: 'Visual Design' },
    { key: 'prototyping',    label: 'Prototyping' },
    { key: 'accessibility',  label: 'Accessibility' },
    { key: 'design_systems', label: 'Design Systems' },
  ],
  finance: [
    { key: 'financial_modelling', label: 'Financial Modelling' },
    { key: 'accounting',          label: 'Accounting' },
    { key: 'risk_analysis',       label: 'Risk Analysis' },
    { key: 'excel',               label: 'Excel / Sheets' },
    { key: 'reporting',           label: 'Reporting' },
    { key: 'compliance',          label: 'Compliance' },
  ],
  hr: [
    { key: 'recruitment',      label: 'Recruitment' },
    { key: 'people_analytics', label: 'People Analytics' },
    { key: 'policy',           label: 'Policy & Compliance' },
    { key: 'learning_dev',     label: 'Learning & Dev' },
    { key: 'compensation',     label: 'Compensation' },
    { key: 'communication',    label: 'Communication' },
  ],
};

// Same domain = same radar axes → overlapping chart
export const ROLE_DOMAIN: Record<string, SkillDomain> = {
  'Frontend Developer':    'it',
  'Backend Developer':     'it',
  'Full-Stack Developer':  'it',
  'DevOps Engineer':       'it',
  'Cloud Engineer':        'it',
  'Security Engineer':     'it',
  'QA Engineer':           'it',
  'Network Engineer':      'it',
  'Mobile Developer':      'it',
  'Data Scientist':        'data',
  'Data Analyst':          'data',
  'ML Engineer':           'data',
  'Product Manager':       'product',
  'UX Designer':           'design',
  'UI Designer':           'design',
  'Finance Analyst':       'finance',
  'HR Specialist':         'hr',
};

export const ROLE_PROFILES: Record<string, Record<string, number>> = {
  'Frontend Developer':   { programming:4.2, systems_analysis:2.5, databases:2.0, security:1.8, cloud:2.2, version_control:4.0, testing:3.0, networking:1.5 },
  'Backend Developer':    { programming:4.5, systems_analysis:3.5, databases:4.0, security:3.0, cloud:3.2, version_control:4.0, testing:3.5, networking:2.5 },
  'Full-Stack Developer': { programming:4.5, systems_analysis:3.2, databases:3.5, security:2.5, cloud:3.0, version_control:4.2, testing:3.2, networking:2.0 },
  'DevOps Engineer':      { programming:3.5, systems_analysis:3.8, databases:2.8, security:3.5, cloud:4.8, version_control:4.5, testing:3.0, networking:4.0 },
  'Cloud Engineer':       { programming:3.2, systems_analysis:4.0, databases:3.0, security:4.0, cloud:5.0, version_control:4.0, testing:2.8, networking:4.5 },
  'Security Engineer':    { programming:3.5, systems_analysis:4.2, databases:2.5, security:5.0, cloud:3.5, version_control:3.5, testing:3.0, networking:4.5 },
  'QA Engineer':          { programming:3.0, systems_analysis:3.5, databases:2.8, security:2.0, cloud:2.2, version_control:3.8, testing:5.0, networking:1.8 },
  'Network Engineer':     { programming:2.0, systems_analysis:3.5, databases:2.0, security:4.2, cloud:3.8, version_control:2.5, testing:2.0, networking:5.0 },
  'Mobile Developer':     { programming:4.5, systems_analysis:3.0, databases:3.0, security:2.5, cloud:2.8, version_control:4.2, testing:3.5, networking:1.8 },
  'Data Scientist':       { statistics:4.8, machine_learning:4.5, data_wrangling:4.2, visualisation:3.5, programming:4.0, databases:3.5, domain_knowledge:3.8 },
  'Data Analyst':         { statistics:3.8, machine_learning:2.5, data_wrangling:4.5, visualisation:4.2, programming:3.0, databases:4.0, domain_knowledge:3.5 },
  'ML Engineer':          { statistics:4.5, machine_learning:5.0, data_wrangling:4.0, visualisation:3.0, programming:4.8, databases:3.8, domain_knowledge:3.5 },
  'Product Manager':      { roadmapping:4.8, stakeholder_mgmt:4.5, user_research:4.0, prioritisation:4.5, analytics:3.8, agile:4.2, technical_writing:4.0 },
  'UX Designer':          { ux_research:4.8, interaction:4.5, visual_design:4.0, prototyping:4.5, accessibility:4.0, design_systems:3.8 },
  'Finance Analyst':      { financial_modelling:4.8, accounting:4.5, risk_analysis:4.0, excel:4.8, reporting:4.2, compliance:3.5 },
  'HR Specialist':        { recruitment:4.5, people_analytics:3.8, policy:4.0, learning_dev:3.5, compensation:3.8, communication:4.5 },
};

// Same-domain groups → overlapping radar
export const SAME_DOMAIN_GROUPS: string[][] = [
  ['Frontend Developer','Backend Developer','Full-Stack Developer','DevOps Engineer','Cloud Engineer','Security Engineer','QA Engineer','Network Engineer','Mobile Developer'],
  ['Data Scientist','Data Analyst','ML Engineer'],
  ['Product Manager'],
  ['UX Designer','UI Designer'],
  ['Finance Analyst'],
  ['HR Specialist'],
];

export function isSameDomain(a: string, b: string): boolean {
  return SAME_DOMAIN_GROUPS.some(g => g.includes(a) && g.includes(b));
}

export function getDomain(role: string): SkillDomain {
  return ROLE_DOMAIN[role] ?? 'it';
}

export function getAxes(role: string): SkillAxis[] {
  return SKILL_AXES[getDomain(role)] ?? SKILL_AXES['it'];
}

export function getRoleProfile(role: string): Record<string, number> {
  return ROLE_PROFILES[role] ?? {};
}

export function computeMatchScore(
  empScores: Record<string, number>,
  reqScores: Record<string, number>,
): number {
  const keys = Object.keys(reqScores);
  if (!keys.length) return 0;
  let matched = 0;
  for (const k of keys) {
    if ((empScores[k] ?? 0) >= reqScores[k] * 0.7) matched++;
  }
  return Math.round((matched / keys.length) * 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type LayoffReason = 'AI Automation Risk' | 'Role Restructuring' | 'Performance' | 'Contract Ending' | 'Budget Cuts' | 'Redundancy';

export interface Employee {
  id: number;
  name: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  department: string;
  currentRole: string;
  yearsOfExperience: number;
  riskScore: number;
  riskReason: LayoffReason;
  skills: { name: string; proficiency: number }[];
  skillScores: Record<string, number>;
  peerReview: string;
  managerComment: string;
  performanceRating: number;
}

export interface Vacancy {
  id: number;
  title: string;
  department: string;
  company: string;
  requiredSkillScores: Record<string, number>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 1, name: 'Ahmad Fadzillah', age: 31, gender: 'Male',
    email: 'ahmad.fadzillah@acmecorp.my', phone: '+60 12-345 6789',
    department: 'Engineering', currentRole: 'Frontend Developer',
    yearsOfExperience: 6, riskScore: 82, riskReason: 'AI Automation Risk',
    skills: [
      { name: 'Angular', proficiency: 4.2 }, { name: 'TypeScript', proficiency: 4.0 },
      { name: 'HTML/CSS', proficiency: 4.5 }, { name: 'React', proficiency: 3.5 },
      { name: 'Git', proficiency: 4.0 },
    ],
    skillScores: { programming:4.2, systems_analysis:2.5, databases:2.0, security:1.8, cloud:2.2, version_control:4.0, testing:3.0, networking:1.5 },
    peerReview: 'Ahmad delivers pixel-perfect UIs reliably but is reluctant to take on backend or DevOps tasks.',
    managerComment: 'AI tools now automate much of the boilerplate Ahmad specialised in. Recommend reskilling towards Full-Stack or DevOps.',
    performanceRating: 3.4,
  },
  {
    id: 2, name: 'Priya Subramaniam', age: 28, gender: 'Female',
    email: 'priya.s@acmecorp.my', phone: '+60 11-222 3344',
    department: 'Engineering', currentRole: 'QA Engineer',
    yearsOfExperience: 4, riskScore: 78, riskReason: 'AI Automation Risk',
    skills: [
      { name: 'Selenium', proficiency: 4.0 }, { name: 'Jest', proficiency: 4.2 },
      { name: 'Python', proficiency: 3.5 }, { name: 'JIRA', proficiency: 4.0 },
      { name: 'SQL', proficiency: 3.0 },
    ],
    skillScores: { programming:3.0, systems_analysis:3.5, databases:2.8, security:2.0, cloud:2.2, version_control:3.8, testing:5.0, networking:1.8 },
    peerReview: 'Priya is thorough and detail-oriented. Showed interest in data analytics during the last hackathon.',
    managerComment: 'Automated pipelines are replacing manual QA. Priya\'s scripting background suits a data engineering or backend transition.',
    performanceRating: 3.8,
  },
  {
    id: 3, name: 'Tan Wei Kiat', age: 35, gender: 'Male',
    email: 'weikiat.tan@acmecorp.my', phone: '+60 16-788 9900',
    department: 'IT Operations', currentRole: 'Network Engineer',
    yearsOfExperience: 10, riskScore: 65, riskReason: 'Role Restructuring',
    skills: [
      { name: 'Cisco', proficiency: 4.5 }, { name: 'TCP/IP', proficiency: 4.8 },
      { name: 'Firewalls', proficiency: 4.2 }, { name: 'Linux', proficiency: 3.8 },
    ],
    skillScores: { programming:2.0, systems_analysis:3.5, databases:2.0, security:4.2, cloud:3.8, version_control:2.5, testing:2.0, networking:5.0 },
    peerReview: 'Wei Kiat is the go-to network expert. With infrastructure moving to cloud-managed networking, his on-prem specialisation is less critical.',
    managerComment: 'Restructuring reduces dedicated network headcount. Strong base for Cloud or Security Engineer transition.',
    performanceRating: 4.0,
  },
  {
    id: 4, name: 'Nurul Aina Binti Rashid', age: 26, gender: 'Female',
    email: 'nurul.aina@acmecorp.my', phone: '+60 17-654 3210',
    department: 'Engineering', currentRole: 'Mobile Developer',
    yearsOfExperience: 3, riskScore: 55, riskReason: 'Contract Ending',
    skills: [
      { name: 'Flutter', proficiency: 3.8 }, { name: 'Dart', proficiency: 3.5 },
      { name: 'Swift', proficiency: 3.0 }, { name: 'Firebase', proficiency: 3.2 }, { name: 'Git', proficiency: 3.8 },
    ],
    skillScores: { programming:4.5, systems_analysis:3.0, databases:3.0, security:2.5, cloud:2.8, version_control:4.2, testing:3.5, networking:1.8 },
    peerReview: 'Aina is a fast learner with excellent communication. Contract ending is administrative, not performance-related.',
    managerComment: 'Would like to retain via internal transfer. Strong fundamentals suit Full-Stack or Backend.',
    performanceRating: 4.2,
  },
  {
    id: 5, name: 'Kavesh Pillai', age: 33, gender: 'Male',
    email: 'kavesh.p@acmecorp.my', phone: '+60 12-999 1111',
    department: 'Data', currentRole: 'Data Analyst',
    yearsOfExperience: 7, riskScore: 71, riskReason: 'Budget Cuts',
    skills: [
      { name: 'SQL', proficiency: 4.5 }, { name: 'Power BI', proficiency: 4.2 },
      { name: 'Excel', proficiency: 4.8 }, { name: 'Python', proficiency: 3.5 }, { name: 'Tableau', proficiency: 3.8 },
    ],
    skillScores: { statistics:3.8, machine_learning:2.5, data_wrangling:4.5, visualisation:4.2, programming:3.0, databases:4.0, domain_knowledge:3.5 },
    peerReview: 'Kavesh produces clean dashboards and is meticulous about data quality. Strong domain knowledge in the finance vertical.',
    managerComment: 'Budget cuts reducing analyst headcount. Natural fit for Data Scientist or Product Manager given business acumen.',
    performanceRating: 4.1,
  },
];

export const MOCK_VACANCIES: Vacancy[] = [
  { id:1, title:'Full-Stack Developer', department:'Engineering', company:'Acme Corp',
    requiredSkillScores: { programming:4.5, systems_analysis:3.2, databases:3.5, security:2.5, cloud:3.0, version_control:4.2, testing:3.2, networking:2.0 } },
  { id:2, title:'Backend Developer', department:'Engineering', company:'Acme Corp',
    requiredSkillScores: { programming:4.5, systems_analysis:3.5, databases:4.0, security:3.0, cloud:3.2, version_control:4.0, testing:3.5, networking:2.5 } },
  { id:3, title:'DevOps Engineer', department:'Platform', company:'Acme Corp',
    requiredSkillScores: { programming:3.5, systems_analysis:3.8, databases:2.8, security:3.5, cloud:4.8, version_control:4.5, testing:3.0, networking:4.0 } },
  { id:4, title:'Cloud Engineer', department:'Platform', company:'Acme Corp',
    requiredSkillScores: { programming:3.2, systems_analysis:4.0, databases:3.0, security:4.0, cloud:5.0, version_control:4.0, testing:2.8, networking:4.5 } },
  { id:5, title:'Security Engineer', department:'IT Security', company:'Acme Corp',
    requiredSkillScores: { programming:3.5, systems_analysis:4.2, databases:2.5, security:5.0, cloud:3.5, version_control:3.5, testing:3.0, networking:4.5 } },
  { id:6, title:'Data Scientist', department:'Data', company:'Acme Corp',
    requiredSkillScores: { statistics:4.8, machine_learning:4.5, data_wrangling:4.2, visualisation:3.5, programming:4.0, databases:3.5, domain_knowledge:3.8 } },
  { id:7, title:'ML Engineer', department:'Data', company:'Acme Corp',
    requiredSkillScores: { statistics:4.5, machine_learning:5.0, data_wrangling:4.0, visualisation:3.0, programming:4.8, databases:3.8, domain_knowledge:3.5 } },
  { id:8, title:'QA Engineer', department:'Engineering', company:'Acme Corp',
    requiredSkillScores: { programming:3.0, systems_analysis:3.5, databases:2.8, security:2.0, cloud:2.2, version_control:3.8, testing:5.0, networking:1.8 } },
  { id:9, title:'Product Manager', department:'Product', company:'Acme Corp',
    requiredSkillScores: { roadmapping:4.8, stakeholder_mgmt:4.5, user_research:4.0, prioritisation:4.5, analytics:3.8, agile:4.2, technical_writing:4.0 } },
];
