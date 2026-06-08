import { Component, AfterViewInit, ElementRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SiteLayoutComponent } from '../site-layout.component';
import { CommonModule } from '@angular/common';


interface FaqItem { q: string; a: string; open: boolean; }

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [RouterModule, SiteLayoutComponent, CommonModule],
  template: `
    <app-site-layout>
      <main class="faq-main">
        <section class="reveal faq-hero">
          <h1 class="faq-h1">FAQ</h1>
          <p class="faq-sub">Practical answers about risk analysis, skill mapping, redeployment recommendations, and employee data safeguards.</p>
        </section>

        <section class="faq-list">
          <article
            *ngFor="let item of faqs; let i = index"
            class="faq-item glass reveal rounded-2xl"
            [class.is-open]="item.open"
          >
            <button
              class="faq-btn"
              [attr.aria-expanded]="item.open"
              (click)="toggle(i)"
            >
              <span class="faq-q">{{ item.q }}</span>
              <span class="faq-icon" [class.rotated]="item.open">+</span>
            </button>
            <div class="faq-panel" [style.maxHeight]="item.open ? '18rem' : '0'">
              <p class="faq-answer">{{ item.a }}</p>
            </div>
          </article>
        </section>
      </main>
    </app-site-layout>
  `,
  styles: [`
    .faq-main { padding-top: 104px; max-width: 64rem; margin: 0 auto; padding-left: 1.25rem; padding-right: 1.25rem; padding-bottom: 5rem; }
    .faq-hero { margin-bottom: 2.5rem; }
    .faq-h1 { margin: 1.5rem 0 0; font-family: "Cabinet Grotesk","Satoshi",sans-serif; font-weight: 900; font-size: clamp(3rem, 6vw, 4.5rem); line-height: 1; color: #f8fbff; }
    .faq-sub { margin: 1.25rem 0 0; max-width: 48rem; font-size: 1.1rem; line-height: 1.75; color: #aab7ca; }
    .faq-list { display: flex; flex-direction: column; gap: 1rem; }
    .rounded-2xl { border-radius: 1rem; }

    .faq-item { padding: 1.25rem; }
    .faq-btn {
      display: flex; width: 100%; align-items: center; justify-content: space-between;
      gap: 1rem; text-align: left; background: none; border: none; cursor: pointer;
      color: inherit; padding: 0;
    }
    .faq-q { font-size: 1.25rem; font-weight: 900; font-family: "Cabinet Grotesk","Satoshi",sans-serif; color: #f8fbff; }
    .faq-icon { font-size: 1.75rem; color: #00f2ff; flex-shrink: 0; transition: transform 220ms ease; }
    .faq-icon.rotated { transform: rotate(45deg); }

    .faq-panel { overflow: hidden; transition: max-height 260ms ease; }
    .faq-answer { padding-top: 1rem; line-height: 1.75; color: #aab7ca; margin: 0; }

    :host ::ng-deep .glass {
      position: relative; overflow: hidden;
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      box-shadow: 0 24px 80px rgba(0,0,0,0.28);
    }
    :host ::ng-deep .reveal { opacity: 0; transform: translateY(24px); transition: opacity 700ms ease, transform 700ms ease; }
    :host ::ng-deep .reveal.is-visible { opacity: 1; transform: translateY(0); }
  `]
})
export class FaqComponent implements AfterViewInit {
  faqs: FaqItem[] = [
    { open: true,  q: 'How does TalentPivot identify layoff or displacement risk?', a: 'TalentPivot combines HR-uploaded employee data, organizational context, market reports, role trends, and skill disruption signals. The output is a decision-support risk indicator, not an automatic employment decision.' },
    { open: false, q: 'Does the platform replace HR judgment?', a: 'No. TalentPivot is built to support workforce planning conversations with structured evidence. HR leaders remain responsible for review, context, policy alignment, and final decisions.' },
    { open: false, q: 'How are employee skills extracted?', a: 'Skills can be extracted from HR profiles, resumes, job histories, learning records, and manager-validated inputs. TalentPivot normalizes similar skills so matching is consistent across departments.' },
    { open: false, q: 'Can it recommend both internal and external roles?', a: 'Yes. The core focus is internal mobility, but the model can also surface external partner opportunities when redeployment inside the organization is limited.' },
    { open: false, q: 'What data privacy safeguards are expected?', a: 'A production deployment should use role-based access, encryption, audit trails, retention limits, vendor controls, and transparent employee notices. See the privacy page for a startup-ready draft framework.' },
    { open: false, q: 'How do upskilling pathways work?', a: 'TalentPivot compares current skills to target-role requirements, then generates a practical learning path. As employees complete training, the skill gap graph can be updated.' },
    { open: false, q: 'Why include Malaysia workforce examples?', a: 'The Malaysia framing makes disruption concrete: in a representative 100 workers, 29 may be upskilled in role, 11 upskilled and redeployed, and 12 may not receive adequate opportunities.' },
    { open: false, q: 'What is needed to implement TalentPivot?', a: 'The starting point is clean employee profile data, role definitions, skill taxonomies or resumes, and agreement on governance for access, review, and employee communication.' },
  ];

  constructor(private el: ElementRef) {}

  toggle(i: number) { this.faqs[i].open = !this.faqs[i].open; }

  ngAfterViewInit() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    this.el.nativeElement.querySelectorAll('.reveal').forEach((el: Element) => obs.observe(el));
  }
}
