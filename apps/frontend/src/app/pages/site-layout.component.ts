import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BodyClassService } from '../services/body-class.service';

@Component({
  selector: 'app-site-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- ── Fixed nav pill ─────────────────────────────────────────────── -->
    <header class="site-header">
      <nav class="nav-pill glass" aria-label="Primary navigation">
        <a routerLink="/home" class="brand-mark display-font">
          <span class="brand-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3Z" stroke="currentColor" stroke-width="2"/>
              <path d="M12 8v8M8 10.5l4-2.5 4 2.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </span>
          <span>Talent<span class="brand-pivot">Pivot</span></span>
        </a>
        <div class="header-actions">
          <a class="btn-header-cta" routerLink="/how-to-use">How to use?</a>
          <div class="user-menu">
            <button class="user-trigger" type="button" aria-label="User menu">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M20 21a8 8 0 0 0-16 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
            <div class="login-popover glass">
              <a routerLink="/app">Launch App</a>
            </div>
          </div>
        </div>
      </nav>
    </header>

    <!-- ── Page content (transcluded) ──────────────────────────────────── -->
    <ng-content></ng-content>

    <!-- ── Footer ──────────────────────────────────────────────────────── -->
    <footer class="site-footer">
      <div class="footer-panel glass">
        <div class="footer-top">
          <div>
            <a routerLink="/home" class="brand-mark display-font brand-mark-lg">
              <span class="brand-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3Z" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 8v8M8 10.5l4-2.5 4 2.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </span>
              <span>Talent<span class="brand-pivot">Pivot</span></span>
            </a>
            <p class="footer-tagline">Intelligent workforce redeployment and upskilling for teams navigating skill disruption.</p>
          </div>
          <div class="footer-links">
            <a routerLink="/faq">FAQ</a>
            <a routerLink="/privacy">Privacy</a>
            <a routerLink="/terms">Terms</a>
          </div>
        </div>
        <div class="footer-copy">© 2026 TalentPivot. All rights reserved.</div>
      </div>
    </footer>
  `,
  styles: [`
    /* ── Header ── */
    .site-header {
      position: fixed; top: 18px; left: 0; right: 0; z-index: 50; padding: 0 20px;
    }
    .nav-pill {
      display: grid; grid-template-columns: 1fr auto; align-items: center;
      max-width: 1280px; margin: 0 auto; padding: 11px 20px; border-radius: 999px; overflow: visible;
    }
    .brand-mark {
      display: inline-flex; align-items: center; gap: 0.65rem;
      font-family: "Cabinet Grotesk", "Satoshi", sans-serif; font-weight: 900;
      font-size: 1.55rem; color: #f8fbff; text-decoration: none;
    }
    .brand-mark-lg { font-size: 2rem; }
    .brand-pivot { color: #7dd3fc; }
    .brand-icon {
      display: inline-grid; width: 2rem; height: 2rem; place-items: center;
      border-radius: 999px; background: linear-gradient(135deg, #00f2ff, #7000ff);
      color: #fff; box-shadow: 0 0 24px rgba(0,242,255,0.35); flex-shrink: 0;
    }
    .header-actions {
      display: flex; align-items: center; justify-content: flex-end; gap: 0.75rem; line-height: 1;
    }
    .btn-header-cta {
      display: inline-flex; align-items: center; justify-content: center;
      height: 2.25rem; min-height: 2.25rem; padding: 0 1.1rem; border-radius: 999px;
      background: #fff; color: #000; font-size: 0.875rem; font-weight: 900; text-decoration: none;
      box-shadow: 0 0 20px rgba(0,242,255,0.28); transition: transform 180ms ease, box-shadow 180ms ease;
    }
    .btn-header-cta:hover { transform: translateY(-2px); box-shadow: 0 0 24px rgba(0,242,255,0.48); }
    .user-menu { position: relative; display: flex; height: 2.25rem; align-items: center; }
    .user-trigger {
      display: inline-grid; width: 2.25rem; height: 2.25rem; place-items: center;
      border-radius: 999px; border: 1px solid rgba(255,255,255,0.18);
      color: #fff; background: rgba(255,255,255,0.05); cursor: pointer;
    }
    .login-popover {
      position: absolute; top: calc(100% + 10px); right: 0; min-width: 8.25rem;
      padding: 0.45rem; border-radius: 16px; opacity: 0; pointer-events: none;
      transform: translateY(-6px); z-index: 80;
      transition: opacity 180ms ease, transform 180ms ease;
    }
    .user-menu:hover .login-popover,
    .user-menu:focus-within .login-popover { opacity: 1; pointer-events: auto; transform: translateY(0); }
    .login-popover a {
      display: flex; min-height: 2.35rem; align-items: center; justify-content: center;
      border-radius: 999px; background: #fff; color: #000; font-size: 0.875rem;
      font-weight: 900; text-decoration: none;
    }

    /* ── Footer ── */
    .site-footer { padding: 4rem 1.25rem 2rem; border-top: 1px solid rgba(255,255,255,0.1); }
    .footer-panel { max-width: 1280px; margin: 0 auto; padding: 2rem; border-radius: 24px; }
    .footer-top {
      display: flex; flex-direction: column; gap: 2rem;
    }
    @media (min-width: 768px) {
      .footer-top { flex-direction: row; align-items: center; justify-content: space-between; }
    }
    .footer-tagline { margin-top: 1rem; max-width: 28rem; font-size: 0.875rem; line-height: 1.7; color: #aab7ca; }
    .footer-links { display: flex; flex-wrap: wrap; gap: 0.85rem; justify-content: flex-end; }
    .footer-links a {
      display: inline-flex; min-height: 2.35rem; align-items: center; border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.1); padding: 0 1rem; color: #cbd5e1;
      font-size: 0.875rem; font-weight: 700; background: rgba(255,255,255,0.03); text-decoration: none;
      transition: border-color 180ms ease, color 180ms ease;
    }
    .footer-links a:hover { border-color: rgba(0,242,255,0.5); color: #fff; }
    .footer-copy { margin-top: 2rem; padding-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.875rem; color: #64748b; }

    /* ── Glass ── */
    :host ::ng-deep .glass {
      position: relative; overflow: hidden;
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      box-shadow: 0 24px 80px rgba(0,0,0,0.28);
    }
    :host ::ng-deep .nav-pill.glass { overflow: visible; }

    @media (max-width: 767px) {
      .site-header { top: 12px; padding: 0 12px; }
      .nav-pill { gap: 0.75rem; padding: 10px 10px 10px 14px; }
      .brand-mark { font-size: 1.18rem; }
      .brand-icon { width: 1.85rem; height: 1.85rem; }
      .btn-header-cta { height: 2.2rem; min-height: 2.2rem; padding: 0 0.85rem; font-size: 0.8rem; }
      .footer-links { justify-content: flex-start; }
      .footer-panel { padding: 1.35rem; }
    }
  `]
})
export class SiteLayoutComponent implements OnInit {
  constructor(private bodyClass: BodyClassService) {}
  ngOnInit() { this.bodyClass.setMarketing(); }
}