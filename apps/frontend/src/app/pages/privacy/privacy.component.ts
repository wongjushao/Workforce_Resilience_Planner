import { Component, AfterViewInit, ElementRef } from '@angular/core';
import { SiteLayoutComponent } from '../site-layout.component';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [SiteLayoutComponent],
  template: `
    <app-site-layout>
      <main class="legal-main">
        <section class="glass reveal rounded-2xl legal-card">
          <h1 class="legal-h1">Privacy Policy</h1>
          <div class="legal-content">
            <p>This draft privacy policy describes the principles expected for a production deployment of TalentPivot. Review with qualified legal counsel before use.</p>
            <h2>Data We Process</h2>
            <p>TalentPivot may process employee names, roles, departments, skills, career history, performance indicators, and HR-uploaded documents. Processing is carried out for the purpose of workforce planning, skill mapping, and redeployment recommendations.</p>
            <h2>Legal Basis</h2>
            <p>Processing should be carried out on a lawful basis defined in the applicable data protection framework. Typical bases include legitimate interest, contractual necessity, or explicit consent where required by local law.</p>
            <h2>Data Retention</h2>
            <p>Employee data should be retained only for as long as necessary for workforce planning purposes. Customers are responsible for defining and enforcing appropriate retention periods within their organizational policies.</p>
            <h2>Access Controls</h2>
            <p>Access to employee data should be restricted to authorized HR professionals and managers on a need-to-know basis. Role-based access controls, audit logs, and authentication requirements should be enforced in production.</p>
            <h2>Data Subject Rights</h2>
            <p>Depending on jurisdiction, employees may have rights to access, correct, delete, or restrict the processing of their personal data. Organizations using TalentPivot are responsible for implementing processes to honor such requests.</p>
            <h2>Third-Party Vendors</h2>
            <p>Any third-party services used in a production deployment should be subject to data processing agreements. Vendor security practices, sub-processor lists, and transfer mechanisms should be reviewed before deployment.</p>
            <h2>International Transfers</h2>
            <p>Where employee data is transferred across borders, appropriate safeguards such as standard contractual clauses or adequacy decisions should be in place as required by applicable law.</p>
            <h2>Security Measures</h2>
            <p>Technical and organizational measures including encryption at rest and in transit, access logging, vulnerability management, and incident response procedures should be implemented in production.</p>
            <h2>Employee Transparency</h2>
            <p>Employees whose data is processed for workforce planning purposes should receive clear information about how that data is used, who can access it, and how they can exercise their rights.</p>
            <h2>Contact</h2>
            <p>Replace this placeholder with the contact details of the data controller and, where required, a data protection officer before launch.</p>
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
export class PrivacyComponent implements AfterViewInit {
  constructor(private el: ElementRef) {}
  ngAfterViewInit() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    this.el.nativeElement.querySelectorAll('.reveal').forEach((el: Element) => obs.observe(el));
  }
}
