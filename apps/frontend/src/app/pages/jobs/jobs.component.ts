import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SiteLayoutComponent } from '../site-layout.component';
import { AuthService } from '../../services/auth.service';

interface Job {
  id: number;
  title: string;
  company: string;
  logo: string;
  location: string;
  salary: string;
  type: 'Full-time' | 'Contract' | 'Part-time';
  remote: 'Remote' | 'Hybrid' | 'On-site';
  posted: string;
  match: number;
  applicants: number;
  skills: string[];
  about: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
}

const JOBS: Job[] = [
  {
    id: 1,
    title: 'Senior Frontend Engineer',
    company: 'Grab',
    logo: '🟢',
    location: 'Kuala Lumpur, MY',
    salary: 'RM 8,000 – 14,000 / mo',
    type: 'Full-time',
    remote: 'Hybrid',
    posted: '2h ago',
    match: 92,
    applicants: 147,
    skills: ['React', 'TypeScript', 'GraphQL', 'Node.js'],
    about: 'Grab is Southeast Asia\'s leading super-app, serving millions of users daily across ride-hailing, food delivery, and financial services. As a Senior Frontend Engineer you will craft high-performance consumer-facing experiences used by over 35 million active users. You\'ll collaborate closely with product and design to ship features that matter at scale.',
    responsibilities: [
      'Architect and build scalable React micro-frontends across Grab\'s driver and consumer apps',
      'Establish engineering best-practices, code-review standards, and performance benchmarks',
      'Mentor junior engineers and conduct technical interviews to grow the KL engineering hub',
      'Partner with backend teams to design GraphQL APIs that are efficient and type-safe',
      'Drive adoption of testing culture with >80 % unit and integration test coverage'
    ],
    requirements: [
      '5+ years of production React/TypeScript experience with large-scale user bases',
      'Deep understanding of browser rendering, Core Web Vitals, and performance optimisation',
      'Experience with micro-frontend architecture and module federation',
      'Strong written and verbal communication skills in English',
      'Track record of shipping consumer products used by millions of users'
    ],
    benefits: [
      'Flexible hybrid work (3 days office)',
      'RM 5,000 annual learning budget',
      'Comprehensive medical & dental',
      'Grab credits & employee perks',
      'Global transfer opportunities'
    ]
  },
  {
    id: 2,
    title: 'Product Manager',
    company: 'AirAsia',
    logo: '🔴',
    location: 'Sepang, MY',
    salary: 'RM 9,000 – 15,000 / mo',
    type: 'Full-time',
    remote: 'Hybrid',
    posted: '5h ago',
    match: 78,
    applicants: 214,
    skills: ['Product Strategy', 'Agile', 'SQL', 'User Research'],
    about: 'AirAsia Digital is transforming travel and lifestyle for over 600 million people in ASEAN. We are looking for a Product Manager to lead our ancillary revenue product suite, working across flights, hotels, and experiences. You will own the product roadmap from ideation to launch in a fast-moving environment.',
    responsibilities: [
      'Define and own the product roadmap for ancillary travel products generating >RM 200M annual revenue',
      'Conduct quantitative and qualitative user research to validate hypotheses before building',
      'Write detailed PRDs and collaborate with engineering, design, and data teams',
      'Track OKRs, set KPIs, and communicate progress to C-suite stakeholders',
      'Run A/B experiments to continuously optimise conversion and revenue per booking'
    ],
    requirements: [
      '4+ years in product management, preferably in travel, e-commerce, or marketplace',
      'Strong data skills — comfortable with SQL, Mixpanel, and building dashboards',
      'Proven track record of shipping products from 0-to-1 and iterating to scale',
      'Experience managing cross-functional teams across multiple time zones',
      'MBA or equivalent business acumen is a plus'
    ],
    benefits: [
      'Unlimited AirAsia flight perks',
      'Hybrid work arrangement',
      'Annual performance bonus',
      'Health & wellness allowance',
      'Fast-track career progression'
    ]
  },
  {
    id: 3,
    title: 'Data Scientist',
    company: 'Maxis',
    logo: '🔵',
    location: 'Kuala Lumpur, MY',
    salary: 'RM 7,500 – 12,000 / mo',
    type: 'Full-time',
    remote: 'Hybrid',
    posted: '1d ago',
    match: 85,
    applicants: 98,
    skills: ['Python', 'Machine Learning', 'Spark', 'TensorFlow'],
    about: 'Maxis is Malaysia\'s leading telecommunications company, connecting over 11 million subscribers. Our data science team is building next-generation churn prediction, network optimisation, and personalisation models that directly impact revenue and customer experience. You will be embedded within our Digital Innovation Lab.',
    responsibilities: [
      'Build and productionise ML models for customer churn, lifetime value, and propensity scoring',
      'Process petabyte-scale telco datasets using PySpark on our AWS data platform',
      'Collaborate with marketing and network engineering to translate model outputs into business actions',
      'Maintain model performance monitoring dashboards and retrain pipelines',
      'Publish findings in internal knowledge bases and represent Maxis at industry events'
    ],
    requirements: [
      '3+ years hands-on machine learning experience in a production environment',
      'Proficiency in Python (pandas, scikit-learn, TensorFlow/PyTorch) and SQL',
      'Experience with big data tools — Spark, Hive, or equivalent',
      'Strong statistical foundation: regression, classification, time-series, and experiment design',
      'Degree in Computer Science, Statistics, Mathematics, or related field'
    ],
    benefits: [
      'Free Maxis postpaid line & data',
      'Flexible work-from-home days',
      'Annual conference budget',
      'Employee share purchase plan',
      'Comprehensive insurance coverage'
    ]
  },
  {
    id: 4,
    title: 'Backend Engineer',
    company: 'Shopee',
    logo: '🟠',
    location: 'Petaling Jaya, MY',
    salary: 'RM 7,000 – 13,000 / mo',
    type: 'Full-time',
    remote: 'On-site',
    posted: '2d ago',
    match: 71,
    applicants: 302,
    skills: ['Go', 'Microservices', 'Kafka', 'MySQL'],
    about: 'Shopee is the leading e-commerce platform in Southeast Asia and Taiwan, with over 2 billion orders annually. Our backend engineering team in Malaysia builds the order management and payment infrastructure that processes millions of transactions every day. You will work on systems with extreme reliability and performance requirements.',
    responsibilities: [
      'Design and implement high-throughput microservices in Go handling millions of requests per second',
      'Architect event-driven systems using Kafka for order lifecycle and inventory management',
      'Optimise MySQL and Redis usage to ensure sub-10ms p99 latencies',
      'Participate in on-call rotations and drive post-incident reviews',
      'Collaborate with SRE teams to define and meet SLAs for critical payment flows'
    ],
    requirements: [
      '3+ years backend engineering experience with Go, Java, or C++',
      'Deep knowledge of distributed systems, consensus algorithms, and CAP theorem trade-offs',
      'Hands-on experience with message queuing systems (Kafka, RabbitMQ)',
      'Strong understanding of database internals and query optimisation',
      'Experience with Kubernetes and container orchestration at scale'
    ],
    benefits: [
      'On-site gym & cafeteria',
      'Competitive base + equity',
      'Annual overseas team trip',
      'Medical & dental for family',
      'Structured career ladder'
    ]
  },
  {
    id: 5,
    title: 'UX Designer',
    company: 'CIMB',
    logo: '🏦',
    location: 'Kuala Lumpur, MY',
    salary: 'RM 6,000 – 10,000 / mo',
    type: 'Full-time',
    remote: 'Hybrid',
    posted: '3d ago',
    match: 67,
    applicants: 76,
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    about: 'CIMB Group is one of ASEAN\'s leading universal banks with presence in 18 countries. Our Digital Experience team is reimagining retail banking for the next generation of mobile-first customers. As a UX Designer you will shape the experience for CIMB Clicks and our new neobank product launching in 2025.',
    responsibilities: [
      'Lead end-to-end UX design for digital banking features from discovery through delivery',
      'Conduct moderated user research sessions with customers across Malaysia and Indonesia',
      'Maintain and extend the CIMB design system in Figma for consistency at scale',
      'Collaborate with compliance and legal teams to balance regulatory constraints with great UX',
      'Facilitate design sprints and present concepts to senior leadership'
    ],
    requirements: [
      '3+ years UX/product design experience, ideally in fintech or banking',
      'Expert Figma skills including component libraries, auto-layout, and interactive prototyping',
      'Portfolio demonstrating mobile-first design thinking and user research rigour',
      'Understanding of WCAG 2.1 accessibility standards',
      'Ability to communicate design rationale clearly to non-design stakeholders'
    ],
    benefits: [
      'Hybrid work 3 days/week',
      'CIMB preferential banking rates',
      'Annual design tool budget',
      'Mentorship programme',
      'Comprehensive health coverage'
    ]
  },
  {
    id: 6,
    title: 'HR Analytics Lead',
    company: 'TalentPivot',
    logo: '◈',
    location: 'Kuala Lumpur, MY',
    salary: 'RM 10,000 – 16,000 / mo',
    type: 'Full-time',
    remote: 'Remote',
    posted: '1h ago',
    match: 99,
    applicants: 43,
    skills: ['People Analytics', 'Python', 'Power BI', 'HR Strategy'],
    about: 'TalentPivot is building the operating system for the modern workforce — an AI-powered platform that helps companies reskill, redeploy, and retain their people before disruption strikes. As HR Analytics Lead you will sit at the intersection of people strategy and data science, directly influencing how hundreds of enterprise clients manage their talent. This is a founding team role with equity.',
    responsibilities: [
      'Build and own the people analytics frameworks that power TalentPivot\'s AI matching engine',
      'Partner with enterprise HR clients to translate workforce data into actionable insights',
      'Develop predictive models for attrition, skills gaps, and internal mobility',
      'Create executive-ready dashboards and data stories using Power BI and custom visualisations',
      'Define data collection standards and work with engineering to instrument the platform'
    ],
    requirements: [
      '5+ years in HR analytics, people science, or workforce intelligence',
      'Strong Python skills (pandas, statsmodels) and experience with HR data systems (Workday, SAP)',
      'Track record of influencing senior HR or C-suite decisions with data',
      'Deep understanding of Malaysian and ASEAN labour market dynamics',
      'Excellent stakeholder management and data storytelling ability'
    ],
    benefits: [
      'Fully remote — work anywhere in MY',
      'Meaningful equity package',
      'RM 8,000 annual L&D budget',
      'Private medical + mental health',
      'Founding team culture & impact'
    ]
  },
  {
    id: 7,
    title: 'DevOps Engineer',
    company: 'Petronas Digital',
    logo: '⚡',
    location: 'Kuala Lumpur, MY',
    salary: 'RM 7,000 – 11,500 / mo',
    type: 'Contract',
    remote: 'Hybrid',
    posted: '4d ago',
    match: 74,
    applicants: 55,
    skills: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD'],
    about: 'Petronas Digital is the technology arm of PETRONAS, driving digital transformation across the energy sector. We are modernising critical upstream and downstream systems on cloud-native infrastructure. As DevOps Engineer you will build the platform that powers intelligent oilfield operations and corporate digital services for one of Asia\'s largest companies.',
    responsibilities: [
      'Design and manage multi-region Kubernetes clusters on AWS EKS for mission-critical workloads',
      'Automate infrastructure provisioning using Terraform and maintain IaC best practices',
      'Build and optimise CI/CD pipelines in GitHub Actions and ArgoCD',
      'Implement security hardening, secrets management, and compliance controls (ISO 27001)',
      'Monitor platform health with Prometheus, Grafana, and PagerDuty with defined runbooks'
    ],
    requirements: [
      '4+ years in DevOps, SRE, or platform engineering roles',
      'CKA or equivalent Kubernetes certification preferred',
      'Proficiency with Terraform, Helm, and GitOps workflows',
      'AWS Solutions Architect Associate or higher certification',
      'Experience with security and compliance in regulated industries'
    ],
    benefits: [
      '12-month renewable contract',
      'RM 500/mo transport allowance',
      'Medical coverage via panel clinic',
      'Flexible hybrid arrangement',
      'PETRONAS staff canteen access'
    ]
  },
  {
    id: 8,
    title: 'Marketing Manager',
    company: 'Lazada',
    logo: '🛒',
    location: 'Kuala Lumpur, MY',
    salary: 'RM 8,500 – 13,500 / mo',
    type: 'Full-time',
    remote: 'Hybrid',
    posted: '6h ago',
    match: 65,
    applicants: 189,
    skills: ['Performance Marketing', 'Meta Ads', 'SEO/SEM', 'Analytics'],
    about: 'Lazada is one of Southeast Asia\'s largest e-commerce platforms, backed by Alibaba Group. Our Malaysian marketing team drives seller acquisition and buyer growth campaigns across all channels. As Marketing Manager you will lead performance and brand campaigns for mega sale events like 11.11 and 12.12 that generate billions in GMV.',
    responsibilities: [
      'Plan and execute 360° marketing campaigns across Meta, Google, TikTok, and programmatic channels',
      'Manage a RM 5M+ annual media budget with rigorous ROAS tracking and optimisation',
      'Lead a team of 4 digital marketing specialists and coordinate with regional Alibaba teams',
      'Develop seller marketing playbooks and co-marketing programs with key brand partners',
      'Report campaign performance to the Country GM and regional leadership weekly'
    ],
    requirements: [
      '5+ years digital marketing experience with at least 2 years in e-commerce or marketplace',
      'Hands-on expertise with Meta Ads Manager, Google Ads, and programmatic DSPs',
      'Strong analytical mindset — comfortable building attribution models in Excel and Looker',
      'Experience managing high-budget campaigns during high-traffic sale events',
      'Excellent stakeholder management and agency partnership skills'
    ],
    benefits: [
      'Lazada seller vouchers & perks',
      'Performance-based bonus',
      'Hybrid work flexibility',
      'Annual overseas offsite',
      'Medical & life insurance'
    ]
  }
];

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SiteLayoutComponent],
  template: `
    <app-site-layout>
      <div class="jobs-page">

        <!-- Search Hero -->
        <section class="jobs-hero">
          <div class="jobs-hero-inner">
            <p class="jobs-eyebrow">Career OS · Powered by TalentPivot AI</p>
            <h1 class="jobs-h1">Find your next <em class="jobs-h1-accent">career move</em></h1>
            <p class="jobs-sub">AI-powered matching · 10,000+ verified roles · Real-time market insights</p>
            <div class="search-bar">
              <div class="search-field">
                <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>
                  <path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <input [(ngModel)]="searchRole" placeholder="Job title, skill, or company" (keyup.enter)="doSearch()" />
              </div>
              <div class="search-divider"></div>
              <div class="search-field">
                <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="9" r="2.5" stroke="currentColor" stroke-width="2"/>
                </svg>
                <input [(ngModel)]="searchLocation" placeholder="City or 'Remote'" (keyup.enter)="doSearch()" />
              </div>
              <button class="search-submit" (click)="doSearch()">Search Jobs</button>
            </div>
            <div class="popular-row">
              <span class="popular-label">Popular:</span>
              <button *ngFor="let t of popularSearches" class="popular-tag" (click)="setSearch(t)">{{ t }}</button>
            </div>
          </div>
        </section>

        <!-- Filter bar -->
        <div class="jobs-filter-bar">
          <div class="filter-chips">
            <button *ngFor="let t of types" class="filter-chip" [class.active]="typeFilter() === t" (click)="typeFilter.set(t)">{{ t }}</button>
          </div>
          <div class="filter-right">
            <select class="sort-sel" [(ngModel)]="sortByValue">
              <option value="match">Best Match</option>
              <option value="latest">Latest</option>
            </select>
            <span class="result-count">{{ filteredJobs().length }} jobs</span>
          </div>
        </div>

        <!-- Two-column main area -->
        <div class="jobs-layout">

          <!-- Left: scrollable job list -->
          <div class="jobs-list-col">
            <div *ngFor="let job of filteredJobs()"
                 class="job-card"
                 [class.selected]="selectedJob()?.id === job.id"
                 (click)="selectJob(job)">
              <div class="jc-top-row">
                <span class="company-logo">{{ job.logo }}</span>
                <span class="match-chip"
                      [style.color]="matchColor(job.match)"
                      [style.border-color]="matchColor(job.match) + '44'">
                  {{ job.match }}% match
                </span>
              </div>
              <h3 class="jc-title">{{ job.title }}</h3>
              <p class="jc-company">{{ job.company }}</p>
              <div class="jc-meta-row">
                <span class="jc-meta">📍 {{ job.location }}</span>
                <span class="jc-meta type-badge">{{ job.type }}</span>
                <span class="jc-meta remote-badge" *ngIf="job.remote !== 'On-site'">{{ job.remote }}</span>
              </div>
              <div class="jc-salary">{{ job.salary }}</div>
              <div class="jc-skills">
                <span class="jc-skill" *ngFor="let s of job.skills.slice(0, 3)">{{ s }}</span>
              </div>
              <div class="jc-footer-row">
                <span class="jc-posted">{{ job.posted }}</span>
                <span class="jc-apps">{{ job.applicants }} applicants</span>
              </div>
            </div>
            <div class="jobs-empty" *ngIf="filteredJobs().length === 0">
              No jobs match your search. Try different keywords.
            </div>
          </div>

          <!-- Right: sticky job detail -->
          <div class="job-detail-col">
            <div class="job-detail" *ngIf="selectedJob()">
              <div class="jd-header">
                <div class="jd-header-top">
                  <span class="jd-logo">{{ selectedJob()!.logo }}</span>
                  <div class="jd-match-block" [style.color]="matchColor(selectedJob()!.match)">
                    <span class="jd-match-pct">{{ selectedJob()!.match }}%</span>
                    <span class="jd-match-lbl">AI Match</span>
                  </div>
                </div>
                <h2 class="jd-title">{{ selectedJob()!.title }}</h2>
                <p class="jd-company">{{ selectedJob()!.company }}</p>
                <div class="jd-meta-pills">
                  <span>📍 {{ selectedJob()!.location }}</span>
                  <span>{{ selectedJob()!.type }}</span>
                  <span>{{ selectedJob()!.remote }}</span>
                  <span class="jd-salary">{{ selectedJob()!.salary }}</span>
                </div>
                <div class="jd-actions" *ngIf="!applied().has(selectedJob()!.id)">
                  <button class="jd-apply-btn" (click)="applyToJob(selectedJob()!)">Apply Now</button>
                  <button class="jd-save-btn"
                          [class.saved]="saved().has(selectedJob()!.id)"
                          (click)="toggleSave(selectedJob()!)">
                    {{ saved().has(selectedJob()!.id) ? '★ Saved' : '☆ Save' }}
                  </button>
                </div>
                <div class="jd-applied-success" *ngIf="applied().has(selectedJob()!.id)">
                  <span class="success-check">✓</span> Application submitted — we'll notify you of any updates.
                </div>
              </div>

              <div class="jd-skills-row">
                <span class="jd-skill-chip" *ngFor="let s of selectedJob()!.skills">{{ s }}</span>
              </div>

              <div class="jd-section">
                <h4 class="jd-sec-title">About the Role</h4>
                <p class="jd-sec-body">{{ selectedJob()!.about }}</p>
              </div>
              <div class="jd-section">
                <h4 class="jd-sec-title">What you'll do</h4>
                <ul class="jd-list">
                  <li *ngFor="let r of selectedJob()!.responsibilities">{{ r }}</li>
                </ul>
              </div>
              <div class="jd-section">
                <h4 class="jd-sec-title">What we're looking for</h4>
                <ul class="jd-list">
                  <li *ngFor="let r of selectedJob()!.requirements">{{ r }}</li>
                </ul>
              </div>
              <div class="jd-section">
                <h4 class="jd-sec-title">Benefits</h4>
                <div class="jd-benefits-grid">
                  <span class="jd-benefit" *ngFor="let b of selectedJob()!.benefits">✓ {{ b }}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </app-site-layout>
  `,
  styles: [`
    /* ── Page wrapper ── */
    .jobs-page {
      min-height: 100vh;
      color: #f1f5f9;
    }

    /* ── Search Hero ── */
    .jobs-hero {
      padding: 140px 24px 60px;
      text-align: center;
      background: linear-gradient(180deg, rgba(0,242,255,0.04) 0%, transparent 100%);
    }

    .jobs-hero-inner {
      max-width: 780px;
      margin: 0 auto;
    }

    .jobs-eyebrow {
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #00d4e8;
      margin-bottom: 16px;
    }

    .jobs-h1 {
      font-size: 2.6rem;
      font-weight: 800;
      line-height: 1.15;
      color: #f1f5f9;
      margin: 0 0 16px;
      font-style: normal;
    }

    .jobs-h1-accent {
      font-style: normal;
      background: linear-gradient(90deg, #00f2ff, #7000ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .jobs-sub {
      font-size: 1rem;
      color: #94a3b8;
      margin-bottom: 36px;
      line-height: 1.6;
    }

    /* ── Search bar ── */
    .search-bar {
      display: flex;
      align-items: center;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 14px;
      padding: 6px;
      gap: 0;
      max-width: 700px;
      margin: 0 auto 24px;
      box-shadow: 0 4px 32px rgba(0,0,0,0.3);
      backdrop-filter: blur(8px);
    }

    .search-field {
      display: flex;
      align-items: center;
      flex: 1;
      padding: 6px 12px;
      gap: 10px;
    }

    .search-icon {
      color: #64748b;
      flex-shrink: 0;
    }

    .search-field input {
      background: transparent;
      border: none;
      outline: none;
      color: #f1f5f9;
      font-size: 0.92rem;
      width: 100%;
    }

    .search-field input::placeholder {
      color: #475569;
    }

    .search-divider {
      width: 1px;
      height: 32px;
      background: rgba(255,255,255,0.1);
      flex-shrink: 0;
    }

    .search-submit {
      background: linear-gradient(135deg, #0077bb, #00f2ff);
      color: white;
      border: none;
      border-radius: 10px;
      padding: 12px 28px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: opacity 0.2s;
      flex-shrink: 0;
    }

    .search-submit:hover {
      opacity: 0.88;
    }

    /* ── Popular searches ── */
    .popular-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .popular-label {
      font-size: 0.8rem;
      color: #64748b;
    }

    .popular-tag {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 5px 14px;
      font-size: 0.8rem;
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.2s;
    }

    .popular-tag:hover {
      background: rgba(0,242,255,0.08);
      border-color: rgba(0,242,255,0.3);
      color: #00d4e8;
    }

    /* ── Filter bar ── */
    .jobs-filter-bar {
      position: sticky;
      top: 74px;
      z-index: 100;
      background: rgba(3,7,18,0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255,255,255,0.06);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 24px;
      gap: 16px;
    }

    .filter-chips {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .filter-chip {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      padding: 6px 16px;
      font-size: 0.82rem;
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-chip:hover {
      border-color: rgba(0,242,255,0.3);
      color: #00d4e8;
    }

    .filter-chip.active {
      background: rgba(0,242,255,0.1);
      border-color: rgba(0,242,255,0.4);
      color: #00d4e8;
      font-weight: 600;
    }

    .filter-right {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-shrink: 0;
    }

    .sort-sel {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      color: #94a3b8;
      font-size: 0.82rem;
      padding: 6px 12px;
      outline: none;
      cursor: pointer;
    }

    .result-count {
      font-size: 0.82rem;
      color: #64748b;
      white-space: nowrap;
    }

    /* ── Two-column layout ── */
    .jobs-layout {
      display: grid;
      grid-template-columns: 420px 1fr;
      gap: 0;
      max-width: 1400px;
      margin: 0 auto;
      min-height: calc(100vh - 220px);
    }

    /* ── Left column: job list ── */
    .jobs-list-col {
      overflow-y: auto;
      border-right: 1px solid rgba(255,255,255,0.06);
      padding: 16px;
      height: calc(100vh - 180px);
      position: sticky;
      top: 130px;
    }

    .job-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      padding: 18px;
      cursor: pointer;
      margin-bottom: 10px;
      transition: all 0.2s;
    }

    .job-card:hover:not(.selected) {
      border-color: rgba(255,255,255,0.15);
      background: rgba(255,255,255,0.05);
    }

    .job-card.selected {
      border-color: rgba(0,242,255,0.4);
      background: rgba(0,242,255,0.05);
      box-shadow: 0 0 0 1px rgba(0,242,255,0.2);
    }

    .jc-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }

    .company-logo {
      font-size: 1.4rem;
      line-height: 1;
    }

    .match-chip {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 20px;
      border: 1px solid;
      background: transparent;
      letter-spacing: 0.02em;
    }

    .jc-title {
      font-size: 1rem;
      font-weight: 700;
      color: #f1f5f9;
      margin: 8px 0 4px;
    }

    .jc-company {
      font-size: 0.84rem;
      color: #64748b;
      margin: 0 0 10px;
    }

    .jc-meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 8px;
    }

    .jc-meta {
      font-size: 0.75rem;
      color: #64748b;
    }

    .type-badge {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 4px;
      padding: 2px 7px;
      color: #94a3b8;
    }

    .remote-badge {
      background: rgba(0,242,255,0.07);
      border: 1px solid rgba(0,242,255,0.2);
      border-radius: 4px;
      padding: 2px 7px;
      color: #00d4e8;
    }

    .jc-salary {
      font-size: 0.85rem;
      font-weight: 600;
      color: #00d4e8;
      margin: 8px 0;
    }

    .jc-skills {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 10px;
    }

    .jc-skill {
      font-size: 0.72rem;
      padding: 3px 9px;
      border-radius: 4px;
      background: rgba(0,242,255,0.07);
      border: 1px solid rgba(0,242,255,0.18);
      color: #67e8f9;
    }

    .jc-footer-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .jc-posted {
      font-size: 0.73rem;
      color: #475569;
    }

    .jc-apps {
      font-size: 0.73rem;
      color: #475569;
    }

    .jobs-empty {
      text-align: center;
      color: #475569;
      padding: 60px 20px;
      font-size: 0.9rem;
    }

    /* ── Right column: job detail ── */
    .job-detail-col {
      position: sticky;
      top: 130px;
      height: calc(100vh - 130px);
      overflow-y: auto;
      padding: 24px;
    }

    .job-detail {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 28px;
    }

    .jd-header {
      margin-bottom: 20px;
    }

    .jd-header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .jd-logo {
      font-size: 2rem;
      line-height: 1;
    }

    .jd-match-block {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .jd-match-pct {
      font-size: 1.5rem;
      font-weight: 800;
      line-height: 1;
    }

    .jd-match-lbl {
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      opacity: 0.7;
    }

    .jd-title {
      font-size: 1.6rem;
      font-weight: 800;
      color: #f1f5f9;
      margin: 0 0 6px;
      line-height: 1.2;
    }

    .jd-company {
      font-size: 0.95rem;
      color: #64748b;
      margin: 0 0 14px;
    }

    .jd-meta-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 20px;
    }

    .jd-meta-pills span {
      font-size: 0.78rem;
      color: #94a3b8;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 6px;
      padding: 4px 10px;
    }

    .jd-salary {
      color: #00d4e8 !important;
      border-color: rgba(0,242,255,0.2) !important;
      background: rgba(0,242,255,0.06) !important;
      font-weight: 600;
    }

    .jd-actions {
      display: flex;
      gap: 10px;
      margin-bottom: 6px;
    }

    .jd-apply-btn {
      flex: 1;
      background: linear-gradient(135deg, #0077bb, #00f2ff);
      color: white;
      border: none;
      border-radius: 10px;
      padding: 13px 0;
      font-size: 0.92rem;
      font-weight: 700;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .jd-apply-btn:hover {
      opacity: 0.88;
    }

    .jd-save-btn {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      padding: 13px 22px;
      font-size: 0.88rem;
      font-weight: 600;
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .jd-save-btn:hover {
      border-color: rgba(255,255,255,0.2);
      color: #f1f5f9;
    }

    .jd-save-btn.saved {
      color: #f59e0b;
      border-color: rgba(245,158,11,0.35);
      background: rgba(245,158,11,0.07);
    }

    .jd-applied-success {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(34,197,94,0.1);
      border: 1px solid rgba(34,197,94,0.3);
      border-radius: 10px;
      padding: 12px 16px;
      color: #4ade80;
      font-size: 0.88rem;
      font-weight: 500;
    }

    .success-check {
      font-size: 1rem;
      font-weight: 800;
    }

    /* ── Job detail skills ── */
    .jd-skills-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 16px 0;
      border-top: 1px solid rgba(255,255,255,0.06);
      border-bottom: 1px solid rgba(255,255,255,0.06);
      margin-bottom: 20px;
    }

    .jd-skill-chip {
      font-size: 0.76rem;
      padding: 4px 12px;
      border-radius: 6px;
      background: rgba(0,242,255,0.07);
      border: 1px solid rgba(0,242,255,0.2);
      color: #67e8f9;
      font-weight: 500;
    }

    /* ── Job detail sections ── */
    .jd-section {
      margin-bottom: 22px;
    }

    .jd-sec-title {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #00d4e8;
      margin-bottom: 10px;
      font-weight: 700;
    }

    .jd-sec-body {
      color: #94a3b8;
      font-size: 0.88rem;
      line-height: 1.75;
      margin: 0;
    }

    .jd-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .jd-list li {
      color: #94a3b8;
      font-size: 0.88rem;
      line-height: 1.7;
      margin-bottom: 6px;
      padding-left: 20px;
      position: relative;
    }

    .jd-list li::before {
      content: '→';
      position: absolute;
      left: 0;
      color: #00d4e8;
    }

    .jd-benefits-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .jd-benefit {
      color: #94a3b8;
      font-size: 0.84rem;
    }

    /* ── Responsive ── */
    @media (max-width: 900px) {
      .jobs-h1 {
        font-size: 1.8rem;
      }

      .search-bar {
        flex-direction: column;
        align-items: stretch;
        gap: 4px;
        padding: 10px;
      }

      .search-divider {
        width: 100%;
        height: 1px;
      }

      .jobs-layout {
        grid-template-columns: 1fr;
      }

      .jobs-list-col {
        height: auto;
        overflow-y: visible;
        position: static;
        border-right: none;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }

      .job-detail-col {
        position: static;
        height: auto;
        overflow-y: visible;
      }

      .jd-benefits-grid {
        grid-template-columns: 1fr;
      }

      .jobs-filter-bar {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }
    }

    @media (max-width: 480px) {
      .jobs-hero {
        padding: 120px 16px 40px;
      }

      .jobs-h1 {
        font-size: 1.5rem;
      }

      .search-submit {
        width: 100%;
        padding: 12px;
      }
    }
  `]
})
export class JobsComponent implements OnInit {
  searchRole = '';
  searchLocation = '';
  typeFilter = signal<string>('All');
  sortByValue = 'match';
  selectedJob = signal<any>(null);
  applied = signal<Set<number>>(new Set());
  saved = signal<Set<number>>(new Set());

  popularSearches = ['Frontend Engineer', 'Data Scientist', 'Product Manager', 'Remote Jobs', 'Fintech'];
  types = ['All', 'Full-time', 'Contract', 'Part-time', 'Remote'];

  filteredJobs = computed(() => {
    const type = this.typeFilter();
    const role = this.searchRole.toLowerCase().trim();
    const location = this.searchLocation.toLowerCase().trim();

    let results = JOBS.filter(job => {
      const matchesType =
        type === 'All' ||
        job.type === type ||
        (type === 'Remote' && job.remote === 'Remote');

      const matchesRole =
        !role ||
        job.title.toLowerCase().includes(role) ||
        job.company.toLowerCase().includes(role) ||
        job.skills.some(s => s.toLowerCase().includes(role));

      const matchesLocation =
        !location ||
        job.location.toLowerCase().includes(location) ||
        (location === 'remote' && job.remote === 'Remote');

      return matchesType && matchesRole && matchesLocation;
    });

    if (this.sortByValue === 'match') {
      results = [...results].sort((a, b) => b.match - a.match);
    } else {
      // 'latest' — sort by the posted field heuristically (h ago < d ago)
      const parseTime = (posted: string): number => {
        const num = parseInt(posted, 10);
        if (posted.includes('h')) return num;
        if (posted.includes('d')) return num * 24;
        return 999;
      };
      results = [...results].sort((a, b) => parseTime(a.posted) - parseTime(b.posted));
    }

    return results;
  });

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.selectedJob.set(JOBS[0]);
  }

  selectJob(job: any) {
    this.selectedJob.set(job);
  }

  matchColor(m: number): string {
    return m >= 85 ? '#22c55e' : m >= 70 ? '#f59e0b' : '#ef4444';
  }

  applyToJob(job: any) {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/jobs' } });
      return;
    }
    const current = new Set(this.applied());
    current.add(job.id);
    this.applied.set(current);
  }

  toggleSave(job: any) {
    const current = new Set(this.saved());
    if (current.has(job.id)) {
      current.delete(job.id);
    } else {
      current.add(job.id);
    }
    this.saved.set(current);
  }

  setSearch(term: string) {
    this.searchRole = term;
  }

  doSearch() {
    // Signals-based filtering is reactive — no imperative action needed.
    // This method exists as the event target for (keyup.enter) and the search button.
    // The computed filteredJobs() will re-evaluate on the next change detection cycle
    // triggered by [(ngModel)] updating searchRole / searchLocation.
  }
}
