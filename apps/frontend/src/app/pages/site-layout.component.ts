import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BodyClassService } from '../services/body-class.service';
import { AuthService } from '../services/auth.service';

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

          <!-- Guest nav: not logged in -->
          <ng-container *ngIf="!auth.isLoggedIn()">
            <a class="btn-nav-login" routerLink="/login">Log in</a>
            <a class="btn-nav-signup" routerLink="/signup">Sign up free</a>
          </ng-container>

          <!-- Auth nav: logged in -->
          <div *ngIf="auth.isLoggedIn()" class="user-menu">
            <button
              class="user-trigger"
              type="button"
              aria-label="Open account menu"
              aria-haspopup="true"
            >
              <span class="user-avatar-initials" aria-hidden="true">{{ userInitials() }}</span>
              <svg class="user-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="user-dropdown" role="menu">
              <!-- User info -->
              <div class="user-dropdown-profile">
                <div class="user-dropdown-avatar">{{ userInitials() }}</div>
                <div class="user-dropdown-info">
                  <span class="user-dropdown-name">{{ auth.user()?.name }}</span>
                  <span class="user-dropdown-email">{{ auth.user()?.email }}</span>
                </div>
              </div>
              <div class="user-dropdown-divider"></div>
              <p class="user-dropdown-eyebrow">Workspace</p>
              <a class="user-dropdown-item" routerLink="/app" role="menuitem">
                <span class="user-dropdown-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M4 14.5V19a1 1 0 0 0 1 1h5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M20 9.5V5a1 1 0 0 0-1-1h-5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M14 3h7v7M10 21H3v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                <span class="user-dropdown-copy">
                  <span class="user-dropdown-title">Launch App</span>
                  <span class="user-dropdown-sub">Open the dashboard</span>
                </span>
              </a>
              <div class="user-dropdown-divider"></div>
              <button class="user-dropdown-signout" role="menuitem" (click)="auth.logout()">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Sign out
              </button>
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
      display: inline-flex; align-items: center; justify-content: flex-end;
      gap: 0.75rem; flex-shrink: 0; line-height: 1;
    }
    .btn-header-cta {
      display: inline-flex; align-items: center; justify-content: center;
      height: 2.25rem; min-height: 2.25rem; padding: 0 1.1rem; border-radius: 999px;
      background: #fff; color: #000; font-size: 0.875rem; font-weight: 900; line-height: 1;
      text-decoration: none; white-space: nowrap; flex-shrink: 0;
      box-shadow: 0 0 20px rgba(0,242,255,0.28); transition: transform 180ms ease, box-shadow 180ms ease;
    }
    .btn-header-cta:hover { transform: translateY(-2px); box-shadow: 0 0 24px rgba(0,242,255,0.48); }
    .btn-nav-login {
      display: inline-flex; align-items: center; justify-content: center;
      height: 2.25rem; min-height: 2.25rem; padding: 0 1rem; border-radius: 999px;
      background: transparent; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.16);
      font-size: 0.875rem; font-weight: 700; line-height: 1;
      text-decoration: none; white-space: nowrap; flex-shrink: 0;
      transition: border-color 180ms ease, color 180ms ease;
    }
    .btn-nav-login:hover { border-color: rgba(0,242,255,0.45); color: #fff; }
    .btn-nav-signup {
      display: inline-flex; align-items: center; justify-content: center;
      height: 2.25rem; min-height: 2.25rem; padding: 0 1.1rem; border-radius: 999px;
      background: #00f2ff; color: #031018; border: none;
      font-size: 0.875rem; font-weight: 900; line-height: 1;
      text-decoration: none; white-space: nowrap; flex-shrink: 0;
      box-shadow: 0 0 18px rgba(0,242,255,0.38);
      transition: transform 180ms ease, box-shadow 180ms ease;
    }
    .btn-nav-signup:hover { transform: translateY(-2px); box-shadow: 0 0 26px rgba(0,242,255,0.58); }
    .user-avatar-initials {
      display: inline-grid; place-items: center;
      width: 1.75rem; height: 1.75rem; border-radius: 50%;
      background: linear-gradient(135deg, rgba(0,242,255,0.3), rgba(112,0,255,0.38));
      color: #fff; font-size: 0.7rem; font-weight: 900; flex-shrink: 0;
    }
    .user-dropdown-profile {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.65rem 0.55rem 0.75rem;
    }
    .user-dropdown-avatar {
      width: 2.25rem; height: 2.25rem; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, rgba(0,242,255,0.25), rgba(112,0,255,0.35));
      border: 1.5px solid rgba(0,242,255,0.25);
      display: grid; place-items: center;
      font-size: 0.78rem; font-weight: 900; color: #00f2ff;
    }
    .user-dropdown-info { display: flex; flex-direction: column; gap: 0.1rem; min-width: 0; }
    .user-dropdown-name { font-size: 0.875rem; font-weight: 800; color: #f8fbff; }
    .user-dropdown-email { font-size: 0.75rem; color: #64748b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .user-dropdown-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 0.35rem 0; }
    .user-dropdown-signout {
      display: flex; align-items: center; gap: 0.65rem;
      width: 100%; padding: 0.65rem 0.75rem; margin-top: 0.1rem;
      border-radius: 12px; background: none; border: none;
      color: #f87171; font-size: 0.875rem; font-weight: 700; font-family: inherit;
      cursor: pointer; text-align: left;
      transition: background 180ms ease;
    }
    .user-dropdown-signout:hover { background: rgba(248,113,113,0.1); }
    .user-menu {
      position: relative;
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
    }
    .user-trigger {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      height: 2.25rem;
      margin: 0;
      padding: 0 0.55rem 0 0.35rem;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.14);
      color: #e2e8f0;
      background: rgba(255,255,255,0.04);
      cursor: pointer;
      transition: border-color 180ms ease, background 180ms ease, box-shadow 180ms ease;
    }
    .user-trigger:hover,
    .user-menu:focus-within .user-trigger {
      border-color: rgba(0,242,255,0.42);
      background: rgba(0,242,255,0.08);
      box-shadow: 0 0 18px rgba(0,242,255,0.16);
    }
    .user-avatar {
      display: inline-grid;
      place-items: center;
      width: 1.65rem;
      height: 1.65rem;
      border-radius: 999px;
      background: linear-gradient(135deg, rgba(0,242,255,0.22), rgba(112,0,255,0.28));
      color: #fff;
    }
    .user-chevron {
      display: block;
      opacity: 0.72;
      transition: transform 180ms ease, opacity 180ms ease;
    }
    .user-menu:hover .user-chevron,
    .user-menu:focus-within .user-chevron {
      transform: rotate(180deg);
      opacity: 1;
    }
    .user-dropdown {
      position: absolute;
      top: calc(100% + 12px);
      right: 0;
      z-index: 80;
      width: 15.5rem;
      padding: 0.65rem;
      border-radius: 18px;
      background: rgba(8, 14, 28, 0.92);
      border: 1px solid rgba(255,255,255,0.1);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      box-shadow:
        0 18px 50px rgba(0,0,0,0.42),
        0 0 0 1px rgba(0,242,255,0.06) inset;
      opacity: 0;
      pointer-events: none;
      transform: translateY(-8px) scale(0.98);
      transform-origin: top right;
      transition: opacity 180ms ease, transform 180ms ease;
    }
    .user-dropdown::before {
      content: "";
      position: absolute;
      top: -6px;
      right: 1rem;
      width: 12px;
      height: 12px;
      transform: rotate(45deg);
      background: rgba(8, 14, 28, 0.92);
      border-top: 1px solid rgba(255,255,255,0.1);
      border-left: 1px solid rgba(255,255,255,0.1);
    }
    .user-menu:hover .user-dropdown,
    .user-menu:focus-within .user-dropdown {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0) scale(1);
    }
    .user-dropdown-eyebrow {
      margin: 0 0 0.45rem;
      padding: 0 0.55rem;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #64748b;
    }
    .user-dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.7rem 0.75rem;
      border-radius: 14px;
      color: #f8fbff;
      text-decoration: none;
      transition: background 180ms ease, transform 180ms ease;
    }
    .user-dropdown-item:hover {
      background: rgba(0,242,255,0.1);
      transform: translateX(2px);
    }
    .user-dropdown-icon {
      display: inline-grid;
      place-items: center;
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 12px;
      flex-shrink: 0;
      background: linear-gradient(135deg, rgba(0,242,255,0.18), rgba(112,0,255,0.24));
      color: #7dd3fc;
      box-shadow: inset 0 0 0 1px rgba(0,242,255,0.18);
    }
    .user-dropdown-copy {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      min-width: 0;
    }
    .user-dropdown-title {
      font-size: 0.9rem;
      font-weight: 800;
      line-height: 1.2;
    }
    .user-dropdown-sub {
      font-size: 0.75rem;
      line-height: 1.2;
      color: #94a3b8;
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
      .nav-pill { gap: 0.5rem; padding: 10px 10px 10px 14px; }
      .brand-mark { font-size: 1.18rem; }
      .brand-icon { width: 1.85rem; height: 1.85rem; }
      .btn-header-cta { display: none; }
      .btn-nav-login { height: 2.1rem; min-height: 2.1rem; padding: 0 0.75rem; font-size: 0.8rem; }
      .btn-nav-signup { height: 2.1rem; min-height: 2.1rem; padding: 0 0.85rem; font-size: 0.8rem; }
      .user-trigger { height: 2.2rem; padding: 0 0.5rem 0 0.3rem; }
      .user-avatar-initials { width: 1.55rem; height: 1.55rem; font-size: 0.65rem; }
      .user-dropdown { width: 14.5rem; }
      .footer-links { justify-content: flex-start; }
      .footer-panel { padding: 1.35rem; }
    }
  `]
})
export class SiteLayoutComponent implements OnInit {
  userInitials = computed(() => {
    const name = this.auth.user()?.name ?? '';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  });

  constructor(private bodyClass: BodyClassService, public auth: AuthService) {}
  ngOnInit() { this.bodyClass.setMarketing(); }
}