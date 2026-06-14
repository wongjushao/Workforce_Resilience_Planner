import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BodyClassService } from '../services/body-class.service';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="auth-page">
      <header class="auth-header">
        <a routerLink="/home" class="brand-mark">
          <svg class="brand-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="#00f2ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Talent<span class="brand-pivot">Pivot</span></span>
        </a>
        <a routerLink="/home" class="back-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Back to home
        </a>
      </header>
      <main class="auth-main">
        <ng-content></ng-content>
      </main>
      <footer class="auth-footer">
        <p>© 2026 TalentPivot &nbsp;·&nbsp; <a routerLink="/privacy">Privacy</a> &nbsp;·&nbsp; <a routerLink="/terms">Terms</a></p>
      </footer>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .auth-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.4rem 2rem;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .brand-mark {
      display: inline-flex; align-items: center; gap: 0.65rem;
      font-family: "Cabinet Grotesk","Satoshi",sans-serif; font-weight: 900;
      font-size: 1.45rem; color: #f8fbff; text-decoration: none;
    }
    .brand-pivot { color: #00f2ff; }
    .brand-icon { display: inline-grid; place-items: center; flex-shrink: 0; }
    .back-link {
      display: inline-flex; align-items: center; gap: 0.4rem;
      font-size: 0.875rem; color: #94a3b8; text-decoration: none;
      transition: color 180ms ease;
    }
    .back-link:hover { color: #f8fbff; }
    .auth-main {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2.5rem 1.25rem 3rem;
    }
    .auth-footer {
      padding: 1.25rem 2rem;
      border-top: 1px solid rgba(255,255,255,0.06);
      text-align: center;
    }
    .auth-footer p {
      margin: 0;
      font-size: 0.8rem;
      color: #475569;
    }
    .auth-footer a {
      color: #64748b;
      text-decoration: none;
      transition: color 180ms ease;
    }
    .auth-footer a:hover { color: #94a3b8; }
    @media (max-width: 640px) {
      .auth-header { padding: 1.1rem 1.25rem; }
      .brand-mark { font-size: 1.25rem; }
    }
  `]
})
export class AuthLayoutComponent implements OnInit {
  constructor(private bodyClass: BodyClassService) {}
  ngOnInit() { this.bodyClass.setMarketing(); }
}
