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
              <a class="btn-primary px-6" routerLink="/how-to-use">How to use?</a>
            </div>
          </div>
          <div class="hero-signal-card glass tilt-card reveal">
            <div class="hero-signal-inner">
              <div class="signal-toprow">
                <span class="signal-title">Workforce Resilience Dashboard</span>
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

        <!-- CTA -->
        <section class="content-section cta-section">
          <div class="glass reveal rounded-2xl cta-inner">
            <h2 class="cta-h2">Ready to map your workforce?</h2>
            <p class="section-body cta-body">Start with the dashboard to see which employees are at risk and which internal roles are available right now.</p>
            <div class="hero-cta-row">
              <a class="btn-primary" routerLink="/app">Launch Dashboard</a>
              <a class="btn-secondary" routerLink="/how-to-use">How it works</a>
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
    .signal-toprow { display: flex; align-items: center; justify-content: space-between; font-size: 0.875rem; }
    .signal-title { font-weight: 700; color: #00f2ff; }
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

    /* CTA */
    .cta-section { padding-bottom: 5rem; }
    .cta-inner { padding: 3rem 2rem; text-align: center; }
    .cta-h2 { margin: 0; font-family: "Cabinet Grotesk","Satoshi",sans-serif; font-weight: 900; font-size: clamp(2rem, 4vw, 3rem); color: #f8fbff; }
    .cta-body { max-width: 36rem; margin: 1rem auto 0; }
    .cta-inner .hero-cta-row { justify-content: center; }

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
