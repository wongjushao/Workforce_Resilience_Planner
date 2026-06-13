import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthLayoutComponent } from '../auth-layout.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-username',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AuthLayoutComponent],
  template: `
    <app-auth-layout>
      <div class="auth-card glass">

        <!-- Icon -->
        <div class="icon-wrap">
          <div class="icon-circle">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M20 21a8 8 0 0 0-16 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M21 21a8 8 0 0 0-5-7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
        </div>

        <!-- Sent state -->
        <div *ngIf="sent()">
          <div class="success-state">
            <div class="success-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="rgba(0,242,255,0.12)" stroke="#00f2ff" stroke-width="1.5"/>
                <path d="M8 12l3 3 5-5" stroke="#00f2ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h1 class="auth-h1">Username sent!</h1>
            <p class="auth-sub">
              We've emailed your username to
              <strong class="email-highlight">{{ submittedEmail }}</strong>.
              Check your inbox — it should arrive within a minute.
            </p>
            <div class="info-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#7dd3fc" stroke-width="2"/>
                <path d="M12 8v4M12 16h.01" stroke="#7dd3fc" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <p>Once you have your username, you can sign in with either your email or username.</p>
            </div>
            <a routerLink="/login" class="btn-back">Back to sign in</a>
          </div>
        </div>

        <!-- Form state -->
        <div *ngIf="!sent()">
          <div class="auth-head">
            <h1 class="auth-h1">Find your username</h1>
            <p class="auth-sub">
              Enter the email address associated with your account and we'll send your username right over.
            </p>
          </div>

          <form (ngSubmit)="onSubmit()" #form="ngForm" novalidate>
            <div class="field-group">
              <label class="field-label" for="fu-email">Email address</label>
              <div class="field-wrap" [class.field-focused]="emailFocused()">
                <span class="field-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" stroke-width="2"/>
                    <path d="M2 8l10 6 10-6" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </span>
                <input
                  id="fu-email"
                  type="email"
                  class="field-input"
                  [(ngModel)]="email"
                  name="email"
                  placeholder="you@company.com"
                  autocomplete="email"
                  required
                  [disabled]="loading()"
                  (focus)="emailFocused.set(true)"
                  (blur)="emailFocused.set(false)"
                />
              </div>
            </div>

            <div class="privacy-note">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M12 3l8 4v5c0 5-8 9-8 9S4 17 4 12V7l8-4Z" stroke="#475569" stroke-width="2"/>
              </svg>
              <span>We only send username reminders to verified email addresses on file.</span>
            </div>

            <button type="submit" class="btn-submit" [disabled]="loading() || !email.includes('@')">
              <span *ngIf="!loading()">Send my username</span>
              <span *ngIf="loading()" class="btn-loading-dots">
                <span></span><span></span><span></span>
              </span>
            </button>
          </form>

          <p class="auth-switch">
            <a routerLink="/login" class="auth-switch-link">← Back to sign in</a>
          </p>
          <p class="auth-switch alt-link">
            Forgot your password?
            <a routerLink="/forgot-password" class="auth-switch-link">Reset it here</a>
          </p>
        </div>

      </div>
    </app-auth-layout>
  `,
  styles: [`
    .auth-card {
      width: 100%; max-width: 24rem; padding: 2.25rem; border-radius: 1.5rem;
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      box-shadow: 0 32px 80px rgba(0,0,0,0.32);
    }
    .icon-wrap { display: flex; justify-content: center; margin-bottom: 1.5rem; }
    .icon-circle {
      width: 4rem; height: 4rem; border-radius: 50%;
      background: linear-gradient(135deg, rgba(112,0,255,0.16), rgba(0,242,255,0.12));
      border: 1px solid rgba(112,0,255,0.28);
      display: grid; place-items: center; color: #b38cff;
      box-shadow: 0 0 28px rgba(112,0,255,0.18);
    }
    .auth-head { margin-bottom: 1.75rem; }
    .auth-h1 {
      margin: 0 0 0.6rem;
      font-family: "Cabinet Grotesk","Satoshi",sans-serif;
      font-weight: 900; font-size: 1.8rem; color: #f8fbff; line-height: 1.1;
    }
    .auth-sub { margin: 0; font-size: 0.9rem; color: #94a3b8; line-height: 1.65; }

    .field-group { margin-bottom: 0.85rem; }
    .field-label {
      display: block; margin-bottom: 0.45rem;
      font-size: 0.82rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.02em;
    }
    .field-wrap {
      display: flex; align-items: center; border-radius: 10px;
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
      transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
    }
    .field-wrap.field-focused {
      border-color: rgba(179,140,255,0.45); background: rgba(112,0,255,0.05);
      box-shadow: 0 0 0 3px rgba(112,0,255,0.1);
    }
    .field-icon { display: inline-grid; place-items: center; width: 2.6rem; flex-shrink: 0; color: #475569; }
    .field-input {
      flex: 1; height: 2.75rem;
      background: transparent; border: none; outline: none;
      color: #f8fbff; font-size: 0.9rem; font-family: inherit; padding-right: 0.75rem;
    }
    .field-input::placeholder { color: #334155; }

    .privacy-note {
      display: flex; align-items: flex-start; gap: 0.5rem;
      padding: 0.65rem 0.85rem; margin-bottom: 1.25rem;
      border-radius: 8px; background: rgba(255,255,255,0.025);
      border: 1px solid rgba(255,255,255,0.07);
      font-size: 0.78rem; color: #475569; line-height: 1.5;
    }
    .privacy-note svg { flex-shrink: 0; margin-top: 2px; }

    .btn-submit {
      width: 100%; height: 2.85rem; border-radius: 10px;
      background: #b38cff; color: #0a0015;
      border: none; font-size: 0.95rem; font-weight: 800; cursor: pointer; font-family: inherit;
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      box-shadow: 0 0 22px rgba(112,0,255,0.35);
      transition: transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease;
      margin-bottom: 1.5rem;
    }
    .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 0 32px rgba(112,0,255,0.55); }
    .btn-submit:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }

    .btn-loading-dots { display: inline-flex; align-items: center; gap: 5px; }
    .btn-loading-dots span {
      width: 6px; height: 6px; border-radius: 50%;
      background: currentColor; opacity: 0.6; animation: dot-pulse 1.2s infinite;
    }
    .btn-loading-dots span:nth-child(2) { animation-delay: 0.2s; }
    .btn-loading-dots span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes dot-pulse {
      0%, 80%, 100% { transform: scale(0.75); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }

    .auth-switch { margin: 0 0 0.6rem; text-align: center; font-size: 0.875rem; color: #64748b; }
    .alt-link { margin-top: 0.5rem; }
    .auth-switch-link {
      color: #b38cff; text-decoration: none; font-weight: 700;
      margin-left: 0.3rem; transition: color 180ms ease;
    }
    .auth-switch-link:hover { color: #d4b8ff; }

    /* Success */
    .success-state { display: flex; flex-direction: column; align-items: center; text-align: center; }
    .success-icon {
      margin-bottom: 1.25rem; display: grid; place-items: center;
      width: 4rem; height: 4rem; border-radius: 50%;
      background: rgba(0,242,255,0.06); box-shadow: 0 0 32px rgba(0,242,255,0.15);
    }
    .success-state .auth-h1 { margin-bottom: 0.75rem; }
    .success-state .auth-sub { margin-bottom: 1.25rem; }
    .email-highlight { color: #7dd3fc; font-weight: 700; }
    .info-box {
      display: flex; align-items: flex-start; gap: 0.6rem; text-align: left;
      padding: 0.85rem 1rem; margin-bottom: 1.75rem; border-radius: 10px;
      background: rgba(125,211,252,0.06); border: 1px solid rgba(125,211,252,0.15);
    }
    .info-box svg { flex-shrink: 0; margin-top: 3px; }
    .info-box p { margin: 0; font-size: 0.84rem; color: #94a3b8; line-height: 1.55; }
    .btn-back {
      display: flex; align-items: center; justify-content: center;
      width: 100%; height: 2.85rem; border-radius: 10px;
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.14);
      color: #f8fbff; text-decoration: none; font-size: 0.92rem; font-weight: 700;
      transition: border-color 180ms ease, transform 180ms ease; margin-bottom: 1.25rem;
    }
    .btn-back:hover { border-color: rgba(0,242,255,0.45); transform: translateY(-1px); }

    @media (max-width: 640px) { .auth-card { padding: 1.75rem 1.25rem; } }
  `]
})
export class ForgotUsernameComponent {
  email = '';
  submittedEmail = '';
  sent = signal(false);
  loading = signal(false);
  emailFocused = signal(false);

  constructor(private auth: AuthService) {}

  async onSubmit() {
    if (this.loading() || !this.email.includes('@')) return;
    this.loading.set(true);
    await this.auth.forgotUsername(this.email);
    this.submittedEmail = this.email;
    this.loading.set(false);
    this.sent.set(true);
  }
}
