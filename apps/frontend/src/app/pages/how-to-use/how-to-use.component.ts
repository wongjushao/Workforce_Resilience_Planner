import { Component, AfterViewInit, ElementRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SiteLayoutComponent } from '../site-layout.component';

@Component({
  selector: 'app-how-to-use',
  standalone: true,
  imports: [RouterModule, SiteLayoutComponent],
  template: `
    <app-site-layout>
      <main class="htu-main">

        <!-- Hero -->
        <section class="htu-hero">
          <div class="reveal">
            <span class="accent-chip">Simple guide</span>
            <h1 class="htu-h1">How to use TalentPivot</h1>
            <p class="htu-sub">Upload workforce data once, then follow a clear path: find risk, map skills, match people to better opportunities, and track every next step in one dashboard.</p>
            <div class="cta-row">
              <a class="btn-primary" href="#steps">View steps</a>
              <a class="btn-secondary" href="#decisions">See matching logic</a>
            </div>
          </div>
          <div class="glass tilt-card reveal hero-card rounded-2xl p-6">
            <div class="mini-grid">
              <div class="mini-node">
                <div class="node-eyebrow">Input</div>
                <div class="node-big">Reports + HR data</div>
              </div>
              <div class="mini-row">
                <div class="mini-node"><div class="node-sm">Find risk</div><div class="node-num white">01</div></div>
                <div class="mini-node"><div class="node-sm">Map skills</div><div class="node-num cyan">02</div></div>
              </div>
              <div class="mini-node border-cyan">
                <div class="node-eyebrow output">Output</div>
                <p class="node-desc">Career profiles, role recommendations, and upskilling plans ready for manager review.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Steps 1-4 -->
        <section id="steps" class="content-section">
          <div class="reveal section-intro">
            <p class="eyebrow">The main flow</p>
            <h2 class="section-h2">From raw data to a clear next move.</h2>
            <p class="section-body">Each step keeps the wording simple so HR teams, hiring managers, and employees can understand what happens next.</p>
          </div>
          <div class="flow-grid">
            <article class="flow-card glass tilt-card reveal rounded-2xl p-6">
              <span class="flow-number">1</span>
              <h3 class="flow-h3">Upload data</h3>
              <p class="flow-desc">Add industry reports, employee profiles, resumes, and HR workforce data.</p>
              <span class="flow-arrow" aria-hidden="true"></span>
            </article>
            <article class="flow-card glass tilt-card reveal rounded-2xl p-6">
              <span class="flow-number">2</span>
              <h3 class="flow-h3">Find risk</h3>
              <p class="flow-desc">TalentPivot spots roles or employees that may be affected by business change.</p>
              <span class="flow-arrow" aria-hidden="true"></span>
            </article>
            <article class="flow-card glass tilt-card reveal rounded-2xl p-6">
              <span class="flow-number">3</span>
              <h3 class="flow-h3">Map skills</h3>
              <p class="flow-desc">Skills are pulled from profiles or resumes, then cleaned up so similar skills match properly.</p>
              <span class="flow-arrow" aria-hidden="true"></span>
            </article>
            <article class="flow-card glass tilt-card reveal rounded-2xl p-6">
              <span class="flow-number">4</span>
              <h3 class="flow-h3">Build the skill graph</h3>
              <p class="flow-desc">A visual map shows what each employee can do and where they may fit next.</p>
            </article>
          </div>
        </section>

        <!-- Decision logic -->
        <section id="decisions" class="content-section">
          <div class="glass reveal rounded-2xl decision-card">
            <div class="decision-inner">
              <div>
                <p class="eyebrow">Matching logic</p>
                <h2 class="section-h2">TalentPivot checks the best option first.</h2>
                <p class="section-body">The goal is to keep good people moving forward. The system checks internal options first, then partner roles, then training plans.</p>
              </div>
              <div class="decision-path">
                <div class="mini-node">
                  <span class="decision-pill">Same-role vacancy?</span>
                  <p class="node-desc mt-3">If yes, recommend a similar internal role and create a career profile.</p>
                </div>
                <div class="mini-node">
                  <span class="decision-pill">70%+ skill match?</span>
                  <p class="node-desc mt-3">If yes, suggest a cross-function internal role with a clear transition path.</p>
                </div>
                <div class="mini-node">
                  <span class="decision-pill">Partner vacancy?</span>
                  <p class="node-desc mt-3">If yes, recommend a trusted external partner role and prepare the profile.</p>
                </div>
                <div class="mini-node">
                  <span class="decision-pill">No match yet?</span>
                  <p class="node-desc mt-3">Create an upskilling plan, show missing skills, and recommend the next training steps.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Steps 5-7 -->
        <section class="content-section">
          <div class="flow-grid three-col">
            <article class="flow-card glass tilt-card reveal rounded-2xl p-6">
              <span class="flow-number">5</span>
              <h3 class="flow-h3">Send profiles to managers</h3>
              <p class="flow-desc">Hiring managers receive career profiles, role recommendations, and skill notes for review.</p>
            </article>
            <article class="flow-card glass tilt-card reveal rounded-2xl p-6">
              <span class="flow-number">6</span>
              <h3 class="flow-h3">Decide and act</h3>
              <p class="flow-desc">If accepted, the employee moves into the new role. If not, TalentPivot updates the skill gaps.</p>
            </article>
            <article class="flow-card glass tilt-card reveal rounded-2xl p-6">
              <span class="flow-number">7</span>
              <h3 class="flow-h3">Track progress</h3>
              <p class="flow-desc">HR use the dashboard to monitor profiles, training, skill growth, and redeployment progress.</p>
            </article>
          </div>
        </section>

        <!-- Dashboard preview -->
        <section class="content-section pb-section">
          <div class="glass reveal rounded-2xl dashboard-card">
            <div class="dashboard-inner">
              <div>
                <p class="eyebrow">Final view</p>
                <h2 class="section-h2">Everything ends in a shared dashboard.</h2>
                <p class="section-body">HR sees workforce risk and redeployment progress. Employees see possible paths, missing skills, and practical next steps.</p>
              </div>
              <div class="dash-stats">
                <div class="mini-node"><div class="node-sm">At-risk employees</div><div class="dash-stat cyan">24</div></div>
                <div class="mini-node"><div class="node-sm">Internal matches</div><div class="dash-stat white">19</div></div>
                <div class="mini-node"><div class="node-sm">Upskilling plans</div><div class="dash-stat blue">11</div></div>
                <div class="mini-node"><div class="node-sm">Manager reviews</div><div class="dash-stat purple">8</div></div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </app-site-layout>
  `,
  styles: [`
    .htu-main { padding-top: 88px; }
    .htu-hero {
      max-width: 1280px; margin: 0 auto; padding: 4rem 1.25rem;
      display: grid; gap: 2.5rem; align-items: center;
    }
    @media (min-width: 1024px) { .htu-hero { grid-template-columns: 0.95fr 1.05fr; padding: 5rem 1.25rem; } }
    .accent-chip { display: inline-flex; border-radius: 999px; padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 700; border: 1px solid rgba(0,242,255,0.25); background: rgba(0,242,255,0.08); color: #d9fdff; }
    .htu-h1 { margin: 1.5rem 0 0; font-family: "Cabinet Grotesk","Satoshi",sans-serif; font-weight: 900; font-size: clamp(2.5rem, 6vw, 4.5rem); line-height: 0.95; color: #f8fbff; }
    .htu-sub { margin: 1.5rem 0 0; max-width: 36rem; font-size: 1.1rem; line-height: 1.75; color: #aab7ca; }
    .cta-row { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 2rem; }
    .hero-card { width: 100%; }
    .mini-grid { display: flex; flex-direction: column; gap: 1rem; }
    .mini-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

    .content-section { max-width: 1280px; margin: 0 auto; padding: 4rem 1.25rem; }
    .pb-section { padding-bottom: 5rem; }
    .section-intro { max-width: 48rem; margin-bottom: 2.5rem; }
    .eyebrow { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.22em; color: #00f2ff; margin: 0; }
    .section-h2 { margin: 0.75rem 0 0; font-family: "Cabinet Grotesk","Satoshi",sans-serif; font-weight: 900; font-size: clamp(2rem, 4vw, 3.25rem); line-height: 1.1; color: #f8fbff; }
    .section-body { margin: 1.25rem 0 0; line-height: 1.75; color: #aab7ca; }

    .flow-grid { display: grid; gap: 1.25rem; }
    @media (min-width: 1024px) { .flow-grid { grid-template-columns: repeat(4, 1fr); } }
    .three-col { @media (min-width: 768px) { grid-template-columns: repeat(3, 1fr); } }
    @media (min-width: 768px) { .three-col { grid-template-columns: repeat(3, 1fr); } }
    .flow-card { position: relative; }
    .flow-number {
      display: inline-grid; width: 2.35rem; height: 2.35rem; place-items: center;
      border-radius: 999px; background: linear-gradient(135deg, #00f2ff, #7000ff);
      color: #fff; font-weight: 900; box-shadow: 0 0 22px rgba(0,242,255,0.32);
    }
    .flow-h3 { margin: 1.25rem 0 0; font-size: 1.35rem; font-weight: 900; font-family: "Cabinet Grotesk","Satoshi",sans-serif; color: #f8fbff; }
    .flow-desc { margin: 0.75rem 0 0; line-height: 1.75; color: #aab7ca; }
    .flow-arrow {
      display: none; position: absolute; top: 50%; right: -1.15rem;
      width: 2rem; height: 1px; background: linear-gradient(90deg, #00f2ff, transparent);
    }
    .flow-arrow::after {
      content: ''; position: absolute; right: 0; top: -4px; width: 9px; height: 9px;
      border-top: 1px solid #00f2ff; border-right: 1px solid #00f2ff; transform: rotate(45deg);
    }
    @media (min-width: 1024px) { .flow-arrow { display: block; } }

    .decision-card { padding: 1.5rem; }
    @media (min-width: 768px) { .decision-card { padding: 2.5rem; } }
    .decision-inner { display: grid; gap: 2.5rem; }
    @media (min-width: 1024px) { .decision-inner { grid-template-columns: 0.85fr 1.15fr; } }
    .decision-path { display: grid; gap: 1rem; border-left: 1px solid rgba(0,242,255,0.22); padding-left: 1.5rem; }
    @media (max-width: 767px) { .decision-path { border-left: 0; padding-left: 0; } }
    .decision-pill {
      display: inline-flex; align-items: center; gap: 0.5rem; border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.12); padding: 0.45rem 0.75rem;
      color: #dbeafe; background: rgba(255,255,255,0.04); font-size: 0.8rem; font-weight: 800;
    }
    .mt-3 { margin-top: 0.75rem; }

    .dashboard-card { padding: 2rem; }
    @media (min-width: 768px) { .dashboard-card { padding: 3rem; } }
    .dashboard-inner { display: grid; gap: 2rem; align-items: center; }
    @media (min-width: 1024px) { .dashboard-inner { grid-template-columns: 0.9fr 1.1fr; } }
    .dash-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .dash-stat { margin-top: 0.5rem; font-size: 2.5rem; font-weight: 900; font-family: "Cabinet Grotesk","Satoshi",sans-serif; }
    .dash-stat.cyan { color: #00f2ff; }
    .dash-stat.white { color: #fff; }
    .dash-stat.blue { color: #7dd3fc; }
    .dash-stat.purple { color: #b894ff; }

    /* Shared nodes */
    .mini-node { border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.025); border-radius: 14px; padding: 1rem; }
    .border-cyan { border-color: rgba(0,242,255,0.3); }
    .node-eyebrow { font-size: 0.875rem; font-weight: 700; color: #00f2ff; }
    .node-eyebrow.output { color: #fff; }
    .node-big { margin-top: 0.5rem; font-size: 1.5rem; font-weight: 900; font-family: "Cabinet Grotesk","Satoshi",sans-serif; color: #f8fbff; }
    .node-sm { font-size: 0.875rem; color: #aab7ca; }
    .node-num { font-size: 1.875rem; font-weight: 900; margin-top: 0.5rem; font-family: "Cabinet Grotesk","Satoshi",sans-serif; }
    .node-num.white { color: #fff; }
    .node-num.cyan { color: #7dd3fc; }
    .node-desc { font-size: 0.875rem; line-height: 1.6; color: #aab7ca; margin: 0; }

    /* Buttons */
    .btn-primary {
      display: inline-flex; align-items: center; justify-content: center;
      min-height: 2.75rem; border-radius: 8px; padding: 0 1.5rem;
      background: #00f2ff; color: #031018; font-weight: 800; text-decoration: none;
      box-shadow: 0 0 20px rgba(0,242,255,0.55); transition: transform 180ms ease;
    }
    .btn-primary:hover { transform: translateY(-2px); }
    .btn-secondary {
      display: inline-flex; align-items: center; justify-content: center;
      min-height: 2.75rem; border-radius: 8px; padding: 0 1.5rem;
      color: #fff; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.14);
      text-decoration: none; transition: border-color 180ms ease, transform 180ms ease;
    }
    .btn-secondary:hover { border-color: rgba(0,242,255,0.6); transform: translateY(-2px); }

    .rounded-2xl { border-radius: 1rem; }
    .p-6 { padding: 1.5rem; }

    :host ::ng-deep .glass {
      position: relative; overflow: hidden; background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px); box-shadow: 0 24px 80px rgba(0,0,0,0.28);
    }
    :host ::ng-deep .tilt-card { transform-style: preserve-3d; will-change: transform; }
    :host ::ng-deep .reveal { opacity: 0; transform: translateY(24px); transition: opacity 700ms ease, transform 700ms ease; }
    :host ::ng-deep .reveal.is-visible { opacity: 1; transform: translateY(0); }
  `]
})
export class HowToUseComponent implements AfterViewInit {
  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    this.el.nativeElement.querySelectorAll('.reveal').forEach((el: Element) => obs.observe(el));

    this.el.nativeElement.querySelectorAll('.tilt-card').forEach((card: HTMLElement) => {
      card.addEventListener('pointermove', (e: PointerEvent) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(1000px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }
}
