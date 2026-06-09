import { Component, AfterViewInit, ElementRef } from '@angular/core';
import { SiteLayoutComponent } from '../site-layout.component';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [SiteLayoutComponent],
  template: `
    <app-site-layout>
      <main class="legal-main">
        <section class="glass reveal rounded-2xl legal-card">
          <h1 class="legal-h1">Terms and Conditions</h1>
          <div class="legal-content">
            <p>These draft terms describe the expected conditions for accessing and using TalentPivot, an intelligent workforce redeployment and upskilling platform.</p>
            <h2>Use of the Platform</h2>
            <p>TalentPivot is intended for authorized organizations and users managing workforce planning, skill analysis, role recommendations, and upskilling pathways. Users must comply with applicable laws, employment policies, and internal governance requirements.</p>
            <h2>Accounts and Access</h2>
            <p>Customers are responsible for managing authorized users, permissions, account security, and the accuracy of information submitted to the platform.</p>
            <h2>Uploaded Content</h2>
            <p>Customers retain ownership of employee profiles, resumes, HR data, role definitions, and other uploaded materials. Customers grant TalentPivot the limited rights needed to host, process, analyze, and display that content for the service.</p>
            <h2>Recommendations and Limitations</h2>
            <p>Risk indicators, skill matches, redeployment suggestions, and upskilling plans are informational decision-support outputs. They do not replace human review, legal obligations, labor consultation, or employment decision-making processes.</p>
            <h2>Acceptable Use</h2>
            <ul>
              <li>Do not use the platform unlawfully or to discriminate.</li>
              <li>Do not upload data without proper authority or notice.</li>
              <li>Do not attempt to reverse engineer, disrupt, or misuse the service.</li>
              <li>Do not bypass access controls or expose confidential employee data.</li>
            </ul>
            <h2>Intellectual Property</h2>
            <p>TalentPivot owns the platform, software, interface, analytics models, workflows, and related intellectual property. Customer data remains subject to the customer's ownership and contractual rights.</p>
            <h2>Subscriptions and Fees</h2>
            <p>Commercial terms, billing cycles, taxes, renewals, and cancellation rights should be defined in a separate order form or service agreement.</p>
            <h2>Disclaimers and Liability</h2>
            <p>The platform should be provided according to the applicable agreement. To the extent permitted by law, TalentPivot should disclaim implied warranties and limit liability for indirect, incidental, consequential, or punitive damages.</p>
            <h2>Termination</h2>
            <p>Access may be suspended or terminated for breach, security risk, non-payment, or other reasons defined in the governing agreement. Data export and deletion obligations should be handled according to contract terms.</p>
            <h2>Governing Law</h2>
            <p>Replace this placeholder with the selected jurisdiction and dispute resolution process before launch.</p>
          </div>
        </section>
      </main>
    </app-site-layout>
  `,
  styles: [`
    .legal-main { padding-top: 104px; max-width: 56rem; margin: 0 auto; padding-left: 1.25rem; padding-right: 1.25rem; padding-bottom: 5rem; }
    .rounded-2xl { border-radius: 1rem; }
    .legal-card { padding: 1.5rem; }
    @media (min-width: 768px) { .legal-card { padding: 2.5rem; } }
    .legal-h1 { margin: 1.5rem 0 0; font-family: "Cabinet Grotesk","Satoshi",sans-serif; font-weight: 900; font-size: clamp(2.5rem, 5vw, 4rem); line-height: 1; color: #f8fbff; }
    .legal-content { margin-top: 2rem; }
    .legal-content p { color: #aab7ca; line-height: 1.8; margin: 0 0 1rem; }
    .legal-content h2 { margin: 2.5rem 0 0.75rem; font-family: "Cabinet Grotesk","Satoshi",sans-serif; font-weight: 900; font-size: clamp(1.35rem, 2vw, 2rem); color: #f8fbff; }
    .legal-content ul { margin: 0.75rem 0 0; padding-left: 1.25rem; }
    .legal-content li { color: #aab7ca; line-height: 1.8; }
    :host ::ng-deep .glass {
      position: relative; overflow: hidden; background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px); box-shadow: 0 24px 80px rgba(0,0,0,0.28);
    }
    :host ::ng-deep .reveal { opacity: 0; transform: translateY(24px); transition: opacity 700ms ease, transform 700ms ease; }
    :host ::ng-deep .reveal.is-visible { opacity: 1; transform: translateY(0); }
  `]
})
export class TermsComponent implements AfterViewInit {
  constructor(private el: ElementRef) {}
  ngAfterViewInit() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    this.el.nativeElement.querySelectorAll('.reveal').forEach((el: Element) => obs.observe(el));
  }
}
