import { Component, AfterViewInit, ElementRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SiteLayoutComponent } from '../site-layout.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterModule, SiteLayoutComponent],
  template: `
    <app-site-layout>
      <main class="landing-main">

        <!-- Hero -->
        <section class="hero-section">
          <div class="reveal">
            <h1 class="hero-h1">Your workforce is changing faster than your org chart.</h1>
            <p class="hero-sub">TalentPivot helps your team adapt to change. Spot roles at risk, map out real employee skills, and guide people toward new roles or training before they look elsewhere.</p>
            <div class="hero-cta-row">
              <a class="btn-primary px-6" routerLink="/signup">Get started free</a>
              <a class="btn-secondary" routerLink="/how-to-use">How it works</a>
            </div>
          </div>
          <div class="hero-signal-card glass tilt-card reveal">
            <div class="hero-signal-inner">
              <div class="signal-toprow">
                <span class="signal-title">Workforce Resilience Dashboard</span>
                <div class="signal-header-actions">
                  <div class="signal-user-menu">
                    <span class="signal-user-chip" aria-hidden="true">
                      <span class="signal-user-avatar">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M20 21a8 8 0 0 0-16 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                          <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
                        </svg>
                      </span>
                    </span>
                    <a class="signal-launch-link" routerLink="/app">
                      <span class="signal-launch-icon" aria-hidden="true">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M4 14.5V19a1 1 0 0 0 1 1h5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                          <path d="M20 9.5V5a1 1 0 0 0-1-1h-5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                          <path d="M14 3h7v7M10 21H3v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </span>
                      Launch App
                    </a>
                  </div>
                </div>
              </div>
              <div class="signal-panel mt-8">
                <p class="signal-label">Employees at Risk</p>
                <h3 class="signal-h3">IT Operations Team</h3>
                <div class="signal-progress"><span></span></div>
              </div>
              <div class="signal-grid">
                <div class="signal-panel">
                  <div class="stat-cyan">11</div>
                  <p class="signal-label mt-3">At-risk employees</p>
                </div>
                <div class="signal-panel">
                  <div class="stat-purple">19</div>
                  <p class="signal-label mt-3">Open vacancies</p>
                </div>
              </div>
              <div class="signal-panel mt-5">
                <h3 class="signal-sm-h3">Recommended pivot</h3>
                <p class="signal-label mt-3">Ahmad Fadzillah — Frontend Developer → Full Stack Developer</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Stats -->
        <section id="risk" class="content-section">
          <div class="reveal section-intro">
            <p class="section-eyebrow">The pressure is measurable</p>
            <h2 class="section-h2">Skills decay, jobs shift, and retention becomes a timing problem.</h2>
          </div>
          <div class="stat-grid">
            <article class="glass tilt-card reveal rounded-2xl p-6">
              <div class="stat-num cyan" data-count="39" data-suffix="%">0%</div>
              <p class="stat-desc">of current skills are expected to transform or become outdated by 2030.</p>
            </article>
            <article class="glass tilt-card reveal rounded-2xl p-6">
              <div class="stat-num white"><span data-count="170" data-suffix="M">0M</span></div>
              <p class="stat-desc">new jobs are projected by 2030, alongside 92M displaced roles.</p>
            </article>
            <article class="glass tilt-card reveal rounded-2xl p-6">
              <div class="stat-num purple" data-count="85" data-suffix="%">0%</div>
              <p class="stat-desc">of employers plan to prioritize workforce upskilling by 2030.</p>
            </article>
            <article class="glass tilt-card reveal rounded-2xl p-6">
              <div class="stat-num white" data-count="12">0</div>
              <p class="stat-desc">in every 100 Malaysian workers may miss adequate upskilling opportunities.</p>
            </article>
          </div>
        </section>

        <!-- Workflow -->
        <section id="workflow" class="content-section">
          <div class="glass reveal rounded-2xl workflow-card">
            <div class="workflow-inner">
              <div>
                <p class="section-eyebrow">Talent intelligence workflow</p>
                <h2 class="section-h2">From layoff risk to a next-role pathway.</h2>
                <p class="section-body">TalentPivot connects HR data, industry signals, employee skills, and role demand into one decision layer for workforce continuity.</p>
              </div>
              <div class="workflow-grid">
                <div class="workflow-item">
                  <h3 class="workflow-item-h3">Risk analysis</h3>
                  <p class="stat-desc">Ingest industry reports and HR uploads to identify employees exposed to organizational shifts.</p>
                </div>
                <div class="workflow-item">
                  <h3 class="workflow-item-h3">Skill graph</h3>
                  <p class="stat-desc">Extract, normalize, and map skills across profiles, resumes, and current roles.</p>
                </div>
                <div class="workflow-item">
                  <h3 class="workflow-item-h3">Role matching</h3>
                  <p class="stat-desc">Recommend internal and external roles using skill similarity and transition fit.</p>
                </div>
                <div id="pathways" class="workflow-item">
                  <h3 class="workflow-item-h3">Upskilling paths</h3>
                  <p class="stat-desc">Generate personalized plans and update skill gaps as employees gain new capabilities.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Who it serves -->
        <section class="content-section">
          <div class="reveal section-intro">
            <p class="section-eyebrow">Who TalentPivot serves</p>
            <h2 class="section-h2">Built for the people who keep organizations moving.</h2>
          </div>
          <div class="who-grid">
            <div class="glass tilt-card reveal rounded-2xl p-6">
              <div class="who-icon">👥</div>
              <h3 class="who-h3">HR Leaders</h3>
              <p class="stat-desc">Get a clear view of workforce risk before it becomes a retention or compliance problem.</p>
            </div>
            <div class="glass tilt-card reveal rounded-2xl p-6">
              <div class="who-icon">💼</div>
              <h3 class="who-h3">Hiring Managers</h3>
              <p class="stat-desc">Receive pre-matched internal candidates with skill profiles so redeployment moves quickly.</p>
            </div>
            <div class="glass tilt-card reveal rounded-2xl p-6">
              <div class="who-icon">🎯</div>
              <h3 class="who-h3">Employees</h3>
              <p class="stat-desc">See exactly what skills are needed for your next role and what steps will close the gap.</p>
            </div>
          </div>
        </section>

        <!-- Career OS — For Job Seekers -->
        <section class="content-section">
          <div class="reveal section-intro">
            <p class="section-eyebrow">Career OS · For Job Seekers</p>
            <h2 class="section-h2">Your career, intelligently matched.</h2>
            <p class="section-body">Career OS uses the same AI engine that powers TalentPivot — turned around to serve you. Find roles you're genuinely suited for, not just keyword matches.</p>
          </div>
          <div class="cos-feature-grid">
            <div class="cos-feature glass reveal tilt-card">
              <div class="cos-feature-icon cyan-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </div>
              <h3 class="cos-feature-h3">AI Job Matching</h3>
              <p class="cos-feature-body">Every listing gets a match score against your skill graph. No more guessing if you're a fit — you see it instantly.</p>
            </div>
            <div class="cos-feature glass reveal tilt-card">
              <div class="cos-feature-icon purple-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" stroke="currentColor" stroke-width="2"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </div>
              <h3 class="cos-feature-h3">Resume Builder</h3>
              <p class="cos-feature-body">Build a structured profile that speaks to ATS systems and human recruiters alike. Export as a polished PDF.</p>
            </div>
            <div class="cos-feature glass reveal tilt-card">
              <div class="cos-feature-icon green-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M22 4 12 14.01l-3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
              <h3 class="cos-feature-h3">Application Tracker</h3>
              <p class="cos-feature-body">Track every application from sent to offer in a visual pipeline. Get notified on status changes in real time.</p>
            </div>
            <div class="cos-feature glass reveal tilt-card">
              <div class="cos-feature-icon cyan-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
              <h3 class="cos-feature-h3">Skill Gap Insights</h3>
              <p class="cos-feature-body">See exactly which skills are holding you back from top roles — and get learning paths to bridge the gap fast.</p>
            </div>
          </div>

          <!-- Jobs preview strip -->
          <div class="jobs-preview-strip glass reveal">
            <div class="jps-header">
              <div>
                <p class="jps-eyebrow">Live Listings · AI-Matched</p>
                <h3 class="jps-h3">Roles waiting for someone like you</h3>
              </div>
              <a class="btn-primary" routerLink="/jobs">Browse All Jobs →</a>
            </div>
            <div class="jps-cards">
              <div class="jps-card">
                <div class="jps-card-top"><span class="jps-logo">🟢</span><span class="jps-match" style="color:#22c55e">96% match</span></div>
                <div class="jps-role">Senior Frontend Engineer</div>
                <div class="jps-company">Grab · Kuala Lumpur · Hybrid</div>
                <div class="jps-salary">RM 8,000 – 12,000 / mo</div>
              </div>
              <div class="jps-card">
                <div class="jps-card-top"><span class="jps-logo">◈</span><span class="jps-match" style="color:#22c55e">99% match</span></div>
                <div class="jps-role">HR Analytics Lead</div>
                <div class="jps-company">TalentPivot · Remote · Full-time</div>
                <div class="jps-salary">RM 10,000 – 16,000 / mo</div>
              </div>
              <div class="jps-card">
                <div class="jps-card-top"><span class="jps-logo">🔵</span><span class="jps-match" style="color:#22c55e">91% match</span></div>
                <div class="jps-role">Data Scientist – AI/ML</div>
                <div class="jps-company">Maxis · Kuala Lumpur · Hybrid</div>
                <div class="jps-salary">RM 9,000 – 13,000 / mo</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Dual CTA -->
        <section class="content-section cta-section">
          <div class="dual-cta-grid">
            <div class="glass reveal rounded-2xl cta-inner cta-seeker">
              <p class="cta-eyebrow cyan-text">For Job Seekers</p>
              <h2 class="cta-h2">Find your next role, matched by AI.</h2>
              <p class="section-body cta-body">Browse thousands of listings, apply in seconds, and track your pipeline — all from one dashboard.</p>
              <div class="hero-cta-row">
                <a class="btn-primary" routerLink="/jobs">Browse Jobs</a>
                <a class="btn-secondary" routerLink="/signup">Create Profile</a>
              </div>
            </div>
            <div class="glass reveal rounded-2xl cta-inner cta-employer">
              <p class="cta-eyebrow purple-text">For Employers</p>
              <h2 class="cta-h2">Map your workforce resilience.</h2>
              <p class="section-body cta-body">Use TalentPivot's WRP module to identify at-risk employees, match internal talent, and plan redeployment before disruption hits.</p>
              <div class="hero-cta-row">
                <a class="btn-primary-purple" routerLink="/app">Launch WRP Dashboard</a>
                <a class="btn-secondary" routerLink="/how-to-use">How it works</a>
              </div>
            </div>
          </div>
        </section>

      </main>
    </app-site-layout>
  `,
  styles: [`
    .landing-main { padding-top: 88px; }

    /* Hero */
    .hero-section {
      max-width: 1280px; margin: 0 auto; padding: 4rem 1.25rem 4rem;
      display: grid; gap: 2.5rem; align-items: center;
    }
    @media (min-width: 1024px) {
      .hero-section { grid-template-columns: 1.05fr 0.95fr; padding: 5rem 1.25rem; }
    }
    .hero-h1 {
      margin: 1.5rem 0 0; font-family: "Cabinet Grotesk","Satoshi",sans-serif;
      font-weight: 900; font-size: clamp(2.5rem, 6vw, 4.5rem); line-height: 0.95; color: #f8fbff;
    }
    .hero-sub { margin: 1.5rem 0 0; max-width: 36rem; font-size: 1.1rem; line-height: 1.7; color: #aab7ca; }
    .hero-cta-row { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 2rem; }

    /* Hero card */
    .hero-signal-card {
      width: min(100%, 640px); margin-left: auto; padding: 1.8rem; border-radius: 22px;
    }
    .hero-signal-inner {
      border: 1px solid rgba(0,242,255,0.16); border-radius: 18px;
      background: rgba(3,7,18,0.22); padding: 1.55rem;
    }
    .signal-toprow {
      display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 0.75rem;
      font-size: 0.875rem;
    }
    .signal-title { font-weight: 700; color: #00f2ff; min-width: 0; }
    .signal-header-actions {
      display: inline-flex; align-items: center; justify-content: flex-end;
      flex-shrink: 0; line-height: 1;
    }
    .signal-user-menu {
      display: inline-flex;
      flex-direction: column;
      align-items: stretch;
      gap: 0.45rem;
      min-width: 7.5rem;
      flex-shrink: 0;
    }
    .signal-user-chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      align-self: flex-end;
      width: 2rem;
      height: 2rem;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(255,255,255,0.04);
    }
    .signal-user-avatar {
      display: inline-grid;
      place-items: center;
      width: 1.45rem;
      height: 1.45rem;
      border-radius: 999px;
      background: linear-gradient(135deg, rgba(0,242,255,0.22), rgba(112,0,255,0.28));
      color: #fff;
    }
    .signal-launch-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      min-height: 2rem;
      padding: 0 0.85rem;
      border-radius: 999px;
      border: 1px solid rgba(0,242,255,0.24);
      background: linear-gradient(135deg, rgba(0,242,255,0.14), rgba(112,0,255,0.18));
      color: #f8fbff;
      font-size: 0.78rem;
      font-weight: 800;
      line-height: 1;
      text-decoration: none;
      white-space: nowrap;
      box-shadow: 0 0 18px rgba(0,242,255,0.12);
      transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
    }
    .signal-launch-link:hover {
      transform: translateY(-1px);
      border-color: rgba(0,242,255,0.45);
      box-shadow: 0 0 22px rgba(0,242,255,0.22);
    }
    .signal-launch-icon {
      display: inline-grid;
      place-items: center;
      color: #7dd3fc;
    }
    .signal-panel {
      border: 1px solid rgba(255,255,255,0.11); border-radius: 15px;
      background: rgba(255,255,255,0.035); padding: 1.35rem;
    }
    .signal-label { font-size: 0.875rem; color: #aab7ca; margin: 0; }
    .signal-h3 { margin: 0.75rem 0 0; font-family: "Cabinet Grotesk","Satoshi",sans-serif; font-weight: 900; font-size: 1.5rem; color: #f8fbff; }
    .signal-sm-h3 { margin: 0; font-size: 1.1rem; font-weight: 700; color: #f8fbff; }
    .signal-progress { height: 0.55rem; overflow: hidden; border-radius: 999px; background: rgba(255,255,255,0.12); margin-top: 1.5rem; }
    .signal-progress span { display: block; width: 72%; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #00f2ff, #536dff, #7000ff); }
    .signal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-top: 1.25rem; }
    .mt-3 { margin-top: 0.75rem; }
    .mt-5 { margin-top: 1.25rem; }
    .mt-8 { margin-top: 2rem; }
    .stat-cyan { font-size: 2.5rem; font-weight: 900; color: #63f3ff; font-family: "Cabinet Grotesk","Satoshi",sans-serif; }
    .stat-purple { font-size: 2.5rem; font-weight: 900; color: #b38cff; font-family: "Cabinet Grotesk","Satoshi",sans-serif; }

    /* Shared section styles */
    .content-section { max-width: 1280px; margin: 0 auto; padding: 4rem 1.25rem; }
    .section-eyebrow { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.22em; color: #00f2ff; margin: 0; }
    .section-h2 { margin: 0.75rem 0 0; font-family: "Cabinet Grotesk","Satoshi",sans-serif; font-weight: 900; font-size: clamp(2rem, 4vw, 3.25rem); line-height: 1.1; color: #f8fbff; }
    .section-body { margin: 1.25rem 0 0; line-height: 1.75; color: #aab7ca; }
    .section-intro { max-width: 48rem; margin-bottom: 2.5rem; }

    /* Stats */
    .stat-grid { display: grid; gap: 1rem; }
    @media (min-width: 768px) { .stat-grid { grid-template-columns: 1fr 1fr; } }
    @media (min-width: 1024px) { .stat-grid { grid-template-columns: repeat(4,1fr); } }
    .rounded-2xl { border-radius: 1rem; }
    .p-6 { padding: 1.5rem; }
    .stat-num { font-size: 3rem; font-weight: 900; font-family: "Cabinet Grotesk","Satoshi",sans-serif; }
    .stat-num.cyan { color: #00f2ff; }
    .stat-num.purple { color: #b894ff; }
    .stat-num.white { color: #fff; }
    .stat-desc { margin: 1rem 0 0; color: #aab7ca; line-height: 1.6; font-size: 0.92rem; }

    /* Workflow */
    .workflow-card { padding: 1.5rem; }
    @media (min-width: 768px) { .workflow-card { padding: 2.5rem; } }
    .workflow-inner { display: grid; gap: 2.5rem; }
    @media (min-width: 1024px) { .workflow-inner { grid-template-columns: 0.8fr 1.2fr; } }
    .workflow-grid { display: grid; gap: 1rem; }
    @media (min-width: 640px) { .workflow-grid { grid-template-columns: 1fr 1fr; } }
    .workflow-item { border-radius: 0.75rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.02); padding: 1.25rem; }
    .workflow-item-h3 { margin: 0 0 0.5rem; font-size: 1.15rem; font-weight: 700; color: #f8fbff; }

    /* Who */
    .who-grid { display: grid; gap: 1.25rem; }
    @media (min-width: 768px) { .who-grid { grid-template-columns: repeat(3,1fr); } }
    .who-icon { font-size: 2rem; margin-bottom: 1rem; }
    .who-h3 { margin: 0 0 0.75rem; font-size: 1.35rem; font-weight: 900; font-family: "Cabinet Grotesk","Satoshi",sans-serif; color: #f8fbff; }

    /* Career OS seeker section */
    .cos-feature-grid {
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 32px;
    }
    @media (min-width: 900px) { .cos-feature-grid { grid-template-columns: repeat(4, 1fr); } }
    .cos-feature { padding: 28px 24px; border-radius: 16px; }
    .cos-feature-icon {
      width: 48px; height: 48px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; margin-bottom: 16px;
    }
    .cyan-icon { background: rgba(0,200,220,0.12); color: #00d4e8; }
    .purple-icon { background: rgba(112,0,255,0.12); color: #b38cff; }
    .green-icon { background: rgba(34,197,94,0.12); color: #4ade80; }
    .cos-feature-h3 { margin: 0 0 10px; font-size: 1.05rem; font-weight: 800; font-family: "Cabinet Grotesk","Satoshi",sans-serif; color: #f8fbff; }
    .cos-feature-body { margin: 0; font-size: 0.88rem; color: #aab7ca; line-height: 1.65; }

    /* Jobs preview strip */
    .jobs-preview-strip { padding: 28px 32px; border-radius: 20px; }
    .jps-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; }
    .jps-eyebrow { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #00f2ff; margin: 0 0 6px; }
    .jps-h3 { margin: 0; font-size: 1.2rem; font-weight: 800; font-family: "Cabinet Grotesk","Satoshi",sans-serif; color: #f8fbff; }
    .jps-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
    @media (max-width: 700px) { .jps-cards { grid-template-columns: 1fr; } }
    .jps-card {
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px; padding: 16px;
    }
    .jps-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .jps-logo { font-size: 1.4rem; }
    .jps-match { font-size: 0.78rem; font-weight: 700; }
    .jps-role { font-size: 0.95rem; font-weight: 700; color: #f1f5f9; margin-bottom: 4px; }
    .jps-company { font-size: 0.82rem; color: #7e8fa2; margin-bottom: 8px; }
    .jps-salary { font-size: 0.84rem; font-weight: 600; color: #00d4e8; }

    /* Dual CTA */
    .dual-cta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    @media (max-width: 768px) { .dual-cta-grid { grid-template-columns: 1fr; } }
    .cta-eyebrow { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; margin: 0 0 12px; }
    .cyan-text { color: #00f2ff; }
    .purple-text { color: #b38cff; }
    .btn-primary-purple {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
      min-height: 2.75rem; border-radius: 8px; padding: 0 1.5rem;
      background: linear-gradient(135deg, #7000ff, #b38cff); color: #fff; font-weight: 800; text-decoration: none;
      box-shadow: 0 0 20px rgba(112,0,255,0.4);
      transition: transform 180ms ease, box-shadow 180ms ease;
    }
    .btn-primary-purple:hover { transform: translateY(-2px); box-shadow: 0 0 28px rgba(112,0,255,0.6); }

    /* CTA */
    .cta-section { padding-bottom: 5rem; }
    .cta-inner { padding: 3rem 2rem; text-align: left; }
    .cta-h2 { margin: 0; font-family: "Cabinet Grotesk","Satoshi",sans-serif; font-weight: 900; font-size: clamp(1.6rem, 3vw, 2.4rem); color: #f8fbff; }
    .cta-body { max-width: 36rem; margin: 1rem 0 0; }
    .cta-inner .hero-cta-row { justify-content: flex-start; }

    /* Buttons */
    .btn-primary {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
      min-height: 2.75rem; border-radius: 8px; padding: 0 1.5rem;
      background: #00f2ff; color: #031018; font-weight: 800; text-decoration: none;
      box-shadow: 0 0 20px rgba(0,242,255,0.55);
      transition: transform 180ms ease, box-shadow 180ms ease;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 28px rgba(0,242,255,0.7); }
    .btn-secondary {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
      min-height: 2.75rem; border-radius: 8px; padding: 0 1.5rem;
      color: #fff; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.14);
      text-decoration: none; backdrop-filter: blur(12px);
      transition: border-color 180ms ease, transform 180ms ease;
    }
    .btn-secondary:hover { border-color: rgba(0,242,255,0.6); transform: translateY(-2px); }
    .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }

    /* Reveal animation */
    :host ::ng-deep .reveal { opacity: 0; transform: translateY(24px); transition: opacity 700ms ease, transform 700ms ease; }
    :host ::ng-deep .reveal.is-visible { opacity: 1; transform: translateY(0); }
    :host ::ng-deep .glass {
      position: relative; overflow: hidden;
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      box-shadow: 0 24px 80px rgba(0,0,0,0.28);
    }
    :host ::ng-deep .tilt-card { transform-style: preserve-3d; will-change: transform; }
  `]
})
export class LandingComponent implements AfterViewInit {
  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    // Intersection observer for .reveal
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); observer.unobserve(e.target); } });
    }, { threshold: 0.12 });
    this.el.nativeElement.querySelectorAll('.reveal').forEach((el: Element) => observer.observe(el));

    // Counter animation
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target as HTMLElement;
        const target = Number(el.dataset['count'] || 0);
        const suffix = el.dataset['suffix'] || '';
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / 1200, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = `${Math.round(target * eased)}${suffix}`;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        counterObs.unobserve(el);
      });
    }, { threshold: 0.5 });
    this.el.nativeElement.querySelectorAll('[data-count]').forEach((el: Element) => counterObs.observe(el));

    // Tilt cards
    this.el.nativeElement.querySelectorAll('.tilt-card').forEach((card: HTMLElement) => {
      card.addEventListener('pointermove', (e: PointerEvent) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(1000px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });

    // Cursor glow
    window.addEventListener('pointermove', (e: PointerEvent) => {
      document.body.style.setProperty('--cursor-x', `${e.clientX}px`);
      document.body.style.setProperty('--cursor-y', `${e.clientY}px`);
    });
  }
}
